import type { INodeProperties } from 'n8n-workflow';

const STATUS_OPTIONS = [
	{ name: 'Draft', value: 'draft' },
	{ name: 'Sent', value: 'sent' },
	{ name: 'Partial', value: 'partial' },
	{ name: 'Paid', value: 'paid' },
	{ name: 'Void', value: 'void' },
	{ name: 'Overdue', value: 'overdue' },
];

export const invoiceOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['invoice'] } },
		options: [
			{ name: 'Create', value: 'create', action: 'Create an invoice', description: 'Create a draft invoice from snapshotted line items' },
			{ name: 'Get', value: 'get', action: 'Get an invoice', description: 'Get a single invoice' },
			{ name: 'Get Many', value: 'getAll', action: 'Get many invoices', description: 'List invoices for the workspace' },
			{ name: 'Record Payment', value: 'recordPayment', action: 'Record a payment against an invoice', description: 'Record a manual payment and recompute the invoice' },
			{ name: 'Send', value: 'send', action: 'Send an invoice', description: 'Finalise a draft invoice to sent and post the statement debit' },
			{ name: 'Void', value: 'void', action: 'Void an invoice', description: 'Void the invoice and post an offsetting statement credit' },
		],
		default: 'getAll',
	},
];

export const invoiceFields: INodeProperties[] = [
	{
		displayName: 'Invoice ID',
		name: 'invoiceId',
		type: 'string',
		required: true,
		default: '',
		description: 'The invoice UUID',
		displayOptions: {
			show: {
				resource: ['invoice'],
				operation: ['get', 'recordPayment', 'send', 'void'],
			},
		},
	},

	// ---- create ----
	{
		displayName: 'Line Items',
		name: 'lineItems',
		type: 'json',
		required: true,
		default: '[]',
		description: 'Array of line-item objects. Each: { item_type: service|product|plan|custom (default custom), item_id: number, name: string (required), description: string, unit_price: number (required), quantity: number (default 1), tax: { rate: number, inclusive: boolean } }.',
		displayOptions: { show: { resource: ['invoice'], operation: ['create'] } },
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: { show: { resource: ['invoice'], operation: ['create'] } },
		options: [
			{ displayName: 'Client Notes', name: 'clientNotes', type: 'string', typeOptions: { rows: 3 }, default: '', description: 'Notes shown to the client (max 2000 chars)' },
			{ displayName: 'Contact ID', name: 'contactId', type: 'string', default: '', description: 'Optional contact UUID; supplying it converts the contact to a client' },
			{ displayName: 'Currency', name: 'currency', type: 'string', default: '', description: 'ISO currency code (max 3 chars), e.g. USD' },
			{ displayName: 'Discount Total', name: 'discountTotal', type: 'number', default: 0, description: 'Order-level discount total (0 to 100000000)' },
			{ displayName: 'Due Date', name: 'dueDate', type: 'dateTime', default: '', description: 'Invoice due date' },
			{ displayName: 'Issue Date', name: 'issueDate', type: 'dateTime', default: '', description: 'Invoice issue date' },
		],
	},

	// ---- recordPayment ----
	{
		displayName: 'Amount',
		name: 'amount',
		type: 'number',
		required: true,
		default: 0,
		description: 'Payment amount (minimum 0.01)',
		displayOptions: { show: { resource: ['invoice'], operation: ['recordPayment'] } },
	},
	{
		displayName: 'Additional Fields',
		name: 'paymentFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: { show: { resource: ['invoice'], operation: ['recordPayment'] } },
		options: [
			{ displayName: 'Payment Method', name: 'paymentMethod', type: 'string', default: '', description: 'Payment method label, e.g. cash (max 40 chars). Defaults to cash.' },
			{ displayName: 'Reference', name: 'reference', type: 'string', default: '', description: 'Optional external reference for the payment (max 120 chars)' },
		],
	},

	// ---- getAll ----
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		default: false,
		description: 'Whether to return all results or only up to a given limit',
		displayOptions: { show: { resource: ['invoice'], operation: ['getAll'] } },
	},
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		typeOptions: { minValue: 1 },
		default: 50,
		description: 'Max number of results to return',
		displayOptions: { show: { resource: ['invoice'], operation: ['getAll'], returnAll: [false] } },
	},
	{
		displayName: 'Filters',
		name: 'filters',
		type: 'collection',
		placeholder: 'Add Filter',
		default: {},
		displayOptions: { show: { resource: ['invoice'], operation: ['getAll'] } },
		options: [
			{ displayName: 'Contact ID', name: 'contact', type: 'string', default: '', description: 'Filter to invoices for a single contact, by the contact UUID' },
			{ displayName: 'From', name: 'from', type: 'dateTime', default: '', description: 'Only invoices with issue_date on or after this date (YYYY-MM-DD)' },
			{ displayName: 'Status', name: 'status', type: 'options', options: STATUS_OPTIONS, default: 'draft', description: 'Filter by invoice status' },
			{ displayName: 'To', name: 'to', type: 'dateTime', default: '', description: 'Only invoices with issue_date on or before this date (YYYY-MM-DD)' },
		],
	},
];
