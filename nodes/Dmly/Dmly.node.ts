import {
	IExecuteFunctions,
	IDataObject,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeConnectionTypes,
	NodeOperationError,
} from 'n8n-workflow';

import {
	dmlyApiRequest,
	getWebhookHeadersFromCollection,
	normalizeDmlyResponse,
	normalizeRecipientFields,
} from './GenericFunctions';

function parseCommaSeparatedList(value: string): string[] {
	return value
		.split(',')
		.map((item) => item.trim())
		.filter((item) => item !== '');
}

function parseJsonParameter(
	context: IExecuteFunctions,
	parameterName: string,
	itemIndex: number,
	defaultValue = '{}',
): IDataObject {
	const value = context.getNodeParameter(parameterName, itemIndex, defaultValue) as string | IDataObject;

	if (typeof value === 'object' && value !== null) {
		return value;
	}

	const textValue = String(value ?? '').trim();
	if (textValue === '') {
		return {};
	}

	try {
		return JSON.parse(textValue) as IDataObject;
	} catch (error) {
		throw new NodeOperationError(
			context.getNode(),
			`Invalid JSON in parameter "${parameterName}". Please provide valid JSON.`,
			{ itemIndex },
		);
	}
}

function getErrorMessage(error: unknown): string {
	if (error instanceof Error) {
		return error.message;
	}

	return 'An unknown error occurred.';
}

function getErrorDetails(error: unknown): IDataObject | undefined {
	const errorObject = error as {
		response?: {
			status?: number;
			statusText?: string;
			data?: IDataObject;
		};
		httpCode?: string;
	};

	if (errorObject.response?.data && typeof errorObject.response.data === 'object') {
		return errorObject.response.data;
	}

	if (errorObject.httpCode) {
		return {
			httpCode: errorObject.httpCode,
		};
	}

	return undefined;
}

function isNotFoundError(error: unknown): boolean {
	const errorObject = error as {
		response?: {
			status?: number;
		};
		httpCode?: string;
	};

	if (errorObject.response?.status === 404) {
		return true;
	}

	if (errorObject.httpCode === '404') {
		return true;
	}

	return false;
}

function getMessageEndpoint(
	messageChannel: string,
	messageSendType: string,
	whatsappSendType: string,
): string | undefined {
	if (messageChannel === 'whatsapp') {
		const whatsappPaths: { [key: string]: string } = {
			catalog: 'sendcatalog',
			interactiveButtons: 'sendinteractivebuttons',
			interactiveCtaUrl: 'sendinteractivectaurl',
			interactiveList: 'sendinteractivelist',
			media: 'sendmedia',
			product: 'sendproduct',
			productList: 'sendproductlist',
			template: 'sendtemplate',
			text: 'sendtext',
		};

		const path = whatsappPaths[whatsappSendType];
		if (!path) {
			return undefined;
		}

		return `/v1/messages/whatsapp/${path}`;
	}

	const nonWhatsappPaths: { [key: string]: string } = {
		media: 'sendmedia',
		template: 'sendtemplate',
		text: 'sendtext',
	};

	const path = nonWhatsappPaths[messageSendType];
	if (!path) {
		return undefined;
	}

	return `/v1/messages/${messageChannel}/${path}`;
}

export class Dmly implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'DMLY',
		name: 'dmly',
		icon: 'file:dmly.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Interact with the DMLY REST API.',
		defaults: {
			name: 'DMLY',
		},
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		credentials: [
			{
				name: 'dmlyApi',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Account',
						value: 'account',
					},
					{
						name: 'Broadcast',
						value: 'broadcast',
					},
					{
						name: 'Contact',
						value: 'contact',
					},
					{
						name: 'Contact Tag',
						value: 'contactTag',
					},
					{
						name: 'Message',
						value: 'message',
					},
					{
						name: 'Segment',
						value: 'segment',
					},
					{
						name: 'Staff',
						value: 'staff',
					},
					{
						name: 'Webhook',
						value: 'webhook',
					},
					{
						name: 'WhatsApp Template',
						value: 'whatsappTemplate',
					},
					{
						name: 'Workspace',
						value: 'workspace',
					},
				],
				default: 'contact',
			},

			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['account'],
					},
				},
				options: [
					{
						name: 'Get Info',
						value: 'getInfo',
						description: 'Get account information',
						action: 'Get account information',
					},
				],
				default: 'getInfo',
			},

			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['broadcast'],
					},
				},
				options: [
					{
						name: 'Create',
						value: 'create',
						description: 'Create a broadcast',
						action: 'Create a broadcast',
					},
					{
						name: 'Delete',
						value: 'delete',
						description: 'Delete a broadcast',
						action: 'Delete a broadcast',
					},
					{
						name: 'Get',
						value: 'get',
						description: 'Get a broadcast',
						action: 'Get a broadcast',
					},
					{
						name: 'Get Logs',
						value: 'getLogs',
						description: 'Get logs for a broadcast',
						action: 'Get logs for a broadcast',
					},
					{
						name: 'Get Many',
						value: 'getAll',
						description: 'Get many broadcasts',
						action: 'Get many broadcasts',
					},
					{
						name: 'Update',
						value: 'update',
						description: 'Update a broadcast',
						action: 'Update a broadcast',
					},
				],
				default: 'getAll',
			},

			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['contact'],
					},
				},
				options: [
					{
						name: 'Add Tags',
						value: 'addTags',
						description: 'Add tags to a contact',
						action: 'Add tags to a contact',
					},
					{
						name: 'Assign Chat',
						value: 'assignChat',
						description: 'Assign a contact chat to a staff member',
						action: 'Assign a contact chat',
					},
					{
						name: 'Create',
						value: 'create',
						description: 'Create a contact',
						action: 'Create a contact',
					},
					{
						name: 'Delete',
						value: 'delete',
						description: 'Delete a contact',
						action: 'Delete a contact',
					},
					{
						name: 'Get',
						value: 'get',
						description: 'Get a contact',
						action: 'Get a contact',
					},
					{
						name: 'Get Many',
						value: 'getAll',
						description: 'Get many contacts',
						action: 'Get many contacts',
					},
					{
						name: 'Remove Tags',
						value: 'removeTags',
						description: 'Remove tags from a contact',
						action: 'Remove tags from a contact',
					},
					{
						name: 'Update',
						value: 'update',
						description: 'Update a contact',
						action: 'Update a contact',
					},
				],
				default: 'getAll',
			},

			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['contactTag'],
					},
				},
				options: [
					{
						name: 'Create',
						value: 'create',
						description: 'Create a contact tag',
						action: 'Create a contact tag',
					},
					{
						name: 'Delete',
						value: 'delete',
						description: 'Delete a contact tag',
						action: 'Delete a contact tag',
					},
					{
						name: 'Get',
						value: 'get',
						description: 'Get a contact tag',
						action: 'Get a contact tag',
					},
					{
						name: 'Get Many',
						value: 'getAll',
						description: 'Get many contact tags',
						action: 'Get many contact tags',
					},
				],
				default: 'getAll',
			},

			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['message'],
					},
				},
				options: [
					{
						name: 'Get by Contact',
						value: 'getByContact',
						description: 'Get messages for a contact',
						action: 'Get messages for a contact',
					},
					{
						name: 'Send',
						value: 'send',
						description: 'Send a message',
						action: 'Send a message',
					},
				],
				default: 'send',
			},

			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['segment'],
					},
				},
				options: [
					{
						name: 'Create',
						value: 'create',
						description: 'Create a segment',
						action: 'Create a segment',
					},
					{
						name: 'Delete',
						value: 'delete',
						description: 'Delete a segment',
						action: 'Delete a segment',
					},
					{
						name: 'Get',
						value: 'get',
						description: 'Get a segment',
						action: 'Get a segment',
					},
					{
						name: 'Get Many',
						value: 'getAll',
						description: 'Get many segments',
						action: 'Get many segments',
					},
				],
				default: 'getAll',
			},

			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['staff'],
					},
				},
				options: [
					{
						name: 'Get',
						value: 'get',
						description: 'Get a staff member',
						action: 'Get a staff member',
					},
					{
						name: 'Get Many',
						value: 'getAll',
						description: 'Get many staff members',
						action: 'Get many staff members',
					},
				],
				default: 'getAll',
			},

			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['webhook'],
					},
				},
				options: [
					{
						name: 'Create',
						value: 'create',
						description: 'Create a webhook',
						action: 'Create a webhook',
					},
					{
						name: 'Delete',
						value: 'delete',
						description: 'Delete a webhook',
						action: 'Delete a webhook',
					},
					{
						name: 'Get',
						value: 'get',
						description: 'Get a webhook',
						action: 'Get a webhook',
					},
					{
						name: 'Get Many',
						value: 'getAll',
						description: 'Get many webhooks',
						action: 'Get many webhooks',
					},
					{
						name: 'Update',
						value: 'update',
						description: 'Update a webhook',
						action: 'Update a webhook',
					},
				],
				default: 'getAll',
			},

			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['whatsappTemplate'],
					},
				},
				options: [
					{
						name: 'Create',
						value: 'create',
						description: 'Create a WhatsApp template',
						action: 'Create a whats app template',
					},
					{
						name: 'Get',
						value: 'get',
						description: 'Get a WhatsApp template',
						action: 'Get a whats app template',
					},
					{
						name: 'Get Many',
						value: 'getAll',
						description: 'Get many WhatsApp templates',
						action: 'Get many whats app templates',
					},
				],
				default: 'getAll',
			},

			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['workspace'],
					},
				},
				options: [
					{
						name: 'Get',
						value: 'get',
						description: 'Get a workspace',
						action: 'Get a workspace',
					},
					{
						name: 'Get Many',
						value: 'getAll',
						description: 'Get many workspaces',
						action: 'Get many workspaces',
					},
				],
				default: 'getAll',
			},

			{
				displayName: 'Broadcast ID',
				name: 'broadcastId',
				type: 'string',
				default: '',
				required: true,
				displayOptions: {
					show: {
						resource: ['broadcast'],
						operation: ['delete', 'get', 'getLogs', 'update'],
					},
				},
			},
			{
				displayName: 'Payload (JSON)',
				name: 'broadcastPayload',
				type: 'string',
				typeOptions: {
					rows: 8,
				},
				default: '{}',
				required: true,
				displayOptions: {
					show: {
						resource: ['broadcast'],
						operation: ['create', 'update'],
					},
				},
				description: 'The full JSON payload to send to the broadcast endpoint',
			},
			{
				displayName: 'Per Page Limit',
				name: 'broadcastLimit',
				type: 'number',
				typeOptions: {
					minValue: 1,
				},
				default: 10,
				displayOptions: {
					show: {
						resource: ['broadcast'],
						operation: ['getAll'],
					},
				},
				description: 'Max number of results to return',
			},
			{
				displayName: 'Page',
				name: 'broadcastPage',
				type: 'number',
				typeOptions: {
					minValue: 1,
				},
				default: 1,
				displayOptions: {
					show: {
						resource: ['broadcast'],
						operation: ['getAll'],
					},
				},
				description: 'The page number',
			},
			{
				displayName: 'Search Text',
				name: 'broadcastSearchText',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						resource: ['broadcast'],
						operation: ['getAll'],
					},
				},
				description: 'Filter broadcasts by free-text search',
			},
			{
				displayName: 'Workspace ID',
				name: 'broadcastWorkspaceId',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						resource: ['broadcast'],
						operation: ['getAll'],
					},
				},
				description: 'Filter broadcasts by workspace ID',
			},
			{
				displayName: 'Start Date',
				name: 'broadcastStartDate',
				type: 'dateTime',
				default: '',
				displayOptions: {
					show: {
						resource: ['broadcast'],
						operation: ['getAll'],
					},
				},
				description: 'Filter broadcasts by start date',
			},
			{
				displayName: 'End Date',
				name: 'broadcastEndDate',
				type: 'dateTime',
				default: '',
				displayOptions: {
					show: {
						resource: ['broadcast'],
						operation: ['getAll'],
					},
				},
				description: 'Filter broadcasts by end date',
			},
			{
				displayName: 'Per Page Limit',
				name: 'broadcastLogsLimit',
				type: 'number',
				typeOptions: {
					minValue: 1,
				},
				default: 100,
				displayOptions: {
					show: {
						resource: ['broadcast'],
						operation: ['getLogs'],
					},
				},
				description: 'Max number of log results to return',
			},
			{
				displayName: 'Page',
				name: 'broadcastLogsPage',
				type: 'number',
				typeOptions: {
					minValue: 1,
				},
				default: 1,
				displayOptions: {
					show: {
						resource: ['broadcast'],
						operation: ['getLogs'],
					},
				},
				description: 'The page number for logs',
			},

			{
				displayName: 'Contact ID',
				name: 'contactId',
				type: 'string',
				default: '',
				required: true,
				displayOptions: {
					show: {
						resource: ['contact'],
						operation: ['addTags', 'assignChat', 'delete', 'get', 'removeTags', 'update'],
					},
				},
			},
			{
				displayName: 'Payload (JSON)',
				name: 'contactPayload',
				type: 'string',
				typeOptions: {
					rows: 8,
				},
				default: '{}',
				required: true,
				displayOptions: {
					show: {
						resource: ['contact'],
						operation: ['create', 'update'],
					},
				},
				description: 'The full JSON payload to send to the contact endpoint',
			},
			{
				displayName: 'Tags',
				name: 'contactTagsToModify',
				type: 'string',
				default: '',
				required: true,
				placeholder: 'VIP,Lead',
				displayOptions: {
					show: {
						resource: ['contact'],
						operation: ['addTags', 'removeTags'],
					},
				},
				description: 'Comma-separated list of tags to add or remove',
			},
			{
				displayName: 'Staff ID',
				name: 'contactStaffId',
				type: 'string',
				default: '',
				required: true,
				displayOptions: {
					show: {
						resource: ['contact'],
						operation: ['assignChat'],
					},
				},
				description: 'The staff ID to assign to the contact chat',
			},
			{
				displayName: 'Per Page Limit',
				name: 'contactLimit',
				type: 'number',
				typeOptions: {
					minValue: 1,
				},
				default: 10,
				displayOptions: {
					show: {
						resource: ['contact'],
						operation: ['getAll'],
					},
				},
				description: 'Max number of results to return',
			},
			{
				displayName: 'Page',
				name: 'contactPage',
				type: 'number',
				typeOptions: {
					minValue: 1,
				},
				default: 1,
				displayOptions: {
					show: {
						resource: ['contact'],
						operation: ['getAll'],
					},
				},
				description: 'The page number',
			},
			{
				displayName: 'Search Text',
				name: 'contactSearchText',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						resource: ['contact'],
						operation: ['getAll'],
					},
				},
				description: 'Filter contacts by free-text search',
			},
			{
				displayName: 'Workspace ID',
				name: 'contactWorkspaceId',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						resource: ['contact'],
						operation: ['getAll'],
					},
				},
				description: 'Filter contacts by workspace ID',
			},
			{
				displayName: 'Channel',
				name: 'contactChannel',
				type: 'options',
				options: [
					{
						name: 'Instagram',
						value: 'instagram',
					},
					{
						name: 'Messenger',
						value: 'messenger',
					},
					{
						name: 'Telegram',
						value: 'telegram',
					},
					{
						name: 'Website',
						value: 'website',
					},
					{
						name: 'WhatsApp',
						value: 'whatsapp',
					},
				],
				default: 'whatsapp',
				displayOptions: {
					show: {
						resource: ['contact'],
						operation: ['getAll'],
					},
				},
				description: 'Filter contacts by channel',
			},
			{
				displayName: 'Tags',
				name: 'contactTags',
				type: 'string',
				default: '',
				placeholder: 'VIP,Lead',
				displayOptions: {
					show: {
						resource: ['contact'],
						operation: ['getAll'],
					},
				},
				description: 'Filter contacts by comma-separated tags',
			},

			{
				displayName: 'Contact Tag ID',
				name: 'contactTagId',
				type: 'string',
				default: '',
				required: true,
				displayOptions: {
					show: {
						resource: ['contactTag'],
						operation: ['delete', 'get'],
					},
				},
			},
			{
				displayName: 'Name',
				name: 'contactTagName',
				type: 'string',
				default: '',
				required: true,
				displayOptions: {
					show: {
						resource: ['contactTag'],
						operation: ['create'],
					},
				},
				description: 'The contact tag name',
			},
			{
				displayName: 'Per Page Limit',
				name: 'contactTagLimit',
				type: 'number',
				typeOptions: {
					minValue: 1,
				},
				default: 10,
				displayOptions: {
					show: {
						resource: ['contactTag'],
						operation: ['getAll'],
					},
				},
				description: 'Max number of results to return',
			},
			{
				displayName: 'Page',
				name: 'contactTagPage',
				type: 'number',
				typeOptions: {
					minValue: 1,
				},
				default: 1,
				displayOptions: {
					show: {
						resource: ['contactTag'],
						operation: ['getAll'],
					},
				},
				description: 'The page number',
			},
			{
				displayName: 'Search Text',
				name: 'contactTagSearchText',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						resource: ['contactTag'],
						operation: ['getAll'],
					},
				},
				description: 'Filter contact tags by free-text search',
			},

			{
				displayName: 'Contact ID',
				name: 'messageContactId',
				type: 'string',
				default: '',
				required: true,
				displayOptions: {
					show: {
						resource: ['message'],
						operation: ['getByContact'],
					},
				},
			},
			{
				displayName: 'Per Page Limit',
				name: 'messageLimit',
				type: 'number',
				typeOptions: {
					minValue: 1,
				},
				default: 10,
				displayOptions: {
					show: {
						resource: ['message'],
						operation: ['getByContact'],
					},
				},
				description: 'Max number of results to return',
			},
			{
				displayName: 'Page',
				name: 'messagePage',
				type: 'number',
				typeOptions: {
					minValue: 1,
				},
				default: 1,
				displayOptions: {
					show: {
						resource: ['message'],
						operation: ['getByContact'],
					},
				},
				description: 'The page number',
			},
			{
				displayName: 'Search Text',
				name: 'messageSearchText',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						resource: ['message'],
						operation: ['getByContact'],
					},
				},
				description: 'Filter messages by free-text search',
			},
			{
				displayName: 'Channel',
				name: 'messageChannel',
				type: 'options',
				default: 'whatsapp',
				displayOptions: {
					show: {
						resource: ['message'],
						operation: ['send'],
					},
				},
				options: [
					{
						name: 'Instagram',
						value: 'instagram',
					},
					{
						name: 'Messenger',
						value: 'messenger',
					},
					{
						name: 'Telegram',
						value: 'telegram',
					},
					{
						name: 'Website',
						value: 'website',
					},
					{
						name: 'WhatsApp',
						value: 'whatsapp',
					},
				],
				description: 'The channel to send the message through',
			},
			{
				displayName: 'Send Type',
				name: 'messageSendType',
				type: 'options',
				default: 'text',
				displayOptions: {
					show: {
						resource: ['message'],
						operation: ['send'],
						messageChannel: ['instagram', 'messenger', 'telegram', 'website'],
					},
				},
				options: [
					{
						name: 'Media',
						value: 'media',
					},
					{
						name: 'Template',
						value: 'template',
					},
					{
						name: 'Text',
						value: 'text',
					},
				],
				description: 'The message type for non-WhatsApp channels',
			},
			{
				displayName: 'Send Type',
				name: 'whatsappSendType',
				type: 'options',
				default: 'text',
				displayOptions: {
					show: {
						resource: ['message'],
						operation: ['send'],
						messageChannel: ['whatsapp'],
					},
				},
				options: [
					{
						name: 'Catalog',
						value: 'catalog',
					},
					{
						name: 'Interactive Buttons',
						value: 'interactiveButtons',
					},
					{
						name: 'Interactive CTA URL',
						value: 'interactiveCtaUrl',
					},
					{
						name: 'Interactive List',
						value: 'interactiveList',
					},
					{
						name: 'Media',
						value: 'media',
					},
					{
						name: 'Product',
						value: 'product',
					},
					{
						name: 'Product List',
						value: 'productList',
					},
					{
						name: 'Template',
						value: 'template',
					},
					{
						name: 'Text',
						value: 'text',
					},
				],
				description: 'The WhatsApp message type',
			},
			{
				displayName: 'Payload (JSON)',
				name: 'messagePayload',
				type: 'string',
				typeOptions: {
					rows: 10,
				},
				default: '{}',
				required: true,
				displayOptions: {
					show: {
						resource: ['message'],
						operation: ['send'],
					},
				},
				description: 'The full JSON payload for the selected message endpoint',
			},

			{
				displayName: 'Segment ID',
				name: 'segmentId',
				type: 'string',
				default: '',
				required: true,
				displayOptions: {
					show: {
						resource: ['segment'],
						operation: ['delete', 'get'],
					},
				},
			},
			{
				displayName: 'Payload (JSON)',
				name: 'segmentPayload',
				type: 'string',
				typeOptions: {
					rows: 8,
				},
				default: '{}',
				required: true,
				displayOptions: {
					show: {
						resource: ['segment'],
						operation: ['create'],
					},
				},
				description: 'The full JSON payload to send to the segment endpoint',
			},
			{
				displayName: 'Per Page Limit',
				name: 'segmentLimit',
				type: 'number',
				typeOptions: {
					minValue: 1,
				},
				default: 10,
				displayOptions: {
					show: {
						resource: ['segment'],
						operation: ['getAll'],
					},
				},
				description: 'Max number of results to return',
			},
			{
				displayName: 'Page',
				name: 'segmentPage',
				type: 'number',
				typeOptions: {
					minValue: 1,
				},
				default: 1,
				displayOptions: {
					show: {
						resource: ['segment'],
						operation: ['getAll'],
					},
				},
				description: 'The page number',
			},
			{
				displayName: 'Search Text',
				name: 'segmentSearchText',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						resource: ['segment'],
						operation: ['getAll'],
					},
				},
				description: 'Filter segments by free-text search',
			},
			{
				displayName: 'Workspace ID',
				name: 'segmentWorkspaceId',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						resource: ['segment'],
						operation: ['getAll'],
					},
				},
				description: 'Filter segments by workspace ID',
			},

			{
				displayName: 'Staff ID',
				name: 'staffId',
				type: 'string',
				default: '',
				required: true,
				displayOptions: {
					show: {
						resource: ['staff'],
						operation: ['get'],
					},
				},
			},
			{
				displayName: 'Per Page Limit',
				name: 'staffLimit',
				type: 'number',
				typeOptions: {
					minValue: 1,
				},
				default: 10,
				displayOptions: {
					show: {
						resource: ['staff'],
						operation: ['getAll'],
					},
				},
				description: 'Max number of results to return',
			},
			{
				displayName: 'Page',
				name: 'staffPage',
				type: 'number',
				typeOptions: {
					minValue: 1,
				},
				default: 1,
				displayOptions: {
					show: {
						resource: ['staff'],
						operation: ['getAll'],
					},
				},
				description: 'The page number',
			},
			{
				displayName: 'Search Text',
				name: 'staffSearchText',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						resource: ['staff'],
						operation: ['getAll'],
					},
				},
				description: 'Filter staff by free-text search',
			},
			{
				displayName: 'Workspace ID',
				name: 'staffWorkspaceId',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						resource: ['staff'],
						operation: ['getAll'],
					},
				},
				description: 'Filter staff by workspace ID',
			},

			{
				displayName: 'Webhook ID',
				name: 'webhookId',
				type: 'string',
				default: '',
				required: true,
				displayOptions: {
					show: {
						resource: ['webhook'],
						operation: ['delete', 'get', 'update'],
					},
				},
			},
			{
				displayName: 'Name',
				name: 'webhookName',
				type: 'string',
				default: 'My Webhook',
				required: true,
				displayOptions: {
					show: {
						resource: ['webhook'],
						operation: ['create', 'update'],
					},
				},
				description: 'The webhook name',
			},
			{
				displayName: 'Server URL',
				name: 'webhookServerUrl',
				type: 'string',
				default: '',
				required: true,
				placeholder: 'https://yourdomain.com/webhook',
				displayOptions: {
					show: {
						resource: ['webhook'],
						operation: ['create', 'update'],
					},
				},
				description: 'The destination URL for webhook deliveries',
			},
			{
				displayName: 'Active',
				name: 'webhookActive',
				type: 'boolean',
				default: true,
				displayOptions: {
					show: {
						resource: ['webhook'],
						operation: ['create', 'update'],
					},
				},
				description: 'Whether the webhook should be active',
			},
			{
				displayName: 'Events',
				name: 'webhookEvents',
				type: 'multiOptions',
				required: true,
				default: ['incoming_whatsapp_message'],
				displayOptions: {
					show: {
						resource: ['webhook'],
						operation: ['create', 'update'],
					},
				},
				options: [
					{
						name: 'Contact Created',
						value: 'contact_created',
					},
					{
						name: 'Contact Tag Added',
						value: 'contact_tag_added',
					},
					{
						name: 'Contact Tag Removed',
						value: 'contact_tag_removed',
					},
					{
						name: 'Incoming Instagram Message',
						value: 'incoming_instagram_message',
					},
					{
						name: 'Incoming Messenger Message',
						value: 'incoming_messenger_message',
					},
					{
						name: 'Incoming Telegram Message',
						value: 'incoming_telegram_message',
					},
					{
						name: 'Incoming Website Message',
						value: 'incoming_website_message',
					},
					{
						name: 'Incoming WhatsApp Message',
						value: 'incoming_whatsapp_message',
					},
					{
						name: 'Outgoing Instagram Message',
						value: 'outgoing_instagram_message',
					},
					{
						name: 'Outgoing Messenger Message',
						value: 'outgoing_messenger_message',
					},
					{
						name: 'Outgoing Telegram Message',
						value: 'outgoing_telegram_message',
					},
					{
						name: 'Outgoing Website Message',
						value: 'outgoing_website_message',
					},
					{
						name: 'Outgoing WhatsApp Message',
						value: 'outgoing_whatsapp_message',
					},
				],
				description: 'The events that should trigger this webhook',
			},
			{
				displayName: 'Webhook Headers',
				name: 'webhookHeaders',
				type: 'fixedCollection',
				typeOptions: {
					multipleValues: true,
				},
				default: {},
				placeholder: 'Add Header',
				displayOptions: {
					show: {
						resource: ['webhook'],
						operation: ['create', 'update'],
					},
				},
				options: [
					{
						name: 'header',
						displayName: 'Header',
						values: [
							{
								displayName: 'Key',
								name: 'key',
								type: 'string',
								default: '',
								description: 'The HTTP header name',
							},
							{
								displayName: 'Value',
								name: 'value',
								type: 'string',
								default: '',
								description: 'The HTTP header value',
							},
						],
					},
				],
				description: 'Optional headers to include in webhook deliveries',
			},
			{
				displayName: 'Per Page Limit',
				name: 'webhookLimit',
				type: 'number',
				typeOptions: {
					minValue: 1,
				},
				default: 10,
				displayOptions: {
					show: {
						resource: ['webhook'],
						operation: ['getAll'],
					},
				},
				description: 'Max number of results to return',
			},
			{
				displayName: 'Page',
				name: 'webhookPage',
				type: 'number',
				typeOptions: {
					minValue: 1,
				},
				default: 1,
				displayOptions: {
					show: {
						resource: ['webhook'],
						operation: ['getAll'],
					},
				},
				description: 'The page number',
			},

			{
				displayName: 'Template ID',
				name: 'whatsappTemplateId',
				type: 'string',
				default: '',
				required: true,
				displayOptions: {
					show: {
						resource: ['whatsappTemplate'],
						operation: ['get'],
					},
				},
				description: 'The WhatsApp template ID',
			},
			{
				displayName: 'Payload (JSON)',
				name: 'whatsappTemplatePayload',
				type: 'string',
				typeOptions: {
					rows: 10,
				},
				default: '{}',
				required: true,
				displayOptions: {
					show: {
						resource: ['whatsappTemplate'],
						operation: ['create'],
					},
				},
				description: 'The full JSON payload for creating a WhatsApp template',
			},
			{
				displayName: 'Workspace ID',
				name: 'whatsappTemplateWorkspaceId',
				type: 'string',
				default: '',
				required: true,
				displayOptions: {
					show: {
						resource: ['whatsappTemplate'],
						operation: ['getAll'],
					},
				},
				description: 'Filter templates by workspace ID',
			},
			{
				displayName: 'Per Page Limit',
				name: 'whatsappTemplateLimit',
				type: 'number',
				typeOptions: {
					minValue: 1,
				},
				default: 10,
				displayOptions: {
					show: {
						resource: ['whatsappTemplate'],
						operation: ['getAll'],
					},
				},
				description: 'Max number of results to return',
			},
			{
				displayName: 'Page',
				name: 'whatsappTemplatePage',
				type: 'number',
				typeOptions: {
					minValue: 1,
				},
				default: 1,
				displayOptions: {
					show: {
						resource: ['whatsappTemplate'],
						operation: ['getAll'],
					},
				},
				description: 'The page number',
			},
			{
				displayName: 'Search Text',
				name: 'whatsappTemplateSearchText',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						resource: ['whatsappTemplate'],
						operation: ['getAll'],
					},
				},
				description: 'Filter templates by free-text search',
			},

			{
				displayName: 'Workspace ID',
				name: 'workspaceId',
				type: 'string',
				default: '',
				required: true,
				displayOptions: {
					show: {
						resource: ['workspace'],
						operation: ['get'],
					},
				},
			},
			{
				displayName: 'Per Page Limit',
				name: 'workspaceLimit',
				type: 'number',
				typeOptions: {
					minValue: 1,
				},
				default: 10,
				displayOptions: {
					show: {
						resource: ['workspace'],
						operation: ['getAll'],
					},
				},
				description: 'Max number of results to return',
			},
			{
				displayName: 'Page',
				name: 'workspacePage',
				type: 'number',
				typeOptions: {
					minValue: 1,
				},
				default: 1,
				displayOptions: {
					show: {
						resource: ['workspace'],
						operation: ['getAll'],
					},
				},
				description: 'The page number',
			},
			{
				displayName: 'Search Text',
				name: 'workspaceSearchText',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						resource: ['workspace'],
						operation: ['getAll'],
					},
				},
				description: 'Filter workspaces by free-text search',
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: IDataObject[] = [];

		for (let i = 0; i < items.length; i++) {
			try {
				const resource = this.getNodeParameter('resource', i) as string;
				const operation = this.getNodeParameter('operation', i) as string;

				let requestMethod = 'GET';
				let endpoint = '';
				let body: IDataObject = {};
				let qs: IDataObject = {};

				if (resource === 'account') {
					endpoint = '/v1/account-info';
				} else if (resource === 'broadcast') {
					if (operation === 'create') {
						requestMethod = 'POST';
						endpoint = '/v1/broadcasts';
						body = parseJsonParameter(this, 'broadcastPayload', i);
					} else if (operation === 'delete') {
						const broadcastId = this.getNodeParameter('broadcastId', i) as string;
						requestMethod = 'DELETE';
						endpoint = `/v1/broadcasts/${broadcastId}`;
					} else if (operation === 'get') {
						const broadcastId = this.getNodeParameter('broadcastId', i) as string;
						endpoint = `/v1/broadcasts/${broadcastId}`;
					} else if (operation === 'getAll') {
						endpoint = '/v1/broadcasts';
						qs.limit = this.getNodeParameter('broadcastLimit', i) as number;
						qs.page = this.getNodeParameter('broadcastPage', i) as number;

						const searchText = this.getNodeParameter('broadcastSearchText', i, '') as string;
						if (searchText) {
							qs.searchText = searchText;
						}

						const workspaceId = this.getNodeParameter('broadcastWorkspaceId', i, '') as string;
						if (workspaceId) {
							qs.workspaceId = workspaceId;
						}

						const startDate = this.getNodeParameter('broadcastStartDate', i, '') as string;
						if (startDate) {
							qs.startDate = startDate;
						}

						const endDate = this.getNodeParameter('broadcastEndDate', i, '') as string;
						if (endDate) {
							qs.endDate = endDate;
						}
					} else if (operation === 'getLogs') {
						const broadcastId = this.getNodeParameter('broadcastId', i) as string;
						endpoint = `/v1/broadcasts/${broadcastId}/logs`;
						qs.limit = this.getNodeParameter('broadcastLogsLimit', i) as number;
						qs.page = this.getNodeParameter('broadcastLogsPage', i) as number;
					} else if (operation === 'update') {
						const broadcastId = this.getNodeParameter('broadcastId', i) as string;
						requestMethod = 'PUT';
						endpoint = `/v1/broadcasts/${broadcastId}`;
						body = parseJsonParameter(this, 'broadcastPayload', i);
					}
				} else if (resource === 'contact') {
					if (operation === 'addTags') {
						const contactId = this.getNodeParameter('contactId', i) as string;
						const tagsValue = this.getNodeParameter('contactTagsToModify', i) as string;
						const tags = parseCommaSeparatedList(tagsValue);
						if (tags.length === 0) {
							throw new NodeOperationError(
								this.getNode(),
								'Please provide at least one tag.',
								{ itemIndex: i },
							);
						}

						requestMethod = 'POST';
						endpoint = `/v1/contacts/${contactId}/tags/add`;
						body.tags = tags;
					} else if (operation === 'assignChat') {
						const contactId = this.getNodeParameter('contactId', i) as string;
						const staffId = this.getNodeParameter('contactStaffId', i) as string;

						requestMethod = 'POST';
						endpoint = `/v1/contacts/${contactId}/assign-chat`;
						body.staffId = staffId;
					} else if (operation === 'create') {
						requestMethod = 'POST';
						endpoint = '/v1/contacts';
						body = parseJsonParameter(this, 'contactPayload', i);
					} else if (operation === 'delete') {
						const contactId = this.getNodeParameter('contactId', i) as string;
						requestMethod = 'DELETE';
						endpoint = `/v1/contacts/${contactId}`;
					} else if (operation === 'get') {
						const contactId = this.getNodeParameter('contactId', i) as string;
						endpoint = `/v1/contacts/${contactId}`;
					} else if (operation === 'getAll') {
						endpoint = '/v1/contacts';
						qs.limit = this.getNodeParameter('contactLimit', i) as number;
						qs.page = this.getNodeParameter('contactPage', i) as number;

						const searchText = this.getNodeParameter('contactSearchText', i, '') as string;
						if (searchText) {
							qs.searchText = searchText;
						}

						const workspaceId = this.getNodeParameter('contactWorkspaceId', i, '') as string;
						if (workspaceId) {
							qs.workspaceId = workspaceId;
						}

						const channel = this.getNodeParameter('contactChannel', i, '') as string;
						if (channel) {
							qs.channel = channel;
						}

						const tagsValue = this.getNodeParameter('contactTags', i, '') as string;
						if (tagsValue) {
							qs.tags = parseCommaSeparatedList(tagsValue).join(',');
						}
					} else if (operation === 'removeTags') {
						const contactId = this.getNodeParameter('contactId', i) as string;
						const tagsValue = this.getNodeParameter('contactTagsToModify', i) as string;
						const tags = parseCommaSeparatedList(tagsValue);
						if (tags.length === 0) {
							throw new NodeOperationError(
								this.getNode(),
								'Please provide at least one tag.',
								{ itemIndex: i },
							);
						}

						requestMethod = 'POST';
						endpoint = `/v1/contacts/${contactId}/tags/remove`;
						body.tags = tags;
					} else if (operation === 'update') {
						const contactId = this.getNodeParameter('contactId', i) as string;
						requestMethod = 'PUT';
						endpoint = `/v1/contacts/${contactId}`;
						body = parseJsonParameter(this, 'contactPayload', i);
					}
				} else if (resource === 'contactTag') {
					if (operation === 'create') {
						requestMethod = 'POST';
						endpoint = '/v1/contactTags';
						body.name = this.getNodeParameter('contactTagName', i) as string;
					} else if (operation === 'delete') {
						const contactTagId = this.getNodeParameter('contactTagId', i) as string;
						requestMethod = 'DELETE';
						endpoint = `/v1/contactTags/${contactTagId}`;
					} else if (operation === 'get') {
						const contactTagId = this.getNodeParameter('contactTagId', i) as string;
						endpoint = `/v1/contactTags/${contactTagId}`;
					} else if (operation === 'getAll') {
						endpoint = '/v1/contactTags';
						qs.limit = this.getNodeParameter('contactTagLimit', i) as number;
						qs.page = this.getNodeParameter('contactTagPage', i) as number;

						const searchText = this.getNodeParameter('contactTagSearchText', i, '') as string;
						if (searchText) {
							qs.searchText = searchText;
						}
					}
				} else if (resource === 'message') {
					if (operation === 'getByContact') {
						const contactId = this.getNodeParameter('messageContactId', i) as string;
						endpoint = `/v1/messages/${contactId}`;
						qs.limit = this.getNodeParameter('messageLimit', i) as number;
						qs.page = this.getNodeParameter('messagePage', i) as number;

						const searchText = this.getNodeParameter('messageSearchText', i, '') as string;
						if (searchText) {
							qs.searchText = searchText;
						}
					} else if (operation === 'send') {
						const messageChannel = this.getNodeParameter('messageChannel', i) as string;
						const messageSendType = this.getNodeParameter('messageSendType', i, 'text') as string;
						const whatsappSendType = this.getNodeParameter('whatsappSendType', i, 'text') as string;

						requestMethod = 'POST';
						const messageEndpoint = getMessageEndpoint(
							messageChannel,
							messageSendType,
							whatsappSendType,
						);

						if (!messageEndpoint) {
							throw new NodeOperationError(
								this.getNode(),
								'Invalid message channel or send type combination',
								{ itemIndex: i },
							);
						}

						endpoint = messageEndpoint;
						body = parseJsonParameter(this, 'messagePayload', i);

						if (messageChannel === 'whatsapp') {
							body = normalizeRecipientFields(body);
						}
					}
				} else if (resource === 'segment') {
					if (operation === 'create') {
						requestMethod = 'POST';
						endpoint = '/v1/segments';
						body = parseJsonParameter(this, 'segmentPayload', i);
					} else if (operation === 'delete') {
						const segmentId = this.getNodeParameter('segmentId', i) as string;
						requestMethod = 'DELETE';
						endpoint = `/v1/segments/${segmentId}`;
					} else if (operation === 'get') {
						const segmentId = this.getNodeParameter('segmentId', i) as string;
						endpoint = `/v1/segments/${segmentId}`;
					} else if (operation === 'getAll') {
						endpoint = '/v1/segments';
						qs.limit = this.getNodeParameter('segmentLimit', i) as number;
						qs.page = this.getNodeParameter('segmentPage', i) as number;

						const searchText = this.getNodeParameter('segmentSearchText', i, '') as string;
						if (searchText) {
							qs.searchText = searchText;
						}

						const workspaceId = this.getNodeParameter('segmentWorkspaceId', i, '') as string;
						if (workspaceId) {
							qs.workspaceId = workspaceId;
						}
					}
				} else if (resource === 'staff') {
					if (operation === 'get') {
						const staffId = this.getNodeParameter('staffId', i) as string;
						endpoint = `/v1/staffs/${staffId}`;
					} else if (operation === 'getAll') {
						endpoint = '/v1/staffs';
						qs.limit = this.getNodeParameter('staffLimit', i) as number;
						qs.page = this.getNodeParameter('staffPage', i) as number;

						const searchText = this.getNodeParameter('staffSearchText', i, '') as string;
						if (searchText) {
							qs.searchText = searchText;
						}

						const workspaceId = this.getNodeParameter('staffWorkspaceId', i, '') as string;
						if (workspaceId) {
							qs.workspaceId = workspaceId;
						}
					}
				} else if (resource === 'webhook') {
					if (operation === 'create' || operation === 'update') {
						const headersData = this.getNodeParameter('webhookHeaders', i, {}) as IDataObject;
						const webhookHeaders = getWebhookHeadersFromCollection(headersData);

						body.name = this.getNodeParameter('webhookName', i) as string;
						body.serverUrl = this.getNodeParameter('webhookServerUrl', i) as string;
						body.active = this.getNodeParameter('webhookActive', i) as boolean;
						body.events = this.getNodeParameter('webhookEvents', i) as string[];

						if (webhookHeaders.length > 0) {
							body.webhookHeaders = webhookHeaders as unknown as IDataObject;
						}

						if (operation === 'create') {
							requestMethod = 'POST';
							endpoint = '/v1/webhooks';
						} else {
							const webhookId = this.getNodeParameter('webhookId', i) as string;
							requestMethod = 'PUT';
							endpoint = `/v1/webhooks/${webhookId}`;
						}
					} else if (operation === 'delete') {
						const webhookId = this.getNodeParameter('webhookId', i) as string;
						requestMethod = 'DELETE';
						endpoint = `/v1/webhooks/${webhookId}`;
					} else if (operation === 'get') {
						const webhookId = this.getNodeParameter('webhookId', i) as string;
						endpoint = `/v1/webhooks/${webhookId}`;
					} else if (operation === 'getAll') {
						endpoint = '/v1/webhooks';
						qs.limit = this.getNodeParameter('webhookLimit', i) as number;
						qs.page = this.getNodeParameter('webhookPage', i) as number;
					}
				} else if (resource === 'whatsappTemplate') {
					if (operation === 'create') {
						requestMethod = 'POST';
						endpoint = '/v1/whatsapp-template';
						body = parseJsonParameter(this, 'whatsappTemplatePayload', i);
					} else if (operation === 'get') {
						const templateId = this.getNodeParameter('whatsappTemplateId', i) as string;
						endpoint = `/v1/whatsapp-templates/${templateId}`;
					} else if (operation === 'getAll') {
						endpoint = '/v1/whatsapp-templates';
						qs.limit = this.getNodeParameter('whatsappTemplateLimit', i) as number;
						qs.page = this.getNodeParameter('whatsappTemplatePage', i) as number;
						qs.workspaceId = this.getNodeParameter('whatsappTemplateWorkspaceId', i) as string;

						const searchText = this.getNodeParameter('whatsappTemplateSearchText', i, '') as string;
						if (searchText) {
							qs.searchText = searchText;
						}
					}
				} else if (resource === 'workspace') {
					if (operation === 'get') {
						const workspaceId = this.getNodeParameter('workspaceId', i) as string;
						endpoint = `/v1/workspaces/${workspaceId}`;
					} else if (operation === 'getAll') {
						endpoint = '/v1/workspaces';
						qs.limit = this.getNodeParameter('workspaceLimit', i) as number;
						qs.page = this.getNodeParameter('workspacePage', i) as number;

						const searchText = this.getNodeParameter('workspaceSearchText', i, '') as string;
						if (searchText) {
							qs.searchText = searchText;
						}
					}
				}

				let responseData: IDataObject | IDataObject[];
				if (resource === 'whatsappTemplate' && operation === 'create') {
					try {
						responseData = await dmlyApiRequest.call(this, requestMethod, endpoint, body, qs);
					} catch (error) {
						if (isNotFoundError(error)) {
							responseData = await dmlyApiRequest.call(
								this,
								requestMethod,
								'/v1/whatsapp-templates',
								body,
								qs,
							);
						} else {
							throw error;
						}
					}
				} else {
					responseData = await dmlyApiRequest.call(this, requestMethod, endpoint, body, qs);
				}

				returnData.push(...normalizeDmlyResponse(responseData));
			} catch (error) {
				if (this.continueOnFail()) {
					const errorItem: IDataObject = {
						error: getErrorMessage(error),
					};

					const details = getErrorDetails(error);
					if (details) {
						errorItem.details = details;
					}

					returnData.push(errorItem);
					continue;
				}

				throw error;
			}
		}

		return [this.helpers.returnJsonArray(returnData)];
	}
}
