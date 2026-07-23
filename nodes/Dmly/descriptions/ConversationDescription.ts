import type { INodeProperties } from 'n8n-workflow';

const STATUS_OPTIONS = [
	{ name: 'Open', value: 'open' },
	{ name: 'Done', value: 'done' },
];

export const conversationOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['conversation'] } },
		options: [
			{ name: 'Get Many', value: 'getAll', action: 'Get many conversations', description: 'List the workspace conversations ordered by most recent activity' },
			{ name: 'Get Messages', value: 'getMessages', action: 'Get messages in a conversation', description: 'List the messages in one conversation thread, oldest-first' },
		],
		default: 'getAll',
	},
];

export const conversationFields: INodeProperties[] = [
	// ---- getMessages ----
	{
		displayName: 'Contact ID',
		name: 'contactId',
		type: 'string',
		required: true,
		default: '',
		description: 'The conversation ID, which is the contact uuid',
		displayOptions: { show: { resource: ['conversation'], operation: ['getMessages'] } },
	},

	// ---- getAll / getMessages ----
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		default: false,
		description: 'Whether to return all results or only up to a given limit',
		displayOptions: { show: { resource: ['conversation'], operation: ['getAll', 'getMessages'] } },
	},
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		typeOptions: { minValue: 1 },
		default: 50,
		description: 'Max number of results to return',
		displayOptions: { show: { resource: ['conversation'], operation: ['getAll', 'getMessages'], returnAll: [false] } },
	},

	// ---- getAll ----
	{
		displayName: 'Filters',
		name: 'filters',
		type: 'collection',
		placeholder: 'Add Filter',
		default: {},
		displayOptions: { show: { resource: ['conversation'], operation: ['getAll'] } },
		options: [
			{ displayName: 'Platform', name: 'platform', type: 'string', default: '', description: "Filter by the contact's messaging platform (e.g. whatsapp, facebook, instagram, sms, telegram, livechat)" },
			{ displayName: 'Search', name: 'search', type: 'string', default: '', description: 'Keyword filter matched against the contact name, handle or phone' },
			{ displayName: 'Status', name: 'status', type: 'options', options: STATUS_OPTIONS, default: 'open', description: 'Inbox triage status filter' },
			{ displayName: 'Unread', name: 'unread', type: 'boolean', default: false, description: 'Whether to only return conversations with an unread count greater than 0' },
		],
	},
];
