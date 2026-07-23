import type { IDataObject, IExecuteFunctions, INode } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

import { dmlyApiRequest, dmlyApiRequestAllItems, parseJson } from '../GenericFunctions';

function applyPlanFields(node: INode, body: IDataObject, fields: IDataObject, itemIndex: number): void {
	if (fields.name) body.name = fields.name;
	if (fields.categoryId) body.category_id = fields.categoryId;
	if (fields.description) body.description = fields.description;
	if (fields.billingType) body.billing_type = fields.billingType;
	if (fields.price !== undefined) body.price = fields.price;
	if (fields.currency) body.currency = fields.currency;
	if (fields.billingInterval) body.billing_interval = fields.billingInterval;
	if (fields.intervalCount !== undefined) body.interval_count = fields.intervalCount;
	if (fields.credits !== undefined) body.credits = fields.credits;
	if (fields.isEcommerce !== undefined) body.is_ecommerce = fields.isEcommerce;
	if (fields.notifyEmail !== undefined) body.notify_email = fields.notifyEmail;
	if (fields.notifyWhatsapp !== undefined) body.notify_whatsapp = fields.notifyWhatsapp;
	if (fields.imageUrl) body.image_url = fields.imageUrl;
	if (fields.sortOrder !== undefined) body.sort_order = fields.sortOrder;
	if (fields.active !== undefined) body.active = fields.active;
	if (fields.items) {
		const items = parseJson(node, fields.items, itemIndex, 'Items');
		if (items !== undefined) body.items = items;
	}
}

export async function handlePlan(
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
		if (filters.billingType) qs.billing_type = filters.billingType;
		if (filters.category) qs.category = filters.category;

		if (returnAll) {
			return dmlyApiRequestAllItems.call(ctx, 'GET', '/plans', {}, qs);
		}
		qs.per_page = ctx.getNodeParameter('limit', i) as number;
		return dmlyApiRequest.call(ctx, 'GET', '/plans', {}, qs);
	}

	if (operation === 'get') {
		const id = ctx.getNodeParameter('planId', i) as string;
		return dmlyApiRequest.call(ctx, 'GET', `/plans/${id}`);
	}

	if (operation === 'create') {
		const body: IDataObject = {
			name: ctx.getNodeParameter('name', i) as string,
			billing_type: ctx.getNodeParameter('billingType', i) as string,
		};
		applyPlanFields(node, body, ctx.getNodeParameter('additionalFields', i, {}) as IDataObject, i);
		return dmlyApiRequest.call(ctx, 'POST', '/plans', body);
	}

	if (operation === 'update') {
		const id = ctx.getNodeParameter('planId', i) as string;
		const body: IDataObject = {};
		applyPlanFields(node, body, ctx.getNodeParameter('updateFields', i, {}) as IDataObject, i);
		return dmlyApiRequest.call(ctx, 'PUT', `/plans/${id}`, body);
	}

	if (operation === 'delete') {
		const id = ctx.getNodeParameter('planId', i) as string;
		return dmlyApiRequest.call(ctx, 'DELETE', `/plans/${id}`);
	}

	throw new NodeOperationError(node, `Unknown operation "${operation}" for resource "plan".`, {
		itemIndex: i,
	});
}
