import type { INodeProperties } from 'n8n-workflow';

export const mediaOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['media'] } },
		options: [
			{ name: 'Delete', value: 'delete', action: 'Delete a media item', description: 'Delete a media item and its files from storage' },
			{ name: 'Get', value: 'get', action: 'Get a media item', description: 'Get a single media item' },
			{ name: 'Get Many', value: 'getAll', action: 'Get many media items', description: 'Get many media library items' },
			{ name: 'Upload', value: 'upload', action: 'Upload a media file', description: 'Upload a single file to create a media record' },
		],
		default: 'getAll',
	},
];

export const mediaFields: INodeProperties[] = [
	{
		displayName: 'Media ID',
		name: 'mediaId',
		type: 'string',
		required: true,
		default: '',
		description: 'The media UUID',
		displayOptions: {
			show: {
				resource: ['media'],
				operation: ['delete', 'get'],
			},
		},
	},

	// ---- upload ----
	{
		displayName: 'File',
		name: 'file',
		type: 'string',
		required: true,
		default: '',
		description: 'The binary file to upload, sent as a multipart/form-data "file" part (e.g. product-photo.jpg)',
		displayOptions: { show: { resource: ['media'], operation: ['upload'] } },
	},

	// ---- getAll ----
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		default: false,
		description: 'Whether to return all results or only up to a given limit',
		displayOptions: { show: { resource: ['media'], operation: ['getAll'] } },
	},
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		typeOptions: { minValue: 1 },
		default: 50,
		description: 'Max number of results to return',
		displayOptions: { show: { resource: ['media'], operation: ['getAll'], returnAll: [false] } },
	},
	{
		displayName: 'Filters',
		name: 'filters',
		type: 'collection',
		placeholder: 'Add Filter',
		default: {},
		displayOptions: { show: { resource: ['media'], operation: ['getAll'] } },
		options: [
			{ displayName: 'Search', name: 'search', type: 'string', default: '', description: 'Filter items whose name contains this string (case-insensitive)' },
		],
	},
];
