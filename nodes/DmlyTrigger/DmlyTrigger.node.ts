import type {
	IDataObject,
	IHookFunctions,
	INodeType,
	INodeTypeDescription,
	IWebhookFunctions,
	IWebhookResponseData,
	JsonObject,
} from 'n8n-workflow';
import { NodeApiError, NodeConnectionTypes, NodeOperationError } from 'n8n-workflow';

import { dmlyApiRequest, getWebhookHeadersFromCollection } from '../Dmly/GenericFunctions';

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

function extractWebhookId(responseData: IDataObject | IDataObject[]): string | undefined {
	if (Array.isArray(responseData)) {
		const firstItem = responseData[0] as IDataObject | undefined;
		if (firstItem?.id) {
			return String(firstItem.id);
		}
		return undefined;
	}

	if (responseData.id) {
		return String(responseData.id);
	}

	const nestedData = responseData.data as IDataObject | undefined;
	if (nestedData?.id) {
		return String(nestedData.id);
	}

	return undefined;
}

export class DmlyTrigger implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'DMLY Trigger',
		name: 'dmlyTrigger',
		icon: 'file:dmly.svg',
		group: ['trigger'],
		version: 1,
		subtitle:
			'={{(() => { const events = $parameter["events"] || []; const labels = { contact_created: "contact created", contact_tag_added: "contact tag added", contact_tag_removed: "contact tag removed", incoming_instagram_message: "incoming Instagram message", incoming_messenger_message: "incoming Messenger message", incoming_telegram_message: "incoming Telegram message", incoming_website_message: "incoming Website message", incoming_whatsapp_message: "incoming WhatsApp message", outgoing_instagram_message: "outgoing Instagram message", outgoing_messenger_message: "outgoing Messenger message", outgoing_telegram_message: "outgoing Telegram message", outgoing_website_message: "outgoing Website message", outgoing_whatsapp_message: "outgoing WhatsApp message" }; if (!events.length) return "On DMLY event"; return "On " + events.map((event) => labels[event] || event).join(", "); })()}}',
		description: 'Starts the workflow when DMLY sends webhook events.',
		defaults: {
			name: 'DMLY Trigger',
		},
		inputs: [],
		outputs: [NodeConnectionTypes.Main],
		credentials: [
			{
				name: 'dmlyApi',
				required: true,
			},
		],
		webhooks: [
			{
				name: 'default',
				httpMethod: 'POST',
				responseMode: 'onReceived',
				path: 'webhook',
			},
		],
		properties: [
			{
				displayName:
					'This node automatically creates and manages a DMLY webhook when you activate or deactivate your workflow.',
				name: 'notice',
				type: 'notice',
				default: '',
			},
			{
				displayName: 'Name',
				name: 'webhookName',
				type: 'string',
				default: 'n8n DMLY Webhook',
				required: true,
				description: 'The name used when creating the webhook in DMLY',
			},
			{
				displayName: 'Active',
				name: 'active',
				type: 'boolean',
				default: true,
				description: 'Whether the webhook should be active in DMLY',
			},
			{
				displayName: 'Events',
				name: 'events',
				type: 'multiOptions',
				required: true,
				default: ['incoming_whatsapp_message'],
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
				description: 'The DMLY events that should trigger this workflow',
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
				description: 'Optional headers that DMLY should include in webhook requests',
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
			},
		],
	};

	webhookMethods = {
		default: {
			async checkExists(this: IHookFunctions): Promise<boolean> {
				const webhookData = this.getWorkflowStaticData('node');
				const webhookUrl = this.getNodeWebhookUrl('default') as string;

				if (webhookData.webhookId === undefined) {
					return false;
				}

				try {
					const responseData = await dmlyApiRequest.call(
						this,
						'GET',
						`/v1/webhooks/${webhookData.webhookId as string}`,
					);

					if (!Array.isArray(responseData)) {
						const serverUrl = responseData.serverUrl as string | undefined;
						if (serverUrl && serverUrl !== webhookUrl) {
							delete webhookData.webhookId;
							return false;
						}
					}

					return true;
				} catch (error) {
					if (isNotFoundError(error)) {
						delete webhookData.webhookId;
						return false;
					}

					throw error;
				}
			},
			async create(this: IHookFunctions): Promise<boolean> {
				const webhookUrl = this.getNodeWebhookUrl('default') as string;

				if (webhookUrl.includes('//localhost')) {
					throw new NodeOperationError(
						this.getNode(),
						'The webhook can not work on localhost. Please use a public URL.',
					);
				}

				const body: IDataObject = {
					name: this.getNodeParameter('webhookName') as string,
					serverUrl: webhookUrl,
					active: this.getNodeParameter('active') as boolean,
					events: this.getNodeParameter('events') as string[],
				};

				const headersData = this.getNodeParameter('webhookHeaders', {}) as IDataObject;
				const webhookHeaders = getWebhookHeadersFromCollection(headersData);
				if (webhookHeaders.length > 0) {
					body.webhookHeaders = webhookHeaders as unknown as IDataObject;
				}

				const responseData = await dmlyApiRequest.call(this, 'POST', '/v1/webhooks', body);
				const webhookId = extractWebhookId(responseData);

				if (!webhookId) {
					throw new NodeApiError(this.getNode(), responseData as unknown as JsonObject, {
						message: 'Webhook creation response did not contain an ID.',
					});
				}

				const webhookData = this.getWorkflowStaticData('node');
				webhookData.webhookId = webhookId;

				return true;
			},
			async delete(this: IHookFunctions): Promise<boolean> {
				const webhookData = this.getWorkflowStaticData('node');

				if (webhookData.webhookId !== undefined) {
					try {
						await dmlyApiRequest.call(
							this,
							'DELETE',
							`/v1/webhooks/${webhookData.webhookId as string}`,
						);
					} catch (error) {
						if (!isNotFoundError(error)) {
							return false;
						}
					}

					delete webhookData.webhookId;
				}

				return true;
			},
		},
	};

	async webhook(this: IWebhookFunctions): Promise<IWebhookResponseData> {
		const body = this.getBodyData();

		const payload: IDataObject = {
			body,
			headers: this.getHeaderData(),
			query: this.getQueryData(),
		};

		return {
			workflowData: [this.helpers.returnJsonArray([payload])],
		};
	}
}
