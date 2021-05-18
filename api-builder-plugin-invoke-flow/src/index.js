const path = require('path');
const { SDK } = require('@axway/api-builder-sdk');
const actions = require('./actions');

function getFlowTrigger({ flowMap }) {
	return {
		name: 'Invoke flow listener',
		description: 'Can be triggered by the \'Invoke flow\' flow-node.',
		requestSchema: {
			title: 'Data',
			description: 'The data sent as the request.'
		},
		triggerParameters: {
			type: 'object',
			properties: {
				id: {
					type: 'string',
					title: 'Flow listener ID',
					description: 'A unique id, used to trigger this flow.'
				}
			},
			required: [ 'id' ],
			additionalProperties: false
		},
		createTrigger: async ({ parameters }) => {
			const { id } = parameters;
			if (flowMap.hasOwnProperty(id)) {
				throw new Error(`Cannot create multiple triggers with the same Flow ID: ${id}`);
			}

			return {
				async start (startInvoke) {
					flowMap[id] = startInvoke;
				},
				async onInvoke({ invoke, data }) {
					return invoke(data);
				},
				async destroy() {
					delete flowMap[id];
				},
				description: ' '
			};
		}
	};
}

/**
 * Resolves the API Builder plugin.
 * @param {object} pluginConfig - The service configuration for this plugin
 * from API Builder config.pluginConfig['api-builder-plugin-pluginName'].
 * @param {string} pluginConfig.proxy - The configured API-builder proxy
 * server.
 * @param {object} options - Additional options and configuration provided by
 * API Builder.
 * @param {string} options.appDir - The current directory of the service using
 * the plugin.
 * @param {string} options.logger - An API Builder logger scoped for this
 * plugin.
 * @returns {object} An API Builder plugin.
 */
async function getPlugin(pluginConfig) {
	const sdk = new SDK({ pluginConfig });

	const flowMap = {};

	sdk.load(path.resolve(__dirname, 'flow-nodes.yml'), actions, {
		pluginContext: flowMap
	});
	const plugin = sdk.getPlugin();

	plugin.triggers = {
		flow: getFlowTrigger({ flowMap })
	};
	plugin.triggers.flow.icon = plugin.flownodes.flow.icon;
	return plugin;
}

module.exports = getPlugin;
