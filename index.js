import { Mutex as asyncMutex } from 'async-mutex';

import Constants from './constants';

import NotImplementedError from '@thzero/library_common/errors/notImplemented';

import ResourceDiscoveryService from '@thzero/library_server/service/discovery/resources';

class LightweightResourceDiscoveryService extends ResourceDiscoveryService {
	constructor() {
		super();

		this._mutex = new asyncMutex();

		this._name = null;

		this._services = new Map();
	}

	async cleanup() {
		if (!this._consul)
			return;
		if (String.isNullOrEmpty(this._name))
			return;

		const response = await this._serviceCommunicationRest.post(correlationId, Constants.ExternalKeys.REGISTRY, 'registry/degregister', {
				name: this._name
			},
			{
				correlationId: correlationId
			});
		this._logger.debug('LightweightResourceDiscoveryService', 'cleanup', 'response', response, correlationId);
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

				const response = await this._serviceCommunicationRest.get(correlationId, Constants.ExternalKeys.REGISTRY, 'registry', name,
					{
						correlationId: correlationId
					});
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

		const response = await this._serviceCommunicationRest.post(correlationId, Constants.ExternalKeys.REGISTRY, 'registry/register',
			config,
			{
				correlationId: correlationId
			});
		this._logger.debug('LightweightResourceDiscoveryService', '_register', 'response', response, correlationId);

		return this._success(correlationId);
	}

	_serviceCommunicationRest() {
		throw new NotImplementedError();
	}
}

export default LightweightResourceDiscoveryService;
