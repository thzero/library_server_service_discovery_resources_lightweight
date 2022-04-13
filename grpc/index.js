import { Mutex as asyncMutex } from 'async-mutex';

import LibraryUtility from '@thzero/library_common/utility';

import BaseClientGrpcService from '@thzero/library_server_service_grpc/client';

import registryMessages from '@thzero/library_server_service_discovery_resources_lightweight_proto/binary/registry_pb.cjs';
import registryServices from '@thzero/library_server_service_discovery_resources_lightweight_proto/binary/registry_grpc_pb.cjs';

class LightweightResourceDiscoveryGrpcService extends BaseClientGrpcService {
	constructor() {
		super();

		this._mutex = new asyncMutex();

		this._client = null;
	}

	async deregister(correlationId, token) {
		try {
			await this._initClient(correlationId);

			this._enforceNotNull('LightweightResourceDiscoveryGrpcService', 'deregister', token, 'token');
			const request = new registryMessages.DeregisterRequest();
			request.setToken(token);

			const deregisterResponse = await this._execute(correlationId, this._client.deregister, this._client, request);
			this._enforceNotNull('LightweightResourceDiscoveryGrpcService', 'deregister', deregisterResponse, 'deregisterResponse', correlationId);

			return dergisterResponse;
		}
		catch(err) {
			return this._error('LightweightResourceDiscoveryGrpcService', 'deregister', null, err, null, null, correlationId);
		}
	}

	async getService(correlationId, token) {
		try {
			await this._initClient(correlationId);

			this._enforceNotNull('LightweightResourceDiscoveryGrpcService', 'get', token, 'token');
			const request = new registryMessages.GetRequest();
			request.setToken(token);

			const getResponse = await this._execute(correlationId, this._client.get, this._client, request);
			this._enforceNotNull('LightweightResourceDiscoveryGrpcService', 'get', getResponse, 'getResponse', correlationId);

			this._logger.debug('LightweightResourceDiscoveryGrpcService', 'get', 'getResponse', getResponse, correlationId);
			const node = getResponse ? getResponse.toObject() : null;
			const response = node ? this._successResponse(node, correlationId) : this._error('LightweightResourceDiscoveryGrpcService', 'get', 'Invalid node', null, null, null, correlationId);
			return response;
		}
		catch(err) {
			return this._error('LightweightResourceDiscoveryGrpcService', 'get', null, err, null, null, correlationId);
		}
	}

	async register(correlationId, config) {
		try {
			await this._initClient(correlationId);

			this._enforceNotNull('LightweightResourceDiscoveryGrpcService', 'register', config, 'config');
			const request = new registryMessages.RegisterRequest();
			request.setName(config.name);
			request.setAddress(config.address);
			request.setPort(config.port);
			request.setSecure(config.secure);

			if (config.dns) {
				const requestDns = new registryMessages.DnsRegisterRequest();
				requestDns.setLabel(config.dns.label);
				requestDns.setNamespace(config.dns.namespace);
				requestDns.setLocal(config.dns.local);
				request.setDns(requestDns);
			}

			if (config.grpc) {
				const requestGrpc = new registryMessages.GrpcRegisterRequest();
				requestGrpc.setEnabled(config.grpc.enabled  !== undefined && config.grpc.enabled !== null ? config.grpc.enabled : true);
				requestGrpc.setPort(config.grpc.port);
				requestGrpc.setSecure(config.grpc.secure);
				request.setGrpc(requestGrpc);
			}

			if (config.healthCheck) {
				const requestHealthCheck = new registryMessages.HealthcheckRegisterRequest();
				requestHealthCheck.setEnabled(config.healthCheck.enabled  !== undefined && config.healthCheck.enabled !== null ? config.healthCheck.enabled : true);
				requestHealthCheck.setHealtcheck(config.healthCheck.healthCheck);
				requestHealthCheck.setInterval(config.healthCheck.interval);
				requestHealthCheck.setType(config.healthCheck.type);
				request.setHealtcheck(requestHealthCheck);
			}

			const registerResponse = await this._execute(correlationId, this._client.register, this._client, request);
			this._enforceNotNull('LightweightResourceDiscoveryGrpcService', 'register', registerResponse, 'registerResponse', correlationId);

			return registerResponse;
		}
		catch(err) {
			return this._error('LightweightResourceDiscoveryGrpcService', 'register', null, err, null, null, correlationId);
		}
	}

	async _initClient(correlationId) {
		if (this._client)
			return;

		const release = await this._mutex.acquire();
		try {
			if (this._client)
				return;

			const host = await this._host(LibraryUtility.generateId(), 'registry_grpc');
			if (!host || String.isNullOrEmpty(host.url))
				throw Error(`Invalid host for 'registry_grpc'.`);

			this._client = new registryServices.RegistryClient(host.url, this._credentials(host));
		}
		finally {
			release();
		}
	}
}

export default LightweightResourceDiscoveryGrpcService;