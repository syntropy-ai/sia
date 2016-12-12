const LayerBehaviours = require('../layer'),
	  Tensor = require('../tensor'),
	  Rand = require('../utils/rand');

// reconstruction traits

const ReconstructionBehaviours = state => ({

	run(gIteration) {
		let input = state.previousLayer.getOutput();
		this.propagate(input, gIteration);
		this.learn(input, state.learningSignal, gIteration);
	},
	
	postCreate(network) {
		state.learningSignal = network.getLayer(state.learningLayerId).getOutput();
	},
	
	propagate(input, gIteration) {
	
		const {
			totalOutputs,
			totalInputs,
			weights,
			output,
		} = state;

		output.fill(0);

		const iframe = input.item(0);
		const oframe = output.item(0);
			
		for(let p=0; p<totalInputs; p++){
			let weightBlock = weights.item(p);
			let inputMult = iframe[p];
				
			if(inputMult > 0){
				for(let w=0; w<totalOutputs; w++){
					oframe[w] += inputMult * weightBlock[w];
				}	
			}
		}

		oframe.rectify();
	},
	
	learn(input, signal, gIteration) {
	
		const {
			output,
			totalInputs,
			learningRate,
			totalOutputs,
			weights,
		} = state;
	
		let lRate = learningRate;
		let iframe = input.item(0);  // input frame
		let oframe = output.item(0); // output frame
		let sframe = signal.item(0); // learning signal frame

		// update the weights to better fit input
		for(let p=0; p<totalInputs; p++){
			let weightBlock = weights.item(p);
			let inputMult = iframe[p];
			if(inputMult > 0){
				for(let w=0; w<totalOutputs; w++){
					weightBlock[w] += lRate * inputMult * (sframe[w] - oframe[w]);
				}	
			}				
		}		
	},

	log(gIteration) {
		if(gIteration % 100 === 0){
			console.log('error:', state.avgError / 100);
			console.log('-------', gIteration, '--------');
			state.avgError = 0;
		}
		state.avgError += state.output.error(state.learningSignal); 
	},
	
	getWeights() {
		return state.weights;
	},

	save(fileLocation) {
		state.weights.save(fileLocation, state.id);
	},

	load(fileLocation) {
		state.weights.load(fileLocation, state.id);
	}
});

module.exports.create = (def, previousLayer) => {

	const options = def.options;
	let inputDims = previousLayer.getOutput().dims();

	// setup the layer state
	const state = {
		previousLayer,
		id: def.id,
		weights: Tensor.create(options.x, options.y, inputDims.x * inputDims.y),
		output: Tensor.create(options.x, options.y),
		totalInputs: inputDims.x * inputDims.y,
		totalOutputs: options.x * options.y,
		learningRate: options.learningRate || 0.001,		
		learningLayerId: options.learningLayerId,
		avgError: 0
	};

	// set the initial weight values to be non zero
	state.weights.items().forEach(block => {
		for(let x=0; x<block.length; x++){
			block[x] = 0.0001;//Rand.gaussian(0, 1);
		}
	});

	return Object.assign({},
		LayerBehaviours(state),
		ReconstructionBehaviours(state));
};
