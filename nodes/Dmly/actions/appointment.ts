import type { IDataObject, IExecuteFunctions } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

import { dmlyApiRequest, dmlyApiRequestAllItems } from '../GenericFunctions';

export async function handleAppointment(
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
		if (filters.contact) qs.contact = filters.contact;
		if (filters.status) qs.status = filters.status;
		if (filters.from) qs.from = filters.from;
		if (filters.to) qs.to = filters.to;

		if (returnAll) {
			return dmlyApiRequestAllItems.call(ctx, 'GET', '/appointments', {}, qs);
		}
		qs.per_page = ctx.getNodeParameter('limit', i) as number;
		return dmlyApiRequest.call(ctx, 'GET', '/appointments', {}, qs);
	}

	if (operation === 'getSlots') {
		const qs: IDataObject = {
			service_id: ctx.getNodeParameter('serviceId', i) as string,
			date: ctx.getNodeParameter('date', i) as string,
		};
		const staffId = ctx.getNodeParameter('staffId', i, '') as string;
		const timezone = ctx.getNodeParameter('timezone', i, '') as string;
		const days = ctx.getNodeParameter('days', i, 7) as number;
		if (staffId) qs.staff_id = staffId;
		if (timezone) qs.timezone = timezone;
		if (days) qs.days = days;
		return dmlyApiRequest.call(ctx, 'GET', '/appointments/slots', {}, qs);
	}

	if (operation === 'create') {
		const body: IDataObject = {
			contact_id: ctx.getNodeParameter('contactId', i) as string,
			service_id: ctx.getNodeParameter('serviceId', i) as string,
			datetime: ctx.getNodeParameter('datetime', i) as string,
		};
		const fields = ctx.getNodeParameter('additionalFields', i, {}) as IDataObject;
		if (fields.staffId) body.staff_id = fields.staffId;
		if (fields.timezone) body.timezone = fields.timezone;
		if (fields.notes) body.notes = fields.notes;
		if (fields.source) body.source = fields.source;
		return dmlyApiRequest.call(ctx, 'POST', '/appointments', body);
	}

	if (operation === 'get') {
		const id = ctx.getNodeParameter('appointmentId', i) as string;
		return dmlyApiRequest.call(ctx, 'GET', `/appointments/${id}`);
	}

	if (operation === 'reschedule') {
		const id = ctx.getNodeParameter('appointmentId', i) as string;
		const body: IDataObject = { datetime: ctx.getNodeParameter('datetime', i) as string };
		const timezone = ctx.getNodeParameter('timezone', i, '') as string;
		if (timezone) body.timezone = timezone;
		return dmlyApiRequest.call(ctx, 'POST', `/appointments/${id}/reschedule`, body);
	}

	if (operation === 'cancel') {
		const id = ctx.getNodeParameter('appointmentId', i) as string;
		const body: IDataObject = {};
		const reason = ctx.getNodeParameter('reason', i, '') as string;
		if (reason) body.reason = reason;
		return dmlyApiRequest.call(ctx, 'POST', `/appointments/${id}/cancel`, body);
	}

	if (operation === 'updateStatus') {
		const id = ctx.getNodeParameter('appointmentId', i) as string;
		const body: IDataObject = { status: ctx.getNodeParameter('status', i) as string };
		return dmlyApiRequest.call(ctx, 'PUT', `/appointments/${id}/status`, body);
	}

	throw new NodeOperationError(node, `Unknown operation "${operation}" for resource "appointment".`, {
		itemIndex: i,
	});
}
