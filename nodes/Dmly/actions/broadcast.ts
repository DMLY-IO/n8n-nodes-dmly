import type { IDataObject, IExecuteFunctions, INode } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

import { dmlyApiRequest, dmlyApiRequestAllItems, parseJson } from '../GenericFunctions';

function applyBroadcastFields(node: INode, body: IDataObject, fields: IDataObject, itemIndex: number): void {
	if (fields.name) body.name = fields.name;
	if (fields.channel) body.channel = fields.channel;
	if (fields.schedule) body.schedule = fields.schedule;
	if (fields.scheduledAt) body.scheduled_at = fields.scheduledAt;
	if (fields.timezoneMode) body.timezone_mode = fields.timezoneMode;
	if (fields.scheduledLocalAt) body.scheduled_local_at = fields.scheduledLocalAt;
	if (fields.requiresApproval) body.requires_approval = fields.requiresApproval;
	if (fields.type) body.type = fields.type;
	if (fields.sourceBroadcastId) body.source_broadcast_id = fields.sourceBroadcastId;
	if (fields.retargetEngagement) body.retarget_engagement = fields.retargetEngagement;
	if (fields.audience) body.audience = parseJson(node, fields.audience, itemIndex, 'Audience');
	if (fields.message) body.message = parseJson(node, fields.message, itemIndex, 'Message');
}

export async function handleBroadcast(
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
		if (filters.channel) qs.channel = filters.channel;

		if (returnAll) {
			return dmlyApiRequestAllItems.call(ctx, 'GET', '/broadcasts', {}, qs);
		}
		qs.per_page = ctx.getNodeParameter('limit', i) as number;
		return dmlyApiRequest.call(ctx, 'GET', '/broadcasts', {}, qs);
	}

	if (operation === 'get') {
		const id = ctx.getNodeParameter('broadcastId', i) as string;
		return dmlyApiRequest.call(ctx, 'GET', `/broadcasts/${id}`);
	}

	if (operation === 'create') {
		const body: IDataObject = {
			name: ctx.getNodeParameter('name', i) as string,
			channel: ctx.getNodeParameter('channel', i) as string,
		};
		applyBroadcastFields(node, body, ctx.getNodeParameter('additionalFields', i, {}) as IDataObject, i);
		return dmlyApiRequest.call(ctx, 'POST', '/broadcasts', body);
	}

	if (operation === 'update') {
		const id = ctx.getNodeParameter('broadcastId', i) as string;
		const body: IDataObject = {};
		applyBroadcastFields(node, body, ctx.getNodeParameter('updateFields', i, {}) as IDataObject, i);
		return dmlyApiRequest.call(ctx, 'PUT', `/broadcasts/${id}`, body);
	}

	if (operation === 'delete') {
		const id = ctx.getNodeParameter('broadcastId', i) as string;
		return dmlyApiRequest.call(ctx, 'DELETE', `/broadcasts/${id}`);
	}

	if (operation === 'approve') {
		const id = ctx.getNodeParameter('broadcastId', i) as string;
		return dmlyApiRequest.call(ctx, 'POST', `/broadcasts/${id}/approve`);
	}

	if (operation === 'send') {
		const id = ctx.getNodeParameter('broadcastId', i) as string;
		return dmlyApiRequest.call(ctx, 'POST', `/broadcasts/${id}/send`);
	}

	if (operation === 'getRecipients') {
		const id = ctx.getNodeParameter('broadcastId', i) as string;
		const returnAll = ctx.getNodeParameter('returnAll', i) as boolean;
		const filters = ctx.getNodeParameter('recipientFilters', i, {}) as IDataObject;
		const qs: IDataObject = {};
		if (filters.status) qs.status = filters.status;

		if (returnAll) {
			return dmlyApiRequestAllItems.call(ctx, 'GET', `/broadcasts/${id}/recipients`, {}, qs);
		}
		qs.per_page = ctx.getNodeParameter('limit', i) as number;
		return dmlyApiRequest.call(ctx, 'GET', `/broadcasts/${id}/recipients`, {}, qs);
	}

	throw new NodeOperationError(node, `Unknown operation "${operation}" for resource "broadcast".`, {
		itemIndex: i,
	});
}
