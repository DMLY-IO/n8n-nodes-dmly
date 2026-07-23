import type { INodeProperties } from 'n8n-workflow';

const STATUS_OPTIONS = [
	{ name: 'Draft', value: 'draft' },
	{ name: 'Confirmed', value: 'confirmed' },
	{ name: 'Fulfilled', value: 'fulfilled' },
	{ name: 'Cancelled', value: 'cancelled' },
	{ name: 'Refunded', value: 'refunded' },
];

export const orderOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['order'] } },
		options: [
			{ name: 'Cancel', value: 'cancel', action: 'Cancel an order', description: 'Cancel an order, restoring any product stock decremented on confirmation and clawing back earned loyalty' },
			{ name: 'Confirm', value: 'confirm', action: 'Confirm an order', description: 'Confirm a draft order, moving it to confirmed and decrementing tracked product stock once per line item' },
			{ name: 'Create', value: 'create', action: 'Create an order', description: 'Create a draft order from offering (service/product/plan) or custom line-item selections' },
			{ name: 'Get', value: 'get', action: 'Get an order', description: 'Retrieve a single order by its uuid, with embedded contact and snapshotted line items' },
			{ name: 'Get Many', value: 'getAll', action: 'Get many orders', description: 'List the workspace orders, newest first, with embedded contact and snapshotted line items' },
		],
		default: 'getAll',
	},
];

export const orderFields: INodeProperties[] = [
	{
		displayName: 'Order ID',
		name: 'orderId',
		type: 'string',
		required: true,
		default: '',
		description: 'The order UUID',
		displayOptions: { show: { resource: ['order'], operation: ['cancel', 'confirm', 'get'] } },
	},

	// ---- create ----
	{
		displayName: 'Items',
		name: 'items',
		type: 'json',
		required: true,
		default: '[]',
		description: 'Array of at least one line-item selection. Each item: type (required, one of service|product|plan|custom), ID (uuid of the offering for non-custom types), name (custom line name), unit_price, quantity, tax_rate, tax_inclusive.',
		displayOptions: { show: { resource: ['order'], operation: ['create'] } },
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: { show: { resource: ['order'], operation: ['create'] } },
		options: [
			{ displayName: 'Contact ID', name: 'contactId', type: 'string', default: '', description: 'The contact UUID to attach the order to. Omit for a contactless order.' },
			{ displayName: 'Coupon Code', name: 'couponCode', type: 'string', default: '', description: 'Optional coupon code; validated and applied server-side' },
			{ displayName: 'Currency', name: 'currency', type: 'string', default: '', description: '3-letter ISO currency code. Defaults server-side from the resolved items.' },
			{ displayName: 'Notes', name: 'notes', type: 'string', default: '', description: 'Free-form order notes' },
		],
	},

	// ---- getAll ----
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		default: false,
		description: 'Whether to return all results or only up to a given limit',
		displayOptions: { show: { resource: ['order'], operation: ['getAll'] } },
	},
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		typeOptions: { minValue: 1 },
		default: 50,
		description: 'Max number of results to return',
		displayOptions: { show: { resource: ['order'], operation: ['getAll'], returnAll: [false] } },
	},
	{
		displayName: 'Filters',
		name: 'filters',
		type: 'collection',
		placeholder: 'Add Filter',
		default: {},
		displayOptions: { show: { resource: ['order'], operation: ['getAll'] } },
		options: [
			{ displayName: 'Contact ID', name: 'contact', type: 'string', default: '', description: 'Filter to orders belonging to a contact, by the contact UUID' },
			{ displayName: 'Status', name: 'status', type: 'options', options: STATUS_OPTIONS, default: 'draft', description: 'Filter by order status' },
		],
	},
];
