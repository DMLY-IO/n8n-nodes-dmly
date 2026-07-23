import type {
	IDataObject,
	IExecuteFunctions,
	IHookFunctions,
	IHttpRequestMethods,
	IHttpRequestOptions,
	ILoadOptionsFunctions,
	INode,
	IWebhookFunctions,
	JsonObject,
} from 'n8n-workflow';
import { NodeApiError, NodeOperationError } from 'n8n-workflow';

export type DmlyRequestContext =
	| IExecuteFunctions
	| IHookFunctions
	| ILoadOptionsFunctions
	| IWebhookFunctions;

const DEFAULT_BASE_URL = 'https://dash.dmly.io/api/v1';

/**
 * Make a single authenticated request to the DMLY REST API (/api/v1).
 * The workspace is selected by the API key, so no workspace id is ever sent.
 */
export async function dmlyApiRequest(
	this: DmlyRequestContext,
	method: IHttpRequestMethods,
	endpoint: string,
	body: IDataObject = {},
	qs: IDataObject = {},
): Promise<IDataObject | IDataObject[]> {
	const credentials = await this.getCredentials('dmlyApi');
	const baseUrl = ((credentials.baseUrl as string) || DEFAULT_BASE_URL).replace(/\/+$/, '');
	const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

	const options: IHttpRequestOptions = {
		method,
		url: `${baseUrl}${path}`,
		headers: {
			Accept: 'application/json',
			'x-api-key': credentials.apiKey as string,
		},
		json: true,
	};

	if (Object.keys(qs).length) {
		options.qs = qs;
	}
	if (Object.keys(body).length) {
		options.body = body;
	}

	try {
		return (await this.helpers.httpRequest(options)) as IDataObject | IDataObject[];
	} catch (error) {
		throw new NodeApiError(this.getNode(), error as JsonObject);
	}
}

/**
 * Pull the `data` array out of a DMLY list response ({ data, links, meta }),
 * or return the response as-is if it is already an array.
 */
export function extractData(response: unknown): IDataObject[] {
	if (Array.isArray(response)) {
		return response as IDataObject[];
	}
	if (response && typeof response === 'object') {
		const data = (response as IDataObject).data;
		if (Array.isArray(data)) {
			return data as IDataObject[];
		}
	}
	return [];
}

function extractLastPage(response: unknown, currentPage: number): number {
	if (response && typeof response === 'object') {
		const meta = (response as IDataObject).meta as IDataObject | undefined;
		if (meta && typeof meta.last_page === 'number') {
			return meta.last_page as number;
		}
	}
	return currentPage;
}

/**
 * Follow DMLY's `meta.last_page` pagination to collect every item of a list
 * endpoint (used by "Return All").
 */
export async function dmlyApiRequestAllItems(
	this: DmlyRequestContext,
	method: IHttpRequestMethods,
	endpoint: string,
	body: IDataObject = {},
	qs: IDataObject = {},
): Promise<IDataObject[]> {
	const returnData: IDataObject[] = [];
	let page = 1;
	let lastPage = 1;

	do {
		const response = await dmlyApiRequest.call(this, method, endpoint, body, {
			...qs,
			per_page: 100,
			page,
		});
		returnData.push(...extractData(response));
		lastPage = extractLastPage(response, page);
		page += 1;
	} while (page <= lastPage);

	return returnData;
}

/**
 * Normalise any DMLY response into an array of items for n8n output:
 *  - an array stays an array;
 *  - a list wrapper ({ data: [...] }) yields its items;
 *  - a single wrapper ({ data: {...} }) yields the one record;
 *  - anything else (e.g. { deleted: true }) is returned as a single item.
 */
export function normalizeDmlyResponse(response: unknown): IDataObject[] {
	if (Array.isArray(response)) {
		return response as IDataObject[];
	}
	if (response && typeof response === 'object') {
		const obj = response as IDataObject;
		for (const key of ['data', 'items', 'results'] as const) {
			if (Array.isArray(obj[key])) {
				return obj[key] as IDataObject[];
			}
		}
		if (obj.data && typeof obj.data === 'object') {
			return [obj.data as IDataObject];
		}
		return [obj];
	}
	return [{ value: String(response ?? '') }];
}

/** Split a comma-separated string parameter into a trimmed, non-empty list. */
export function parseCsv(value: string): string[] {
	return value
		.split(',')
		.map((item) => item.trim())
		.filter((item) => item !== '');
}

/** Parse a JSON parameter that may already be an object, or throw a clear node error. */
export function parseJsonObject(
	node: INode,
	value: unknown,
	itemIndex: number,
	fieldName: string,
): IDataObject {
	if (value && typeof value === 'object') {
		return value as IDataObject;
	}
	const text = String(value ?? '').trim();
	if (text === '') {
		return {};
	}
	try {
		return JSON.parse(text) as IDataObject;
	} catch {
		throw new NodeOperationError(
			node,
			`Invalid JSON in "${fieldName}". Please provide valid JSON.`,
			{ itemIndex },
		);
	}
}

/**
 * Parse a JSON parameter that may be an object OR an array (e.g. media, template
 * parameters). Returns undefined for empty input, or throws a clear node error.
 */
export function parseJson(
	node: INode,
	value: unknown,
	itemIndex: number,
	fieldName: string,
): IDataObject | IDataObject[] | undefined {
	if (value !== null && typeof value === 'object') {
		return value as IDataObject | IDataObject[];
	}
	const text = String(value ?? '').trim();
	if (text === '') {
		return undefined;
	}
	try {
		return JSON.parse(text) as IDataObject | IDataObject[];
	} catch {
		throw new NodeOperationError(
			node,
			`Invalid JSON in "${fieldName}". Please provide valid JSON.`,
			{ itemIndex },
		);
	}
}
