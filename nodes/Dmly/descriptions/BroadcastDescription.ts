import type { INodeProperties } from 'n8n-workflow';

const STATUS_OPTIONS = [
	{ name: 'Draft', value: 'draft' },
	{ name: 'Scheduled', value: 'scheduled' },
	{ name: 'Sending', value: 'sending' },
	{ name: 'Sent', value: 'sent' },
	{ name: 'Paused', value: 'paused' },
	{ name: 'Failed', value: 'failed' },
];

const RECIPIENT_STATUS_OPTIONS = [
	{ name: 'Pending', value: 'pending' },
	{ name: 'Sent', value: 'sent' },
	{ name: 'Delivered', value: 'delivered' },
	{ name: 'Read', value: 'read' },
	{ name: 'Failed', value: 'failed' },
	{ name: 'Skipped', value: 'skipped' },
];

const TIMEZONE_MODE_OPTIONS = [
	{ name: 'Fixed', value: 'fixed' },
	{ name: 'Contact', value: 'contact' },
];

const TYPE_OPTIONS = [
	{ name: 'Contact', value: 'contact' },
	{ name: 'Retarget', value: 'retarget' },
];

const RETARGET_ENGAGEMENT_OPTIONS = [
	{ name: 'All Sent', value: 'all_sent' },
	{ name: 'All Delivered', value: 'all_delivered' },
	{ name: 'All Read', value: 'all_read' },
	{ name: 'All Replied', value: 'all_replied' },
	{ name: 'All Sent But Not Replied', value: 'all_sent_not_replied' },
	{ name: 'All Failed', value: 'all_failed' },
];

export const broadcastOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['broadcast'] } },
		options: [
			{ name: 'Approve', value: 'approve', action: 'Approve a broadcast', description: 'Release a held broadcast and mark it Scheduled for dispatch' },
			{ name: 'Create', value: 'create', action: 'Create a broadcast', description: 'Create a new broadcast' },
			{ name: 'Delete', value: 'delete', action: 'Delete a broadcast', description: 'Permanently delete a broadcast' },
			{ name: 'Get', value: 'get', action: 'Get a broadcast', description: 'Get a single broadcast' },
			{ name: 'Get Many', value: 'getAll', action: 'Get many broadcasts', description: 'Get many broadcasts' },
			{ name: 'Get Recipients', value: 'getRecipients', action: 'Get a broadcast s recipients', description: 'List per-contact delivery rows for a broadcast' },
			{ name: 'Send', value: 'send', action: 'Send a broadcast now', description: 'Mark the broadcast Scheduled to send now' },
			{ name: 'Update', value: 'update', action: 'Update a broadcast', description: 'Update an existing broadcast' },
		],
		default: 'getAll',
	},
];

export const broadcastFields: INodeProperties[] = [
	{
		displayName: 'Broadcast ID',
		name: 'broadcastId',
		type: 'string',
		required: true,
		default: '',
		description: 'The broadcast UUID',
		displayOptions: {
			show: {
				resource: ['broadcast'],
				operation: ['approve', 'delete', 'get', 'getRecipients', 'send', 'update'],
			},
		},
	},

	// ---- create ----
	{
		displayName: 'Name',
		name: 'name',
		type: 'string',
		required: true,
		default: '',
		description: 'Broadcast name (max 120 chars)',
		displayOptions: { show: { resource: ['broadcast'], operation: ['create'] } },
	},
	{
		displayName: 'Channel Name or ID',
		name: 'channel',
		type: 'options',
		typeOptions: { loadOptionsMethod: 'getChannels' },
		required: true,
		default: '',
		description: 'Channel to send the broadcast on. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
		displayOptions: { show: { resource: ['broadcast'], operation: ['create'] } },
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: { show: { resource: ['broadcast'], operation: ['create'] } },
		options: [
			{ displayName: 'Audience', name: 'audience', type: 'json', default: '{}', description: 'Contact-segment audience object, e.g. {"type":"segment","segment":"all","contacts":[]}. Ignored for retarget broadcasts.' },
			{ displayName: 'Message', name: 'message', type: 'json', default: '{}', description: 'Message payload object, e.g. {"template":"promo_june","language":"en","components":[]}' },
			{ displayName: 'Requires Approval', name: 'requiresApproval', type: 'boolean', default: false, description: 'Whether the broadcast is held awaiting approval before it can be scheduled or sent' },
			{ displayName: 'Retarget Engagement', name: 'retargetEngagement', type: 'options', options: RETARGET_ENGAGEMENT_OPTIONS, default: 'all_sent', description: 'Which of the source broadcast\'s recipients to re-message, by engagement. Required when type is retarget.' },
			{ displayName: 'Schedule', name: 'schedule', type: 'boolean', default: false, description: 'Whether the broadcast is created as Scheduled rather than Draft' },
			{ displayName: 'Scheduled At', name: 'scheduledAt', type: 'dateTime', default: '', description: 'Fixed-mode send time; must be now or in the future. Omit for send-now.' },
			{ displayName: 'Scheduled Local At', name: 'scheduledLocalAt', type: 'dateTime', default: '', description: 'Naive local wall-clock for contact mode. Required when timezone mode is contact.' },
			{ displayName: 'Source Broadcast ID', name: 'sourceBroadcastId', type: 'string', default: '', description: 'UUID of a prior broadcast to retarget. Required when type is retarget.' },
			{ displayName: 'Timezone Mode', name: 'timezoneMode', type: 'options', options: TIMEZONE_MODE_OPTIONS, default: 'fixed', description: 'Scheduling mode. Fixed sends at one instant; contact sends at each recipient\'s local wall-clock.' },
			{ displayName: 'Type', name: 'type', type: 'options', options: TYPE_OPTIONS, default: 'contact', description: 'Campaign type. Contact targets an audience segment; retarget re-messages a source broadcast\'s recipients.' },
		],
	},

	// ---- update ----
	{
		displayName: 'Update Fields',
		name: 'updateFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: { show: { resource: ['broadcast'], operation: ['update'] } },
		options: [
			{ displayName: 'Audience', name: 'audience', type: 'json', default: '{}', description: 'Contact-segment audience object. Updatable independently of retarget config.' },
			{ displayName: 'Channel Name or ID', name: 'channel', type: 'options', typeOptions: { loadOptionsMethod: 'getChannels' }, default: '', description: 'Channel (validated but not applied on update). Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.' },
			{ displayName: 'Message', name: 'message', type: 'json', default: '{}', description: 'Message payload object, e.g. {"template":"promo_june_v2","language":"en","components":[]}' },
			{ displayName: 'Name', name: 'name', type: 'string', default: '', description: 'Broadcast name (max 120 chars)' },
			{ displayName: 'Requires Approval', name: 'requiresApproval', type: 'boolean', default: false, description: 'Whether to hold the broadcast for approval and void any prior sign-off' },
			{ displayName: 'Retarget Engagement', name: 'retargetEngagement', type: 'options', options: RETARGET_ENGAGEMENT_OPTIONS, default: 'all_sent', description: 'Which of the source broadcast\'s recipients to re-message. Required when type is retarget.' },
			{ displayName: 'Schedule', name: 'schedule', type: 'boolean', default: false, description: 'Whether the broadcast is scheduled' },
			{ displayName: 'Scheduled At', name: 'scheduledAt', type: 'dateTime', default: '', description: 'Fixed-mode send time; must be now or in the future' },
			{ displayName: 'Scheduled Local At', name: 'scheduledLocalAt', type: 'dateTime', default: '', description: 'Naive local wall-clock for contact mode. Required when timezone mode is contact.' },
			{ displayName: 'Source Broadcast ID', name: 'sourceBroadcastId', type: 'string', default: '', description: 'UUID of a prior broadcast to retarget. Required when type is retarget. A broadcast cannot retarget itself.' },
			{ displayName: 'Timezone Mode', name: 'timezoneMode', type: 'options', options: TIMEZONE_MODE_OPTIONS, default: 'fixed', description: 'Scheduling mode' },
			{ displayName: 'Type', name: 'type', type: 'options', options: TYPE_OPTIONS, default: 'contact', description: 'Campaign type. Only overwrites retarget config when supplied.' },
		],
	},

	// ---- getAll / getRecipients ----
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		default: false,
		description: 'Whether to return all results or only up to a given limit',
		displayOptions: { show: { resource: ['broadcast'], operation: ['getAll', 'getRecipients'] } },
	},
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		typeOptions: { minValue: 1 },
		default: 50,
		description: 'Max number of results to return',
		displayOptions: { show: { resource: ['broadcast'], operation: ['getAll', 'getRecipients'], returnAll: [false] } },
	},
	{
		displayName: 'Filters',
		name: 'filters',
		type: 'collection',
		placeholder: 'Add Filter',
		default: {},
		displayOptions: { show: { resource: ['broadcast'], operation: ['getAll'] } },
		options: [
			{ displayName: 'Channel Name or ID', name: 'channel', type: 'options', typeOptions: { loadOptionsMethod: 'getChannels' }, default: '', description: 'Filter to broadcasts on this channel. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.' },
			{ displayName: 'Status', name: 'status', type: 'options', options: STATUS_OPTIONS, default: 'draft', description: 'Filter by broadcast status' },
		],
	},
	{
		displayName: 'Filters',
		name: 'recipientFilters',
		type: 'collection',
		placeholder: 'Add Filter',
		default: {},
		displayOptions: { show: { resource: ['broadcast'], operation: ['getRecipients'] } },
		options: [
			{ displayName: 'Status', name: 'status', type: 'options', options: RECIPIENT_STATUS_OPTIONS, default: 'pending', description: 'Filter by recipient delivery status' },
		],
	},
];
