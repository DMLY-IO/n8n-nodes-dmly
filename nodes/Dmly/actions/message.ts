import type { IDataObject, IExecuteFunctions } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

import { dmlyApiRequest, parseJson, parseJsonObject } from '../GenericFunctions';

export async function handleMessage(
	ctx: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<IDataObject | IDataObject[]> {
	const node = ctx.getNode();

	if (operation === 'send') {
		const body: IDataObject = {
			contact_id: ctx.getNodeParameter('contactId', i) as string,
			type: ctx.getNodeParameter('type', i) as string,
		};
		const additionalFields = ctx.getNodeParameter('additionalFields', i, {}) as IDataObject;
		if (additionalFields.body) body.body = additionalFields.body;
		if (additionalFields.kind) body.kind = additionalFields.kind;
		if (additionalFields.templateId) body.template_id = additionalFields.templateId;
		if (additionalFields.media) {
			const media = parseJson(node, additionalFields.media, i, 'Media');
			if (media !== undefined) body.media = media;
		}
		if (additionalFields.header) {
			const header = parseJsonObject(node, additionalFields.header, i, 'Header');
			if (header && typeof header === 'object' && !Array.isArray(header) && Object.keys(header).length) {
				body.header = header;
			}
		}
		if (additionalFields.parameters) {
			const parameters = parseJson(node, additionalFields.parameters, i, 'Parameters');
			if (parameters !== undefined) body.parameters = parameters;
		}
		return dmlyApiRequest.call(ctx, 'POST', '/messages', body);
	}

	throw new NodeOperationError(node, `Unknown operation "${operation}" for resource "message".`, {
		itemIndex: i,
	});
}
