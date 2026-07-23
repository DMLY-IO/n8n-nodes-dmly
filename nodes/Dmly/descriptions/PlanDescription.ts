import type { INodeProperties } from 'n8n-workflow';

const BILLING_TYPE_OPTIONS = [
	{ name: 'One Time', value: 'one_time' },
	{ name: 'Recurring', value: 'recurring' },
];

const BILLING_INTERVAL_OPTIONS = [
	{ name: 'Day', value: 'day' },
	{ name: 'Week', value: 'week' },
	{ name: 'Month', value: 'month' },
	{ name: 'Year', value: 'year' },
];

const ITEMS_DESCRIPTION =
	"Array of granted line items. Each item: {item_type: 'service'|'product'|'credit' (required), service_id: uuid (for service/credit items), product_id: uuid (for product items), quantity: int (1-100000), credits: int (0-1000000, for credit items), notes: string (max 255)}. Supplying items replaces the plan's existing line items.";

export const planOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['plan'] } },
		options: [
			{ name: 'Create', value: 'create', action: 'Create a plan', description: 'Create a new plan or package' },
			{ name: 'Delete', value: 'delete', action: 'Delete a plan', description: 'Delete a plan' },
			{ name: 'Get', value: 'get', action: 'Get a plan', description: 'Get a single plan' },
			{ name: 'Get Many', value: 'getAll', action: 'Get many plans', description: 'List plans in the Offerings catalogue' },
			{ name: 'Update', value: 'update', action: 'Update a plan', description: 'Update an existing plan' },
		],
		default: 'getAll',
	},
];

export const planFields: INodeProperties[] = [
	{
		displayName: 'Plan ID',
		name: 'planId',
		type: 'string',
		required: true,
		default: '',
		description: 'The plan UUID',
		displayOptions: { show: { resource: ['plan'], operation: ['delete', 'get', 'update'] } },
	},

	// ---- create ----
	{
		displayName: 'Name',
		name: 'name',
		type: 'string',
		required: true,
		default: '',
		description: 'Plan name (max 160)',
		displayOptions: { show: { resource: ['plan'], operation: ['create'] } },
	},
	{
		displayName: 'Billing Type',
		name: 'billingType',
		type: 'options',
		options: BILLING_TYPE_OPTIONS,
		required: true,
		default: 'one_time',
		description: 'Whether the plan is a one-time package or a recurring membership',
		displayOptions: { show: { resource: ['plan'], operation: ['create'] } },
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: { show: { resource: ['plan'], operation: ['create'] } },
		options: [
			{ displayName: 'Active', name: 'active', type: 'boolean', default: true, description: 'Whether the plan is active (defaults to true)' },
			{ displayName: 'Billing Interval', name: 'billingInterval', type: 'options', options: BILLING_INTERVAL_OPTIONS, default: 'month', description: 'Recurring interval unit; defaults to month for recurring plans' },
			{ displayName: 'Category ID', name: 'categoryId', type: 'string', default: '', description: 'ServiceCategory UUID to file the plan under' },
			{ displayName: 'Credits', name: 'credits', type: 'number', default: 0, description: 'Credit pool granted by the plan (0-1000000)' },
			{ displayName: 'Currency', name: 'currency', type: 'string', default: '', description: 'ISO currency code (max 3 chars), stored uppercase' },
			{ displayName: 'Description', name: 'description', type: 'string', default: '', description: 'Plan description (max 2000)' },
			{ displayName: 'Image URL', name: 'imageUrl', type: 'string', default: '', description: 'Plan image URL (max 2048)' },
			{ displayName: 'Interval Count', name: 'intervalCount', type: 'number', default: 1, description: 'Number of intervals per billing cycle (1-365); defaults to 1 for recurring plans' },
			{ displayName: 'Is Ecommerce', name: 'isEcommerce', type: 'boolean', default: false, description: 'Whether the plan is an e-commerce package' },
			{ displayName: 'Items', name: 'items', type: 'json', default: '[]', description: ITEMS_DESCRIPTION },
			{ displayName: 'Notify Email', name: 'notifyEmail', type: 'boolean', default: false, description: 'Whether to send email notifications for this plan' },
			{ displayName: 'Notify WhatsApp', name: 'notifyWhatsapp', type: 'boolean', default: false, description: 'Whether to send WhatsApp notifications for this plan' },
			{ displayName: 'Price', name: 'price', type: 'number', default: 0, description: 'Plan price (0-100000000)' },
			{ displayName: 'Sort Order', name: 'sortOrder', type: 'number', default: 0, description: 'Ordering weight (0-100000)' },
		],
	},

	// ---- update ----
	{
		displayName: 'Update Fields',
		name: 'updateFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: { show: { resource: ['plan'], operation: ['update'] } },
		options: [
			{ displayName: 'Active', name: 'active', type: 'boolean', default: true, description: 'Whether the plan is active' },
			{ displayName: 'Billing Interval', name: 'billingInterval', type: 'options', options: BILLING_INTERVAL_OPTIONS, default: 'month', description: 'Recurring interval unit' },
			{ displayName: 'Billing Type', name: 'billingType', type: 'options', options: BILLING_TYPE_OPTIONS, default: 'one_time', description: 'Whether the plan is a one-time package or a recurring membership' },
			{ displayName: 'Category ID', name: 'categoryId', type: 'string', default: '', description: 'ServiceCategory UUID to file the plan under' },
			{ displayName: 'Credits', name: 'credits', type: 'number', default: 0, description: 'Credit pool granted by the plan (0-1000000)' },
			{ displayName: 'Currency', name: 'currency', type: 'string', default: '', description: 'ISO currency code (max 3 chars), stored uppercase' },
			{ displayName: 'Description', name: 'description', type: 'string', default: '', description: 'Plan description (max 2000)' },
			{ displayName: 'Image URL', name: 'imageUrl', type: 'string', default: '', description: 'Plan image URL (max 2048)' },
			{ displayName: 'Interval Count', name: 'intervalCount', type: 'number', default: 1, description: 'Number of intervals per billing cycle (1-365)' },
			{ displayName: 'Is Ecommerce', name: 'isEcommerce', type: 'boolean', default: false, description: 'Whether the plan is an e-commerce package' },
			{ displayName: 'Items', name: 'items', type: 'json', default: '[]', description: ITEMS_DESCRIPTION },
			{ displayName: 'Name', name: 'name', type: 'string', default: '', description: 'Plan name (max 160)' },
			{ displayName: 'Notify Email', name: 'notifyEmail', type: 'boolean', default: false, description: 'Whether to send email notifications for this plan' },
			{ displayName: 'Notify WhatsApp', name: 'notifyWhatsapp', type: 'boolean', default: false, description: 'Whether to send WhatsApp notifications for this plan' },
			{ displayName: 'Price', name: 'price', type: 'number', default: 0, description: 'Plan price (0-100000000)' },
			{ displayName: 'Sort Order', name: 'sortOrder', type: 'number', default: 0, description: 'Ordering weight (0-100000)' },
		],
	},

	// ---- getAll ----
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		default: false,
		description: 'Whether to return all results or only up to a given limit',
		displayOptions: { show: { resource: ['plan'], operation: ['getAll'] } },
	},
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		typeOptions: { minValue: 1 },
		default: 50,
		description: 'Max number of results to return',
		displayOptions: { show: { resource: ['plan'], operation: ['getAll'], returnAll: [false] } },
	},
	{
		displayName: 'Filters',
		name: 'filters',
		type: 'collection',
		placeholder: 'Add Filter',
		default: {},
		displayOptions: { show: { resource: ['plan'], operation: ['getAll'] } },
		options: [
			{ displayName: 'Active', name: 'active', type: 'boolean', default: true, description: 'Whether to filter by the active flag' },
			{ displayName: 'Billing Type', name: 'billingType', type: 'options', options: BILLING_TYPE_OPTIONS, default: 'one_time', description: 'Filter by billing type' },
			{ displayName: 'Category ID', name: 'category', type: 'string', default: '', description: 'ServiceCategory UUID to filter by' },
			{ displayName: 'Search', name: 'search', type: 'string', default: '', description: 'Keyword matched against plan name' },
		],
	},
];
