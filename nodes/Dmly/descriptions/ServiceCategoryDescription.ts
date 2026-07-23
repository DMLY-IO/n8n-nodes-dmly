import type { INodeProperties } from 'n8n-workflow';

const CATEGORY_KIND_OPTIONS = [
	{ name: 'Service', value: 'service' },
	{ name: 'Product', value: 'product' },
	{ name: 'Plan', value: 'plan' },
];

export const serviceCategoryOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['serviceCategory'] } },
		options: [
			{ name: 'Create', value: 'create', action: 'Create a service category', description: 'Create a catalogue category' },
			{ name: 'Delete', value: 'delete', action: 'Delete a service category', description: 'Delete a category by UUID (linked items are detached first)' },
			{ name: 'Get', value: 'get', action: 'Get a service category', description: 'Retrieve a single category by UUID' },
			{ name: 'Get Many', value: 'getAll', action: 'Get many service categories', description: 'List catalogue categories for the workspace' },
			{ name: 'Update', value: 'update', action: 'Update a service category', description: 'Update an existing category by UUID' },
		],
		default: 'getAll',
	},
];

export const serviceCategoryFields: INodeProperties[] = [
	{
		displayName: 'Service Category ID',
		name: 'serviceCategoryId',
		type: 'string',
		required: true,
		default: '',
		description: 'The service category UUID',
		displayOptions: { show: { resource: ['serviceCategory'], operation: ['delete', 'get', 'update'] } },
	},

	// ---- create ----
	{
		displayName: 'Name',
		name: 'name',
		type: 'string',
		required: true,
		default: '',
		description: 'Category name (max 80 chars)',
		displayOptions: { show: { resource: ['serviceCategory'], operation: ['create'] } },
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: { show: { resource: ['serviceCategory'], operation: ['create'] } },
		options: [
			{ displayName: 'Color', name: 'color', type: 'color', default: '', description: 'Hex colour tag (max 9 chars)' },
			{ displayName: 'Kind', name: 'kind', type: 'options', options: CATEGORY_KIND_OPTIONS, default: 'service', description: 'What this category groups' },
		],
	},

	// ---- update ----
	{
		displayName: 'Update Fields',
		name: 'updateFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: { show: { resource: ['serviceCategory'], operation: ['update'] } },
		options: [
			{ displayName: 'Active', name: 'active', type: 'boolean', default: true, description: 'Whether the category is active' },
			{ displayName: 'Color', name: 'color', type: 'color', default: '', description: 'Hex colour tag (max 9 chars)' },
			{ displayName: 'Kind', name: 'kind', type: 'options', options: CATEGORY_KIND_OPTIONS, default: 'service', description: 'What this category groups (nullable)' },
			{ displayName: 'Name', name: 'name', type: 'string', default: '', description: 'Category name (max 80 chars)' },
			{ displayName: 'Sort Order', name: 'sortOrder', type: 'number', default: 0, description: 'Sort position (integer, min 0)' },
		],
	},

	// ---- getAll ----
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		default: false,
		description: 'Whether to return all results or only up to a given limit',
		displayOptions: { show: { resource: ['serviceCategory'], operation: ['getAll'] } },
	},
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		typeOptions: { minValue: 1 },
		default: 50,
		description: 'Max number of results to return',
		displayOptions: { show: { resource: ['serviceCategory'], operation: ['getAll'], returnAll: [false] } },
	},
	{
		displayName: 'Filters',
		name: 'filters',
		type: 'collection',
		placeholder: 'Add Filter',
		default: {},
		displayOptions: { show: { resource: ['serviceCategory'], operation: ['getAll'] } },
		options: [
			{ displayName: 'Kind', name: 'kind', type: 'options', options: CATEGORY_KIND_OPTIONS, default: 'service', description: 'Filter by category kind' },
			{ displayName: 'Search', name: 'search', type: 'string', default: '', description: 'Case-insensitive substring match on the category name' },
		],
	},
];
