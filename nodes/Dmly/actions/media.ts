import type { IDataObject, IExecuteFunctions } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

import { dmlyApiRequest, dmlyApiRequestAllItems } from '../GenericFunctions';

export async function handleMedia(
	ctx: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<IDataObject | IDataObject[]> {
	const node = ctx.getNode();

	if (operation === 'getAll') {
		const returnAll = ctx.getNodeParameter('returnAll', i) as boolean;
		const filters = ctx.getNodeParameter('filters', i, {}) as IDataObject;
		const qs: IDataObject = {};
		if (filters.search) qs.q = filters.search;

		if (returnAll) {
			return dmlyApiRequestAllItems.call(ctx, 'GET', '/media', {}, qs);
		}
		qs.per_page = ctx.getNodeParameter('limit', i) as number;
		return dmlyApiRequest.call(ctx, 'GET', '/media', {}, qs);
	}

	if (operation === 'get') {
		const id = ctx.getNodeParameter('mediaId', i) as string;
		return dmlyApiRequest.call(ctx, 'GET', `/media/${id}`);
	}

	if (operation === 'upload') {
		const body: IDataObject = { file: ctx.getNodeParameter('file', i) as string };
		return dmlyApiRequest.call(ctx, 'POST', '/media', body);
	}

	if (operation === 'delete') {
		const id = ctx.getNodeParameter('mediaId', i) as string;
		return dmlyApiRequest.call(ctx, 'DELETE', `/media/${id}`);
	}

	throw new NodeOperationError(node, `Unknown operation "${operation}" for resource "media".`, {
		itemIndex: i,
	});
}
