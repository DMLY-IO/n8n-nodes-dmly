import type { IDataObject, IExecuteFunctions } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

import { dmlyApiRequest, dmlyApiRequestAllItems } from '../GenericFunctions';

export async function handleTag(
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
			return dmlyApiRequestAllItems.call(ctx, 'GET', '/tags', {}, qs);
		}
		qs.per_page = ctx.getNodeParameter('limit', i) as number;
		return dmlyApiRequest.call(ctx, 'GET', '/tags', {}, qs);
	}

	if (operation === 'get') {
		const id = ctx.getNodeParameter('tagId', i) as string;
		return dmlyApiRequest.call(ctx, 'GET', `/tags/${id}`);
	}

	if (operation === 'create') {
		const body: IDataObject = { name: ctx.getNodeParameter('name', i) as string };
		const additionalFields = ctx.getNodeParameter('additionalFields', i, {}) as IDataObject;
		if (additionalFields.color) body.color = additionalFields.color;
		return dmlyApiRequest.call(ctx, 'POST', '/tags', body);
	}

	if (operation === 'update') {
		const id = ctx.getNodeParameter('tagId', i) as string;
		const body: IDataObject = {};
		const updateFields = ctx.getNodeParameter('updateFields', i, {}) as IDataObject;
		if (updateFields.name) body.name = updateFields.name;
		if (updateFields.color) body.color = updateFields.color;
		return dmlyApiRequest.call(ctx, 'PUT', `/tags/${id}`, body);
	}

	if (operation === 'delete') {
		const id = ctx.getNodeParameter('tagId', i) as string;
		return dmlyApiRequest.call(ctx, 'DELETE', `/tags/${id}`);
	}

	throw new NodeOperationError(node, `Unknown operation "${operation}" for resource "tag".`, {
		itemIndex: i,
	});
}
