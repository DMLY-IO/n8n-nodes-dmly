import type { IDataObject, IExecuteFunctions } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

import { dmlyApiRequest, dmlyApiRequestAllItems } from '../GenericFunctions';

export async function handleSubscription(
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
		if (filters.contact) qs.contact = filters.contact;

		if (returnAll) {
			return dmlyApiRequestAllItems.call(ctx, 'GET', '/subscriptions', {}, qs);
		}
		qs.per_page = ctx.getNodeParameter('limit', i) as number;
		return dmlyApiRequest.call(ctx, 'GET', '/subscriptions', {}, qs);
	}

	if (operation === 'get') {
		const id = ctx.getNodeParameter('subscriptionId', i) as string;
		return dmlyApiRequest.call(ctx, 'GET', `/subscriptions/${id}`);
	}

	if (operation === 'create') {
		const body: IDataObject = {
			contact_id: ctx.getNodeParameter('contactId', i) as string,
			plan_id: ctx.getNodeParameter('planId', i) as string,
		};
		const additionalFields = ctx.getNodeParameter('additionalFields', i, {}) as IDataObject;
		if (additionalFields.price !== undefined) body.price = additionalFields.price;
		if (additionalFields.currency) body.currency = additionalFields.currency;
		if (additionalFields.notes) body.notes = additionalFields.notes;
		return dmlyApiRequest.call(ctx, 'POST', '/subscriptions', body);
	}

	if (operation === 'pause') {
		const id = ctx.getNodeParameter('subscriptionId', i) as string;
		return dmlyApiRequest.call(ctx, 'POST', `/subscriptions/${id}/pause`);
	}

	if (operation === 'resume') {
		const id = ctx.getNodeParameter('subscriptionId', i) as string;
		return dmlyApiRequest.call(ctx, 'POST', `/subscriptions/${id}/resume`);
	}

	if (operation === 'cancel') {
		const id = ctx.getNodeParameter('subscriptionId', i) as string;
		return dmlyApiRequest.call(ctx, 'POST', `/subscriptions/${id}/cancel`);
	}

	if (operation === 'changePlan') {
		const id = ctx.getNodeParameter('subscriptionId', i) as string;
		const body: IDataObject = { plan_id: ctx.getNodeParameter('changePlanId', i) as string };
		const additionalFields = ctx.getNodeParameter('changePlanFields', i, {}) as IDataObject;
		if (additionalFields.effective) body.effective = additionalFields.effective;
		if (additionalFields.proration !== undefined) body.proration = additionalFields.proration;
		return dmlyApiRequest.call(ctx, 'POST', `/subscriptions/${id}/change-plan`, body);
	}

	throw new NodeOperationError(node, `Unknown operation "${operation}" for resource "subscription".`, {
		itemIndex: i,
	});
}
