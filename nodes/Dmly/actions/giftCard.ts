import type { IDataObject, IExecuteFunctions } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

import { dmlyApiRequest, dmlyApiRequestAllItems } from '../GenericFunctions';

// The route URI is hyphenated (gift-cards) even though the route names use "giftcards".
const BASE = '/gift-cards';

export async function handleGiftCard(
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
		if (filters.status) qs.status = filters.status;

		if (returnAll) {
			return dmlyApiRequestAllItems.call(ctx, 'GET', BASE, {}, qs);
		}
		qs.per_page = ctx.getNodeParameter('limit', i) as number;
		return dmlyApiRequest.call(ctx, 'GET', BASE, {}, qs);
	}

	if (operation === 'get') {
		const id = ctx.getNodeParameter('giftCardId', i) as string;
		return dmlyApiRequest.call(ctx, 'GET', `${BASE}/${id}`);
	}

	if (operation === 'create') {
		const comp = ctx.getNodeParameter('comp', i, false) as boolean;
		const body: IDataObject = {
			value: ctx.getNodeParameter('value', i) as number,
			currency: ctx.getNodeParameter('currency', i) as string,
			comp,
		};
		if (!comp) body.purchaser_id = ctx.getNodeParameter('purchaserId', i) as string;

		const fields = ctx.getNodeParameter('additionalFields', i, {}) as IDataObject;
		if (fields.recipientId) body.recipient_id = fields.recipientId;
		if (fields.expiresAt) body.expires_at = fields.expiresAt;
		if (fields.notes) body.notes = fields.notes;
		return dmlyApiRequest.call(ctx, 'POST', BASE, body);
	}

	if (operation === 'redeem') {
		const body: IDataObject = {
			code: ctx.getNodeParameter('code', i) as string,
			invoice_id: ctx.getNodeParameter('invoiceId', i) as string,
		};
		const amount = ctx.getNodeParameter('amount', i, 0) as number;
		if (amount) body.amount = amount;
		return dmlyApiRequest.call(ctx, 'POST', `${BASE}/redeem`, body);
	}

	throw new NodeOperationError(node, `Unknown operation "${operation}" for resource "giftCard".`, {
		itemIndex: i,
	});
}
