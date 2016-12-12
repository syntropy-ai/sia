
const LayerBehaviours = require('../layer'),
	Tensor = require('../tensor'),
	Rand = require('../utils/rand');

const CrossBehaviours = state => ({

	run(gIteration) {

		const {
			width,
			height,
			lineWidth,
			output
		} = state;

		const frame = output.item(0);

		let xPos = Rand.betweenInt(0, width - lineWidth);
		let yPos = Rand.betweenInt(0, height - lineWidth);
		
		//frame.fill(-((width*lineWidth + height*lineWidth) - (lineWidth*lineWidth)) / (width*height));
		frame.fill(0);

		// vertical bar
		for(let x=xPos; x<xPos+lineWidth; x++){
			for(let y=0; y<height; y++){
				frame[y * width + x] = 1;
			}
		}

		// horizontal bar
		for(let y=yPos; y<yPos+lineWidth; y++){
			for(let x=0; x<width; x++){
				frame[y * width + x] = 1;
			}
		}
	}
});

module.exports.create = def => {

	const options = Object.assign({
		lineWidth: 3,
		width: 28,
		height: 28,
	}, def.options);

	const state = Object.assign(options, {
		output: Tensor.create(options.width, options.height, 1)
	});

	return Object.assign({},
		LayerBehaviours(state),
		CrossBehaviours(state));
};