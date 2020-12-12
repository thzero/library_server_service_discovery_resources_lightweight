import Constants from './constants';

import DiscoveryService from '@thzero/library_server/service/discovery';

class HttpLightweightResourceDiscoveryService extends DiscoveryService {
	constructor() {
		super();
	}

	async cleanup(correlationId) {
		const response = await this._serviceCommunicationRest.post(correlationId, Constants.ExternalKeys.REGISTRY, 'registry/degregister', {
			name: this._name
		},
		{
			correlationId: correlationId
		});

		this._logger.debug('HttpLightweightResourceDiscoveryService', 'cleanup', 'response', response, correlationId);
		return response;
	}

	async getService(correlationId, name) {
		const response = await this._serviceCommunicationRest.get(correlationId, Constants.ExternalKeys.REGISTRY, 'registry', name,
			{
				correlationId: correlationId
			});

		this._logger.debug('HttpLightweightResourceDiscoveryService', 'getService', 'response', response, correlationId);
		return response;
	}

	async register(correlationId, config) {
		const response = await this._serviceCommunicationRest.post(correlationId, Constants.ExternalKeys.REGISTRY, 'registry/register',
			config,
			{
				correlationId: correlationId
			});

		this._logger.debug('HttpLightweightResourceDiscoveryService', 'register', 'response', response, correlationId);
		return response;
	}
}

export default HttpLightweightResourceDiscoveryService;
