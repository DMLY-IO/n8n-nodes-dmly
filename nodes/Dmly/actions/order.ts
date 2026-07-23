import type { IDataObject, IExecuteFunctions } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

import { dmlyApiRequest, dmlyApiRequestAllItems, parseJson } from '../GenericFunctions';

export async function handleOrder(
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

		if (returnAll) {
			return dmlyApiRequestAllItems.call(ctx, 'GET', '/orders', {}, qs);
		}
		qs.per_page = ctx.getNodeParameter('limit', i) as number;
		return dmlyApiRequest.call(ctx, 'GET', '/orders', {}, qs);
	}

	if (operation === 'get') {
		const id = ctx.getNodeParameter('orderId', i) as string;
		return dmlyApiRequest.call(ctx, 'GET', `/orders/${id}`);
	}

	if (operation === 'create') {
		const body: IDataObject = {
			items: parseJson(node, ctx.getNodeParameter('items', i), i, 'Items'),
		};
		const additionalFields = ctx.getNodeParameter('additionalFields', i, {}) as IDataObject;
		if (additionalFields.contactId) body.contact_id = additionalFields.contactId;
		if (additionalFields.currency) body.currency = additionalFields.currency;
		if (additionalFields.notes) body.notes = additionalFields.notes;
		if (additionalFields.couponCode) body.coupon_code = additionalFields.couponCode;
		return dmlyApiRequest.call(ctx, 'POST', '/orders', body);
	}

	if (operation === 'confirm') {
		const id = ctx.getNodeParameter('orderId', i) as string;
		return dmlyApiRequest.call(ctx, 'POST', `/orders/${id}/confirm`);
	}

	if (operation === 'cancel') {
		const id = ctx.getNodeParameter('orderId', i) as string;
		return dmlyApiRequest.call(ctx, 'POST', `/orders/${id}/cancel`);
	}

	throw new NodeOperationError(node, `Unknown operation "${operation}" for resource "order".`, {
		itemIndex: i,
	});
}
