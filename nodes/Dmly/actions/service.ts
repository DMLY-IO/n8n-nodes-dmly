import type { IDataObject, IExecuteFunctions } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

import { dmlyApiRequest, dmlyApiRequestAllItems } from '../GenericFunctions';

function applyServiceFields(body: IDataObject, fields: IDataObject): void {
	if (fields.name !== undefined) body.name = fields.name;
	if (fields.type !== undefined) body.type = fields.type;
	if (fields.category !== undefined) body.category = fields.category;
	if (fields.description !== undefined) body.description = fields.description;
	if (fields.price !== undefined) body.price = fields.price;
	if (fields.costPrice !== undefined) body.cost_price = fields.costPrice;
	if (fields.currency !== undefined) body.currency = fields.currency;
	if (fields.taxRate !== undefined) body.tax_rate = fields.taxRate;
	if (fields.taxInclusive !== undefined) body.tax_inclusive = fields.taxInclusive;
	if (fields.credits !== undefined) body.credits = fields.credits;
	if (fields.creditCost !== undefined) body.credit_cost = fields.creditCost;
	if (fields.paymentMode !== undefined) body.payment_mode = fields.paymentMode;
	if (fields.capacity !== undefined) body.capacity = fields.capacity;
	if (fields.publicVisible !== undefined) body.public_visible = fields.publicVisible;
	if (fields.online !== undefined) body.online = fields.online;
	if (fields.durationMin !== undefined) body.duration_min = fields.durationMin;
	if (fields.locationType !== undefined) body.location_type = fields.locationType;
	if (fields.locationDetails !== undefined) body.location_details = fields.locationDetails;
	if (fields.color !== undefined) body.color = fields.color;
	if (fields.active !== undefined) body.active = fields.active;
}

export async function handleService(
	ctx: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<IDataObject | IDataObject[]> {
	const node = ctx.getNode();

	if (operation === 'getAll') {
		const returnAll = ctx.getNodeParameter('returnAll', i) as boolean;
		const filters = ctx.getNodeParameter('filters', i, {}) as IDataObject;
		const qs: IDataObject = {};
		if (filters.type) qs.type = filters.type;
		if (filters.category) qs.category = filters.category;
		if (filters.search) qs.q = filters.search;

		if (returnAll) {
			return dmlyApiRequestAllItems.call(ctx, 'GET', '/services', {}, qs);
		}
		qs.per_page = ctx.getNodeParameter('limit', i) as number;
		return dmlyApiRequest.call(ctx, 'GET', '/services', {}, qs);
	}

	if (operation === 'get') {
		const id = ctx.getNodeParameter('serviceId', i) as string;
		return dmlyApiRequest.call(ctx, 'GET', `/services/${id}`);
	}

	if (operation === 'create') {
		const body: IDataObject = {
			name: ctx.getNodeParameter('name', i) as string,
			type: ctx.getNodeParameter('type', i) as string,
		};
		applyServiceFields(body, ctx.getNodeParameter('additionalFields', i, {}) as IDataObject);
		return dmlyApiRequest.call(ctx, 'POST', '/services', body);
	}

	if (operation === 'update') {
		const id = ctx.getNodeParameter('serviceId', i) as string;
		const body: IDataObject = {};
		applyServiceFields(body, ctx.getNodeParameter('updateFields', i, {}) as IDataObject);
		return dmlyApiRequest.call(ctx, 'PUT', `/services/${id}`, body);
	}

	if (operation === 'delete') {
		const id = ctx.getNodeParameter('serviceId', i) as string;
		return dmlyApiRequest.call(ctx, 'DELETE', `/services/${id}`);
	}

	throw new NodeOperationError(node, `Unknown operation "${operation}" for resource "service".`, {
		itemIndex: i,
	});
}
