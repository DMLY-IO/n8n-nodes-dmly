import type { IDataObject, IExecuteFunctions } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

import { dmlyApiRequest, dmlyApiRequestAllItems } from '../GenericFunctions';

function applyProductFields(body: IDataObject, fields: IDataObject): void {
	if (fields.name) body.name = fields.name;
	if (fields.categoryId) body.category_id = fields.categoryId;
	if (fields.description) body.description = fields.description;
	if (fields.sku) body.sku = fields.sku;
	if (fields.price !== undefined) body.price = fields.price;
	if (fields.costPrice !== undefined) body.cost_price = fields.costPrice;
	if (fields.currency) body.currency = fields.currency;
	if (fields.taxRate !== undefined) body.tax_rate = fields.taxRate;
	if (fields.taxInclusive !== undefined) body.tax_inclusive = fields.taxInclusive;
	if (fields.trackStock !== undefined) body.track_stock = fields.trackStock;
	if (fields.stockQuantity !== undefined) body.stock_quantity = fields.stockQuantity;
	if (fields.lowStockThreshold !== undefined) body.low_stock_threshold = fields.lowStockThreshold;
	if (fields.imageUrl) body.image_url = fields.imageUrl;
	if (fields.metaSyncFacebook !== undefined) body.meta_sync_facebook = fields.metaSyncFacebook;
	if (fields.metaSyncInstagram !== undefined) body.meta_sync_instagram = fields.metaSyncInstagram;
	if (fields.sortOrder !== undefined) body.sort_order = fields.sortOrder;
	if (fields.active !== undefined) body.active = fields.active;
}

export async function handleProduct(
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
		if (filters.lowStock !== undefined) qs.low_stock = filters.lowStock;
		if (filters.category) qs.category = filters.category;

		if (returnAll) {
			return dmlyApiRequestAllItems.call(ctx, 'GET', '/products', {}, qs);
		}
		qs.per_page = ctx.getNodeParameter('limit', i) as number;
		return dmlyApiRequest.call(ctx, 'GET', '/products', {}, qs);
	}

	if (operation === 'get') {
		const id = ctx.getNodeParameter('productId', i) as string;
		return dmlyApiRequest.call(ctx, 'GET', `/products/${id}`);
	}

	if (operation === 'create') {
		const body: IDataObject = { name: ctx.getNodeParameter('name', i) as string };
		applyProductFields(body, ctx.getNodeParameter('additionalFields', i, {}) as IDataObject);
		return dmlyApiRequest.call(ctx, 'POST', '/products', body);
	}

	if (operation === 'update') {
		const id = ctx.getNodeParameter('productId', i) as string;
		const body: IDataObject = {};
		applyProductFields(body, ctx.getNodeParameter('updateFields', i, {}) as IDataObject);
		return dmlyApiRequest.call(ctx, 'PUT', `/products/${id}`, body);
	}

	if (operation === 'delete') {
		const id = ctx.getNodeParameter('productId', i) as string;
		return dmlyApiRequest.call(ctx, 'DELETE', `/products/${id}`);
	}

	throw new NodeOperationError(node, `Unknown operation "${operation}" for resource "product".`, {
		itemIndex: i,
	});
}
