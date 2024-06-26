import { Mutex as asyncMutex } from 'async-mutex';

import LibraryCommonUtility from '@thzero/library_common/utility/index.js';

import NotImplementedError from '@thzero/library_common/errors/notImplemented.js';

import ResourceDiscoveryService from '@thzero/library_server/service/discovery/resources/index.js';

import GrpcLightweightResourceDiscoveryService from './grpc/discovery.js';
import HttpLightweightResourceDiscoveryService from './http/discovery.js';

class LightweightResourceDiscoveryService extends ResourceDiscoveryService {
	constructor() {
		super();

		this._mutex = new asyncMutex();

		this._communicationTypeI = null;
		this._communicationTypeGrpc = 'grpc';
		this._communicationTypeHttp = 'http';
		this._communicationTypes = new Map();

		this._name = null;

		this._services = new Map();
	}

	async init(injector) {
		await super.init(injector);

		let service = new GrpcLightweightResourceDiscoveryService();
		service.init(injector);
		this._communicationTypes.set(this._communicationTypeGrpc, service);
		service = new HttpLightweightResourceDiscoveryService();
		service.init(injector);
		this._communicationTypes.set(this._communicationTypeHttp, service);
	}

	async initializeDiscovery(opts) {
		try {
			this._enforceNotEmpty('LightweightResourceDiscoveryService', 'initializeDiscovery', opts, 'opts', null);

			const heartbeatRequired = this._config.get('discovery.heartbeatRequired', false);
			if (!(this.allowsHeartbeat && heartbeatRequired))
				return this._success(null);

			await this.register(LibraryCommonUtility.generateId(), optsI);
			const heartbeatInterval = Number(this._config.get('discovery.heartbeatInterval', 30));
			setInterval((async function () {
				await this.register(LibraryCommonUtility.generateId(), optsI);
			}).bind(this), heartbeatInterval * 1000);

			return this._success(null);
		}
		catch(err) {
			return this._error('LightweightResourceDiscoveryService', 'initializeDiscovery', null, err, null, null, null);
		}
	}

	async _cleanup(correlationId) {
		if (String.isNullOrEmpty(this._name))
			return;

		const communicationTypeService = this._communicationTypes.get(this._communicationType);
		if (!communicationTypeService)
			return this._error('LightweightResourceDiscoveryService', '_cleanup', 'response', `Invalid communication type service '${type}'.`, null, null, correlationId)

		const response = await communicationTypeService.cleanup(correlationId);
		this._logger.debug('LightweightResourceDiscoveryService', '_cleanup', 'response', response, correlationId);
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

				const communicationTypeService = this._communicationTypes.get(this._communicationType);
				if (!communicationTypeService)
					return this._error('LightweightResourceDiscoveryService', '_getService', 'response', `Invalid communication type service '${type}'.`, null, null, correlationId)

				const response = await communicationTypeService.getService(correlationId, name);
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

	async _initialize(correlationId, opts) {
	}

	async _register(correlationId, opts) {
		const packagePath = `${process.cwd()}/package.json`;
		const packageJson = require(packagePath);

		this._name = packageJson.name;
		const config = this._config.get('discovery.resources', null);
		this._logger.debug('LightweightResourceDiscoveryService', '_register', 'config', config, correlationId);
		if (!config.register)
			return this._success(correlationId);

		if (config && !String.isNullOrEmpty(config.name))
			this._name = config.name;

		const registerConfig = {
			name: this._name,
			address: opts.address,
			port: opts.port,
			healthCheck: opts.healthCheck,
			secure: opts.secure,
			dns: opts.dns
		};

		if (!String.isNullOrEmpty(opts.name))
			registerConfig.name = opts.name;
		if (!String.isNullOrEmpty(opts.ttl))
			registerConfig.ttl = opts.ttl;
		if (!String.isNullOrEmpty(opts.description))
			registerConfig.notes = opts.description;
		if (opts.grpc)
			registerConfig.grpc = opts.grpc;

		const communicationTypeService = this._communicationTypes.get(this._communicationType);
		if (!communicationTypeService)
			return this._error('LightweightResourceDiscoveryService', '_getService', 'response', `Invalid communication type service '${type}'.`, null, null, correlationId)

		const response = await communicationTypeService.register(correlationId, registerConfig);
		this._logger.debug('LightweightResourceDiscoveryService', '_register', 'response', response, correlationId);

		return this._success(correlationId);
	}

	_serviceCommunicationRest() {
		throw new NotImplementedError();
	}

	get _communicationType() {
		if (this._communicationTypeI)
			return this._communicationTypeI;

		this._communicationTypeI = this._config.get(`discovery.resources.type`, this._communicationTypeHttp);
		return this._communicationTypeI;
	}
}

export default LightweightResourceDiscoveryService;
