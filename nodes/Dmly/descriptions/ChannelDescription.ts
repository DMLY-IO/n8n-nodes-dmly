import type { INodeProperties } from 'n8n-workflow';

const PLATFORM_OPTIONS = [
	{ name: 'Facebook', value: 'facebook' },
	{ name: 'Google Business', value: 'gbp' },
	{ name: 'Instagram', value: 'instagram' },
	{ name: 'Live Chat', value: 'livechat' },
	{ name: 'SMS', value: 'sms' },
	{ name: 'Telegram', value: 'telegram' },
	{ name: 'TikTok', value: 'tiktok' },
	{ name: 'WhatsApp', value: 'whatsapp' },
];

export const channelOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['channel'] } },
		options: [
			{ name: 'Get', value: 'get', action: 'Get a channel', description: 'Get a single connected channel' },
			{ name: 'Get Many', value: 'getAll', action: 'Get many connected channels', description: 'Get many connected messaging channels' },
		],
		default: 'getAll',
	},
];

export const channelFields: INodeProperties[] = [
	// ---- get ----
	{
		displayName: 'Channel ID',
		name: 'channelId',
		type: 'string',
		required: true,
		default: '',
		description: 'The channel UUID',
		displayOptions: { show: { resource: ['channel'], operation: ['get'] } },
	},

	// ---- getAll ----
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		default: false,
		description: 'Whether to return all results or only up to a given limit',
		displayOptions: { show: { resource: ['channel'], operation: ['getAll'] } },
	},
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		typeOptions: { minValue: 1 },
		default: 50,
		description: 'Max number of results to return',
		displayOptions: { show: { resource: ['channel'], operation: ['getAll'], returnAll: [false] } },
	},
	{
		displayName: 'Filters',
		name: 'filters',
		type: 'collection',
		placeholder: 'Add Filter',
		default: {},
		displayOptions: { show: { resource: ['channel'], operation: ['getAll'] } },
		options: [
			{ displayName: 'Platform', name: 'platform', type: 'options', options: PLATFORM_OPTIONS, default: 'whatsapp', description: 'Filter by platform' },
			{ displayName: 'Search', name: 'search', type: 'string', default: '', description: 'Keyword filter matched against the channel name and handle' },
			{ displayName: 'Status', name: 'status', type: 'string', default: '', description: 'Filter by connection status (e.g. connected, disconnected)' },
		],
	},
];
