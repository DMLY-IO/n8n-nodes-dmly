import type { IDataObject, IExecuteFunctions } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

import { dmlyApiRequest, dmlyApiRequestAllItems } from '../GenericFunctions';

function applyClassSessionFields(body: IDataObject, fields: IDataObject): void {
	if (fields.serviceId) body.service_id = fields.serviceId;
	if (fields.startsAt) body.starts_at = fields.startsAt;
	if (fields.endsAt) body.ends_at = fields.endsAt;
	if (fields.staffId) body.staff_id = fields.staffId;
	if (fields.capacity !== undefined) body.capacity = fields.capacity;
	if (fields.location) body.location = fields.location;
	if (fields.waitlistEnabled !== undefined) body.waitlist_enabled = fields.waitlistEnabled;
	if (fields.timezone) body.timezone = fields.timezone;
	if (fields.status) body.status = fields.status;
}

export async function handleClassSession(
	ctx: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<IDataObject | IDataObject[]> {
	const node = ctx.getNode();

	if (operation === 'getAll') {
		const returnAll = ctx.getNodeParameter('returnAll', i) as boolean;
		const filters = ctx.getNodeParameter('filters', i, {}) as IDataObject;
		const qs: IDataObject = {};
		if (filters.service) qs.service = filters.service;
		if (filters.staff) qs.staff = filters.staff;
		if (filters.status) qs.status = filters.status;
		if (filters.from) qs.from = filters.from;
		if (filters.to) qs.to = filters.to;

		if (returnAll) {
			return dmlyApiRequestAllItems.call(ctx, 'GET', '/classes', {}, qs);
		}
		qs.per_page = ctx.getNodeParameter('limit', i) as number;
		return dmlyApiRequest.call(ctx, 'GET', '/classes', {}, qs);
	}

	if (operation === 'get') {
		const id = ctx.getNodeParameter('classSessionId', i) as string;
		return dmlyApiRequest.call(ctx, 'GET', `/classes/${id}`);
	}

	if (operation === 'create') {
		const body: IDataObject = {
			service_id: ctx.getNodeParameter('serviceId', i) as string,
			starts_at: ctx.getNodeParameter('startsAt', i) as string,
		};
		applyClassSessionFields(body, ctx.getNodeParameter('additionalFields', i, {}) as IDataObject);
		return dmlyApiRequest.call(ctx, 'POST', '/classes', body);
	}

	if (operation === 'update') {
		const id = ctx.getNodeParameter('classSessionId', i) as string;
		const body: IDataObject = {};
		applyClassSessionFields(body, ctx.getNodeParameter('updateFields', i, {}) as IDataObject);
		return dmlyApiRequest.call(ctx, 'PUT', `/classes/${id}`, body);
	}

	if (operation === 'delete') {
		const id = ctx.getNodeParameter('classSessionId', i) as string;
		return dmlyApiRequest.call(ctx, 'DELETE', `/classes/${id}`);
	}

	throw new NodeOperationError(node, `Unknown operation "${operation}" for resource "classSession".`, {
		itemIndex: i,
	});
}
