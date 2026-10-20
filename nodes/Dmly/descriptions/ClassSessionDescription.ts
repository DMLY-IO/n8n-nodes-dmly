import type { INodeProperties } from 'n8n-workflow';

const STATUS_OPTIONS = [
	{ name: 'Scheduled', value: 'scheduled' },
	{ name: 'Cancelled', value: 'cancelled' },
	{ name: 'Completed', value: 'completed' },
];

const FREQUENCY_OPTIONS = [
	{ name: 'Daily', value: 'daily' },
	{ name: 'Weekly', value: 'weekly' },
	{ name: 'Every Two Weeks', value: 'biweekly' },
	{ name: 'Monthly', value: 'monthly' },
];

const SCOPE_OPTIONS = [
	{ name: 'This Occurrence Only', value: 'this' },
	{ name: 'This and Later Occurrences', value: 'series' },
];

export const classSessionOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['classSession'] } },
		options: [
			{ name: 'Create', value: 'create', action: 'Create a group class session', description: 'Create one occurrence of a class service' },
			{ name: 'Delete', value: 'delete', action: 'Delete a group class session', description: 'Delete a group-class session, cancelling active places first' },
			{ name: 'Get', value: 'get', action: 'Get a group class session', description: 'Get a single group-class session' },
			{ name: 'Get Many', value: 'getAll', action: 'Get many group class sessions', description: 'Get many group-class sessions' },
			{ name: 'Update', value: 'update', action: 'Update a group class session', description: 'Update an existing group-class session' },
		],
		default: 'getAll',
	},
];

export const classSessionFields: INodeProperties[] = [
	{
		displayName: 'Class Session ID',
		name: 'classSessionId',
		type: 'string',
		required: true,
		default: '',
		description: 'The classSession UUID',
		displayOptions: { show: { resource: ['classSession'], operation: ['delete', 'get', 'update'] } },
	},

	// ---- create ----
	{
		displayName: 'Service ID',
		name: 'serviceId',
		type: 'string',
		required: true,
		default: '',
		description: 'Service uuid the session is an occurrence of',
		displayOptions: { show: { resource: ['classSession'], operation: ['create'] } },
	},
	{
		displayName: 'Starts At',
		name: 'startsAt',
		type: 'dateTime',
		required: true,
		default: '',
		description: 'Session start date/time',
		displayOptions: { show: { resource: ['classSession'], operation: ['create'] } },
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: { show: { resource: ['classSession'], operation: ['create'] } },
		options: [
			{ displayName: 'Capacity', name: 'capacity', type: 'number', default: 0, description: 'Seat capacity (1–100000); defaults to the Service capacity' },
			{ displayName: 'Ends At', name: 'endsAt', type: 'dateTime', default: '', description: 'Session end date/time (must be after starts_at); derived from Service duration when omitted' },
			{ displayName: 'Location', name: 'location', type: 'string', default: '', description: 'Location label (max 255 chars)' },
			{ displayName: 'Repeat Count', name: 'repeatCount', type: 'number', typeOptions: { minValue: 2, maxValue: 52 }, default: 4, description: 'Number of occurrences (2–52). Only used when Repeat Frequency is set.' },
			{ displayName: 'Repeat Frequency', name: 'frequency', type: 'options', options: FREQUENCY_OPTIONS, default: 'weekly', description: 'Create a whole recurring class instead of one session. Occurrences keep the same local time across daylight-saving changes.' },
			{ displayName: 'Staff ID', name: 'staffId', type: 'string', default: '', description: 'Optional host staff member uuid' },
			{ displayName: 'Timezone', name: 'timezone', type: 'string', default: '', description: 'IANA timezone (max 64 chars); defaults to the Service host timezone or UTC' },
			{ displayName: 'Waitlist Enabled', name: 'waitlistEnabled', type: 'boolean', default: false, description: 'Whether a waitlist is enabled; defaults to the Service setting' },
		],
	},

	// ---- update / delete ----
	{
		displayName: 'Apply To',
		name: 'scope',
		type: 'options',
		options: SCOPE_OPTIONS,
		default: 'this',
		description: 'For a recurring class, whether to change only this occurrence or this and every later one (earlier occurrences are never touched; times cannot be edited as a series)',
		displayOptions: { show: { resource: ['classSession'], operation: ['delete', 'update'] } },
	},
	{
		displayName: 'Update Fields',
		name: 'updateFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: { show: { resource: ['classSession'], operation: ['update'] } },
		options: [
			{ displayName: 'Capacity', name: 'capacity', type: 'number', default: 0, description: 'Seat capacity (1–100000)' },
			{ displayName: 'Ends At', name: 'endsAt', type: 'dateTime', default: '', description: 'Session end date/time (must be after starts_at)' },
			{ displayName: 'Location', name: 'location', type: 'string', default: '', description: 'Location label (max 255 chars)' },
			{ displayName: 'Staff ID', name: 'staffId', type: 'string', default: '', description: 'Host staff member uuid, or null to clear' },
			{ displayName: 'Starts At', name: 'startsAt', type: 'dateTime', default: '', description: 'Session start date/time' },
			{ displayName: 'Status', name: 'status', type: 'options', options: STATUS_OPTIONS, default: 'scheduled', description: 'Session lifecycle status' },
			{ displayName: 'Timezone', name: 'timezone', type: 'string', default: '', description: 'IANA timezone (max 64 chars)' },
			{ displayName: 'Waitlist Enabled', name: 'waitlistEnabled', type: 'boolean', default: false, description: 'Whether a waitlist is enabled' },
		],
	},

	// ---- getAll ----
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		default: false,
		description: 'Whether to return all results or only up to a given limit',
		displayOptions: { show: { resource: ['classSession'], operation: ['getAll'] } },
	},
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		typeOptions: { minValue: 1 },
		default: 50,
		description: 'Max number of results to return',
		displayOptions: { show: { resource: ['classSession'], operation: ['getAll'], returnAll: [false] } },
	},
	{
		displayName: 'Filters',
		name: 'filters',
		type: 'collection',
		placeholder: 'Add Filter',
		default: {},
		displayOptions: { show: { resource: ['classSession'], operation: ['getAll'] } },
		options: [
			{ displayName: 'From', name: 'from', type: 'dateTime', default: '', description: 'Only sessions starting at or after this date/time' },
			{ displayName: 'Recurrence ID', name: 'recurrence', type: 'string', default: '', description: 'Only occurrences of one recurring class (the recurrence_id returned on each session)' },
			{ displayName: 'Service ID', name: 'service', type: 'string', default: '', description: 'Filter to sessions of a single Service (its uuid)' },
			{ displayName: 'Staff ID', name: 'staff', type: 'string', default: '', description: 'Filter to sessions hosted by a single staff member (its uuid)' },
			{ displayName: 'Status', name: 'status', type: 'options', options: STATUS_OPTIONS, default: 'scheduled', description: 'Filter by session status' },
			{ displayName: 'To', name: 'to', type: 'dateTime', default: '', description: 'Only sessions starting at or before this date/time' },
		],
	},
];
