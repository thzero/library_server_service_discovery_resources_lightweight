import { Mutex as asyncMutex } from 'async-mutex';

import Constants from './constants';

import NotImplementedError from '@thzero/library_common/errors/notImplemented';

import ResourceDiscoveryService from '@thzero/library_server/service/discovery/resources';

import GrpcLightweightResourceDiscoveryService from './grpc/discovery';
import HttpLightweightResourceDiscoveryService from './http/discovery';

class LightweightResourceDiscoveryService extends ResourceDiscoveryService {
	constructor() {
		super();

		this._mutex = new asyncMutex();

		this._communicationType = null;
		this._communicationTypeGrpc = 'grpc';
		this._communicationTypeHttp = 'http';
		this._communicationTypes = new Map();

		this._name = null;

		this._services = new Map();
	}

	async init(injector) {
		super.init(injector);

		let service = new GrpcLightweightResourceDiscoveryService();
		service.init(injector);
		this._communicationTypes.set(this._communicationTypeGrpc, service);
		service = new HttpLightweightResourceDiscoveryService();
		service.init(injector);
		this._communicationTypes.set(this._communicationTypeHttp, new HttpLightweightResourceDiscoveryService());

		// this._communicationTypes.set(`${this._communicationTypeGrpc}-cleanup`, this._cleanupGrpc);
		// this._communicationTypes.set(`${this._communicationTypeHttp}-cleanup`, this._cleanupHttp);

		// this._communicationTypes.set(`${this._communicationTypeGrpc}-get`, this._getGrpc);
		// this._communicationTypes.set(`${this._communicationTypeHttp}-get`, this._getHttp);

		// this._communicationTypes.set(`${this._communicationTypeGrpc}-register`, this._registerGrpc);
		// this._communicationTypes.set(`${this._communicationTypeHttp}-register`, this._registerHttp);
	}

	async cleanup(correlationId) {
		if (!this._consul)
			return;
		if (String.isNullOrEmpty(this._name))
			return;

		// let response = null;
		// if (this.communicationType === this._communicationTypeHttp) {
		// 	response = await this._serviceCommunicationRest.post(correlationId, Constants.ExternalKeys.REGISTRY, 'registry/degregister', {
		// 		name: this._name
		// 	},
		// 	{
		// 		correlationId: correlationId
		// 	});
		// }
		// else if (this.communicationType === this._communicationTypeGrpc) {
		// }

		//const service = this._communicationTypes(`${this._communicationType}-cleanup`);
		const service = this._communicationTypes(this._communicationType);
		if (!service)
			return this._error('LightweightResourceDiscoveryService', 'cleanup', 'response', `Invalid communication type service '${type}'.`, null, null, correlationId)

		const response = service(correlationId);
		this._logger.debug('LightweightResourceDiscoveryService', 'cleanup', 'response', response, correlationId);
		return response;
	}

	get communicationType() {
		if (this._communicationType)
			return this._communicationType;

		this._communicationType = this._config.get(`discovery.resources.type`, this._communicationTypeHttp);
		return this._communicationType;
	}

	async _cleanupGrpc(correlationId) {
		const response = this._success(correlationId);

		this._logger.debug('LightweightResourceDiscoveryService', '_cleanupGrpc', 'response', response, correlationId);
		return response;
	}

	async _cleanupHttp(correlationId) {
		const response = await this._serviceCommunicationRest.post(correlationId, Constants.ExternalKeys.REGISTRY, 'registry/degregister', {
			name: this._name
		},
		{
			correlationId: correlationId
		});

		this._logger.debug('LightweightResourceDiscoveryService', '_cleanupHttp', 'response', response, correlationId);
		return response;
	}

	async _getService(correlationId, name) {
		try {
			let service = this._services.get(name);
			if (service)
				return this._successResponse(service, correlationId);

			const release = await this._mutex.acquire();
			try {
				let service = this._services.get(name);
				if (service)
					return this._successResponse(service, correlationId);


				// let response = null;
				// if (this.communicationType === this._communicationTypeHttp) {
				// 	response = await this._serviceCommunicationRest.get(correlationId, Constants.ExternalKeys.REGISTRY, 'registry', name,
				// 			{
				// 				correlationId: correlationId
				// 			});
				//
				// }
				// else if (this.communicationType === this._communicationTypeGrpc) {
				// }
				//

				//const service = this._communicationTypes(`${this._communicationType}-get`);
				const service = this._communicationTypes(this._communicationType);
				if (!service)
					return this._error('LightweightResourceDiscoveryService', '_getService', 'response', `Invalid communication type service '${type}'.`, null, null, correlationId)

				const response = service(correlationId, name);
				this._logger.debug('LightweightResourceDiscoveryService', '_getService', 'response', response, correlationId);
				return response;
			}
			finally {
				release();
			}
		}
		catch (err) {
			return this._error('LightweightResourceDiscoveryService', '_get', null, err, null, null, correlationId);
		}
	}

	async _getGrpc(correlationId, name) {
		const response = this._success(correlationId);

		this._logger.debug('LightweightResourceDiscoveryService', '_getGrpc', 'response', response, correlationId);
		return response;
	}

	async _getHttp(correlationId, name) {
		const response = await this._serviceCommunicationRest.get(correlationId, Constants.ExternalKeys.REGISTRY, 'registry', name,
			{
				correlationId: correlationId
			});

		this._logger.debug('LightweightResourceDiscoveryService', '_getHttp', 'response', response, correlationId);
		return response;
	}

	async _initialize(correlationId, opts) {
	}

	async _register(correlationId, opts) {
		const packagePath = `${process.cwd()}/package.json`;
		const packageJson = require(packagePath);

		this._name = packageJson.name;

		const config = {
			name: this._name,
			address: opts.address,
			port: opts.port,
			healthCheck: opts.healthCheck,
			secure: opts.secure
		};

		if (!String.isNullOrEmpty(opts.name))
			config.name = opts.name;
		if (!String.isNullOrEmpty(opts.ttl))
			config.ttl = opts.ttl;
		if (!String.isNullOrEmpty(opts.description))
			config.notes = opts.description;
		if (opts.grpc) {
			config.grpc = {
				port: opts.grpc.port,
				secure: opts.grpc.secure
			}
		}

		// let response = null;
		// if (this.communicationType === this._communicationTypeHttp) {
		// 	response = await this._serviceCommunicationRest.post(correlationId, Constants.ExternalKeys.REGISTRY, 'registry/register',
		// 	config,
		// 	{
		// 		correlationId: correlationId
		// 	});
		// }
		// else if (this.communicationType === this._communicationTypeGrpc) {
		// }


		//const service = this._communicationTypes(`${this._communicationType}-register`);
		const service = this._communicationTypes(this._communicationType);
		if (!service)
			return this._error('LightweightResourceDiscoveryService', '_getService', 'response', `Invalid communication type service '${type}'.`, null, null, correlationId)

		const response = service(correlationId, config);
		this._logger.debug('LightweightResourceDiscoveryService', '_register', 'response', response, correlationId);

		return this._success(correlationId);
	}

	async _registerGrpc(correlationId, config) {
		const response = this._success(correlationId);

		this._logger.debug('LightweightResourceDiscoveryService', '_registerGrpc', 'response', response, correlationId);
		return response;
	}

	async _registerHttp(correlationId, config) {
		const response = await this._serviceCommunicationRest.post(correlationId, Constants.ExternalKeys.REGISTRY, 'registry/register',
			config,
			{
				correlationId: correlationId
			});

		this._logger.debug('LightweightResourceDiscoveryService', '_registerHttp', 'response', response, correlationId);
		return response;
	}

	_serviceCommunicationRest() {
		throw new NotImplementedError();
	}
}

export default LightweightResourceDiscoveryService;
