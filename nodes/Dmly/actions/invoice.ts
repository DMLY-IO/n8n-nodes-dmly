import type { IDataObject, IExecuteFunctions } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

import { dmlyApiRequest, dmlyApiRequestAllItems, parseJson } from '../GenericFunctions';

export async function handleInvoice(
	ctx: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<IDataObject | IDataObject[]> {
	const node = ctx.getNode();

	if (operation === 'getAll') {
		const returnAll = ctx.getNodeParameter('returnAll', i) as boolean;
		const filters = ctx.getNodeParameter('filters', i, {}) as IDataObject;
		const qs: IDataObject = {};
		if (filters.status) qs.status = filters.status;
		if (filters.contact) qs.contact = filters.contact;
		if (filters.from) qs.from = filters.from;
		if (filters.to) qs.to = filters.to;

		if (returnAll) {
			return dmlyApiRequestAllItems.call(ctx, 'GET', '/invoices', {}, qs);
		}
		qs.per_page = ctx.getNodeParameter('limit', i) as number;
		return dmlyApiRequest.call(ctx, 'GET', '/invoices', {}, qs);
	}

	if (operation === 'get') {
		const id = ctx.getNodeParameter('invoiceId', i) as string;
		return dmlyApiRequest.call(ctx, 'GET', `/invoices/${id}`);
	}

	if (operation === 'create') {
		const body: IDataObject = {
			line_items: parseJson(node, ctx.getNodeParameter('lineItems', i), i, 'Line Items'),
		};
		const fields = ctx.getNodeParameter('additionalFields', i, {}) as IDataObject;
		if (fields.contactId) body.contact_id = fields.contactId;
		if (fields.currency) body.currency = fields.currency;
		if (fields.issueDate) body.issue_date = fields.issueDate;
		if (fields.dueDate) body.due_date = fields.dueDate;
		if (fields.discountTotal !== undefined) body.discount_total = fields.discountTotal;
		if (fields.clientNotes) body.client_notes = fields.clientNotes;
		return dmlyApiRequest.call(ctx, 'POST', '/invoices', body);
	}

	if (operation === 'send') {
		const id = ctx.getNodeParameter('invoiceId', i) as string;
		return dmlyApiRequest.call(ctx, 'POST', `/invoices/${id}/send`);
	}

	if (operation === 'void') {
		const id = ctx.getNodeParameter('invoiceId', i) as string;
		return dmlyApiRequest.call(ctx, 'POST', `/invoices/${id}/void`);
	}

	if (operation === 'recordPayment') {
		const id = ctx.getNodeParameter('invoiceId', i) as string;
		const body: IDataObject = { amount: ctx.getNodeParameter('amount', i) as number };
		const fields = ctx.getNodeParameter('paymentFields', i, {}) as IDataObject;
		if (fields.paymentMethod) body.payment_method = fields.paymentMethod;
		if (fields.reference) body.reference = fields.reference;
		return dmlyApiRequest.call(ctx, 'POST', `/invoices/${id}/payments`, body);
	}

	throw new NodeOperationError(node, `Unknown operation "${operation}" for resource "invoice".`, {
		itemIndex: i,
	});
}
