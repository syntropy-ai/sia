
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
				let x,y
				if(Rand.between(0, 1) < 0.5){
					x = Rand.between(0.35, 0.45)
				  y = Rand.between(0, 1)				
				}else{
					x = Rand.between(0.55, 0.65)
				  y = Rand.between(0, 1.0)
				}
				tensor.item(0).set([x, y]);
			}
		}},
		{ type: 'som', id: 'som', options: {
			mapCols: 15,
			mapRows: 15,
			learningSlope: 0.05
		}}
	],
	renderers: [
		{ type: 'mesh_2d', title: 'Kohonen', data: [['input'], ['som', 'getForwardWeights']], options: {
			meshRowSize: 15,
			framesPerRender: 100
		}}
	]
};