/**
 * Action method.
 *
 * @param {object} params - A map of all the parameters passed from the flow.
 * @param {object} options - The additional options provided from the flow
 *  engine.
 * @param {object} options.pluginConfig - The service configuration for this
 *  plugin from API Builder
 *  config.pluginConfig['api-builder-plugin-pluginName']
 * @param {object} options.logger - The API Builder logger which can be used
 *  to log messages to the console. When run in unit-tests, the messages are
 *  not logged.  If you wish to test logging, you will need to create a
 *  mocked logger (e.g. using `simple-mock`) and override in
 *  `MockRuntime.loadPlugin`.  For more information about the logger, see:
 *  https://docs.axway.com/bundle/API_Builder_4x_allOS_en/page/logging.html
 * @example
 *  Log errors with logger.error('Your error message');
 * @param {*} [options.pluginContext] - The data provided by passing the
 *  context to `sdk.load(file, actions, { pluginContext })` in `getPlugin`
 *  in `index.js`.
 * @return {*} The response value (resolves to "next" output, or if the method
 *  does not define "next", the first defined output).
 */
async function trigger(params, { pluginContext: flowMap }) {
	const { id, data } = params;
	if (!id) {
		throw new Error('Missing required parameter: id');
	}
	if (typeof id !== 'string') {
		throw new Error(`Invalid id parameter type: ${typeof id}`);
	}
	if (!flowMap.hasOwnProperty(id)) {
		throw new Error(`Unknown Flow ID: ${id}`);
	}

	const startInvoke = flowMap[id];
	const { error, value: response } = await startInvoke(data);
	if (error) {
		throw response;
	}

	if (typeof response !== 'object' || !('error' in response)) {
		throw new Error(`Invoked flow "${id}" did not end with 'Flow response'`);
	}
	if (response.error) {
		throw response.data;
	}
	return response.data;
}

async function respond(params) {
	if (typeof params.error !== 'boolean') {
		throw new Error('Invalid parameter: error');
	}
	return params;
}

module.exports = {
	trigger,
	respond
};
