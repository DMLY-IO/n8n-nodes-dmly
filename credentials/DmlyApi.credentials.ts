import {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class DmlyApi implements ICredentialType {
	name = 'dmlyApi';
	displayName = 'DMLY API';
	documentationUrl = 'https://help.dmly.io/en/collections/22-rest-api-reference';
	properties: INodeProperties[] = [
		{
			displayName: 'Base URL',
			name: 'baseUrl',
			type: 'string',
			default: 'https://api.dmly.io/rest',
			placeholder: 'https://api.dmly.io/rest',
			required: true,
			description: 'The base URL of the DMLY API. Example: <code>https://api.dmly.io/rest</code>.',
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
			description: 'The API key from DMLY Integrations → REST API.',
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
			url: '/v1/account-info',
			headers: {
				Accept: 'application/json',
			},
		},
	};
}
