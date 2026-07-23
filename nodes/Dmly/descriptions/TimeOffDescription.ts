import type { INodeProperties } from 'n8n-workflow';

export const timeOffOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['timeOff'] } },
		options: [
			{ name: 'Add', value: 'add', action: 'Add time off for a staff member', description: 'Add a time-off availability override' },
			{ name: 'Delete', value: 'delete', action: 'Delete a staff members time off', description: 'Delete a time-off availability override' },
		],
		default: 'add',
	},
];

export const timeOffFields: INodeProperties[] = [
	{
		displayName: 'Staff ID',
		name: 'staffId',
		type: 'string',
		required: true,
		default: '',
		description: 'The UUID of the staff member the time off belongs to',
		displayOptions: { show: { resource: ['timeOff'], operation: ['add', 'delete'] } },
	},
	{
		displayName: 'Override ID',
		name: 'overrideId',
		type: 'string',
		required: true,
		default: '',
		description: 'The UUID of the time-off availability override to delete',
		displayOptions: { show: { resource: ['timeOff'], operation: ['delete'] } },
	},

	// ---- add ----
	{
		displayName: 'Starts At',
		name: 'startsAt',
		type: 'dateTime',
		required: true,
		default: '',
		description: 'Start of the time-off window (UTC)',
		displayOptions: { show: { resource: ['timeOff'], operation: ['add'] } },
	},
	{
		displayName: 'Ends At',
		name: 'endsAt',
		type: 'dateTime',
		required: true,
		default: '',
		description: 'End of the time-off window (UTC). Must be on/after Starts At.',
		displayOptions: { show: { resource: ['timeOff'], operation: ['add'] } },
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: { show: { resource: ['timeOff'], operation: ['add'] } },
		options: [
			{ displayName: 'All Day', name: 'allDay', type: 'boolean', default: false, description: 'Whether the time off spans the whole day' },
			{ displayName: 'Reason', name: 'reason', type: 'string', default: '', description: 'Optional reason, e.g. Public holiday' },
		],
	},
];
