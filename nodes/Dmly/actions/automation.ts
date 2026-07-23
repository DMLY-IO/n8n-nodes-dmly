import type { IDataObject, IExecuteFunctions } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

import { dmlyApiRequest, dmlyApiRequestAllItems } from '../GenericFunctions';

export async function handleAutomation(
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
		if (filters.type) qs.type = filters.type;
		if (filters.builder) qs.builder = filters.builder;
		if (filters.channel) qs.channel = filters.channel;

		if (returnAll) {
			return dmlyApiRequestAllItems.call(ctx, 'GET', '/automations', {}, qs);
		}
		qs.per_page = ctx.getNodeParameter('limit', i) as number;
		return dmlyApiRequest.call(ctx, 'GET', '/automations', {}, qs);
	}

	if (operation === 'get') {
		const id = ctx.getNodeParameter('automationId', i) as string;
		return dmlyApiRequest.call(ctx, 'GET', `/automations/${id}`);
	}

	if (operation === 'activate') {
		const id = ctx.getNodeParameter('automationId', i) as string;
		return dmlyApiRequest.call(ctx, 'POST', `/automations/${id}/activate`);
	}

	if (operation === 'pause') {
		const id = ctx.getNodeParameter('automationId', i) as string;
		return dmlyApiRequest.call(ctx, 'POST', `/automations/${id}/pause`);
	}

	throw new NodeOperationError(node, `Unknown operation "${operation}" for resource "automation".`, {
		itemIndex: i,
	});
}
