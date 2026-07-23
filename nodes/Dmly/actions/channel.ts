import type { IDataObject, IExecuteFunctions } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

import { dmlyApiRequest, dmlyApiRequestAllItems } from '../GenericFunctions';

export async function handleChannel(
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
		if (filters.platform) qs.platform = filters.platform;
		if (filters.status) qs.status = filters.status;

		if (returnAll) {
			return dmlyApiRequestAllItems.call(ctx, 'GET', '/channels', {}, qs);
		}
		qs.per_page = ctx.getNodeParameter('limit', i) as number;
		return dmlyApiRequest.call(ctx, 'GET', '/channels', {}, qs);
	}

	if (operation === 'get') {
		const id = ctx.getNodeParameter('channelId', i) as string;
		return dmlyApiRequest.call(ctx, 'GET', `/channels/${id}`);
	}

	throw new NodeOperationError(node, `Unknown operation "${operation}" for resource "channel".`, {
		itemIndex: i,
	});
}
