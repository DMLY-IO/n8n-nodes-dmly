import type { IDataObject, IExecuteFunctions } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

import { dmlyApiRequest, dmlyApiRequestAllItems } from '../GenericFunctions';

export async function handleConversation(
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
		if (filters.platform) qs.platform = filters.platform;
		if (filters.unread) qs.unread = true;

		if (returnAll) {
			return dmlyApiRequestAllItems.call(ctx, 'GET', '/conversations', {}, qs);
		}
		qs.per_page = ctx.getNodeParameter('limit', i) as number;
		return dmlyApiRequest.call(ctx, 'GET', '/conversations', {}, qs);
	}

	if (operation === 'getMessages') {
		const id = ctx.getNodeParameter('contactId', i) as string;
		const returnAll = ctx.getNodeParameter('returnAll', i) as boolean;
		if (returnAll) {
			return dmlyApiRequestAllItems.call(ctx, 'GET', `/conversations/${id}/messages`);
		}
		const qs: IDataObject = { per_page: ctx.getNodeParameter('limit', i) as number };
		return dmlyApiRequest.call(ctx, 'GET', `/conversations/${id}/messages`, {}, qs);
	}

	throw new NodeOperationError(node, `Unknown operation "${operation}" for resource "conversation".`, {
		itemIndex: i,
	});
}
