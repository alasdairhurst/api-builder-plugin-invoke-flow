const simple = require('simple-mock');
const { expect } = require('chai');
const { MockRuntime, MockLogger } = require('@axway/api-builder-test-utils');
const getPlugin = require('../src');

describe('Flow-trigger flow', () => {

	it('should export a getPlugin function', () => {
		expect(getPlugin).to.be.a('function');
	});

	it('should define a flow flow-trigger when getPlugin is called', async () => {
		const logger = {
			trace: simple.mock()
		};
		const exported = await getPlugin({}, { logger });
		expect(exported).to.have.property('triggers')
			.and.to.have.property('flow')
			.and.to.have.property('triggerParameters');
		expect(exported.triggers.flow.createTrigger)
			.to.be.a('function');
	});

	it('should create, use, and destroy an flow trigger', async () => {
		const plugin = await MockRuntime.loadPlugin(getPlugin, {});
		const flowNode = plugin.getFlowNode('flow');
		const exported = plugin.getRawPlugin();
		expect(exported.triggers).to.have.keys([ 'flow' ]);
		const { flow: flowTrigger } = exported.triggers;
		const error = new Error('omg - errors!');
		const response = 'Great!';
		// mock a Flow response
		const invoke = simple.mock()
			.resolveWith({ error: false, data: response })
			.resolveWith({ error: true, data: error })
			.rejectWith(error)
			.resolveWith(true);

		expect(flowTrigger).to.have.keys([
			'createTrigger',
			'description',
			'icon',
			'name',
			'requestSchema',
			'triggerParameters'
		]);

		expect(flowTrigger.name).to.equal('Flow listener');
		expect(flowTrigger.description)
			.to.equal('Can be triggered by the \'Invoke flow\' flow-node.');
		expect(flowTrigger.icon).to.be.a('string')
			.and.to.satisfy(a => a.startsWith('data:image/svg+xml;base64,'));
		expect(flowTrigger.requestSchema).to.deep.equal({
			title: 'Data',
			description: 'The data sent as the request.'
		});
		expect(flowTrigger.triggerParameters.properties).to.have.keys([ 'id' ]);
		expect(flowTrigger.triggerParameters.required).to.deep.equal([ 'id' ]);

		const created = await flowTrigger.createTrigger({
			id: 'my-trigger',
			parameters: {
				id: 'BEEP'
			}
		});

		const invokeLogger = MockLogger.create();
		const startInvoke = simple.spy(async data => {
			const response = {};
			try {
				response.value = await created.onInvoke({ invoke, data, logger: invokeLogger });
			} catch (err) {
				response.error = true;
				response.value = err;
			}
			return response;
		});

		await created.start(startInvoke);

		try {
			await flowTrigger.createTrigger({
				id: 'my-trigger2',
				parameters: {
					id: 'BEEP'
				}
			});
			expect.fail('unexpected');
		} catch (err) {
			expect(err.message).to.equal('Cannot create multiple triggers with the same Flow ID: BEEP');
		}

		const { value, output } = await flowNode.trigger({
			id: 'BEEP'
		});
		expect(startInvoke.calls).to.have.length(1);
		expect(startInvoke.calls[0].args).to.deep.equal([ undefined ]);
		expect(value).to.equal(response);
		expect(output).to.equal('next');

		const data = { myData: true };
		const { value: value2, output: output2 } = await flowNode.trigger({
			id: 'BEEP',
			data
		});

		expect(invoke.calls).to.have.length(2);
		expect(invoke.calls[1].args).to.deep.equal([ data ]);
		expect(output2).to.equal('error');
		expect(value2).to.equal(error);

		const { value: value3, output: output3 } = await flowNode.trigger({
			id: 'BEEP'
		});

		expect(invoke.calls).to.have.length(3);
		expect(invoke.calls[2].args).to.deep.equal([ undefined ]);
		expect(output3).to.equal('error');
		expect(value3).to.equal(error);

		const { value: value4, output: output4 } = await flowNode.trigger({
			id: 'BEEP'
		});

		expect(invoke.calls).to.have.length(4);
		expect(invoke.calls[3].args).to.deep.equal([ undefined ]);
		expect(output4).to.equal('error');
		expect(value4.message).to.equal('Invoked flow "BEEP" did not end with \'Flow response\'');

		// destroy trigger
		await created.destroy();

		const { value: value5, output: output5 } = await flowNode.trigger({
			id: 'BEEP'
		});

		expect(invoke.calls).to.have.length(4);
		expect(output5).to.equal('error');
		expect(value5.message).to.equal('Unknown Flow ID: BEEP');
	});
});
