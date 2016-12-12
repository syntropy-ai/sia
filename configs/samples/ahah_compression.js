
/***
Implements the hebbian/antihebbian non negative matrix factorisation
provided in this paper: https://arxiv.org/abs/1503.00680
It adds an additional (optional) reconstruction layer to show reconstruction performance
***/

module.exports = {
	layers: [
		{ type: 'omniglot', id: 'input', input: true, options: {

		}},
		{ type: 'ahah', id: 'map', options: {
			totalNeurons: 100
		}},
		{ type: 'reconstruction', id: 'recon', options: {
			x: 28, y: 28,
			learningLayerId: 'input',
			log: true
		}}
	],
	renderers: [
		{ type: 'tensor', title: 'Input', data: ['input'], options: { zoom: 1 } },
		{ type: 'tensor', title: 'Reconstruction', data: ['recon'] },
		{ type: 'tensor', title: 'Forward weights', data: ['map', 'getForwardWeights'], options: { zoom: 1 } },
		{ type: 'tensor', title: 'Reconstruction weights', data: ['recon', 'getWeights'] }		
	]
};