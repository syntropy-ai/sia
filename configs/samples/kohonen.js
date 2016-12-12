
/***
Implements a 2D Visual explanation of a kohonen self organising map
https://en.wikipedia.org/wiki/Self-organizing_map
***/

const Rand = require('../../app/utils/rand');

module.exports = {
	layers: [
		{ type: 'point_generator', id: 'input', input: true, options: {
			dimX: 2,
			generator: function(tensor, iteration) {
				const x = Rand.between(0, 1);
				const y = Rand.between(0, 1);
				tensor.item(0).set([x, y]);
			}
		}}
	],
	renderers: [
		{ type: 'tensor', title: 'Input', data: ['input'] }
	]
};