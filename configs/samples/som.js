
/***
Implements a 2D self-organised map using the MNIST dataset
***/

module.exports = {
	layers: [
		{ type: 'mnist', id: 'input', input: true, options: {
			
		}},
		{ type: 'som', id: 'map', options: {
			mapCols: 15,
			mapRows: 15,
			learningSlope: 0.01, // controls how much neighbours learn in comparison to winner
			learningRate: 0.001
		}}
	],
	renderers: [
		{ type: 'tensor', title: 'Input', data: ['input'], options: { zoom: 1 } },
		{ type: 'tensor', title: 'Self Organised Map', data: ['map', 'getForwardWeights'], options: {
			zoom: 1,
			rowMax: 10
		}}	
	]
};