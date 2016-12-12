
/***
This input lets the user create arbirtrary sets of n dimensional points.
The generator function is specified in the config
***/

const LayerBehaviours = require('../layer'),
	Tensor = require('../tensor');

const PointGeneratorBehaviours = state => ({

	run(gIteration) {
		state.generator(state.output, gIteration);
	}

});

module.exports.create = def => {

	const options = def.options;

	const state = {
		output: Tensor.create(options.dimX, options.dimY),
		generator: options.generator
	};

	return Object.assign({},
		LayerBehaviours(state),
		PointGeneratorBehaviours(state));
};