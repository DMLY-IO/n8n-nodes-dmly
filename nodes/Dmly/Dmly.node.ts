import type {
	IBinaryKeyData,
	IDataObject,
	IExecuteFunctions,
	ILoadOptionsFunctions,
	INodeExecutionData,
	INodePropertyOptions,
	INodeType,
	INodeTypeDescription,
	JsonObject,
} from 'n8n-workflow';
import { NodeApiError, NodeConnectionTypes, NodeOperationError } from 'n8n-workflow';

import { BINARY_RESULT, dmlyApiRequestAllItems, normalizeDmlyResponse } from './GenericFunctions';

import { accountOperations, accountFields } from './descriptions/AccountDescription';
import { appointmentOperations, appointmentFields } from './descriptions/AppointmentDescription';
import { automationOperations, automationFields } from './descriptions/AutomationDescription';
import { broadcastOperations, broadcastFields } from './descriptions/BroadcastDescription';
import { channelOperations, channelFields } from './descriptions/ChannelDescription';
import { classParticipantOperations, classParticipantFields } from './descriptions/ClassParticipantDescription';
import { classSessionOperations, classSessionFields } from './descriptions/ClassSessionDescription';
import { contactOperations, contactFields } from './descriptions/ContactDescription';
import { conversationOperations, conversationFields } from './descriptions/ConversationDescription';
import { couponOperations, couponFields } from './descriptions/CouponDescription';
import { giftCardOperations, giftCardFields } from './descriptions/GiftCardDescription';
import { invoiceOperations, invoiceFields } from './descriptions/InvoiceDescription';
import { mediaOperations, mediaFields } from './descriptions/MediaDescription';
import { messageOperations, messageFields } from './descriptions/MessageDescription';
import { orderOperations, orderFields } from './descriptions/OrderDescription';
import { paymentOperations, paymentFields } from './descriptions/PaymentDescription';
import { planOperations, planFields } from './descriptions/PlanDescription';
import { productOperations, productFields } from './descriptions/ProductDescription';
import { segmentOperations, segmentFields } from './descriptions/SegmentDescription';
import { serviceOperations, serviceFields } from './descriptions/ServiceDescription';
import { serviceCategoryOperations, serviceCategoryFields } from './descriptions/ServiceCategoryDescription';
import { staffOperations, staffFields } from './descriptions/StaffDescription';
import { subscriptionOperations, subscriptionFields } from './descriptions/SubscriptionDescription';
import { tagOperations, tagFields } from './descriptions/TagDescription';
import { timeOffOperations, timeOffFields } from './descriptions/TimeOffDescription';

import { handleAccount } from './actions/account';
import { handleAppointment } from './actions/appointment';
import { handleAutomation } from './actions/automation';
import { handleBroadcast } from './actions/broadcast';
import { handleChannel } from './actions/channel';
import { handleClassParticipant } from './actions/classParticipant';
import { handleClassSession } from './actions/classSession';
import { handleContact } from './actions/contact';
import { handleConversation } from './actions/conversation';
import { handleCoupon } from './actions/coupon';
import { handleGiftCard } from './actions/giftCard';
import { handleInvoice } from './actions/invoice';
import { handleMedia } from './actions/media';
import { handleMessage } from './actions/message';
import { handleOrder } from './actions/order';
import { handlePayment } from './actions/payment';
import { handlePlan } from './actions/plan';
import { handleProduct } from './actions/product';
import { handleSegment } from './actions/segment';
import { handleService } from './actions/service';
import { handleServiceCategory } from './actions/serviceCategory';
import { handleStaff } from './actions/staff';
import { handleSubscription } from './actions/subscription';
import { handleTag } from './actions/tag';
import { handleTimeOff } from './actions/timeOff';

type ResourceHandler = (
	ctx: IExecuteFunctions,
	operation: string,
	itemIndex: number,
) => Promise<IDataObject | IDataObject[]>;

const HANDLERS: Record<string, ResourceHandler> = {
	account: handleAccount,
	appointment: handleAppointment,
	automation: handleAutomation,
	broadcast: handleBroadcast,
	channel: handleChannel,
	classParticipant: handleClassParticipant,
	classSession: handleClassSession,
	contact: handleContact,
	conversation: handleConversation,
	coupon: handleCoupon,
	giftCard: handleGiftCard,
	invoice: handleInvoice,
	media: handleMedia,
	message: handleMessage,
	order: handleOrder,
	payment: handlePayment,
	plan: handlePlan,
	product: handleProduct,
	segment: handleSegment,
	service: handleService,
	serviceCategory: handleServiceCategory,
	staff: handleStaff,
	subscription: handleSubscription,
	tag: handleTag,
	timeOff: handleTimeOff,
};

export class Dmly implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'DMLY',
		name: 'dmly',
		icon: 'file:dmly.svg',
		group: ['transform'],
		usableAsTool: true,
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Interact with the DMLY REST API',
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
					{ name: 'Account', value: 'account' },
					{ name: 'Appointment', value: 'appointment' },
					{ name: 'Automation', value: 'automation' },
					{ name: 'Broadcast', value: 'broadcast' },
					{ name: 'Channel', value: 'channel' },
					{ name: 'Class Participant', value: 'classParticipant' },
					{ name: 'Class Session', value: 'classSession' },
					{ name: 'Contact', value: 'contact' },
					{ name: 'Conversation', value: 'conversation' },
					{ name: 'Coupon', value: 'coupon' },
					{ name: 'Gift Card', value: 'giftCard' },
					{ name: 'Invoice', value: 'invoice' },
					{ name: 'Media', value: 'media' },
					{ name: 'Message', value: 'message' },
					{ name: 'Order', value: 'order' },
					{ name: 'Payment', value: 'payment' },
					{ name: 'Plan', value: 'plan' },
					{ name: 'Product', value: 'product' },
					{ name: 'Segment', value: 'segment' },
					{ name: 'Service', value: 'service' },
					{ name: 'Service Category', value: 'serviceCategory' },
					{ name: 'Staff', value: 'staff' },
					{ name: 'Subscription', value: 'subscription' },
					{ name: 'Tag', value: 'tag' },
					{ name: 'Time Off', value: 'timeOff' },
				],
				default: 'contact',
			},

			...accountOperations,
			...appointmentOperations,
			...automationOperations,
			...broadcastOperations,
			...channelOperations,
			...classParticipantOperations,
			...classSessionOperations,
			...contactOperations,
			...conversationOperations,
			...couponOperations,
			...giftCardOperations,
			...invoiceOperations,
			...mediaOperations,
			...messageOperations,
			...orderOperations,
			...paymentOperations,
			...planOperations,
			...productOperations,
			...segmentOperations,
			...serviceOperations,
			...serviceCategoryOperations,
			...staffOperations,
			...subscriptionOperations,
			...tagOperations,
			...timeOffOperations,

			...accountFields,
			...appointmentFields,
			...automationFields,
			...broadcastFields,
			...channelFields,
			...classParticipantFields,
			...classSessionFields,
			...contactFields,
			...conversationFields,
			...couponFields,
			...giftCardFields,
			...invoiceFields,
			...mediaFields,
			...messageFields,
			...orderFields,
			...paymentFields,
			...planFields,
			...productFields,
			...segmentFields,
			...serviceFields,
			...serviceCategoryFields,
			...staffFields,
			...subscriptionFields,
			...tagFields,
			...timeOffFields,
		],
	};

	methods = {
		loadOptions: {
			async getChannels(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const channels = await dmlyApiRequestAllItems.call(this, 'GET', '/channels');
				return channels.map((channel) => ({
					name: channel.platform ? `${channel.name} (${channel.platform})` : (channel.name as string),
					value: channel.id as string,
				}));
			},
		},
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];
		const resource = this.getNodeParameter('resource', 0) as string;

		const handler = HANDLERS[resource];
		if (!handler) {
			throw new NodeOperationError(this.getNode(), `The resource "${resource}" is not supported.`);
		}

		for (let i = 0; i < items.length; i++) {
			try {
				const operation = this.getNodeParameter('operation', i) as string;
				const responseData = await handler(this, operation, i);
				if (!Array.isArray(responseData) && responseData[BINARY_RESULT]) {
					const { [BINARY_RESULT]: binary, ...json } = responseData;
					returnData.push({ json, binary: binary as IBinaryKeyData, pairedItem: { item: i } });
					continue;
				}
				const normalized = normalizeDmlyResponse(responseData);
				returnData.push(
					...normalized.map((json) => ({ json, pairedItem: { item: i } })),
				);
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({ json: { error: (error as Error).message }, pairedItem: { item: i } });
					continue;
				}
				// Both constructors hand back an existing error of their own type unchanged,
				// so an API failure keeps its HTTP status; anything else is wrapped with the
				// failing item's index.
				if (error instanceof NodeApiError) {
					throw new NodeApiError(this.getNode(), error as unknown as JsonObject, { itemIndex: i });
				}
				throw new NodeOperationError(this.getNode(), error as Error, { itemIndex: i });
			}
		}

		return [returnData];
	}
}
