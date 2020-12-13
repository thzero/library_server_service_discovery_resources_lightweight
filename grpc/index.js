import { Mutex as asyncMutex } from 'async-mutex';

import LibraryUtility from '@thzero/library_common/utility';

import BaseClientGrpcService from '@thzero/library_server_service_grpc/client';

import registryMessages from '@thzero/library_server_service_discovery_resources_lightweight_proto/binary/registry_pb';
import registryServices from '@thzero/library_server_service_discovery_resources_lightweight_proto/binary/registry_grpc_pb';

class LightweightResourceDiscoveryGrpcService extends BaseClientGrpcService {
	constructor() {
		super();

		this._mutex = new asyncMutex();

		this._client = null;
	}

	async deregister(correlationId, token) {
		try {
			this._initClient(correlationId);

			this._enforceNotNull('LightweightResourceDiscoveryGrpcService', 'deregister', token, 'token');
			const request = new registryMessages.VerifyTokenRequest();
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
			this._initClient(correlationId);

			this._enforceNotNull('LightweightResourceDiscoveryGrpcService', 'get', token, 'token');
			const request = new registryMessages.VerifyTokenRequest();
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
			this._initClient(correlationId);

			this._enforceNotNull('LightweightResourceDiscoveryGrpcService', 'register', token, 'token');
			const request = new registryMessages.VerifyTokenRequest();
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

	async _initClient(correlationId) {
		if (!this._client)
			return;

		const release = await this._mutex.acquire();
		try {
			if (!this._client)
				return;

			const url = await this._host(LibraryUtility.generateId(), 'registry_grpc');
			if (String.isNullOrEmpty(url))
				throw Error(`Invalid url for 'registry_grpc'.`);

			this._client = new registryServices.RegisterClient(url, this._credentials);
		}
		finally {
			release();
		}
	}
}

export default LightweightResourceDiscoveryGrpcService;