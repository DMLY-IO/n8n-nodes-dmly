import type { INodeProperties } from 'n8n-workflow';

const STATUS_OPTIONS = [
	{ name: 'Pending', value: 'pending' },
	{ name: 'Active', value: 'active' },
	{ name: 'Exhausted', value: 'exhausted' },
	{ name: 'Expired', value: 'expired' },
	{ name: 'Cancelled', value: 'cancelled' },
];

export const giftCardOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['giftCard'] } },
		options: [
			{ name: 'Create', value: 'create', action: 'Sell or issue a gift card', description: 'Sell a gift card to a purchaser (an invoice is sent) or issue a complimentary one' },
			{ name: 'Get', value: 'get', action: 'Get a gift card', description: 'Get a single gift card' },
			{ name: 'Get Many', value: 'getAll', action: 'Get many gift cards', description: 'List gift cards, newest first' },
			{ name: 'Redeem', value: 'redeem', action: 'Redeem a gift card against an invoice', description: 'Draw a gift card by code against an invoice, recording a gift card payment' },
		],
		default: 'getAll',
	},
];

export const giftCardFields: INodeProperties[] = [
	{
		displayName: 'Gift Card ID',
		name: 'giftCardId',
		type: 'string',
		required: true,
		default: '',
		description: 'The gift card UUID',
		displayOptions: { show: { resource: ['giftCard'], operation: ['get'] } },
	},

	// ---- create ----
	{
		displayName: 'Value',
		name: 'value',
		type: 'number',
		required: true,
		default: 0,
		description: 'Card value (0.01 to 1,000,000)',
		displayOptions: { show: { resource: ['giftCard'], operation: ['create'] } },
	},
	{
		displayName: 'Currency',
		name: 'currency',
		type: 'string',
		required: true,
		default: 'USD',
		description: 'Three-letter ISO currency code',
		displayOptions: { show: { resource: ['giftCard'], operation: ['create'] } },
	},
	{
		displayName: 'Complimentary',
		name: 'comp',
		type: 'boolean',
		default: false,
		description: 'Whether to issue a free card with no purchaser and no invoice. When off, a Purchaser ID is required and a purchase invoice is sent to them.',
		displayOptions: { show: { resource: ['giftCard'], operation: ['create'] } },
	},
	{
		displayName: 'Purchaser ID',
		name: 'purchaserId',
		type: 'string',
		required: true,
		default: '',
		description: 'UUID of the contact buying the card; they receive the purchase invoice',
		displayOptions: { show: { resource: ['giftCard'], operation: ['create'], comp: [false] } },
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: { show: { resource: ['giftCard'], operation: ['create'] } },
		options: [
			{ displayName: 'Expires At', name: 'expiresAt', type: 'dateTime', default: '', description: 'Date after which the card can no longer be redeemed' },
			{ displayName: 'Notes', name: 'notes', type: 'string', default: '', description: 'Internal notes (max 500 chars)' },
			{ displayName: 'Recipient ID', name: 'recipientId', type: 'string', default: '', description: 'UUID of the contact receiving the card, if different from the purchaser' },
		],
	},

	// ---- redeem ----
	{
		displayName: 'Code',
		name: 'code',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'GIFT-A1B2C3D4',
		description: 'The gift card code',
		displayOptions: { show: { resource: ['giftCard'], operation: ['redeem'] } },
	},
	{
		displayName: 'Invoice ID',
		name: 'invoiceId',
		type: 'string',
		required: true,
		default: '',
		description: 'UUID of the invoice to settle with the card',
		displayOptions: { show: { resource: ['giftCard'], operation: ['redeem'] } },
	},
	{
		displayName: 'Amount',
		name: 'amount',
		type: 'number',
		default: 0,
		description: 'Cap on how much to draw. Leave at 0 to apply the lesser of the card balance and the invoice amount due.',
		displayOptions: { show: { resource: ['giftCard'], operation: ['redeem'] } },
	},

	// ---- getAll ----
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		default: false,
		description: 'Whether to return all results or only up to a given limit',
		displayOptions: { show: { resource: ['giftCard'], operation: ['getAll'] } },
	},
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		typeOptions: { minValue: 1 },
		default: 50,
		description: 'Max number of results to return',
		displayOptions: { show: { resource: ['giftCard'], operation: ['getAll'], returnAll: [false] } },
	},
	{
		displayName: 'Filters',
		name: 'filters',
		type: 'collection',
		placeholder: 'Add Filter',
		default: {},
		displayOptions: { show: { resource: ['giftCard'], operation: ['getAll'] } },
		options: [
			{ displayName: 'Search', name: 'search', type: 'string', default: '', description: 'Case-insensitive match on part of the gift card code' },
			{ displayName: 'Status', name: 'status', type: 'options', options: STATUS_OPTIONS, default: 'active', description: 'Filter by gift card status' },
		],
	},
];
