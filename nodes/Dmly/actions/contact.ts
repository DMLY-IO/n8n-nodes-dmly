import type { IDataObject, IExecuteFunctions, IHttpRequestMethods, INode } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

import {
	BINARY_RESULT,
	dmlyApiDownload,
	dmlyApiRequest,
	dmlyApiRequestAllItems,
	parseCsv,
	parseJsonObject,
} from '../GenericFunctions';

function applyContactFields(node: INode, body: IDataObject, fields: IDataObject, itemIndex: number): void {
	if (fields.name) body.name = fields.name;
	if (fields.phone) body.phone = fields.phone;
	if (fields.email) body.email = fields.email;
	if (fields.channel) body.channel = fields.channel;
	if (fields.stage) body.stage = fields.stage;
	if (fields.source) body.source = fields.source;
	if (fields.lifecycleStage) body.lifecycle_stage = fields.lifecycleStage;
	if (fields.tags) body.tags = parseCsv(fields.tags as string);
	if (fields.customFields) {
		body.custom_fields = parseJsonObject(node, fields.customFields, itemIndex, 'Custom Fields');
	}
	if (fields.consent === true) {
		body.consent = true;
		if (fields.consentText) body.consent_text = fields.consentText;
		if (fields.consentPageUrl) body.consent_page_url = fields.consentPageUrl;
	}
}

export async function handleContact(
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
		if (filters.lifecycle) qs.lifecycle = filters.lifecycle;
		if (filters.status) qs.status = filters.status;
		if (filters.platform) qs.platform = filters.platform;
		if (filters.stage) qs.stage = filters.stage;
		if (filters.source) qs.source = filters.source;
		if (filters.hasPhone) qs.has_phone = true;
		if (filters.hasEmail) qs.has_email = true;
		if (filters.tags) qs.tags = parseCsv(filters.tags as string);

		if (returnAll) {
			return dmlyApiRequestAllItems.call(ctx, 'GET', '/contacts', {}, qs);
		}
		qs.per_page = ctx.getNodeParameter('limit', i) as number;
		return dmlyApiRequest.call(ctx, 'GET', '/contacts', {}, qs);
	}

	if (operation === 'get') {
		const id = ctx.getNodeParameter('contactId', i) as string;
		return dmlyApiRequest.call(ctx, 'GET', `/contacts/${id}`);
	}

	if (operation === 'create') {
		const body: IDataObject = { name: ctx.getNodeParameter('name', i) as string };
		applyContactFields(node, body, ctx.getNodeParameter('additionalFields', i, {}) as IDataObject, i);
		return dmlyApiRequest.call(ctx, 'POST', '/contacts', body);
	}

	if (operation === 'update') {
		const id = ctx.getNodeParameter('contactId', i) as string;
		const body: IDataObject = {};
		applyContactFields(node, body, ctx.getNodeParameter('updateFields', i, {}) as IDataObject, i);
		return dmlyApiRequest.call(ctx, 'PUT', `/contacts/${id}`, body);
	}

	if (operation === 'delete') {
		const id = ctx.getNodeParameter('contactId', i) as string;
		return dmlyApiRequest.call(ctx, 'DELETE', `/contacts/${id}`);
	}

	if (operation === 'dataExport') {
		const id = ctx.getNodeParameter('contactId', i) as string;
		const property = ctx.getNodeParameter('binaryPropertyName', i) as string;
		const file = await dmlyApiDownload.call(ctx, `/contacts/${id}/data-export`);
		const fileName = file.fileName ?? `contact-${id}-data-export.zip`;
		const binary = await ctx.helpers.prepareBinaryData(file.data, fileName, file.mimeType ?? 'application/zip');
		return { contactId: id, fileName, [BINARY_RESULT]: { [property]: binary } };
	}

	if (operation === 'addTags' || operation === 'removeTags') {
		const id = ctx.getNodeParameter('contactId', i) as string;
		const tags = parseCsv(ctx.getNodeParameter('tags', i) as string);
		const method: IHttpRequestMethods = operation === 'addTags' ? 'POST' : 'DELETE';
		return dmlyApiRequest.call(ctx, method, `/contacts/${id}/tags`, { tags });
	}

	if (operation === 'addNote') {
		const id = ctx.getNodeParameter('contactId', i) as string;
		const body = ctx.getNodeParameter('noteBody', i) as string;
		return dmlyApiRequest.call(ctx, 'POST', `/contacts/${id}/notes`, { body });
	}

	if (operation === 'setStage') {
		const id = ctx.getNodeParameter('contactId', i) as string;
		const stage = ctx.getNodeParameter('stageId', i, '') as string;
		return dmlyApiRequest.call(ctx, 'PUT', `/contacts/${id}/stage`, { stage: stage || null });
	}

	if (operation === 'setLifecycle') {
		const id = ctx.getNodeParameter('contactId', i) as string;
		const body: IDataObject = { stage: ctx.getNodeParameter('lifecycleStage', i) as string };
		const reason = ctx.getNodeParameter('reason', i, '') as string;
		if (reason) body.reason = reason;
		return dmlyApiRequest.call(ctx, 'PUT', `/contacts/${id}/lifecycle`, body);
	}

	throw new NodeOperationError(node, `Unknown operation "${operation}" for resource "contact".`, {
		itemIndex: i,
	});
}
