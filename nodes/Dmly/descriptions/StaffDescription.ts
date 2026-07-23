import type { INodeProperties } from 'n8n-workflow';

export const staffOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['staff'] } },
		options: [
			{ name: 'Create', value: 'create', action: 'Create a staff member', description: 'Create a bookable staff member' },
			{ name: 'Delete', value: 'delete', action: 'Delete a staff member', description: 'Delete a staff member' },
			{ name: 'Get', value: 'get', action: 'Get a staff member', description: 'Get a single staff member' },
			{ name: 'Get Availability', value: 'getAvailability', action: 'Get a staff members availability', description: 'Get weekly working-hours rules plus one-off overrides' },
			{ name: 'Get Many', value: 'getAll', action: 'Get many staff members', description: 'Get many staff members' },
			{ name: 'Update', value: 'update', action: 'Update a staff member', description: 'Update an existing staff member' },
		],
		default: 'getAll',
	},
];

export const staffFields: INodeProperties[] = [
	{
		displayName: 'Staff ID',
		name: 'staffId',
		type: 'string',
		required: true,
		default: '',
		description: 'The staff UUID',
		displayOptions: {
			show: {
				resource: ['staff'],
				operation: ['delete', 'get', 'getAvailability', 'update'],
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
		description: 'The staff member display name',
		displayOptions: { show: { resource: ['staff'], operation: ['create'] } },
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: { show: { resource: ['staff'], operation: ['create'] } },
		options: [
			{ displayName: 'Accepts Bookings', name: 'acceptsBookings', type: 'boolean', default: true, description: 'Whether the staff member accepts bookings' },
			{ displayName: 'Active', name: 'active', type: 'boolean', default: true, description: 'Whether the staff member is active' },
			{ displayName: 'Bio', name: 'bio', type: 'string', typeOptions: { rows: 3 }, default: '', description: 'Free-text biography' },
			{ displayName: 'Color', name: 'color', type: 'color', default: '', description: 'Display colour, e.g. hex code' },
			{ displayName: 'Email', name: 'email', type: 'string', placeholder: 'name@email.com', default: '', description: 'The staff member email address' },
			{ displayName: 'Phone', name: 'phone', type: 'string', default: '', description: 'The staff member phone number' },
			{ displayName: 'Timezone', name: 'timezone', type: 'string', default: '', description: 'IANA timezone, e.g. America/New_York. Defaults to the workspace default when omitted.' },
			{ displayName: 'Title', name: 'title', type: 'string', default: '', description: 'Job title, e.g. Senior Stylist' },
		],
	},

	// ---- update ----
	{
		displayName: 'Update Fields',
		name: 'updateFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: { show: { resource: ['staff'], operation: ['update'] } },
		options: [
			{ displayName: 'Accepts Bookings', name: 'acceptsBookings', type: 'boolean', default: true, description: 'Whether the staff member accepts bookings' },
			{ displayName: 'Active', name: 'active', type: 'boolean', default: true, description: 'Whether the staff member is active' },
			{ displayName: 'Bio', name: 'bio', type: 'string', typeOptions: { rows: 3 }, default: '', description: 'Free-text biography' },
			{ displayName: 'Color', name: 'color', type: 'color', default: '', description: 'Display colour, e.g. hex code' },
			{ displayName: 'Email', name: 'email', type: 'string', placeholder: 'name@email.com', default: '', description: 'The staff member email address' },
			{ displayName: 'Name', name: 'name', type: 'string', default: '', description: 'The staff member display name' },
			{ displayName: 'Phone', name: 'phone', type: 'string', default: '', description: 'The staff member phone number' },
			{ displayName: 'Timezone', name: 'timezone', type: 'string', default: '', description: 'IANA timezone, e.g. America/New_York' },
			{ displayName: 'Title', name: 'title', type: 'string', default: '', description: 'Job title, e.g. Senior Stylist' },
		],
	},

	// ---- getAvailability ----
	{
		displayName: 'From',
		name: 'from',
		type: 'dateTime',
		default: '',
		description: 'Lower bound date for overrides — only overrides ending on/after this are returned',
		displayOptions: { show: { resource: ['staff'], operation: ['getAvailability'] } },
	},
	{
		displayName: 'To',
		name: 'to',
		type: 'dateTime',
		default: '',
		description: 'Upper bound date for overrides — only overrides starting on/before this are returned',
		displayOptions: { show: { resource: ['staff'], operation: ['getAvailability'] } },
	},

	// ---- getAll ----
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		default: false,
		description: 'Whether to return all results or only up to a given limit',
		displayOptions: { show: { resource: ['staff'], operation: ['getAll'] } },
	},
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		typeOptions: { minValue: 1 },
		default: 50,
		description: 'Max number of results to return',
		displayOptions: { show: { resource: ['staff'], operation: ['getAll'], returnAll: [false] } },
	},
	{
		displayName: 'Filters',
		name: 'filters',
		type: 'collection',
		placeholder: 'Add Filter',
		default: {},
		displayOptions: { show: { resource: ['staff'], operation: ['getAll'] } },
		options: [
			{ displayName: 'Accepts Bookings', name: 'acceptsBookings', type: 'boolean', default: false, description: 'Whether to filter by staff that accept bookings' },
			{ displayName: 'Active', name: 'active', type: 'boolean', default: false, description: 'Whether to filter by the active flag' },
			{ displayName: 'Search', name: 'search', type: 'string', default: '', description: 'Case-insensitive substring match on staff name' },
		],
	},
];
