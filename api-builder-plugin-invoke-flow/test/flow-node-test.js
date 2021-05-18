const { expect } = require('chai');
const { MockRuntime } = require('@axway/api-builder-test-utils');
const actions = require('../src/actions');
const getPlugin = require('../src');

describe('Flow-node flow', () => {
	let plugin;
	let triggerNode;
	let responseNode;

	beforeEach(async () => {
		plugin = await MockRuntime.loadPlugin(getPlugin, {});
		triggerNode = plugin.getFlowNode('flow');
		responseNode = plugin.getFlowNode('flow-response');
	});

	it('should define flow flow-node', () => {
		expect(actions).to.be.an('object');
		expect(actions.trigger).to.be.a('function');
		expect(plugin).to.be.a('object');
		expect(plugin.getFlowNodeIds()).to.deep.equal([
			'flow',
			'flow-response'
		]);
		expect(triggerNode).to.be.a('object');
		// Ensure the flow-node matches the spec
		expect(triggerNode.name).to.equal('Invoke flow');
		expect(triggerNode.description).to.equal('Invokes flows');
		expect(triggerNode.icon).to.be.a('string');
		expect(triggerNode.getMethods()).to.deep.equal([
			'trigger'
		]);

		expect(responseNode).to.be.a('object');
		// Ensure the flow-node matches the spec
		expect(responseNode.name).to.equal('Flow listener response');
		expect(responseNode.description).to.equal('Ends `Flow listener` with a response to send back to the `Invoke flow` flow-node.');
		expect(responseNode.icon).to.be.a('string');
		expect(responseNode.getMethods()).to.deep.equal([
			'respond'
		]);
	});

	it('should define valid flow-nodes', () => {
		plugin.validate();
	});

	it('should throw if missing "id" parameter', async () => {
		const { value, output } = await triggerNode.trigger({});
		expect(output).to.equal('error');
		expect(value).to.be.an('Error')
			.and.to.have.property('message', 'Missing required parameter: id');
	});

	it('should throw if "id" parameter is not a string', async () => {
		const { value, output } = await triggerNode.trigger({ id: 1234 });
		expect(output).to.equal('error');
		expect(value).to.be.an('Error')
			.and.to.have.property('message', 'Invalid id parameter type: number');
	});

	it('should throw if missing "error" parameter', async () => {
		const { value, output } = await responseNode.respond({ });
		expect(output).to.equal('error');
		expect(value).to.be.an('Error')
			.and.to.have.property('message', 'Invalid parameter: error');
	});

	it('should set error on response', async () => {
		const { value, output } = await responseNode.respond({ error: true });
		expect(output).to.equal('next');
		expect(value).to.deep.equal({ error: true });
	});

	it('should set error and data on response', async () => {
		const data = 'happy';
		const { value, output } = await responseNode.respond({ error: false, data });
		expect(output).to.equal('next');
		expect(value).to.deep.equal({ error: false, data });
	});
});
