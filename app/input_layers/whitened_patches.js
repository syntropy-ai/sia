
// Input layer for loading natural image patches from txt file

const LayerBehaviours = require('../layer'),
	Tensor = require('../tensor'),
	fs = require('fs');

const PatchesBehaviours = state => ({

	run(gIteration) {
		var index = gIteration % state.patches.items().length;
		state.output.item(0).set(state.patches.item(index));
	}
});

module.exports.create = def => {

	const options = def.options || {};

	// number of pixels to discard around the image border
	const inset = 2;
	const imageDim = 512;
	const imageSize = imageDim * imageDim;
	const totalImages = 10;

	const patchDim = options.patchDim || 16;
	const patchesWide = Math.floor((imageDim - (inset * 2)) / patchDim);

	let data = fs.readFileSync('./input_data/whitened_patches/patches.txt', 'utf8');
	data = JSON.parse('[' + data + ']');

	const state = {
		patches: Tensor.create(patchDim, patchDim, totalImages * patchesWide * patchesWide),
		output: Tensor.create(patchDim, patchDim, 1)
	};

	// split into 10 images
	const images = new Array(totalImages);
	for(var i=0; i<totalImages; i++){
		images[i] = new Float64Array(imageSize);
		images[i].set(data.slice(i * imageSize, (i + 1) * imageSize));	
	}

	// construct the patches
	const totalPerImage = patchesWide * patchesWide;

	for(var y=0; y<patchesWide; y++){
		for(var x=0; x<patchesWide; x++){
			for(var i=0; i<totalImages; i++){
				const patch = state.patches.item((i * totalPerImage) + (y * patchesWide + x));
				patch.set(images[i].convolution(imageDim, x*patchDim + inset, y*patchDim + inset, patchDim, patchDim));
			}
		}
	}

	return Object.assign({},
		LayerBehaviours(state),
		PatchesBehaviours(state));
};