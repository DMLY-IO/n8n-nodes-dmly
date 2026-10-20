import type {
	IDataObject,
	IHookFunctions,
	ILoadOptionsFunctions,
	INodePropertyOptions,
	INodeType,
	INodeTypeDescription,
	IWebhookFunctions,
	IWebhookResponseData,
} from 'n8n-workflow';
import { NodeConnectionTypes, NodeOperationError } from 'n8n-workflow';
import { createHmac, randomBytes, timingSafeEqual } from 'crypto';

import { dmlyApiRequest } from '../Dmly/GenericFunctions';

const CHANNEL_SCOPE_OPTIONS = [
	{ name: 'All Channels', value: 'all' },
	{ name: 'WhatsApp', value: 'whatsapp' },
	{ name: 'Facebook', value: 'facebook' },
	{ name: 'Instagram', value: 'instagram' },
	{ name: 'SMS', value: 'sms' },
	{ name: 'TikTok', value: 'tiktok' },
	{ name: 'Telegram', value: 'telegram' },
];

const SEEN_DELIVERIES_LIMIT = 200;

/**
 * Read a DMLY delivery header. DMLY sends X-Dmly-Signature / -Event / -Delivery;
 * the X-Salesbot-* twins are a deprecated transitional copy that will be turned
 * off, so the X-Dmly-* name always wins. n8n lowercases incoming header names.
 */
function dmlyHeader(headers: IDataObject, name: 'signature' | 'event' | 'delivery'): string | undefined {
	const value = headers[`x-dmly-${name}`] ?? headers[`x-salesbot-${name}`];
	return typeof value === 'string' && value !== '' ? value : undefined;
}

/** Read the singleton webhook subscription ({ endpoint, events, channel, status, has_secret }). */
async function getSubscription(ctx: IHookFunctions): Promise<IDataObject> {
	const response = (await dmlyApiRequest.call(ctx, 'GET', '/webhooks')) as IDataObject;
	return ((response.data as IDataObject) ?? response) ?? {};
}

function sameEvents(a: unknown, b: string[]): boolean {
	const left = Array.isArray(a) ? [...(a as string[])].sort() : [];
	const right = [...b].sort();
	return left.length === right.length && left.every((value, index) => value === right[index]);
}

export class DmlyTrigger implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'DMLY Trigger',
		name: 'dmlyTrigger',
		icon: 'file:dmly.svg',
		group: ['trigger'],
		version: 1,
		subtitle: '={{$parameter["events"] ? "On " + ($parameter["events"].length) + " event(s)" : "On DMLY event"}}',
		description: 'Starts the workflow when DMLY sends a webhook event',
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
					'DMLY allows one webhook subscription per workspace. In <b>Automatic</b> mode this node takes over that subscription while the workflow is active. In <b>Manual</b> mode, point DMLY at this node\'s Production URL yourself (Salesbot → Integrations → Webhooks).',
				name: 'notice',
				type: 'notice',
				default: '',
			},
			{
				displayName: 'Registration Mode',
				name: 'registrationMode',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Automatic',
						value: 'automatic',
						description: 'Create and manage the DMLY webhook subscription automatically',
					},
					{
						name: 'Manual',
						value: 'manual',
						description: "Only listen — you configure DMLY to call this node's URL yourself",
					},
				],
				default: 'automatic',
			},
			{
				displayName: 'Event Names or IDs',
				name: 'events',
				type: 'multiOptions',
				required: true,
				default: [],
				description:
					'The DMLY events to subscribe to. Choose from the list, or specify IDs using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
				typeOptions: {
					loadOptionsMethod: 'getEvents',
				},
			},
			{
				displayName: 'Channel Scope',
				name: 'channelScope',
				type: 'options',
				options: CHANNEL_SCOPE_OPTIONS,
				default: 'all',
				description: 'Which channel message-lifecycle events are scoped to (ignored by non-message events)',
				displayOptions: { show: { registrationMode: ['automatic'] } },
			},
			{
				displayName: 'Verify Signature',
				name: 'verifySignature',
				type: 'boolean',
				default: true,
				description: 'Whether to reject deliveries whose HMAC-SHA256 signature does not match the signing secret',
			},
			{
				displayName: 'Signing Secret',
				name: 'signingSecret',
				type: 'string',
				typeOptions: { password: true },
				default: '',
				description:
					'The whsec_ signing secret shown when you saved the webhook in DMLY. Required to verify signatures in Manual mode.',
				displayOptions: { show: { registrationMode: ['manual'], verifySignature: [true] } },
			},
		],
	};

	methods = {
		loadOptions: {
			async getEvents(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const response = (await dmlyApiRequest.call(this, 'GET', '/webhooks/events')) as IDataObject;
				const groups = (response.data as IDataObject[]) ?? [];
				const options: INodePropertyOptions[] = [];

				for (const group of groups) {
					const groupName = (group.group as string) ?? '';
					const topics = (group.topics as IDataObject) ?? {};
					for (const [topic, label] of Object.entries(topics)) {
						options.push({
							name: `${label} (${topic})`,
							value: topic,
							description: groupName,
						});
					}
				}

				return options.sort((a, b) => a.name.localeCompare(b.name));
			},
		},
	};

	webhookMethods = {
		default: {
			async checkExists(this: IHookFunctions): Promise<boolean> {
				if ((this.getNodeParameter('registrationMode') as string) === 'manual') {
					return true;
				}

				// Without a locally stored secret we cannot verify deliveries — force create()
				// to re-mint and re-register rather than silently 401-ing every event.
				if (!this.getWorkflowStaticData('node').secret) {
					return false;
				}

				const webhookUrl = this.getNodeWebhookUrl('default') as string;
				const events = this.getNodeParameter('events') as string[];
				const subscription = await getSubscription(this);

				return subscription.endpoint === webhookUrl && sameEvents(subscription.events, events);
			},

			async create(this: IHookFunctions): Promise<boolean> {
				if ((this.getNodeParameter('registrationMode') as string) === 'manual') {
					return true;
				}

				const webhookUrl = this.getNodeWebhookUrl('default') as string;
				if (!/^https:\/\//i.test(webhookUrl) || /\/\/(localhost|127\.0\.0\.1)/i.test(webhookUrl)) {
					throw new NodeOperationError(
						this.getNode(),
						`DMLY requires a public HTTPS webhook URL, but n8n is exposing "${webhookUrl}". Use a publicly reachable n8n instance (or a tunnel), or switch Registration Mode to Manual.`,
					);
				}

				const events = this.getNodeParameter('events') as string[];
				if (!events.length) {
					throw new NodeOperationError(this.getNode(), 'Select at least one event to subscribe to.');
				}
				const channel = this.getNodeParameter('channelScope', 'all') as string;

				const subscription = await getSubscription(this);
				const existing = subscription.endpoint as string | undefined;
				if (existing && existing !== webhookUrl) {
					throw new NodeOperationError(
						this.getNode(),
						`This workspace's DMLY webhook is already pointing at "${existing}". DMLY allows only one webhook subscription per workspace — disable that consumer (or the dashboard webhook), or use Manual mode.`,
					);
				}

				const staticData = this.getWorkflowStaticData('node');
				let secret = staticData.secret as string | undefined;
				if (!secret) {
					secret = `whsec_${randomBytes(24).toString('hex')}`;
					staticData.secret = secret;
				}

				await dmlyApiRequest.call(this, 'PUT', '/webhooks', {
					url: webhookUrl,
					events,
					channel,
					secret,
				});

				return true;
			},

			async delete(this: IHookFunctions): Promise<boolean> {
				const staticData = this.getWorkflowStaticData('node');

				if ((this.getNodeParameter('registrationMode') as string) === 'manual') {
					delete staticData.secret;
					return true;
				}

				const webhookUrl = this.getNodeWebhookUrl('default') as string;
				try {
					const subscription = await getSubscription(this);
					if (subscription.endpoint === webhookUrl) {
						await dmlyApiRequest.call(this, 'DELETE', '/webhooks');
					}
					// We either removed our own subscription or a different endpoint now owns it;
					// in both cases the stored secret is no longer needed.
					delete staticData.secret;
				} catch {
					// API unreachable — keep the secret so a later re-activation can still verify
					// the subscription that is presumably still registered.
				}
				return true;
			},
		},
	};

	async webhook(this: IWebhookFunctions): Promise<IWebhookResponseData> {
		const body = this.getBodyData();
		const headers = this.getHeaderData() as IDataObject;
		const response = this.getResponseObject();

		if (this.getNodeParameter('verifySignature', true) as boolean) {
			const mode = this.getNodeParameter('registrationMode') as string;
			const secret =
				mode === 'manual'
					? (this.getNodeParameter('signingSecret', '') as string)
					: ((this.getWorkflowStaticData('node').secret as string) ?? '');

			if (!secret) {
				response.status(401).send('Signature verification is enabled but no signing secret is available.');
				return { noWebhookResponse: true };
			}

			const request = this.getRequestObject();
			if (!request.rawBody && typeof request.readRawBody === 'function') {
				await request.readRawBody();
			}
			// DMLY signs the exact bytes it sent (json_encode with unescaped slashes/unicode
			// and a fixed key order), so we must HMAC the raw body — never a re-serialized copy.
			// If the raw body is unavailable, fail closed rather than reject every delivery.
			if (!request.rawBody) {
				response
					.status(401)
					.send('Cannot verify signature: the raw request body is unavailable. Disable "Verify Signature" or upgrade n8n.');
				return { noWebhookResponse: true };
			}

			const expected = `sha256=${createHmac('sha256', secret).update(request.rawBody).digest('hex')}`;
			const receivedBuffer = Buffer.from(dmlyHeader(headers, 'signature') ?? '');
			const expectedBuffer = Buffer.from(expected);

			const valid =
				receivedBuffer.length === expectedBuffer.length &&
				timingSafeEqual(receivedBuffer, expectedBuffer);

			if (!valid) {
				response.status(401).send('Invalid signature');
				return { noWebhookResponse: true };
			}
		}

		// Retries reuse the same delivery id; skip ones this node has already accepted.
		const deliveryId = dmlyHeader(headers, 'delivery');
		if (deliveryId) {
			const staticData = this.getWorkflowStaticData('node');
			const seen = (staticData.seenDeliveries as string[] | undefined) ?? [];
			if (seen.includes(deliveryId)) {
				response.status(200).send('duplicate');
				return { noWebhookResponse: true };
			}
			staticData.seenDeliveries = [...seen, deliveryId].slice(-SEEN_DELIVERIES_LIMIT);
		}

		// The subscription delivers every subscribed topic to one URL; make sure this
		// execution only fires for the events selected on this node (matters most in Manual mode).
		const selected = (this.getNodeParameter('events', []) as string[]) ?? [];
		const event = dmlyHeader(headers, 'event') ?? ((body as IDataObject).event as string) ?? '';
		if (selected.length && event && !selected.includes(event)) {
			response.status(200).send('ignored');
			return { noWebhookResponse: true };
		}

		return {
			workflowData: [this.helpers.returnJsonArray([body as IDataObject])],
		};
	}
}
