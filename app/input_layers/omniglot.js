
var LayerBehaviours = require('../layer'),
	Tensor = require('../tensor'),
	CanvasHelpers = require('../utils/canvas_helpers'),
	Rand = require('../utils/rand'),
	FileHelpers = require('../utils/file_helpers');


const InputProps = {
	dim: 28,
	size: 28 * 28,
	inputsPerRow: 20,
	rows: 964,
	imageFile: './input_data/omniglot/images_background.png'
};

const OmniglotBehaviours = state => ({

	getLastIndex() {
		return state.index - 1;
	},

	getLabel() {
		return state.outputLabel;
	},

	getInputInfo() {
		console.log({
			index: state.index,
			data: state.output.items(),
			label: state.outputLabel
		});
	},

	// run the layer, setting the output to the next digit
	run() {

		const index = state.index % (InputProps.inputsPerRow * InputProps.rows);
		state.outputLabel = index;

		const dctx = state.digitsCanvas.ctx,
			sdctx = state.singleDigitCanvas.ctx,
			ddata = state.digitsCanvas.imageData,
			tctx = state.transformCanvas.ctx,
			wsize = state.wsize,
			wstartx = state.wstartx,
			wstarty = state.wstarty;

		// get the next input as data from the digits canvas
		let xpos = index * InputProps.dim % (InputProps.inputsPerRow * InputProps.dim);
		let ypos = Math.floor(Math.max(index, 0.1) / InputProps.inputsPerRow) * InputProps.dim;
		let width = height = InputProps.dim;
		const rawInputData = dctx.getImageData(xpos, ypos, width, height);

		// draw the input to the transform canvas
		sdctx.putImageData(rawInputData, 0, 0);

		// transform the transform canvas
		// fiddle with transforms - http://codepen.io/GusRuss89/pen/NAzENj

		tctx.clearRect(0, 0, InputProps.dim, InputProps.dim);
		tctx.save();

		// rotate ===
		// perform rotation from the centre - requires translating
		var transX = InputProps.dim * 0.5,
			transY = InputProps.dim * 0.5;
		tctx.translate(transX, transY);
		// now rotate
		tctx.rotate(Rand.between(-10, 10) * Math.PI / 180);
		// translate back
		tctx.translate(-transX, -transY);

		// transform ===
		// h scale, h skew, v skew, v scale, h move, v move
		tctx.transform(
			Rand.between(0.9, 1.1), // hscale
			Rand.between(-0.05, 0.05), // hskew
			Rand.between(-0.05, 0.05), // vskew
			Rand.between(0.9, 1.1), // vscale
			Rand.between(InputProps.dim/8 * -1, InputProps.dim/8), // hmove
			Rand.between(InputProps.dim/10 * -1, InputProps.dim/10) // vmove
		);

		// draw single digit input to transform canvas
		tctx.drawImage(state.singleDigitCanvas.domNode, 0, 0);

		// get transformed input data
		const txInputData = tctx.getImageData(wstartx, wstarty, wsize, wsize);
		const raw = state.output.item();
		for(let i=0; i<(InputProps.size); i++){
			raw[i] = txInputData.data[i*4+1] / 255; // *4+1 to get the green value of the pixel
		}

		tctx.restore();
		state.index++;

	}

});

module.exports.create = def => {

	const options = def.options;
	const wstartx = typeof options.wstartx === 'undefined' ? 0 : options.wstartx;
	const wstarty = typeof options.wstarty === 'undefined' ? 0 : options.wstarty;
	const wsize = typeof options.wsize === 'undefined' ? InputProps.dim : options.wsize;

	const state = {
		index: 0,
		wstartx,
		wstarty,
		wsize,
		digitsCanvas: CanvasHelpers.createCanvas(InputProps.dim * InputProps.inputsPerRow, InputProps.dim * InputProps.rows),
		singleDigitCanvas: CanvasHelpers.createCanvas(InputProps.dim, InputProps.dim),
		transformCanvas: CanvasHelpers.createCanvas(InputProps.dim, InputProps.dim),
		output: Tensor.create(wsize, wsize),
		outputLabel: 0
	};

	const layer = Object.assign({},
		LayerBehaviours(state),
		OmniglotBehaviours(state));

	// load the png before completing
	return new Promise(function(resolve, reject) {
		const inputImg = new Image();
		inputImg.src = InputProps.imageFile;
		inputImg.onload = () => {
			state.digitsCanvas.ctx.drawImage(inputImg, 0, 0);
			//CanvasHelpers.stretchVals(state.digitsCanvas.ctx);
			resolve(this.response);
		}
	}).then(buffers => {
		return layer;
	});
};