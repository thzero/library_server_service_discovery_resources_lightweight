import { Mutex as asyncMutex } from 'async-mutex';

import Constants from './constants';
import LibraryConstants from '@thzero/library_common/constants';

import ResourceDiscoveryService from '@thzero/library_server/service/discovery/resources';

class LightweightResourceDiscoveryService extends ResourceDiscoveryService {
	constructor() {
		super();

		this._mutex = new asyncMutex();

		this._address = null;
		this._name = null;

		this._services = new Map();

		this._serviceCommunicationRest = this._injector.getService(LibraryConstants.InjectorKeys.SERVICE_COMMUNICATION_REST);
	}

	async cleanup() {
		if (!this._consul)
			return;
		if (String.isNullOrEmpty(this._name))
			return;

		const response = await this._serviceCommunicationRest.post(correlationId, Constants.ExternalKeys.REGISTRY, 'degregister', {
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

				const response = await this._serviceCommunicationRest.get(correlationId, Constants.ExternalKeys.REGISTRY, '', name,
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

	async _register(correlationId, opts) {
		const packagePath = `${process.cwd()}/package.json`;
		const packageJson = require(packagePath);

		this._name = packageJson.name;
		this._address = opts.address;

		const response = await this._serviceCommunicationRest.post(correlationId, Constants.ExternalKeys.REGISTRY, 'register', {
				name: this._name,
				address: this._address,
				port: opts.port
			},
			{
				correlationId: correlationId
			});
		this._logger.debug('LightweightResourceDiscoveryService', '_register', 'response', response, correlationId);
		return this._success(correlationId);

		// const config = {
		// 	id: LibraryUtility.generateId(),
		// 	name: packageJson.name + '_instance',
		// 	ttl: '10s',
		// 	address: this._address,
		// 	port: opts.port
		// };
		// if (!String.isNullOrEmpty(opts.name))
		// 	config.name = opts.name;
		// if (!String.isNullOrEmpty(opts.ttl))
		// 	config.ttl = opts.ttl;
		// if (!String.isNullOrEmpty(opts.description))
		// 	config.notes = opts.description;
		// if (opts.grpc && opts.grpc.port) {
		// 	config.grpc = `${opts.address}:${opts.grpc.port}`;
		// 	if (options.grpc.tls)
		// 		config.grpcusetls = options.grpc.tls;
		// }

		// await this._consul.agent.service.register(config);
	}
}

export default LightweightResourceDiscoveryService;
