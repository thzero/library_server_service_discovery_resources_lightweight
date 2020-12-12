import DiscoveryService from '@thzero/library_server/service/discovery';

class GrpcLightweightResourceDiscoveryService extends DiscoveryService {
	constructor() {
		super();
	}

	async cleanup(correlationId) {
		const response = this._success(correlationId);

		this._logger.debug('GrpcLightweightResourceDiscoveryService', 'cleanup', 'response', response, correlationId);
		return response;
	}

	async getService(correlationId, name) {
		const response = this._success(correlationId);

		this._logger.debug('GrpcLightweightResourceDiscoveryService', 'getService', 'response', response, correlationId);
		return response;
	}

	async register(correlationId, config) {
		const response = this._success(correlationId);

		this._logger.debug('GrpcLightweightResourceDiscoveryService', 'register', 'response', response, correlationId);
		return response;
	}
}

export default GrpcLightweightResourceDiscoveryService;
