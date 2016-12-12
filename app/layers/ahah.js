
const LayerBehaviours = require('../layer'),
	  Tensor = require('../tensor'),
	  Rand = require('../utils/rand');

// anti hebbian traits

const AntiHebbianBehaviours = state => ({

	getForwardWeights() {
		return state.forwardWeights;
	},

	run(gIteration) {
		const input = state.previousLayer.getOutput();
		this.propagate(input, gIteration);
		this.learn(input);
	},


	// do a forward propagation with a given number of lateral passes 
	propagate(input, gIteration) {

		const {
			totalNeurons,
			forwardWeights, 
			forwardActivations,
			lateralWeights,
			output,
			lateralPasses
		} = state;

		const fa = forwardActivations.item(0);
		const iframe = input.item(0);
		const oframe = output.item(0);

		const thresh = 0;

		// calculate the activation vector for the forward pass
		forwardWeights.dot(iframe, fa);
		oframe.set(fa);

		// do the lateral dynamic process
		for(let p=0; p<lateralPasses; p++){
			for(let ln=0; ln<totalNeurons; ln++){
				let res = fa[ln] - oframe.dot(lateralWeights.item(ln));
				oframe[ln] = (res < thresh) ? 0 : res;
			}
		}
	},

	// perform a single learning update based on some input and the current activation state
	learn(input, frameScores) {

		const {
			totalNeurons,
			forwardWeights,
			lateralWeights,
			output,
			learningRate,
			learningRates
		} = state;

		const scaler = 1.0;
		const lRates = learningRates.item(0);
		const iframe = input.item(0);  // input frame
		const oframe = output.item(0); // output frame

		// update the weights
		for(let fn=0; fn<totalNeurons; fn++){ // fn = feature neuron index

			if(oframe[fn] <= 0) { continue; }

			const lr = 1 / lRates[fn];

			// forward weight update
			const weightBlock = forwardWeights.item(fn);
			const weightsPerBlock = weightBlock.length;
			for(let w=0; w<weightsPerBlock; w++){
				weightBlock[w] += oframe[fn] * (iframe[w] - weightBlock[w] * oframe[fn]) * lr;
			}

			const scaled = scaler * oframe[fn];

			// lateral weight update
			const lateralWeightBlock = lateralWeights.item(fn);
			for(let w=0; w<totalNeurons; w++){
				if(fn !== w){
					lateralWeightBlock[w] += oframe[fn] * (oframe[w] - lateralWeightBlock[w] * oframe[fn]) * lr;
				}					
			}

			// update the learning rate for the neuron
			lRates[fn] += 0.1 * (oframe[fn] * oframe[fn]);
		}
	},

	logLateralWeights() {
		state.lateralWeights.log();
	},

	save(fileLocation) {
		state.forwardWeights.save(fileLocation, state.id + '_fw');
		state.lateralWeights.save(fileLocation, state.id + '_lw');
	},

	load(fileLocation) {
		state.forwardWeights.load(fileLocation, state.id + '_fw');
		state.lateralWeights.load(fileLocation, state.id + '_lw');
	}

});

module.exports.create = (def, previousLayer) => {

	const options = def.options;
	const inputDims = previousLayer.getOutput().dims();

	// setup the layer state
	const state = {
		previousLayer,
		id: def.id,
		forwardWeights: Tensor.create(inputDims.x, inputDims.y, options.totalNeurons),
		lateralWeights: Tensor.create(options.totalNeurons, 1, options.totalNeurons),
		forwardActivations: Tensor.create(options.totalNeurons),
		output: Tensor.create(options.totalNeurons),
		lateralPasses: 10,
		totalNeurons: options.totalNeurons,
		learningRates: Tensor.create(options.totalNeurons),
		learningRate: 0.01
	};

	// initialise the weights
	state.forwardWeights.items().forEach(weights => {
		for(let i=0; i<weights.length; i++){
			weights[i] = Rand.gaussian(0, 1);
		}
		weights.normalise(2);
	});

	// initialise the lateral weights
	state.lateralWeights.items().forEach(weights => {
		for(let w=0; w<weights.length; w++){
			weights[w] = 0.001;//Rand.gaussian(0, 1);
		}
		weights.normalise(1);
	});

	state.learningRates.fill(500);

	return Object.assign({},
		LayerBehaviours(state),
		AntiHebbianBehaviours(state));
};
