import type { INodeProperties } from 'n8n-workflow';

const STATUS_OPTIONS = [
	{ name: 'Pending', value: 'pending' },
	{ name: 'Succeeded', value: 'succeeded' },
	{ name: 'Failed', value: 'failed' },
	{ name: 'Refunded', value: 'refunded' },
];

export const paymentOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['payment'] } },
		options: [
			{ name: 'Create', value: 'create', action: 'Record a manual payment', description: 'Record a manual (non-gateway) payment for a contact' },
			{ name: 'Get', value: 'get', action: 'Get a payment', description: 'Get a single payment' },
			{ name: 'Get Many', value: 'getAll', action: 'Get many payments', description: 'List payments in the unified ledger for the current workspace' },
			{ name: 'Refund', value: 'refund', action: 'Refund a payment', description: 'Refund a succeeded payment fully or partially' },
		],
		default: 'getAll',
	},
];

export const paymentFields: INodeProperties[] = [
	{
		displayName: 'Payment ID',
		name: 'paymentId',
		type: 'string',
		required: true,
		default: '',
		description: 'The payment UUID',
		displayOptions: { show: { resource: ['payment'], operation: ['get', 'refund'] } },
	},

	// ---- create ----
	{
		displayName: 'Contact ID',
		name: 'contactId',
		type: 'string',
		required: true,
		default: '',
		description: 'Uuid of the contact the payment belongs to',
		displayOptions: { show: { resource: ['payment'], operation: ['create'] } },
	},
	{
		displayName: 'Amount',
		name: 'amount',
		type: 'number',
		required: true,
		default: 0,
		description: 'Payment amount (min 0.01, max 100000000)',
		displayOptions: { show: { resource: ['payment'], operation: ['create'] } },
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: { show: { resource: ['payment'], operation: ['create'] } },
		options: [
			{ displayName: 'Currency', name: 'currency', type: 'string', default: '', description: 'ISO currency code (max 3 chars); uppercased server-side' },
			{ displayName: 'Description', name: 'description', type: 'string', default: '', description: 'Free-text description of the payment (max 500 chars)' },
			{ displayName: 'Payment Method', name: 'paymentMethod', type: 'string', default: '', description: "Payment method label (max 40 chars). Defaults to 'cash'." },
			{ displayName: 'Reference', name: 'reference', type: 'string', default: '', description: 'External reference for the payment (max 120 chars)' },
		],
	},

	// ---- refund ----
	{
		displayName: 'Amount',
		name: 'refundAmount',
		type: 'number',
		default: 0,
		description: 'Partial refund amount (min 0.01, max the payment amount). Leave empty for a full refund.',
		displayOptions: { show: { resource: ['payment'], operation: ['refund'] } },
	},

	// ---- getAll ----
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		default: false,
		description: 'Whether to return all results or only up to a given limit',
		displayOptions: { show: { resource: ['payment'], operation: ['getAll'] } },
	},
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		typeOptions: { minValue: 1 },
		default: 50,
		description: 'Max number of results to return',
		displayOptions: { show: { resource: ['payment'], operation: ['getAll'], returnAll: [false] } },
	},
	{
		displayName: 'Filters',
		name: 'filters',
		type: 'collection',
		placeholder: 'Add Filter',
		default: {},
		displayOptions: { show: { resource: ['payment'], operation: ['getAll'] } },
		options: [
			{ displayName: 'Contact ID', name: 'contact', type: 'string', default: '', description: 'Filter to payments belonging to the contact with this uuid' },
			{ displayName: 'From', name: 'from', type: 'dateTime', default: '', description: 'Only payments with a payment_date on or after this date (YYYY-MM-DD)' },
			{ displayName: 'Status', name: 'status', type: 'options', options: STATUS_OPTIONS, default: 'succeeded', description: 'Filter by payment status' },
			{ displayName: 'To', name: 'to', type: 'dateTime', default: '', description: 'Only payments with a payment_date on or before this date (YYYY-MM-DD)' },
		],
	},
];
