// Input layer for loading natural image patches from png file set
const _ = require('lodash'),
	fs = require('fs'),
	LayerBehaviours = require('../layer'),
	Tensor = require('../tensor'),
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

	// read all 10 images into memory
	const folder = './input_data/whitened_patches/'
	return Promise.all(_.range(0, 10).map(i => {
		const buff = fs.readFileSync(`${folder}${i}.png`)
		return imageHelpers.loadPNG(buff)
  }))
	.then(imgDatas => imgDatas.map(({ data }) => {
		var output = new Float64Array(data.length / 4)
		for(var i=0, len=output.length; i<len; ++i){
			var p = i*4
			output[i] = data[p] / 255
		}
		return output
	}))
	.then(greyImages => {
		// convert the image data into patches
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
	})
}
