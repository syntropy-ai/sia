
// render for tensor data type

const CanvasHelpers = require('../utils/canvas_helpers');

const TensorRendererBehaviours = state => ({

	render(iter, force = false) {
		if(force || iter % state.framesPerRender === 0){
			state.canvases.forEach(c => {
				if(state.hideBlanks && c.data.sum() === 0) {
					c.canvas.domNode.style.display = 'none';
				} else {
					c.canvas.domNode.style.display = 'inline-block';
					c.draw()
				}
			});
			return true;
		}
		return false;
	},

	clear(iter, force = false) {
		if(force || iter % state.framesPerRender === 0){
			state.canvases.forEach(c => c.clear());
		}
	}

});

module.exports.create = (tensor, domParent, options = {}) => {

	const state = {
		canvases: [],
		hideBlanks: options.hideBlanks || false,
		framesPerRender: options.framesPerRender || 100,
	};

	const { x, y, totalItems } = tensor.dims();

	for(let i=0; i<totalItems; i++){
		let c = CanvasHelpers.createDataCanvas(x, y, tensor.item(i), options);
		state.canvases.push(c);

		let parent = document.createElement('div');
		parent.className = 'canvas-wrap';
		if(typeof options.itemInfoFunc !== 'undefined' && options.itemInfoFunc !== null) {
			parent.dataset.index = i;
			parent.dataset.func = options.itemInfoFunc;
		}

		parent.appendChild(c.canvas.domNode);
		domParent.appendChild(parent);
	}

	return Object.assign({}, 
		TensorRendererBehaviours(state));
};