import type { IDataObject, IExecuteFunctions } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

import { dmlyApiRequest } from '../GenericFunctions';

export async function handleAccount(
	ctx: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<IDataObject | IDataObject[]> {
	if (operation === 'get') {
		return dmlyApiRequest.call(ctx, 'GET', '/account');
	}

	throw new NodeOperationError(ctx.getNode(), `Unknown operation "${operation}" for resource "account".`, {
		itemIndex: i,
	});
}
