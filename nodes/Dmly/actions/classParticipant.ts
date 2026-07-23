import type { IDataObject, IExecuteFunctions } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

import { dmlyApiRequest, dmlyApiRequestAllItems } from '../GenericFunctions';

export async function handleClassParticipant(
	ctx: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<IDataObject | IDataObject[]> {
	const node = ctx.getNode();

	if (operation === 'getAll') {
		const session = ctx.getNodeParameter('sessionId', i) as string;
		const returnAll = ctx.getNodeParameter('returnAll', i) as boolean;
		const filters = ctx.getNodeParameter('filters', i, {}) as IDataObject;
		const qs: IDataObject = {};
		if (filters.status) qs.status = filters.status;

		if (returnAll) {
			return dmlyApiRequestAllItems.call(ctx, 'GET', `/classes/${session}/participants`, {}, qs);
		}
		qs.per_page = ctx.getNodeParameter('limit', i) as number;
		return dmlyApiRequest.call(ctx, 'GET', `/classes/${session}/participants`, {}, qs);
	}

	if (operation === 'book') {
		const session = ctx.getNodeParameter('sessionId', i) as string;
		const body: IDataObject = { contact_id: ctx.getNodeParameter('contactId', i) as string };
		return dmlyApiRequest.call(ctx, 'POST', `/classes/${session}/participants`, body);
	}

	if (operation === 'cancel') {
		const session = ctx.getNodeParameter('sessionId', i) as string;
		const participant = ctx.getNodeParameter('participantId', i) as string;
		return dmlyApiRequest.call(ctx, 'DELETE', `/classes/${session}/participants/${participant}`);
	}

	throw new NodeOperationError(
		node,
		`Unknown operation "${operation}" for resource "classParticipant".`,
		{ itemIndex: i },
	);
}
