import type { INodeProperties } from 'n8n-workflow';

const TYPE_OPTIONS = [
	{ name: 'Text', value: 'text' },
	{ name: 'Image', value: 'image' },
	{ name: 'Video', value: 'video' },
	{ name: 'Audio', value: 'audio' },
	{ name: 'File', value: 'file' },
	{ name: 'Template', value: 'template' },
];

const KIND_OPTIONS = [
	{ name: 'DM', value: 'dm' },
	{ name: 'Comment', value: 'comment' },
];

export const messageOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['message'] } },
		options: [
			{ name: 'Send', value: 'send', action: 'Send a message', description: 'Send an outbound message into a conversation' },
		],
		default: 'send',
	},
];

export const messageFields: INodeProperties[] = [
	// ---- send ----
	{
		displayName: 'Contact ID',
		name: 'contactId',
		type: 'string',
		required: true,
		default: '',
		description: 'The contact uuid to send the message to',
		displayOptions: { show: { resource: ['message'], operation: ['send'] } },
	},
	{
		displayName: 'Type',
		name: 'type',
		type: 'options',
		options: TYPE_OPTIONS,
		default: 'text',
		description: 'Message type',
		displayOptions: { show: { resource: ['message'], operation: ['send'] } },
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: { show: { resource: ['message'], operation: ['send'] } },
		options: [
			{ displayName: 'Body', name: 'body', type: 'string', typeOptions: { rows: 3 }, default: '', description: 'Message text body (max 4096 characters)' },
			{ displayName: 'Kind', name: 'kind', type: 'options', options: KIND_OPTIONS, default: 'dm', description: 'Message kind: a direct message or a comment' },
			{ displayName: 'Media', name: 'media', type: 'json', default: '[]', description: 'Media payload array for non-text messages' },
			{ displayName: 'Parameters', name: 'parameters', type: 'json', default: '[]', description: 'Ordered {{n}} template parameter values' },
			{ displayName: 'Template ID', name: 'templateId', type: 'string', default: '', description: 'For type=template on WhatsApp, the WaTemplate uuid' },
		],
	},
];
