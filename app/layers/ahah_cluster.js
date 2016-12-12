

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
			lateralPasses,
			tempOutput,
			clusterRadius,
			sheetDim,
			blobScores
		} = state;

		const fa = forwardActivations.item(0);
		const iframe = input.item(0);
		const tframe = tempOutput.item(0);
		const oframe = output.item(0);
		const bframe = blobScores.item(0);

		output.fill(0);

		const thresh = 0;

		// calculate the activation vector for the forward pass
		forwardWeights.dot(iframe, fa);
		tframe.set(fa);

		// do the lateral dynamic process
		for(let p=0; p<lateralPasses; p++){
			for(let ln=0; ln<totalNeurons; ln++){
				let res = fa[ln] - tframe.dot(lateralWeights.item(ln));
				tframe[ln] = (res < thresh) ? 0 : res;
			}
		}


		// cluster/blob pass
		const clusterDim = (clusterRadius * 2) + 1;

		// scoring
		for(var y=0; y<sheetDim; y++){
			for(var x=0; x<sheetDim; x++){
				bframe[y * sheetDim + x] = this.calculateClusterScore(sheetDim, clusterDim, clusterRadius, x, y, tframe);
			}
		}

		// process loop
		for(var pass=0; pass<1; pass++){
			var nextWinner = bframe.maxIndex();

			//console.log(bframe[nextWinner]);
			if(bframe[nextWinner] < 0.5){ break; }

			const winY = Math.floor(nextWinner / sheetDim);
			const winX = nextWinner % sheetDim; 

			this.processCluster(sheetDim, clusterRadius, winX, winY, bframe, oframe);
		}


		/*
		// cluster/blob pass
		
		var maxX = 0, maxY = 0;
		var maxScore = 0;

		//for(var y=clusterRadius; y<sheetDim-clusterRadius; y++){
		//	for(var x=clusterRadius; x<sheetDim-clusterRadius; x++){
		for(var y=0; y<sheetDim; y++){
			for(var x=0; x<sheetDim; x++){

				var score = this.calculateClusterScore(sheetDim, clusterDim, clusterRadius, x, y, tframe);
				bframe[y * sheetDim + x] = score;

				if(score > maxScore){
					maxScore = score;
					maxX = x,
					maxY = y
				}
			}
		}

		var aY = Math.max(0, maxY - clusterRadius);
		var bY = Math.min(sheetDim - 1, maxY + clusterRadius);
		var aX = Math.max(0, maxX - clusterRadius);
		var bX = Math.min(sheetDim - 1, maxX + clusterRadius);
		for(var y=aY; y<=bY; y++){
			for(var x=aX; x<=bX; x++){
				var pos = y * sheetDim + x;
				oframe[pos] = tframe[pos];
				bframe[pos] = 0;
				//oframe[pos] = Math.max(tframe[pos], 0.1);
			}
		}

		

		// find the next largest blob
		var nextWinner = bframe.maxIndex();
		maxY = Math.floor(nextWinner / sheetDim);
		maxX = nextWinner % sheetDim; 

		aY = Math.max(0, maxY - clusterRadius);
		bY = Math.min(sheetDim - 1, maxY + clusterRadius);
		aX = Math.max(0, maxX - clusterRadius);
		bX = Math.min(sheetDim - 1, maxX + clusterRadius);
		for(var y=aY; y<=bY; y++){
			for(var x=aX; x<=bX; x++){
				var pos = y * sheetDim + x;
				oframe[pos] = tframe[pos];
				tframe[pos] = 0;
				//oframe[pos] = Math.max(tframe[pos], 0.1);
			}
		}

		*/
	},

	calculateClusterScore(sheetDim, clusterDim, clusterRadius, x, y, data) {

		var score = 0;

		for(var fy=0; fy<clusterDim; fy++){
			for(var fx=0; fx<clusterDim; fx++){
				var xRel = x - clusterRadius + fx;
				var yRel = y - clusterRadius + fy;

				if(xRel >= 0 && xRel < sheetDim && yRel >= 0 && yRel < sheetDim){
					var activation = data[yRel * sheetDim + xRel];
					//score += activation * activation;
					score += activation;
				}
			}
		}

		return score;
	},

	processCluster(sheetDim, clusterRadius, winX, winY, temp, output) {

		const aY = Math.max(0, winY - clusterRadius);
		const bY = Math.min(sheetDim - 1, winY + clusterRadius);
		const aX = Math.max(0, winX - clusterRadius);
		const bX = Math.min(sheetDim - 1, winX + clusterRadius);
		for(var y=aY; y<=bY; y++){
			for(var x=aX; x<=bX; x++){
				var pos = y * sheetDim + x;
				output[pos] = temp[pos];
				temp[pos] = 0;
				//output[pos] = Math.max(temp[pos], 0.1);
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
			lRates[fn] = Math.min(lRates[fn], 500);
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

	const totalNeurons = options.sheetDim * options.sheetDim;

	// setup the layer state
	const state = {
		previousLayer,
		id: def.id,
		forwardWeights: Tensor.create(inputDims.x, inputDims.y, totalNeurons),
		lateralWeights: Tensor.create(totalNeurons, 1, totalNeurons),
		forwardActivations: Tensor.create(totalNeurons),
		output: Tensor.create(totalNeurons),
		lateralPasses: 10,
		totalNeurons: totalNeurons,
		learningRates: Tensor.create(totalNeurons),
		learningRate: 0.01,
		sheetDim: options.sheetDim,
		clusterRadius: options.clusterRadius,
		tempOutput: Tensor.create(totalNeurons),
		blobScores: Tensor.create(totalNeurons)
	};

	// initialise the weights
	state.forwardWeights.items().forEach(weights => {
		for(let i=0; i<weights.length; i++){
			weights[i] = Rand.gaussian(-1, 1);
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

	state.learningRates.fill(100);

	return Object.assign({},
		LayerBehaviours(state),
		AntiHebbianBehaviours(state));
};
