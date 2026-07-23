import type { INodeProperties } from 'n8n-workflow';

const SERVICE_TYPE_OPTIONS = [
	{ name: 'Appointment', value: 'appointment' },
	{ name: 'Class', value: 'class' },
	{ name: 'Add-On', value: 'add_on' },
];

const PAYMENT_MODE_OPTIONS = [
	{ name: 'None', value: 'none' },
	{ name: 'After', value: 'after' },
	{ name: 'Before', value: 'before' },
];

const LOCATION_TYPE_OPTIONS = [
	{ name: 'Google Meet', value: 'google_meet' },
	{ name: 'Zoom', value: 'zoom' },
	{ name: 'Zoom Webinar', value: 'zoom_webinar' },
	{ name: 'Phone', value: 'phone' },
	{ name: 'In Person', value: 'in_person' },
	{ name: 'Custom', value: 'custom' },
];

export const serviceOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['service'] } },
		options: [
			{ name: 'Create', value: 'create', action: 'Create a service', description: 'Create an appointment, class, or add-on catalogue service' },
			{ name: 'Delete', value: 'delete', action: 'Delete a service', description: 'Delete a service by UUID (deactivated if it has bookings)' },
			{ name: 'Get', value: 'get', action: 'Get a service', description: 'Retrieve a single service by its UUID' },
			{ name: 'Get Many', value: 'getAll', action: 'Get many services', description: 'List catalogue services for the workspace' },
			{ name: 'Update', value: 'update', action: 'Update a service', description: 'Update an existing service by UUID' },
		],
		default: 'getAll',
	},
];

export const serviceFields: INodeProperties[] = [
	{
		displayName: 'Service ID',
		name: 'serviceId',
		type: 'string',
		required: true,
		default: '',
		description: 'The service UUID',
		displayOptions: { show: { resource: ['service'], operation: ['delete', 'get', 'update'] } },
	},

	// ---- create ----
	{
		displayName: 'Name',
		name: 'name',
		type: 'string',
		required: true,
		default: '',
		description: 'Service name (max 120 chars)',
		displayOptions: { show: { resource: ['service'], operation: ['create'] } },
	},
	{
		displayName: 'Type',
		name: 'type',
		type: 'options',
		options: SERVICE_TYPE_OPTIONS,
		required: true,
		default: 'appointment',
		description: 'Service type. add_on forces non-bookable/non-online; capacity only applies to class.',
		displayOptions: { show: { resource: ['service'], operation: ['create'] } },
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: { show: { resource: ['service'], operation: ['create'] } },
		options: [
			{ displayName: 'Active', name: 'active', type: 'boolean', default: true, description: 'Whether the service is active/bookable' },
			{ displayName: 'Capacity', name: 'capacity', type: 'number', default: 1, description: 'Seats per session (integer 1–100000). Applies to class type only.' },
			{ displayName: 'Category ID', name: 'category', type: 'string', default: '', description: 'ServiceCategory UUID to file the service under (resolved server-side)' },
			{ displayName: 'Color', name: 'color', type: 'color', default: '', description: 'Hex colour tag (max 9 chars)' },
			{ displayName: 'Cost Price', name: 'costPrice', type: 'number', default: 0, description: 'Internal cost price (0–1000000)' },
			{ displayName: 'Credit Cost', name: 'creditCost', type: 'number', default: 0, description: 'Credits consumed to redeem this service (integer 0–100000)' },
			{ displayName: 'Credits', name: 'credits', type: 'number', default: 0, description: 'Credits this service grants/represents (integer 0–100000)' },
			{ displayName: 'Currency', name: 'currency', type: 'string', default: '', description: 'ISO currency code (max 3 chars, stored uppercased)' },
			{ displayName: 'Description', name: 'description', type: 'string', default: '', description: 'Description (max 2000 chars)' },
			{ displayName: 'Duration (Minutes)', name: 'durationMin', type: 'number', default: 30, description: 'Duration in minutes (integer 5–1440; forced 0 for add_on)' },
			{ displayName: 'Location Details', name: 'locationDetails', type: 'string', default: '', description: 'Free-text location notes/link (max 500 chars)' },
			{ displayName: 'Location Type', name: 'locationType', type: 'options', options: LOCATION_TYPE_OPTIONS, default: 'custom', description: "Where the service is delivered (forced 'custom' for add_on)" },
			{ displayName: 'Online', name: 'online', type: 'boolean', default: false, description: 'Whether the service is delivered online (forced false for add_on)' },
			{ displayName: 'Payment Mode', name: 'paymentMode', type: 'options', options: PAYMENT_MODE_OPTIONS, default: 'none', description: 'Payment timing; sets payment_required automatically (none => not required)' },
			{ displayName: 'Price', name: 'price', type: 'number', default: 0, description: 'Sale price (0–1000000)' },
			{ displayName: 'Public Visible', name: 'publicVisible', type: 'boolean', default: false, description: 'Whether to show on public booking pages (forced false for add_on)' },
			{ displayName: 'Tax Inclusive', name: 'taxInclusive', type: 'boolean', default: false, description: 'Whether the price already includes tax' },
			{ displayName: 'Tax Rate', name: 'taxRate', type: 'number', default: 0, description: 'Tax rate percentage (0–100)' },
		],
	},

	// ---- update ----
	{
		displayName: 'Update Fields',
		name: 'updateFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: { show: { resource: ['service'], operation: ['update'] } },
		options: [
			{ displayName: 'Active', name: 'active', type: 'boolean', default: true, description: 'Whether the service is active/bookable' },
			{ displayName: 'Capacity', name: 'capacity', type: 'number', default: 1, description: 'Seats per session (integer 1–100000). class type only.' },
			{ displayName: 'Category ID', name: 'category', type: 'string', default: '', description: 'ServiceCategory UUID (resolved server-side)' },
			{ displayName: 'Color', name: 'color', type: 'color', default: '', description: 'Hex colour tag (max 9 chars)' },
			{ displayName: 'Cost Price', name: 'costPrice', type: 'number', default: 0, description: 'Internal cost price (0–1000000)' },
			{ displayName: 'Credit Cost', name: 'creditCost', type: 'number', default: 0, description: 'Credits consumed to redeem this service (integer 0–100000)' },
			{ displayName: 'Credits', name: 'credits', type: 'number', default: 0, description: 'Credits this service grants/represents (integer 0–100000)' },
			{ displayName: 'Currency', name: 'currency', type: 'string', default: '', description: 'ISO currency code (max 3 chars, stored uppercased)' },
			{ displayName: 'Description', name: 'description', type: 'string', default: '', description: 'Description (max 2000 chars)' },
			{ displayName: 'Duration (Minutes)', name: 'durationMin', type: 'number', default: 30, description: 'Duration in minutes (integer 5–1440; forced 0 for add_on)' },
			{ displayName: 'Location Details', name: 'locationDetails', type: 'string', default: '', description: 'Free-text location notes/link (max 500 chars)' },
			{ displayName: 'Location Type', name: 'locationType', type: 'options', options: LOCATION_TYPE_OPTIONS, default: 'custom', description: "Where the service is delivered (forced 'custom' for add_on)" },
			{ displayName: 'Name', name: 'name', type: 'string', default: '', description: 'Service name (max 120 chars)' },
			{ displayName: 'Online', name: 'online', type: 'boolean', default: false, description: 'Whether the service is delivered online (forced false for add_on)' },
			{ displayName: 'Payment Mode', name: 'paymentMode', type: 'options', options: PAYMENT_MODE_OPTIONS, default: 'none', description: 'Payment timing; resets payment_required' },
			{ displayName: 'Price', name: 'price', type: 'number', default: 0, description: 'Sale price (0–1000000)' },
			{ displayName: 'Public Visible', name: 'publicVisible', type: 'boolean', default: false, description: 'Whether to show on public booking pages (forced false for add_on)' },
			{ displayName: 'Tax Inclusive', name: 'taxInclusive', type: 'boolean', default: false, description: 'Whether the price already includes tax' },
			{ displayName: 'Tax Rate', name: 'taxRate', type: 'number', default: 0, description: 'Tax rate percentage (0–100)' },
			{ displayName: 'Type', name: 'type', type: 'options', options: SERVICE_TYPE_OPTIONS, default: 'appointment', description: 'Service type. Changing it re-shapes add_on/class-specific fields.' },
		],
	},

	// ---- getAll ----
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		default: false,
		description: 'Whether to return all results or only up to a given limit',
		displayOptions: { show: { resource: ['service'], operation: ['getAll'] } },
	},
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		typeOptions: { minValue: 1 },
		default: 50,
		description: 'Max number of results to return',
		displayOptions: { show: { resource: ['service'], operation: ['getAll'], returnAll: [false] } },
	},
	{
		displayName: 'Filters',
		name: 'filters',
		type: 'collection',
		placeholder: 'Add Filter',
		default: {},
		displayOptions: { show: { resource: ['service'], operation: ['getAll'] } },
		options: [
			{ displayName: 'Category ID', name: 'category', type: 'string', default: '', description: "Filter by category UUID. Pass 'none' for services with no category." },
			{ displayName: 'Search', name: 'search', type: 'string', default: '', description: 'Case-insensitive substring match on the service name' },
			{ displayName: 'Type', name: 'type', type: 'options', options: SERVICE_TYPE_OPTIONS, default: 'appointment', description: 'Filter by service type' },
		],
	},
];
