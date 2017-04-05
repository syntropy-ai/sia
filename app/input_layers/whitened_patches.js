// Input layer for loading natural image patches from png file set
const _ = require('lodash'),
	fs = require('fs'),
	LayerBehaviours = require('../layer'),
	Tensor = require('../tensor'),
	FileHelpers = require('../utils/file_helpers'),
	imageHelpers = require('../utils/image_helpers')

const PatchesBehaviours = state => ({
	run(gIteration) {
		const index = gIteration % state.patches.items().length
		state.output.item(0).set(state.patches.item(index))
	}
})

module.exports.create = ({ options }) => {

	const inset = 2,
		imageDim = 512,
		imageSize = imageDim * imageDim,
		totalImages = 10

	const patchDim = options.patchDim || 16,
		patchesWide = Math.floor((imageDim - (inset * 2)) / patchDim),
		patchesPerImage = patchesWide * patchesWide

	const state = {
		patches: Tensor.create(patchDim, patchDim, totalImages * patchesPerImage),
		output: Tensor.create(patchDim, patchDim, 1)
	}

	// read all images into memory
	const folder = './input_data/whitened_patches'
	const imageBlock = FileHelpers.loadBuffer(`${folder}/whitened_patches.bin`)

	// create the typed image blocks
	const greyImages = new Array(totalImages)
	for(var i=0; i<totalImages; i++){
		greyImages[i] = new Float64Array(imageBlock, Float64Array.BYTES_PER_ELEMENT * imageSize, imageSize)
	}

	// convert the data into image patches
	for(var y=0; y<patchesWide; y++){
		for(var x=0; x<patchesWide; x++){
			for(var i=0; i<totalImages; i++){
				const patch = state.patches.item((i * patchesPerImage) + (y * patchesWide + x))
				patch.set(greyImages[i].convolution(imageDim, x*patchDim + inset, y*patchDim + inset, patchDim, patchDim))
			}
		}
	}

	return Object.assign({},
		LayerBehaviours(state),
		PatchesBehaviours(state))
}
