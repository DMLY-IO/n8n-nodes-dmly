import type { IDataObject, IExecuteFunctions } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

import { dmlyApiRequest, dmlyApiRequestAllItems } from '../GenericFunctions';

export async function handlePayment(
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
			return dmlyApiRequestAllItems.call(ctx, 'GET', '/payments', {}, qs);
		}
		qs.per_page = ctx.getNodeParameter('limit', i) as number;
		return dmlyApiRequest.call(ctx, 'GET', '/payments', {}, qs);
	}

	if (operation === 'get') {
		const id = ctx.getNodeParameter('paymentId', i) as string;
		return dmlyApiRequest.call(ctx, 'GET', `/payments/${id}`);
	}

	if (operation === 'create') {
		const body: IDataObject = {
			contact_id: ctx.getNodeParameter('contactId', i) as string,
			amount: ctx.getNodeParameter('amount', i) as number,
		};
		const fields = ctx.getNodeParameter('additionalFields', i, {}) as IDataObject;
		if (fields.currency) body.currency = fields.currency;
		if (fields.paymentMethod) body.payment_method = fields.paymentMethod;
		if (fields.reference) body.reference = fields.reference;
		if (fields.description) body.description = fields.description;
		return dmlyApiRequest.call(ctx, 'POST', '/payments', body);
	}

	if (operation === 'refund') {
		const id = ctx.getNodeParameter('paymentId', i) as string;
		const amount = ctx.getNodeParameter('refundAmount', i, 0) as number;
		const body: IDataObject = {};
		if (amount) body.amount = amount;
		return dmlyApiRequest.call(ctx, 'POST', `/payments/${id}/refund`, body);
	}

	throw new NodeOperationError(node, `Unknown operation "${operation}" for resource "payment".`, {
		itemIndex: i,
	});
}
