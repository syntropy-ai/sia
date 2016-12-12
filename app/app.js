
require('./utils/typed_array_maths');

const Network = require('./network'),
	RenderEngine = require('./render_engine'),
	FlowController = require('./flow_controller');

const args = require('electron').remote.process.argv;
const theDef = require('../configs/' + args[2]);

Network.create(theDef.layers).then(network => {
	const renderEngine = RenderEngine.create('renders', theDef.renderers, network);
	window.ctrl = FlowController.create(network, renderEngine, {
		initialLoad: theDef.initialLoad,
		stopAt: theDef.stopAt
	});
});