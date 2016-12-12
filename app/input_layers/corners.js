
const LayerBehaviours = require('../layer'),
	Tensor = require('../tensor');

const CornersBehaviours = state => ({

	run(gIteration) {

		const {
			xStart,
			xRange,
			yStart,
			yRange,
			output,
			lineWidth,
			lineLength
		} = state;

		const x = gIteration % xRange + xStart;
		const y = Math.floor(gIteration / xRange) % yRange + yStart;

		output.fill(0);

		const item = output.item(0);

		// horizontal piece
		for(let l=0; l<lineWidth; l++){
			for(let xx=0; xx<lineLength; xx++){
				item[((y+l)*28)+(xx+x)] = 1;
			}
		}

		// vertical piece
		for(let l=0; l<lineWidth; l++){
			for(let yy=lineWidth; yy<lineLength; yy++){
				item[((y+yy)*28)+(x+l)] = 1;
			}
		}
	}
});

module.exports.create = def => {

	const options = Object.assign({
		lineWidth: 2,
		lineLength: 10,
		xStart: 4,
		xRange: 10,
		yStart: 4,
		yRange: 10,
	}, def.options);

	const state = Object.assign(options, {
		output: Tensor.create(28, 28, 1)
	});

	return Object.assign({},
		LayerBehaviours(state),
		CornersBehaviours(state));
};