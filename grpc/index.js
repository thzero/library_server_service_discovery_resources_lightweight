import LibraryUtility from '@thzero/library_common/utility';

import BaseClientGrpcService from '@thzero/library_server_service_grpc/client';

var registerMessages = require('../proto_register/binary/registry_pb');
var registerService = require('../proto_register/binary/registry_grpc_pb');

class LightweightResourceDiscoveryGrpcService extends BaseClientGrpcService {
	constructor() {
		super();

		this._client = null;
	}

	async initPost() {
		const url = await this._host(LibraryUtility.generateId(), 'auth_grpc');
		if (String.isNullOrEmpty(url))
            throw Error(`Invalid url for 'auth_grpc'.`);

		this._client = new registerService.RegisterClient(url, this._credentials);
	}

	async deregister(correlationId, token) {
		try {
			this._enforceNotNull('LightweightResourceDiscoveryGrpcService', 'deregister', token, 'token');
			const request = new registerMessages.VerifyTokenRequest();
			request.setCorrelationid(correlationId);
			request.setToken(token);

			const dergisterResponse = await this._execute(correlationId, this._client.deregister, this._client, request);
			this._enforceNotNull('LightweightResourceDiscoveryGrpcService', 'deregister', dergisterResponse, 'verifyTokenResponse', correlationId);

			return dergisterResponse;
		}
		catch(err) {
			return this._error('LightweightResourceDiscoveryGrpcService', 'deregister', null, err, null, null, correlationId);
		}
	}

	async get(correlationId, token) {
		try {
			this._enforceNotNull('LightweightResourceDiscoveryGrpcService', 'get', token, 'token');
			const request = new registerMessages.VerifyTokenRequest();
			request.setCorrelationid(correlationId);
			request.setToken(token);

			const getResponse = await this._execute(correlationId, this._client.get, this._client, request);
			this._enforceNotNull('LightweightResourceDiscoveryGrpcService', 'get', getResponse, 'verifyTokenResponse', correlationId);

			this._logger.debug('LightweightResourceDiscoveryGrpcService', 'get', 'getResponse', getResponse, correlationId);
			const node = getResponse ? getResponse.toObject() : null;
			const response = node ? this._successResponse(node, correlationId) : this._error('LightweightResourceDiscoveryGrpcService', 'get', 'Invalid node', null, null, null, correlationId);
			return response;
		}
		catch(err) {
			return this._error('LightweightResourceDiscoveryGrpcService', 'get', null, err, null, null, correlationId);
		}
	}

	async register(correlationId, token) {
		try {
			this._enforceNotNull('LightweightResourceDiscoveryGrpcService', 'register', token, 'token');
			const request = new registerMessages.VerifyTokenRequest();
			request.setCorrelationid(correlationId);
			request.setToken(token);

			const registerResponse = await this._execute(correlationId, this._client.register, this._client, request);
			this._enforceNotNull('LightweightResourceDiscoveryGrpcService', 'register', registerResponse, 'verifyTokenResponse', correlationId);

			return registerResponse;
		}
		catch(err) {
			return this._error('LightweightResourceDiscoveryGrpcService', 'register', null, err, null, null, correlationId);
		}
	}
}

export default LightweightResourceDiscoveryGrpcService;