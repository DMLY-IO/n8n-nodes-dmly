import type { INodeProperties } from 'n8n-workflow';

const TYPE_OPTIONS = [
	{ name: 'Percent', value: 'percent' },
	{ name: 'Fixed', value: 'fixed' },
];

export const couponOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['coupon'] } },
		options: [
			{ name: 'Create', value: 'create', action: 'Create a coupon', description: 'Create a new discount coupon' },
			{ name: 'Delete', value: 'delete', action: 'Delete a coupon', description: 'Delete a coupon' },
			{ name: 'Get', value: 'get', action: 'Get a coupon', description: 'Get a single coupon' },
			{ name: 'Get Many', value: 'getAll', action: 'Get many coupons', description: 'List discount coupons for the current workspace' },
			{ name: 'Update', value: 'update', action: 'Update a coupon', description: 'Update an existing coupon' },
		],
		default: 'getAll',
	},
];

export const couponFields: INodeProperties[] = [
	{
		displayName: 'Coupon ID',
		name: 'couponId',
		type: 'string',
		required: true,
		default: '',
		description: 'The coupon UUID',
		displayOptions: { show: { resource: ['coupon'], operation: ['delete', 'get', 'update'] } },
	},

	// ---- create ----
	{
		displayName: 'Code',
		name: 'code',
		type: 'string',
		required: true,
		default: '',
		description: 'Coupon code (max 60 chars); uppercased and must be unique per workspace',
		displayOptions: { show: { resource: ['coupon'], operation: ['create', 'update'] } },
	},
	{
		displayName: 'Type',
		name: 'type',
		type: 'options',
		options: TYPE_OPTIONS,
		required: true,
		default: 'percent',
		description: 'Discount type',
		displayOptions: { show: { resource: ['coupon'], operation: ['create', 'update'] } },
	},
	{
		displayName: 'Value',
		name: 'value',
		type: 'number',
		required: true,
		default: 0,
		description: 'Discount value (min 0). Capped at 100 for percent type, max 100000000 for fixed.',
		displayOptions: { show: { resource: ['coupon'], operation: ['create', 'update'] } },
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: { show: { resource: ['coupon'], operation: ['create'] } },
		options: [
			{ displayName: 'Active', name: 'active', type: 'boolean', default: true, description: 'Whether the coupon is active' },
			{ displayName: 'Currency', name: 'currency', type: 'string', default: '', description: 'ISO currency code (max 3 chars); uppercased server-side' },
			{ displayName: 'Expires At', name: 'expiresAt', type: 'dateTime', default: '', description: 'Date after which the coupon expires' },
			{ displayName: 'Min Subtotal', name: 'minSubtotal', type: 'number', default: 0, description: 'Minimum order subtotal for the coupon to apply (min 0)' },
			{ displayName: 'Per Contact Limit', name: 'perContactLimit', type: 'number', default: 0, description: 'Number of times a single contact can use the coupon (min 1, max 100000)' },
			{ displayName: 'Starts At', name: 'startsAt', type: 'dateTime', default: '', description: 'Date from which the coupon is valid' },
			{ displayName: 'Usage Limit', name: 'usageLimit', type: 'number', default: 0, description: 'Total number of times the coupon can be used (min 1, max 1000000)' },
		],
	},

	// ---- update ----
	{
		displayName: 'Update Fields',
		name: 'updateFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: { show: { resource: ['coupon'], operation: ['update'] } },
		options: [
			{ displayName: 'Active', name: 'active', type: 'boolean', default: true, description: 'Whether the coupon is active' },
			{ displayName: 'Currency', name: 'currency', type: 'string', default: '', description: 'ISO currency code (max 3 chars); uppercased server-side' },
			{ displayName: 'Expires At', name: 'expiresAt', type: 'dateTime', default: '', description: 'Date after which the coupon expires' },
			{ displayName: 'Min Subtotal', name: 'minSubtotal', type: 'number', default: 0, description: 'Minimum order subtotal for the coupon to apply (min 0)' },
			{ displayName: 'Per Contact Limit', name: 'perContactLimit', type: 'number', default: 0, description: 'Number of times a single contact can use the coupon (min 1, max 100000)' },
			{ displayName: 'Starts At', name: 'startsAt', type: 'dateTime', default: '', description: 'Date from which the coupon is valid' },
			{ displayName: 'Usage Limit', name: 'usageLimit', type: 'number', default: 0, description: 'Total number of times the coupon can be used (min 1, max 1000000)' },
		],
	},

	// ---- getAll ----
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		default: false,
		description: 'Whether to return all results or only up to a given limit',
		displayOptions: { show: { resource: ['coupon'], operation: ['getAll'] } },
	},
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		typeOptions: { minValue: 1 },
		default: 50,
		description: 'Max number of results to return',
		displayOptions: { show: { resource: ['coupon'], operation: ['getAll'], returnAll: [false] } },
	},
	{
		displayName: 'Filters',
		name: 'filters',
		type: 'collection',
		placeholder: 'Add Filter',
		default: {},
		displayOptions: { show: { resource: ['coupon'], operation: ['getAll'] } },
		options: [
			{ displayName: 'Active', name: 'active', type: 'boolean', default: false, description: 'Whether to only return active coupons' },
			{ displayName: 'Search', name: 'search', type: 'string', default: '', description: 'Filter coupons whose code contains this substring' },
		],
	},
];
