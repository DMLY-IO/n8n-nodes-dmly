import type {
	IDataObject,
	IExecuteFunctions,
	IHookFunctions,
	ILoadOptionsFunctions,
	JsonObject,
} from 'n8n-workflow';
import { NodeApiError } from 'n8n-workflow';

type DmlyRequestContext = IExecuteFunctions | IHookFunctions | ILoadOptionsFunctions;

export async function dmlyApiRequest(
	this: DmlyRequestContext,
	method: string,
	endpoint: string,
	body: IDataObject = {},
	qs: IDataObject = {},
): Promise<IDataObject | IDataObject[]> {
	const credentials = await this.getCredentials('dmlyApi');
	const baseUrl = ((credentials.baseUrl as string) || 'https://api.dmly.io/rest').replace(/\/$/, '');
	const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

	const requestOptions: {
		method: string;
		url: string;
		headers: IDataObject;
		qs?: IDataObject;
		body?: IDataObject;
	} = {
		method,
		url: `${baseUrl}${path}`,
		headers: {
			Accept: 'application/json',
			'x-api-key': credentials.apiKey as string,
		},
	};

	if (Object.keys(qs).length > 0) {
		requestOptions.qs = qs;
	}

	if (Object.keys(body).length > 0) {
		requestOptions.headers['Content-Type'] = 'application/json';
		requestOptions.body = body;
	}

	try {
		return await this.helpers.httpRequest(requestOptions as never);
	} catch (error) {
		throw new NodeApiError(this.getNode(), error as JsonObject);
	}
}

export function normalizeDmlyResponse(response: unknown): IDataObject[] {
	if (Array.isArray(response)) {
		return response as IDataObject[];
	}

	if (response && typeof response === 'object') {
		const responseObject = response as IDataObject;

		const possibleArrayKeys = ['data', 'items', 'results'];
		for (const key of possibleArrayKeys) {
			if (Array.isArray(responseObject[key])) {
				return responseObject[key] as IDataObject[];
			}
		}

		return [responseObject];
	}

	return [{ value: String(response ?? '') }];
}

export function getWebhookHeadersFromCollection(headersData: IDataObject): Array<{ key: string; value: string }> {
	const headerItems = (headersData.header as IDataObject[]) || [];

	return headerItems
		.map((headerItem) => ({
			key: String(headerItem.key || '').trim(),
			value: String(headerItem.value || '').trim(),
		}))
		.filter((headerItem) => headerItem.key !== '');
}

export function normalizeRecipientFields(payload: IDataObject): IDataObject {
	if (payload.recipient && !payload.recepient) {
		payload.recepient = payload.recipient;
	}

	if (payload.recepient && !payload.recipient) {
		payload.recipient = payload.recepient;
	}

	return payload;
}
