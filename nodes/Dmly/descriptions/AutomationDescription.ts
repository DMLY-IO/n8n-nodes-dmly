import type { INodeProperties } from 'n8n-workflow';

const STATUS_OPTIONS = [
	{ name: 'Draft', value: 'draft' },
	{ name: 'Active', value: 'active' },
	{ name: 'Paused', value: 'paused' },
	{ name: 'Failed', value: 'failed' },
];

const BUILDER_OPTIONS = [
	{ name: 'Quick', value: 'quick' },
	{ name: 'Flow', value: 'flow' },
];

export const automationOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['automation'] } },
		options: [
			{ name: 'Activate', value: 'activate', action: 'Activate an automation', description: 'Set the automation status to active so it begins running on its trigger' },
			{ name: 'Get', value: 'get', action: 'Get an automation', description: 'Get a single automation' },
			{ name: 'Get Many', value: 'getAll', action: 'Get many automations', description: 'Get many automations' },
			{ name: 'Pause', value: 'pause', action: 'Pause an automation', description: 'Set the automation status to paused so it stops running until reactivated' },
		],
		default: 'getAll',
	},
];

export const automationFields: INodeProperties[] = [
	{
		displayName: 'Automation ID',
		name: 'automationId',
		type: 'string',
		required: true,
		default: '',
		description: 'The automation UUID',
		displayOptions: {
			show: {
				resource: ['automation'],
				operation: ['activate', 'get', 'pause'],
			},
		},
	},

	// ---- getAll ----
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		default: false,
		description: 'Whether to return all results or only up to a given limit',
		displayOptions: { show: { resource: ['automation'], operation: ['getAll'] } },
	},
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		typeOptions: { minValue: 1 },
		default: 50,
		description: 'Max number of results to return',
		displayOptions: { show: { resource: ['automation'], operation: ['getAll'], returnAll: [false] } },
	},
	{
		displayName: 'Filters',
		name: 'filters',
		type: 'collection',
		placeholder: 'Add Filter',
		default: {},
		displayOptions: { show: { resource: ['automation'], operation: ['getAll'] } },
		options: [
			{ displayName: 'Builder', name: 'builder', type: 'options', options: BUILDER_OPTIONS, default: 'quick', description: 'Filter by how the automation was authored' },
			{ displayName: 'Channel Name or ID', name: 'channel', type: 'options', typeOptions: { loadOptionsMethod: 'getChannels' }, default: '', description: 'Filter to automations bound to a specific channel. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.' },
			{ displayName: 'Status', name: 'status', type: 'options', options: STATUS_OPTIONS, default: 'active', description: 'Filter by automation status' },
			{ displayName: 'Type', name: 'type', type: 'string', default: '', description: 'Filter by the trigger type that starts the automation, e.g. whatsapp_message, contact_created, invoice_paid' },
		],
	},
];
