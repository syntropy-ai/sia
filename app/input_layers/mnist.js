
var LayerBehaviours = require('../layer'),
	Tensor = require('../tensor'),
	CanvasHelpers = require('../utils/canvas_helpers'),
	Rand = require('../utils/rand'),
	FileHelpers = require('../utils/file_helpers');

const MNISTProps = {
	dim: 28,
	size: 28 * 28,
	totalImages: 60000,
	imageOffset: 16,
	labelOffset: 8,
	imageFile: './input_data/mnist/images_train',
	labelFile: './input_data/mnist/labels_train'
};

const MNISTBehaviours = state => ({

	getLabel() {
		return state.outputLabel;
	},

	// run the layer, setting the output to the next digit episode
	run(gIteration) {

		const { output, digitCanvas, transformCanvas, 
			images, labels, translateRange, 
			inputsPerEpisode, maxDigits 
		} = state;

		const frame = gIteration % inputsPerEpisode;
		const index = Math.floor(gIteration / inputsPerEpisode) % (maxDigits || MNISTProps.totalImages);
		state.outputLabel = labels[index];

		// write digit to digit canvas
		const size = MNISTProps.size;
		const memSize = Uint8Array.BYTES_PER_ELEMENT * size;
		// creation here is fast because it is simply windowing the already created buffer
		const digitData = new Uint8Array(images.buffer, memSize * index, memSize);
		digitCanvas.paintGreyscale(digitData, 0);

		// TODO: calculate transforms if episodes are used
		let xStart = 0, yStart = 0;
		if(translateRange){
			xStart = Rand.between(-translateRange, translateRange);
			yStart = Rand.between(-translateRange, translateRange);
		}

		// perform the transform and write the output data
		transformCanvas.clear();
		transformCanvas.save();
		transformCanvas.transform(1, 0, 0, 1, xStart, yStart);

		// draw the digit on the transform canvas
		transformCanvas.draw(digitCanvas);

		// get a new image data
		const imgData = transformCanvas.getImageData();

		// write the layer output
		const raw = output.item(0);
		const d = imgData.data;
		for(let i=0; i<size; i++){
			raw[i] = d[i * 4] / 255; // *4 to get the red value of the pixel
		}
		
		transformCanvas.restore();
	}

});

module.exports.create = def => {

	const options = def.options || {};

	options.wsize = options.wsize || 28;
	options.wstartx = options.wstartx || 0;
	options.wstarty = options.wstarty || 0;

	const state = {
		inputsPerEpisode: options.inputsPerEpisode || 1,
		digitCanvas: CanvasHelpers.createCanvas(MNISTProps.dim, MNISTProps.dim),
		transformCanvas: CanvasHelpers.createCanvas(MNISTProps.dim, MNISTProps.dim),
		output: Tensor.create(options.wsize, options.wsize),
		maxDigits: options.maxDigits,
		wsize: options.wsize,
		wstartx: options.wstartx,
		wstarty: options.wstarty,
		translateRange: options.translateRange
	};

	const layer = Object.assign({},
		LayerBehaviours(state),
		MNISTBehaviours(state));

	// load the mnist images before completing
	return Promise.all([
		FileHelpers.loadBinary(MNISTProps.imageFile),
		FileHelpers.loadBinary(MNISTProps.labelFile)
	]).then(buffers => {
		state.images = new Uint8Array(buffers[0].slice(MNISTProps.imageOffset));
		state.labels = new Uint8Array(buffers[1].slice(MNISTProps.labelOffset));

		return layer;
	});
};