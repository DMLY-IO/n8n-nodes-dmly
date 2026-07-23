import type { INodeProperties } from 'n8n-workflow';

const SOURCE_OPTIONS = [
	{ name: 'Flow', value: 'flow' },
	{ name: 'Agent', value: 'agent' },
];

const STATUS_OPTIONS = [
	{ name: 'Completed', value: 'completed' },
	{ name: 'No Show', value: 'no_show' },
];

export const appointmentOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['appointment'] } },
		options: [
			{ name: 'Book', value: 'create', action: 'Book a 1 1 appointment', description: 'Book a 1:1 appointment for a contact' },
			{ name: 'Cancel', value: 'cancel', action: 'Cancel an appointment', description: 'Cancel an appointment' },
			{ name: 'Get', value: 'get', action: 'Get an appointment', description: 'Get a single appointment' },
			{ name: 'Get Many', value: 'getAll', action: 'Get many appointments', description: 'List 1:1 appointments' },
			{ name: 'Get Slots', value: 'getSlots', action: 'Get open booking slots for a service', description: 'Get open booking slots for a service over a date window' },
			{ name: 'Reschedule', value: 'reschedule', action: 'Reschedule an appointment', description: 'Move an appointment to a new slot' },
			{ name: 'Update Status', value: 'updateStatus', action: 'Mark an appointment completed or no show', description: 'Mark an appointment completed or no-show' },
		],
		default: 'getAll',
	},
];

export const appointmentFields: INodeProperties[] = [
	{
		displayName: 'Appointment ID',
		name: 'appointmentId',
		type: 'string',
		required: true,
		default: '',
		description: 'The appointment UUID',
		displayOptions: {
			show: {
				resource: ['appointment'],
				operation: ['cancel', 'get', 'reschedule', 'updateStatus'],
			},
		},
	},

	// ---- create (Book) ----
	{
		displayName: 'Contact ID',
		name: 'contactId',
		type: 'string',
		required: true,
		default: '',
		description: 'The contact UUID to book for',
		displayOptions: { show: { resource: ['appointment'], operation: ['create'] } },
	},
	{
		displayName: 'Service ID',
		name: 'serviceId',
		type: 'string',
		required: true,
		default: '',
		description: 'The service UUID',
		displayOptions: { show: { resource: ['appointment'], operation: ['create', 'getSlots'] } },
	},
	{
		displayName: 'Datetime',
		name: 'datetime',
		type: 'dateTime',
		required: true,
		default: '',
		description: 'Slot start, parsed in the given timezone (default UTC) then converted to UTC',
		displayOptions: { show: { resource: ['appointment'], operation: ['create', 'reschedule'] } },
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: { show: { resource: ['appointment'], operation: ['create'] } },
		options: [
			{ displayName: 'Notes', name: 'notes', type: 'string', typeOptions: { rows: 3 }, default: '', description: 'Free-text booking note (max 2000 chars)' },
			{ displayName: 'Source', name: 'source', type: 'options', options: SOURCE_OPTIONS, default: 'agent', description: 'Booking source' },
			{ displayName: 'Staff ID', name: 'staffId', type: 'string', default: '', description: 'Staff UUID; omit to auto-assign an eligible staff member' },
			{ displayName: 'Timezone', name: 'timezone', type: 'string', default: '', description: 'IANA timezone for the datetime. Defaults to UTC. Max 64 chars.' },
		],
	},

	// ---- getSlots ----
	{
		displayName: 'Date',
		name: 'date',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'YYYY-MM-DD',
		description: 'Start date (YYYY-MM-DD), interpreted in the given timezone',
		displayOptions: { show: { resource: ['appointment'], operation: ['getSlots'] } },
	},
	{
		displayName: 'Staff ID',
		name: 'staffId',
		type: 'string',
		default: '',
		description: 'Staff UUID; omit for any eligible staff (union of their slots)',
		displayOptions: { show: { resource: ['appointment'], operation: ['getSlots'] } },
	},
	{
		displayName: 'Days',
		name: 'days',
		type: 'number',
		typeOptions: { minValue: 1, maxValue: 90 },
		default: 7,
		description: 'Number of days to scan from the start date (1-90)',
		displayOptions: { show: { resource: ['appointment'], operation: ['getSlots'] } },
	},
	{
		displayName: 'Timezone',
		name: 'timezone',
		type: 'string',
		default: '',
		description: 'IANA timezone for the date/datetime. Defaults to UTC.',
		displayOptions: { show: { resource: ['appointment'], operation: ['getSlots', 'reschedule'] } },
	},

	// ---- cancel ----
	{
		displayName: 'Reason',
		name: 'reason',
		type: 'string',
		default: '',
		description: 'Optional cancellation reason (max 255 chars)',
		displayOptions: { show: { resource: ['appointment'], operation: ['cancel'] } },
	},

	// ---- updateStatus ----
	{
		displayName: 'Status',
		name: 'status',
		type: 'options',
		options: STATUS_OPTIONS,
		required: true,
		default: 'completed',
		description: 'Terminal status to transition the appointment to',
		displayOptions: { show: { resource: ['appointment'], operation: ['updateStatus'] } },
	},

	// ---- getAll ----
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		default: false,
		description: 'Whether to return all results or only up to a given limit',
		displayOptions: { show: { resource: ['appointment'], operation: ['getAll'] } },
	},
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		typeOptions: { minValue: 1 },
		default: 50,
		description: 'Max number of results to return',
		displayOptions: { show: { resource: ['appointment'], operation: ['getAll'], returnAll: [false] } },
	},
	{
		displayName: 'Filters',
		name: 'filters',
		type: 'collection',
		placeholder: 'Add Filter',
		default: {},
		displayOptions: { show: { resource: ['appointment'], operation: ['getAll'] } },
		options: [
			{ displayName: 'Contact ID', name: 'contact', type: 'string', default: '', description: 'Filter to one contact by UUID' },
			{ displayName: 'From', name: 'from', type: 'dateTime', default: '', description: 'Only appointments scheduled at/after this datetime (parsed to UTC)' },
			{ displayName: 'Service ID', name: 'service', type: 'string', default: '', description: 'Filter to one service by its UUID' },
			{ displayName: 'Staff ID', name: 'staff', type: 'string', default: '', description: 'Filter to one staff member by UUID' },
			{ displayName: 'Status', name: 'status', type: 'string', default: '', description: 'Filter by booking status (confirmed, completed, cancelled, no_show, etc.)' },
			{ displayName: 'To', name: 'to', type: 'dateTime', default: '', description: 'Only appointments scheduled at/before this datetime (parsed to UTC)' },
		],
	},
];
