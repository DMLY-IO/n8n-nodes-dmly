import type { IDataObject, IExecuteFunctions } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

import { dmlyApiRequest, dmlyApiRequestAllItems } from '../GenericFunctions';

function applyServiceCategoryFields(body: IDataObject, fields: IDataObject): void {
	if (fields.name !== undefined) body.name = fields.name;
	if (fields.kind !== undefined) body.kind = fields.kind;
	if (fields.color !== undefined) body.color = fields.color;
	if (fields.sortOrder !== undefined) body.sort_order = fields.sortOrder;
	if (fields.active !== undefined) body.active = fields.active;
}

export async function handleServiceCategory(
	ctx: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<IDataObject | IDataObject[]> {
	const node = ctx.getNode();

	if (operation === 'getAll') {
		const returnAll = ctx.getNodeParameter('returnAll', i) as boolean;
		const filters = ctx.getNodeParameter('filters', i, {}) as IDataObject;
		const qs: IDataObject = {};
		if (filters.kind) qs.kind = filters.kind;
		if (filters.search) qs.q = filters.search;

		if (returnAll) {
			return dmlyApiRequestAllItems.call(ctx, 'GET', '/service-categories', {}, qs);
		}
		qs.per_page = ctx.getNodeParameter('limit', i) as number;
		return dmlyApiRequest.call(ctx, 'GET', '/service-categories', {}, qs);
	}

	if (operation === 'get') {
		const id = ctx.getNodeParameter('serviceCategoryId', i) as string;
		return dmlyApiRequest.call(ctx, 'GET', `/service-categories/${id}`);
	}

	if (operation === 'create') {
		const body: IDataObject = { name: ctx.getNodeParameter('name', i) as string };
		applyServiceCategoryFields(body, ctx.getNodeParameter('additionalFields', i, {}) as IDataObject);
		return dmlyApiRequest.call(ctx, 'POST', '/service-categories', body);
	}

	if (operation === 'update') {
		const id = ctx.getNodeParameter('serviceCategoryId', i) as string;
		const body: IDataObject = {};
		applyServiceCategoryFields(body, ctx.getNodeParameter('updateFields', i, {}) as IDataObject);
		return dmlyApiRequest.call(ctx, 'PUT', `/service-categories/${id}`, body);
	}

	if (operation === 'delete') {
		const id = ctx.getNodeParameter('serviceCategoryId', i) as string;
		return dmlyApiRequest.call(ctx, 'DELETE', `/service-categories/${id}`);
	}

	throw new NodeOperationError(
		node,
		`Unknown operation "${operation}" for resource "serviceCategory".`,
		{ itemIndex: i },
	);
}
