
// self organising map layer

const LayerBehaviours = require('../layer'),
	Tensor = require('../tensor'),
	Rand = require('../utils/rand');

const SOMBehavious = state => ({

	getForwardWeights() {
		return state.forwardWeights;
	},

	run(gIteration) {
		const input = state.previousLayer.getOutput();
		this.propagate(input, gIteration);
		this.learn(input, gIteration);
	},

	// propagate the input through the layer to find the activation vector
	propagate(input, gIteration) {

		const {
			output,
			totalNeurons,
			forwardWeights
		} = state;

		const iframe = input.item();
		const oframe = output.item();

		// calculate the activation vector for the forward pass
		for(let n=0; n<totalNeurons; n++){
			oframe[n] = iframe.dot(forwardWeights.item(n));
		}

		// calculate the winning index
		state.winnerIndex = oframe.maxIndex();

	},

	// learn based on the current activation state
	learn(input, gIteration) {

		const {
			totalNeurons,
			forwardWeights,
			learningRate,
			mapCols,
			mapRows,
			winnerIndex,
			learningSlope
		} = state;

		const iframe = input.item();  // input frame

		// update the weights
		for(let n=0; n<totalNeurons; n++){

			const weightBlock = forwardWeights.item(n);
			const weightsPerBlock = weightBlock.length;

			// calculate sloped learning rate based on distance from winner

			// get the distance of this neuron from the winner
			let xdist = Math.abs((winnerIndex % mapCols) - (n % mapCols));
			let ydist = Math.abs(Math.floor(winnerIndex / mapRows) - Math.floor(n / mapRows));
			let dist = Math.max(xdist, ydist);

			// calculate the learning rate based on slope and distance
			let lRate = Math.exp(-dist / (totalNeurons * learningSlope)) * learningRate;

			// now do the learning
			for(let w=0; w<weightsPerBlock; w++){
				weightBlock[w] += lRate * (iframe[w] - weightBlock[w]);
			}

			weightBlock.normalise(1);
		}
	},

	save(fileLocation) {
		state.forwardWeights.save(fileLocation, state.id + '_fw');
	},

	load(fileLocation) {
		state.forwardWeights.load(fileLocation, state.id + '_fw');
	}
});

module.exports.create = (def, previousLayer) => {

	const options = def.options;
	const inputDims = previousLayer.getOutput().dims();
	const totalNeurons = options.mapCols * options.mapRows;

	const state = {
		previousLayer,
		id: def.id,
		mapCols: options.mapCols,
		mapRows: options.mapRows,
		forwardWeights: Tensor.create(inputDims.x, inputDims.y, totalNeurons),
		output: Tensor.create(totalNeurons, 1, inputDims.totalItems),
		learningRate: options.learningRate || 0.001,
		learningSlope: options.learningSlope || 0.01,
		totalOutputFrames: inputDims.totalItems,
		totalNeurons: totalNeurons,
		winnerIndex: 0,
	};

	// initialise to normalised random weights
	state.forwardWeights.items().forEach(weights => {
		for(let i=0; i<weights.length; i++){
			weights[i] = Rand.between(0.001, 0.002);
		}
		weights.normalise(1);
	});

	return Object.assign({},
		LayerBehaviours(state),
		SOMBehavious(state));
};