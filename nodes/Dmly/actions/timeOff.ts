import type { IDataObject, IExecuteFunctions } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

import { dmlyApiRequest } from '../GenericFunctions';

export async function handleTimeOff(
	ctx: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<IDataObject | IDataObject[]> {
	const node = ctx.getNode();

	if (operation === 'add') {
		const staffId = ctx.getNodeParameter('staffId', i) as string;
		const body: IDataObject = {
			starts_at: ctx.getNodeParameter('startsAt', i) as string,
			ends_at: ctx.getNodeParameter('endsAt', i) as string,
		};
		const additionalFields = ctx.getNodeParameter('additionalFields', i, {}) as IDataObject;
		if (additionalFields.allDay !== undefined) body.all_day = additionalFields.allDay;
		if (additionalFields.reason !== undefined) body.reason = additionalFields.reason;
		return dmlyApiRequest.call(ctx, 'POST', `/staff/${staffId}/time-off`, body);
	}

	if (operation === 'delete') {
		const staffId = ctx.getNodeParameter('staffId', i) as string;
		const overrideId = ctx.getNodeParameter('overrideId', i) as string;
		return dmlyApiRequest.call(ctx, 'DELETE', `/staff/${staffId}/time-off/${overrideId}`);
	}

	throw new NodeOperationError(node, `Unknown operation "${operation}" for resource "timeOff".`, {
		itemIndex: i,
	});
}
