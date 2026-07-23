import type { INodeProperties } from 'n8n-workflow';

const STATUS_OPTIONS = [
	{ name: 'Active', value: 'active' },
	{ name: 'Paused', value: 'paused' },
	{ name: 'Cancelled', value: 'cancelled' },
	{ name: 'Expired', value: 'expired' },
];

const EFFECTIVE_OPTIONS = [
	{ name: 'Now', value: 'now' },
	{ name: 'Next Renewal', value: 'next_renewal' },
];

export const subscriptionOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['subscription'] } },
		options: [
			{ name: 'Cancel', value: 'cancel', action: 'Cancel a subscription', description: 'Cancel the subscription (clearing its next billing date) if not already cancelled' },
			{ name: 'Change Plan', value: 'changePlan', action: 'Change a subscription s plan', description: 'Switch the subscription to a different plan, either now or at next renewal, optionally prorating' },
			{ name: 'Create', value: 'create', action: 'Subscribe a contact to a plan', description: "Create a subscription for a contact from a plan" },
			{ name: 'Get', value: 'get', action: 'Get a subscription', description: 'Retrieve a single subscription by its uuid, with embedded contact and plan' },
			{ name: 'Get Many', value: 'getAll', action: 'Get many subscriptions', description: "List the workspace's subscriptions, newest first" },
			{ name: 'Pause', value: 'pause', action: 'Pause a subscription', description: 'Pause the subscription if it is currently active' },
			{ name: 'Resume', value: 'resume', action: 'Resume a subscription', description: 'Resume the subscription if it is currently paused' },
		],
		default: 'getAll',
	},
];

export const subscriptionFields: INodeProperties[] = [
	{
		displayName: 'Subscription ID',
		name: 'subscriptionId',
		type: 'string',
		required: true,
		default: '',
		description: 'The subscription UUID',
		displayOptions: {
			show: {
				resource: ['subscription'],
				operation: ['cancel', 'changePlan', 'get', 'pause', 'resume'],
			},
		},
	},

	// ---- create ----
	{
		displayName: 'Contact ID',
		name: 'contactId',
		type: 'string',
		required: true,
		default: '',
		description: 'UUID of the contact to subscribe',
		displayOptions: { show: { resource: ['subscription'], operation: ['create'] } },
	},
	{
		displayName: 'Plan ID',
		name: 'planId',
		type: 'string',
		required: true,
		default: '',
		description: 'UUID of the plan to subscribe the contact to',
		displayOptions: { show: { resource: ['subscription'], operation: ['create'] } },
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: { show: { resource: ['subscription'], operation: ['create'] } },
		options: [
			{ displayName: 'Currency', name: 'currency', type: 'string', default: '', description: "Override currency code (max 10 chars). Defaults to the plan's currency." },
			{ displayName: 'Notes', name: 'notes', type: 'string', typeOptions: { rows: 3 }, default: '', description: 'Free-text notes (max 2000 chars)' },
			{ displayName: 'Price', name: 'price', type: 'number', default: 0, description: "Override price (>= 0). Defaults to the plan's price." },
		],
	},

	// ---- changePlan ----
	{
		displayName: 'Plan ID',
		name: 'changePlanId',
		type: 'string',
		required: true,
		default: '',
		description: 'UUID of the plan to switch to',
		displayOptions: { show: { resource: ['subscription'], operation: ['changePlan'] } },
	},
	{
		displayName: 'Additional Fields',
		name: 'changePlanFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: { show: { resource: ['subscription'], operation: ['changePlan'] } },
		options: [
			{ displayName: 'Effective', name: 'effective', type: 'options', options: EFFECTIVE_OPTIONS, default: 'next_renewal', description: 'When the change takes effect' },
			{ displayName: 'Proration', name: 'proration', type: 'boolean', default: true, description: 'Whether to prorate the change' },
		],
	},

	// ---- getAll ----
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		default: false,
		description: 'Whether to return all results or only up to a given limit',
		displayOptions: { show: { resource: ['subscription'], operation: ['getAll'] } },
	},
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		typeOptions: { minValue: 1 },
		default: 50,
		description: 'Max number of results to return',
		displayOptions: { show: { resource: ['subscription'], operation: ['getAll'], returnAll: [false] } },
	},
	{
		displayName: 'Filters',
		name: 'filters',
		type: 'collection',
		placeholder: 'Add Filter',
		default: {},
		displayOptions: { show: { resource: ['subscription'], operation: ['getAll'] } },
		options: [
			{ displayName: 'Contact ID', name: 'contact', type: 'string', default: '', description: 'Filter to subscriptions belonging to this contact (contact uuid)' },
			{ displayName: 'Status', name: 'status', type: 'options', options: STATUS_OPTIONS, default: 'active', description: 'Filter by subscription status' },
		],
	},
];
