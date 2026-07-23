import type { INodeProperties } from 'n8n-workflow';

const STATUS_OPTIONS = [
	{ name: 'Scheduled', value: 'scheduled' },
	{ name: 'Cancelled', value: 'cancelled' },
	{ name: 'Completed', value: 'completed' },
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
			{ displayName: 'Staff ID', name: 'staffId', type: 'string', default: '', description: 'Optional host staff member uuid' },
			{ displayName: 'Timezone', name: 'timezone', type: 'string', default: '', description: 'IANA timezone (max 64 chars); defaults to the Service host timezone or UTC' },
			{ displayName: 'Waitlist Enabled', name: 'waitlistEnabled', type: 'boolean', default: false, description: 'Whether a waitlist is enabled; defaults to the Service setting' },
		],
	},

	// ---- update ----
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
			{ displayName: 'Service ID', name: 'service', type: 'string', default: '', description: 'Filter to sessions of a single Service (its uuid)' },
			{ displayName: 'Staff ID', name: 'staff', type: 'string', default: '', description: 'Filter to sessions hosted by a single staff member (its uuid)' },
			{ displayName: 'Status', name: 'status', type: 'options', options: STATUS_OPTIONS, default: 'scheduled', description: 'Filter by session status' },
			{ displayName: 'To', name: 'to', type: 'dateTime', default: '', description: 'Only sessions starting at or before this date/time' },
		],
	},
];
