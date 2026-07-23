import type { INodeProperties } from 'n8n-workflow';

export const segmentOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['segment'] } },
		options: [
			{ name: 'Create', value: 'create', action: 'Create a segment', description: 'Create a new saved contact segment' },
			{ name: 'Delete', value: 'delete', action: 'Delete a segment', description: 'Delete a saved contact segment' },
			{ name: 'Get', value: 'get', action: 'Get a segment', description: 'Get a single saved contact segment' },
			{ name: 'Get Contacts', value: 'getContacts', action: 'Get contacts matching a segment', description: 'List the contacts that currently match a segment' },
			{ name: 'Get Many', value: 'getAll', action: 'Get many segments', description: 'Get many saved contact segments' },
			{ name: 'Update', value: 'update', action: 'Update a segment', description: 'Update an existing saved contact segment' },
		],
		default: 'getAll',
	},
];

export const segmentFields: INodeProperties[] = [
	{
		displayName: 'Segment ID',
		name: 'segmentId',
		type: 'string',
		required: true,
		default: '',
		description: 'The segment UUID',
		displayOptions: {
			show: {
				resource: ['segment'],
				operation: ['delete', 'get', 'getContacts', 'update'],
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
		description: 'Segment name (max 80 characters)',
		displayOptions: { show: { resource: ['segment'], operation: ['create'] } },
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: { show: { resource: ['segment'], operation: ['create'] } },
		options: [
			{ displayName: 'Conditions', name: 'conditions', type: 'json', default: '{}', description: 'Grouped conditions rule tree: { match: "all"|"any", groups: [{ match, rules: [{ field, op, name, value, value2 }] }] }' },
			{ displayName: 'Exclude Tags', name: 'excludeTags', type: 'json', default: '[]', description: 'Array of tag UUIDs; matched contacts must have NONE of these tags' },
			{ displayName: 'Include Tags', name: 'includeTags', type: 'json', default: '[]', description: 'Array of tag UUIDs; matched contacts must have ALL of these tags' },
			{ displayName: 'Min Days Inactive', name: 'minDaysInactive', type: 'number', typeOptions: { minValue: 0 }, default: 0, description: 'Only include contacts with no interaction for at least this many days' },
			{ displayName: 'Stage ID', name: 'stage', type: 'string', default: '', description: 'Stage UUID to filter contacts by' },
		],
	},

	// ---- update ----
	{
		displayName: 'Update Fields',
		name: 'updateFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: { show: { resource: ['segment'], operation: ['update'] } },
		options: [
			{ displayName: 'Conditions', name: 'conditions', type: 'json', default: '{}', description: 'Grouped conditions rule tree: { match: "all"|"any", groups: [{ match, rules: [{ field, op, name, value, value2 }] }] }' },
			{ displayName: 'Exclude Tags', name: 'excludeTags', type: 'json', default: '[]', description: 'Array of tag UUIDs; matched contacts must have NONE of these tags' },
			{ displayName: 'Include Tags', name: 'includeTags', type: 'json', default: '[]', description: 'Array of tag UUIDs; matched contacts must have ALL of these tags' },
			{ displayName: 'Min Days Inactive', name: 'minDaysInactive', type: 'number', typeOptions: { minValue: 0 }, default: 0, description: 'Only include contacts with no interaction for at least this many days' },
			{ displayName: 'Name', name: 'name', type: 'string', default: '', description: 'Segment name (max 80 characters)' },
			{ displayName: 'Stage ID', name: 'stage', type: 'string', default: '', description: 'Stage UUID to filter contacts by' },
		],
	},

	// ---- getAll / getContacts ----
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		default: false,
		description: 'Whether to return all results or only up to a given limit',
		displayOptions: { show: { resource: ['segment'], operation: ['getAll', 'getContacts'] } },
	},
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		typeOptions: { minValue: 1 },
		default: 50,
		description: 'Max number of results to return',
		displayOptions: { show: { resource: ['segment'], operation: ['getAll', 'getContacts'], returnAll: [false] } },
	},
	{
		displayName: 'Filters',
		name: 'filters',
		type: 'collection',
		placeholder: 'Add Filter',
		default: {},
		displayOptions: { show: { resource: ['segment'], operation: ['getAll'] } },
		options: [
			{ displayName: 'Search', name: 'search', type: 'string', default: '', description: 'Filter segments by name (case-insensitive partial match)' },
			{ displayName: 'With Counts', name: 'withCounts', type: 'boolean', default: false, description: 'Whether to compute the live contacts_count for each segment (heavier query)' },
		],
	},
];
