
const Tensor = require('../tensor'),
	  LayerBehaviours = require('../layer'),
	  Rand = require('../utils/rand');

const MatchingPursuitBehaviours = state => ({
	
	getWeights() {
		return state.weights;
	},

	getNormWeights() {
		return state.normWeights;
	},

	getFullReconstructions() {
		return state.fullReconstructions;
	},

	run(gIteration) {

		const {
			inputCopy,
			weights,
			normWeights,
			output,
			reconstructions,
			fullReconstruction,
			featureVector,
			totalFeatures,
			winners,
			sparseThreshold,
			learningRate		
		} = state;

		const input = state.previousLayer.getOutput();		
		const activations = output.item(0);

		const iframe = input.item(0);
		const iframeCopy = inputCopy.item(0);
		iframeCopy.set(iframe);

		activations.fill(0); 
		fullReconstruction.fill(0);	
		const fframe = fullReconstruction.item(0)	
		
		// set feature vector to threshold so all are recalculated on first pass
		featureVector.fill(sparseThreshold);

		// do multiloop matching pursuit passes
		let totalWinners = 0;
		for(let pass=0; pass<totalFeatures; pass++){

			var max = 0, winner = 0;

			// find the current winner
			for(let f=0; f<totalFeatures; f++){
				if(featureVector[f] >= sparseThreshold){
					const score = iframeCopy.dot(normWeights.item(f));

					if(score > max){
						max = score;
						winner = f;
					}

					featureVector[f] = score;
				}
			}

			if(max < sparseThreshold && pass > 0){ break; }

			// get the rectified reconstruction
			const recon = reconstructions.item(winner);
			recon.set(weights.item(winner));
			recon.scale(max).rectify();

			// do the subtraction/add
			iframeCopy.subtract(recon);
			fframe.add(recon);

			// set the output
			activations[winner] = max;
			winners[totalWinners++] = winner;

			featureVector[winner] = 0;
		}

		// learn the residual global error of the winners
		for(var f=0; f<totalWinners; f++){
			const winner = winners[f];
			const weightBlock = weights.item(winner);
			const scale = activations[winner];
			for(let w=0, len=weightBlock.length; w<len; ++w){
				weightBlock[w] += scale * (iframe[w] - fframe[w]) * learningRate;
			}

			const norm = normWeights.item(winner);
			norm.set(weightBlock);
			norm.rectify().normalise();
		}	
	},

	log(gIteration) {

		// calculation reconstruction error
		const input = state.previousLayer.getOutput();
		state.avgError += state.fullReconstruction.error(input);

		if(gIteration % 100 === 0){
			console.log(gIteration + ':' + state.avgError / 100);
			state.avgError = 0;
		}
	},

	learnFeatures(weights, signal, scale, learningRate) {

		for(let w=0, len=weights.length; w<len; ++w){
			//weights[w] += scale * (signal[w] - weights[w] * scale) * learningRate;
			weights[w] += scale * signal[w] * learningRate;
		}
		ArrayHelpers.normalise(weights);
	},

	learnReconstruction(weights, signal, output, scale, learningRate) {

		for(let w=0, len=weights.length; w<len; ++w){
			weights[w] += scale * (signal[w] - output[w]) * learningRate;
		}
	},

	save(fileLocation) {
		state.weights.save(fileLocation, 'mp');
	},

	load(fileLocation) {
		state.weights.load(fileLocation, 'mp');
		state.normWeights.set(state.weights);
		state.normWeights.rectify().normaliseItems();
	}
	
});

module.exports.create = (def, previousLayer) => {

	const options = def.options;
	const inputDims = previousLayer.getOutput().dims();

	const state = {
		previousLayer,
		inputDims,
		inputCopy: Tensor.create(inputDims.x, inputDims.y),
		totalFeatures: options.totalFeatures,
		weights: Tensor.create(inputDims.x, inputDims.y, options.totalFeatures),
		normWeights: Tensor.create(inputDims.x, inputDims.y, options.totalFeatures),
		output: Tensor.create(options.totalFeatures),
		featureVector: new Float64Array(options.totalFeatures),
		winners: new Uint32Array(options.totalFeatures),
		reconstructions: Tensor.create(inputDims.x, inputDims.y, options.totalFeatures),
		fullReconstruction: Tensor.create(inputDims.x * inputDims.y),
		sparseThreshold: options.sparseThreshold || 1.8,
		learningRate: 0.001,
		avgError: 0
	};

	if(options.initWeights){
		state.weights.setItems(options.initWeights);
		state.normWeights.setItems(options.initWeights);
	}else{				
		var memWeights = state.weights.getMem();
		var memNorms = state.normWeights.getMem();

		for(var i=0; i<memWeights.length; i++){
			memWeights[i] = Rand.between(options.minWeight || 0, options.maxWeight || 1);
			memNorms[i] = Rand.between(options.minWeight || 0, options.maxWeight || 1);
		}
	}

	return Object.assign({},
		LayerBehaviours(state),
		MatchingPursuitBehaviours(state));
};
