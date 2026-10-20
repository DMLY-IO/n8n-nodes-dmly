import type { INodeProperties } from 'n8n-workflow';

const LIFECYCLE_OPTIONS = [
	{ name: 'Lead', value: 'lead' },
	{ name: 'Client', value: 'client' },
	{ name: 'Inactive', value: 'inactive' },
	{ name: 'Archived', value: 'archived' },
];

const STATUS_OPTIONS = [
	{ name: 'Active', value: 'active' },
	{ name: 'Paused', value: 'paused' },
	{ name: 'Blocked', value: 'blocked' },
];

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

export const contactOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['contact'] } },
		options: [
			{ name: 'Add Note', value: 'addNote', action: 'Add a note to a contact', description: 'Append a timeline note to a contact' },
			{ name: 'Add Tags', value: 'addTags', action: 'Add tags to a contact', description: 'Add tags to a contact by name' },
			{ name: 'Create', value: 'create', action: 'Create a contact', description: 'Create a new contact' },
			{ name: 'Delete', value: 'delete', action: 'Delete a contact', description: 'Delete a contact' },
			{ name: 'Export Data', value: 'dataExport', action: 'Export all data held about a contact', description: 'Download a ZIP of every record held about a person (data-access requests). Needs the privacy:read permission.' },
			{ name: 'Get', value: 'get', action: 'Get a contact', description: 'Get a single contact' },
			{ name: 'Get Many', value: 'getAll', action: 'Get many contacts', description: 'Get many contacts' },
			{ name: 'Remove Tags', value: 'removeTags', action: 'Remove tags from a contact', description: 'Remove tags from a contact by name' },
			{ name: 'Set Lifecycle Stage', value: 'setLifecycle', action: 'Set the lifecycle stage of a contact', description: 'Move a contact along the CRM lifecycle' },
			{ name: 'Set Pipeline Stage', value: 'setStage', action: 'Set the pipeline stage of a contact', description: 'Move a contact to a pipeline stage' },
			{ name: 'Update', value: 'update', action: 'Update a contact', description: 'Update an existing contact' },
		],
		default: 'getAll',
	},
];

export const contactFields: INodeProperties[] = [
	{
		displayName: 'Contact ID',
		name: 'contactId',
		type: 'string',
		required: true,
		default: '',
		description: 'The contact UUID',
		displayOptions: {
			show: {
				resource: ['contact'],
				operation: ['addNote', 'addTags', 'dataExport', 'delete', 'get', 'removeTags', 'setLifecycle', 'setStage', 'update'],
			},
		},
	},
	{
		displayName: 'Put Output File in Field',
		name: 'binaryPropertyName',
		type: 'string',
		required: true,
		default: 'data',
		hint: 'The name of the output binary field to put the ZIP archive in',
		displayOptions: { show: { resource: ['contact'], operation: ['dataExport'] } },
	},

	// ---- create ----
	{
		displayName: 'Name',
		name: 'name',
		type: 'string',
		required: true,
		default: '',
		description: 'The contact display name',
		displayOptions: { show: { resource: ['contact'], operation: ['create'] } },
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: { show: { resource: ['contact'], operation: ['create'] } },
		options: [
			{ displayName: 'Channel Name or ID', name: 'channel', type: 'options', typeOptions: { loadOptionsMethod: 'getChannels' }, default: '', description: 'Channel to attach a messaging identity to. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.' },
			{ displayName: 'Consent Page URL', name: 'consentPageUrl', type: 'string', default: '', description: 'URL of the page where marketing consent was captured (stored in consent history)' },
			{ displayName: 'Consent Text', name: 'consentText', type: 'string', default: '', description: 'The exact words shown when the person consented (stored in consent history)' },
			{ displayName: 'Custom Fields', name: 'customFields', type: 'json', default: '{}', description: 'Arbitrary key/value custom fields as a JSON object' },
			{ displayName: 'Email', name: 'email', type: 'string', placeholder: 'name@email.com', default: '', description: 'The contact email address' },
			{ displayName: 'Lifecycle Stage', name: 'lifecycleStage', type: 'options', options: LIFECYCLE_OPTIONS, default: 'lead', description: 'Initial CRM lifecycle stage' },
			{ displayName: 'Marketing Consent', name: 'consent', type: 'boolean', default: false, description: 'Whether the person agreed to receive marketing messages. Only enable when they actually consented; it is recorded in their consent history.' },
			{ displayName: 'Phone', name: 'phone', type: 'string', default: '', description: 'The contact phone number in E.164 format' },
			{ displayName: 'Pipeline Stage ID', name: 'stage', type: 'string', default: '', description: 'Pipeline stage UUID to place the contact in' },
			{ displayName: 'Source', name: 'source', type: 'string', default: '', description: 'Where the contact came from' },
			{ displayName: 'Tags', name: 'tags', type: 'string', default: '', placeholder: 'VIP,Newsletter', description: 'Comma-separated tag names (created if they do not exist)' },
		],
	},

	// ---- update ----
	{
		displayName: 'Update Fields',
		name: 'updateFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: { show: { resource: ['contact'], operation: ['update'] } },
		options: [
			{ displayName: 'Channel Name or ID', name: 'channel', type: 'options', typeOptions: { loadOptionsMethod: 'getChannels' }, default: '', description: 'Channel to attach a messaging identity to. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.' },
			{ displayName: 'Custom Fields', name: 'customFields', type: 'json', default: '{}', description: 'Arbitrary key/value custom fields as a JSON object' },
			{ displayName: 'Email', name: 'email', type: 'string', placeholder: 'name@email.com', default: '', description: 'The contact email address' },
			{ displayName: 'Name', name: 'name', type: 'string', default: '', description: 'The contact display name' },
			{ displayName: 'Phone', name: 'phone', type: 'string', default: '', description: 'The contact phone number in E.164 format' },
			{ displayName: 'Pipeline Stage ID', name: 'stage', type: 'string', default: '', description: 'Pipeline stage UUID to place the contact in' },
			{ displayName: 'Source', name: 'source', type: 'string', default: '', description: 'Where the contact came from' },
			{ displayName: 'Tags', name: 'tags', type: 'string', default: '', placeholder: 'VIP,Newsletter', description: 'Comma-separated tag names to add (created if they do not exist)' },
		],
	},

	// ---- addTags / removeTags ----
	{
		displayName: 'Tags',
		name: 'tags',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'VIP,Lead',
		description: 'Comma-separated tag names',
		displayOptions: { show: { resource: ['contact'], operation: ['addTags', 'removeTags'] } },
	},

	// ---- addNote ----
	{
		displayName: 'Note',
		name: 'noteBody',
		type: 'string',
		typeOptions: { rows: 3 },
		required: true,
		default: '',
		description: 'The note text to append to the contact timeline',
		displayOptions: { show: { resource: ['contact'], operation: ['addNote'] } },
	},

	// ---- setStage ----
	{
		displayName: 'Pipeline Stage ID',
		name: 'stageId',
		type: 'string',
		default: '',
		description: 'Pipeline stage UUID to move the contact to (leave empty to clear)',
		displayOptions: { show: { resource: ['contact'], operation: ['setStage'] } },
	},

	// ---- setLifecycle ----
	{
		displayName: 'Lifecycle Stage',
		name: 'lifecycleStage',
		type: 'options',
		options: LIFECYCLE_OPTIONS,
		required: true,
		default: 'lead',
		description: 'The CRM lifecycle stage to set',
		displayOptions: { show: { resource: ['contact'], operation: ['setLifecycle'] } },
	},
	{
		displayName: 'Reason',
		name: 'reason',
		type: 'string',
		default: '',
		description: 'Optional reason recorded with the lifecycle change',
		displayOptions: { show: { resource: ['contact'], operation: ['setLifecycle'] } },
	},

	// ---- getAll ----
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		default: false,
		description: 'Whether to return all results or only up to a given limit',
		displayOptions: { show: { resource: ['contact'], operation: ['getAll'] } },
	},
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		typeOptions: { minValue: 1 },
		default: 50,
		description: 'Max number of results to return',
		displayOptions: { show: { resource: ['contact'], operation: ['getAll'], returnAll: [false] } },
	},
	{
		displayName: 'Filters',
		name: 'filters',
		type: 'collection',
		placeholder: 'Add Filter',
		default: {},
		displayOptions: { show: { resource: ['contact'], operation: ['getAll'] } },
		options: [
			{ displayName: 'Has Email', name: 'hasEmail', type: 'boolean', default: false, description: 'Whether to only return contacts that have an email address' },
			{ displayName: 'Has Phone', name: 'hasPhone', type: 'boolean', default: false, description: 'Whether to only return contacts that have a phone number' },
			{ displayName: 'Lifecycle', name: 'lifecycle', type: 'options', options: LIFECYCLE_OPTIONS, default: 'lead', description: 'Filter by CRM lifecycle stage' },
			{ displayName: 'Pipeline Stage ID', name: 'stage', type: 'string', default: '', description: 'Filter by pipeline stage UUID, or "none" for contacts with no stage' },
			{ displayName: 'Platform', name: 'platform', type: 'options', options: PLATFORM_OPTIONS, default: 'whatsapp', description: 'Filter by messaging platform' },
			{ displayName: 'Search', name: 'search', type: 'string', default: '', description: 'Search name, handle, phone or email' },
			{ displayName: 'Source', name: 'source', type: 'string', default: '', description: 'Filter by acquisition source' },
			{ displayName: 'Status', name: 'status', type: 'options', options: STATUS_OPTIONS, default: 'active', description: 'Filter by contact status' },
			{ displayName: 'Tags', name: 'tags', type: 'string', default: '', placeholder: 'tag-uuid-1,tag-uuid-2', description: 'Comma-separated tag UUIDs; matches contacts having any of them' },
		],
	},
];
