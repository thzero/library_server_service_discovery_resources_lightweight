import Constants from '../constants.js';
import LibraryConstants from '@thzero/library_server/constants.js';

import DiscoveryService from '@thzero/library_server/service/discovery/index.js';

class HttpLightweightResourceDiscoveryService extends DiscoveryService {
	constructor() {
		super();

		this._serviceCommunicationRest = null;
	}

	async init(injector) {
		await super.init(injector);

		this._serviceCommunicationRest = this._injector.getService(LibraryConstants.InjectorKeys.SERVICE_COMMUNICATION_REST);
	}

	async cleanup(correlationId) {
		const response = await this._serviceCommunicationRest.post(correlationId, Constants.ExternalKeys.REGISTRY, 'registry/cleanup', {
			name: this._name
		},
		{
			correlationId: correlationId
		});

		this._logger.debug('HttpLightweightResourceDiscoveryService', 'cleanup', 'response', response, correlationId);
		return response;
	}

	async deregister(correlationId, name) {
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
		const response = await this._serviceCommunicationRest.getById(correlationId, Constants.ExternalKeys.REGISTRY, 'registry', name,
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
