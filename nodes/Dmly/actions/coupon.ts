import type { IDataObject, IExecuteFunctions } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

import { dmlyApiRequest, dmlyApiRequestAllItems } from '../GenericFunctions';

function applyCouponFields(body: IDataObject, fields: IDataObject): void {
	if (fields.code) body.code = fields.code;
	if (fields.type) body.type = fields.type;
	if (fields.value !== undefined) body.value = fields.value;
	if (fields.currency) body.currency = fields.currency;
	if (fields.minSubtotal !== undefined) body.min_subtotal = fields.minSubtotal;
	if (fields.usageLimit) body.usage_limit = fields.usageLimit;
	if (fields.perContactLimit) body.per_contact_limit = fields.perContactLimit;
	if (fields.startsAt) body.starts_at = fields.startsAt;
	if (fields.expiresAt) body.expires_at = fields.expiresAt;
	if (fields.active !== undefined) body.active = fields.active;
}

export async function handleCoupon(
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

		if (returnAll) {
			return dmlyApiRequestAllItems.call(ctx, 'GET', '/coupons', {}, qs);
		}
		qs.per_page = ctx.getNodeParameter('limit', i) as number;
		return dmlyApiRequest.call(ctx, 'GET', '/coupons', {}, qs);
	}

	if (operation === 'get') {
		const id = ctx.getNodeParameter('couponId', i) as string;
		return dmlyApiRequest.call(ctx, 'GET', `/coupons/${id}`);
	}

	if (operation === 'create') {
		const body: IDataObject = {
			code: ctx.getNodeParameter('code', i) as string,
			type: ctx.getNodeParameter('type', i) as string,
			value: ctx.getNodeParameter('value', i) as number,
		};
		applyCouponFields(body, ctx.getNodeParameter('additionalFields', i, {}) as IDataObject);
		return dmlyApiRequest.call(ctx, 'POST', '/coupons', body);
	}

	if (operation === 'update') {
		const id = ctx.getNodeParameter('couponId', i) as string;
		// code/type/value are re-validated as required on update, so they are top-level fields.
		const body: IDataObject = {
			code: ctx.getNodeParameter('code', i) as string,
			type: ctx.getNodeParameter('type', i) as string,
			value: ctx.getNodeParameter('value', i) as number,
		};
		applyCouponFields(body, ctx.getNodeParameter('updateFields', i, {}) as IDataObject);
		return dmlyApiRequest.call(ctx, 'PUT', `/coupons/${id}`, body);
	}

	if (operation === 'delete') {
		const id = ctx.getNodeParameter('couponId', i) as string;
		return dmlyApiRequest.call(ctx, 'DELETE', `/coupons/${id}`);
	}

	throw new NodeOperationError(node, `Unknown operation "${operation}" for resource "coupon".`, {
		itemIndex: i,
	});
}
