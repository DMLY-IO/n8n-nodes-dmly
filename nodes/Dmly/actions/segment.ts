import type { IDataObject, IExecuteFunctions, INode } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

import { dmlyApiRequest, dmlyApiRequestAllItems, parseJson, parseJsonObject } from '../GenericFunctions';

function applySegmentFields(node: INode, body: IDataObject, fields: IDataObject, itemIndex: number): void {
	if (fields.name) body.name = fields.name;
	if (fields.stage) body.stage = fields.stage;
	if (fields.minDaysInactive !== undefined) body.min_days_inactive = fields.minDaysInactive;
	if (fields.includeTags) body.include_tags = parseJson(node, fields.includeTags, itemIndex, 'Include Tags');
	if (fields.excludeTags) body.exclude_tags = parseJson(node, fields.excludeTags, itemIndex, 'Exclude Tags');
	if (fields.conditions) body.conditions = parseJsonObject(node, fields.conditions, itemIndex, 'Conditions');
}

export async function handleSegment(
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
		if (filters.withCounts) qs.with_counts = true;

		if (returnAll) {
			return dmlyApiRequestAllItems.call(ctx, 'GET', '/segments', {}, qs);
		}
		qs.per_page = ctx.getNodeParameter('limit', i) as number;
		return dmlyApiRequest.call(ctx, 'GET', '/segments', {}, qs);
	}

	if (operation === 'get') {
		const id = ctx.getNodeParameter('segmentId', i) as string;
		return dmlyApiRequest.call(ctx, 'GET', `/segments/${id}`);
	}

	if (operation === 'create') {
		const body: IDataObject = { name: ctx.getNodeParameter('name', i) as string };
		applySegmentFields(node, body, ctx.getNodeParameter('additionalFields', i, {}) as IDataObject, i);
		return dmlyApiRequest.call(ctx, 'POST', '/segments', body);
	}

	if (operation === 'update') {
		const id = ctx.getNodeParameter('segmentId', i) as string;
		const body: IDataObject = {};
		applySegmentFields(node, body, ctx.getNodeParameter('updateFields', i, {}) as IDataObject, i);
		return dmlyApiRequest.call(ctx, 'PUT', `/segments/${id}`, body);
	}

	if (operation === 'delete') {
		const id = ctx.getNodeParameter('segmentId', i) as string;
		return dmlyApiRequest.call(ctx, 'DELETE', `/segments/${id}`);
	}

	if (operation === 'getContacts') {
		const id = ctx.getNodeParameter('segmentId', i) as string;
		const returnAll = ctx.getNodeParameter('returnAll', i) as boolean;
		if (returnAll) {
			return dmlyApiRequestAllItems.call(ctx, 'GET', `/segments/${id}/contacts`);
		}
		const qs: IDataObject = { per_page: ctx.getNodeParameter('limit', i) as number };
		return dmlyApiRequest.call(ctx, 'GET', `/segments/${id}/contacts`, {}, qs);
	}

	throw new NodeOperationError(node, `Unknown operation "${operation}" for resource "segment".`, {
		itemIndex: i,
	});
}
