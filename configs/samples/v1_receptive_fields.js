
/***
An example of hebbian/lateral inhibitive antihebbian for finding the
receptive fields similar to those found in v1 in the visual cortex
***/

module.exports = {
	layers: [
		{ type: 'whitened_patches', id: 'input', input: true, options: {
			
		}},
		{ type: 'ahah', id: 'map', options: {
			totalNeurons: 256
		}}
	],
	renderers: [
		{ type: 'tensor', title: 'Input', data: ['input'], options: { zoom: 2 } },
		{ type: 'tensor', title: 'Simple cell features', data: ['map', 'getForwardWeights'], options: { zoom: 2 } },
	]
};