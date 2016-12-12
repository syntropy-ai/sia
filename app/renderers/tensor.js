
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

	function buildDataCanvas(data, index, dParent) {
		const c = CanvasHelpers.createDataCanvas(x, y, data, options);
		state.canvases.push(c);

		const parent = document.createElement('div');
		parent.className = 'canvas-wrap';
		if(typeof options.itemInfoFunc !== 'undefined' && options.itemInfoFunc !== null) {
			parent.dataset.index = index;
			parent.dataset.func = options.itemInfoFunc;
		}

		parent.appendChild(c.canvas.domNode);
		dParent.appendChild(parent);
	}

	if(options.rowMax){
		let rowParent;
		tensor.items().forEach((d, i) => {
			if(i % options.rowMax === 0){
				rowParent = document.createElement('div');
				rowParent.className = 'row-wrap';
				domParent.appendChild(rowParent);
			}
			buildDataCanvas(d, i, rowParent);
		});
	}else{
		tensor.items().forEach((d, i) => buildDataCanvas(d, i, domParent));
	}

	return Object.assign({}, 
		TensorRendererBehaviours(state));
};