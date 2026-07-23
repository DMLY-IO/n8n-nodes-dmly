import type { INodeProperties } from 'n8n-workflow';

export const tagOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['tag'] } },
		options: [
			{ name: 'Create', value: 'create', action: 'Create a tag', description: 'Create a tag, or return the existing one with the same name' },
			{ name: 'Delete', value: 'delete', action: 'Delete a tag', description: 'Delete a tag and detach it from contacts' },
			{ name: 'Get', value: 'get', action: 'Get a tag', description: 'Get a single tag' },
			{ name: 'Get Many', value: 'getAll', action: 'Get many tags', description: 'Get many contact tags with contact counts' },
			{ name: 'Update', value: 'update', action: 'Update a tag', description: 'Rename or recolour a tag' },
		],
		default: 'getAll',
	},
];

export const tagFields: INodeProperties[] = [
	{
		displayName: 'Tag ID',
		name: 'tagId',
		type: 'string',
		required: true,
		default: '',
		description: 'The tag UUID',
		displayOptions: {
			show: {
				resource: ['tag'],
				operation: ['delete', 'get', 'update'],
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
		description: 'Tag name (max 60 characters)',
		displayOptions: { show: { resource: ['tag'], operation: ['create'] } },
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: { show: { resource: ['tag'], operation: ['create'] } },
		options: [
			{ displayName: 'Color', name: 'color', type: 'color', default: '', placeholder: '#16a34a', description: 'Hex colour, e.g. #16a34a (max 9 characters). Defaults to #64748b.' },
		],
	},

	// ---- update ----
	{
		displayName: 'Update Fields',
		name: 'updateFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: { show: { resource: ['tag'], operation: ['update'] } },
		options: [
			{ displayName: 'Color', name: 'color', type: 'color', default: '', placeholder: '#000000', description: 'New hex colour, e.g. #000000 (max 9 characters)' },
			{ displayName: 'Name', name: 'name', type: 'string', default: '', description: 'New tag name (max 60 characters)' },
		],
	},

	// ---- getAll ----
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		default: false,
		description: 'Whether to return all results or only up to a given limit',
		displayOptions: { show: { resource: ['tag'], operation: ['getAll'] } },
	},
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		typeOptions: { minValue: 1 },
		default: 50,
		description: 'Max number of results to return',
		displayOptions: { show: { resource: ['tag'], operation: ['getAll'], returnAll: [false] } },
	},
	{
		displayName: 'Filters',
		name: 'filters',
		type: 'collection',
		placeholder: 'Add Filter',
		default: {},
		displayOptions: { show: { resource: ['tag'], operation: ['getAll'] } },
		options: [
			{ displayName: 'Search', name: 'search', type: 'string', default: '', description: 'Search tag names' },
		],
	},
];
