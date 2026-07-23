import type { INodeProperties } from 'n8n-workflow';

const STATUS_OPTIONS = [
	{ name: 'Booked', value: 'booked' },
	{ name: 'Waitlisted', value: 'waitlisted' },
	{ name: 'Attended', value: 'attended' },
	{ name: 'No Show', value: 'no_show' },
	{ name: 'Cancelled', value: 'cancelled' },
];

export const classParticipantOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['classParticipant'] } },
		options: [
			{ name: 'Book', value: 'book', action: 'Book a contact into a class', description: 'Book a contact into the session, reserving a seat or a waitlist place' },
			{ name: 'Cancel', value: 'cancel', action: 'Cancel a participant s place', description: "Cancel a participant's place, freeing the seat and promoting the next waitlisted contact" },
			{ name: 'Get Many', value: 'getAll', action: 'Get many class participants', description: 'Get many class participants' },
		],
		default: 'getAll',
	},
];

export const classParticipantFields: INodeProperties[] = [
	{
		displayName: 'Session ID',
		name: 'sessionId',
		type: 'string',
		required: true,
		default: '',
		description: 'The group-class session uuid',
		displayOptions: { show: { resource: ['classParticipant'], operation: ['book', 'cancel', 'getAll'] } },
	},
	{
		displayName: 'Participant ID',
		name: 'participantId',
		type: 'string',
		required: true,
		default: '',
		description: 'The class participant uuid',
		displayOptions: { show: { resource: ['classParticipant'], operation: ['cancel'] } },
	},

	// ---- book ----
	{
		displayName: 'Contact ID',
		name: 'contactId',
		type: 'string',
		required: true,
		default: '',
		description: 'Contact uuid to book into the session',
		displayOptions: { show: { resource: ['classParticipant'], operation: ['book'] } },
	},

	// ---- getAll ----
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		default: false,
		description: 'Whether to return all results or only up to a given limit',
		displayOptions: { show: { resource: ['classParticipant'], operation: ['getAll'] } },
	},
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		typeOptions: { minValue: 1 },
		default: 50,
		description: 'Max number of results to return',
		displayOptions: { show: { resource: ['classParticipant'], operation: ['getAll'], returnAll: [false] } },
	},
	{
		displayName: 'Filters',
		name: 'filters',
		type: 'collection',
		placeholder: 'Add Filter',
		default: {},
		displayOptions: { show: { resource: ['classParticipant'], operation: ['getAll'] } },
		options: [
			{ displayName: 'Status', name: 'status', type: 'options', options: STATUS_OPTIONS, default: 'booked', description: 'Filter by participant status' },
		],
	},
];
