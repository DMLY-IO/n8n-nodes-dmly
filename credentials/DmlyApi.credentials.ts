import {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class DmlyApi implements ICredentialType {
	name = 'dmlyApi';
	displayName = 'DMLY API';
	documentationUrl = 'https://docs.dmly.io/api-reference/introduction';
	properties: INodeProperties[] = [
		{
			displayName: 'Base URL',
			name: 'baseUrl',
			type: 'string',
			default: 'https://dash.dmly.io/api/v1',
			placeholder: 'https://dash.dmly.io/api/v1',
			required: true,
			description:
				'Base URL of the DMLY REST API, ending in <code>/api/v1</code>. Change this only for a self-hosted, agency, or white-label instance (e.g. <code>https://your-domain.com/api/v1</code>).',
		},
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			required: true,
			description:
				'A workspace API key (starts with <code>dmly_</code>). Generate one in DMLY under Salesbot → Integrations → the "API" tile. The key is scoped to a single workspace.',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				'x-api-key': '={{$credentials.apiKey}}',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: '={{$credentials.baseUrl}}',
			url: '/account',
			headers: {
				Accept: 'application/json',
			},
		},
	};
}
