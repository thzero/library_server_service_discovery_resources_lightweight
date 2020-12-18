import DiscoveryService from '@thzero/library_server/service/discovery';

import LightweightResourceDiscoveryGrpcService from './index';

class GrpcLightweightResourceDiscoveryService extends DiscoveryService {
	constructor() {
		super();

		this._grpcService = null;
	}

	async init(injector) {
		await super.init(injector);

		this._grpcService = new LightweightResourceDiscoveryGrpcService();
		this._grpcService.init(injector);
	}

	async cleanup(correlationId) {
		return this._grpcService.cleanup(correlationId);
	}

	async getService(correlationId, name) {
		return this._grpcService.getService(correlationId);
	}

	async register(correlationId, config) {
		return this._grpcService.register(correlationId, config);
	}
}

export default GrpcLightweightResourceDiscoveryService;
