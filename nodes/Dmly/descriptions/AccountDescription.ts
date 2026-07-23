import type { INodeProperties } from 'n8n-workflow';

export const accountOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['account'] } },
		options: [
			{ name: 'Get', value: 'get', action: 'Get the authenticated workspace', description: 'Returns the workspace (account) that the API key belongs to' },
		],
		default: 'get',
	},
];

export const accountFields: INodeProperties[] = [];
