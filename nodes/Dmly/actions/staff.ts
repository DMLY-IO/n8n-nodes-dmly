import type { IDataObject, IExecuteFunctions, INode } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

import { dmlyApiRequest, dmlyApiRequestAllItems } from '../GenericFunctions';

function applyStaffFields(_node: INode, body: IDataObject, fields: IDataObject): void {
	if (fields.name !== undefined) body.name = fields.name;
	if (fields.email !== undefined) body.email = fields.email;
	if (fields.phone !== undefined) body.phone = fields.phone;
	if (fields.title !== undefined) body.title = fields.title;
	if (fields.bio !== undefined) body.bio = fields.bio;
	if (fields.color !== undefined) body.color = fields.color;
	if (fields.timezone !== undefined) body.timezone = fields.timezone;
	if (fields.acceptsBookings !== undefined) body.accepts_bookings = fields.acceptsBookings;
	if (fields.active !== undefined) body.active = fields.active;
}

export async function handleStaff(
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
		if (filters.active !== undefined) qs.active = filters.active;
		if (filters.acceptsBookings !== undefined) qs.accepts_bookings = filters.acceptsBookings;

		if (returnAll) {
			return dmlyApiRequestAllItems.call(ctx, 'GET', '/staff', {}, qs);
		}
		qs.per_page = ctx.getNodeParameter('limit', i) as number;
		return dmlyApiRequest.call(ctx, 'GET', '/staff', {}, qs);
	}

	if (operation === 'get') {
		const id = ctx.getNodeParameter('staffId', i) as string;
		return dmlyApiRequest.call(ctx, 'GET', `/staff/${id}`);
	}

	if (operation === 'getAvailability') {
		const id = ctx.getNodeParameter('staffId', i) as string;
		const qs: IDataObject = {};
		const from = ctx.getNodeParameter('from', i, '') as string;
		const to = ctx.getNodeParameter('to', i, '') as string;
		if (from) qs.from = from;
		if (to) qs.to = to;
		return dmlyApiRequest.call(ctx, 'GET', `/staff/${id}/availability`, {}, qs);
	}

	if (operation === 'create') {
		const body: IDataObject = { name: ctx.getNodeParameter('name', i) as string };
		applyStaffFields(node, body, ctx.getNodeParameter('additionalFields', i, {}) as IDataObject);
		return dmlyApiRequest.call(ctx, 'POST', '/staff', body);
	}

	if (operation === 'update') {
		const id = ctx.getNodeParameter('staffId', i) as string;
		const body: IDataObject = {};
		applyStaffFields(node, body, ctx.getNodeParameter('updateFields', i, {}) as IDataObject);
		return dmlyApiRequest.call(ctx, 'PUT', `/staff/${id}`, body);
	}

	if (operation === 'delete') {
		const id = ctx.getNodeParameter('staffId', i) as string;
		return dmlyApiRequest.call(ctx, 'DELETE', `/staff/${id}`);
	}

	throw new NodeOperationError(node, `Unknown operation "${operation}" for resource "staff".`, {
		itemIndex: i,
	});
}
