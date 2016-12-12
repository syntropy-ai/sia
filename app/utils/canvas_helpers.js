
// helper functions and objects for dealing with canvases

// canvas behaviours
const CanvasBehaviours = state => ({

	paintGreyscale(data, colour = 0, min = 0, range = 255) {

		const { domNode, ctx, imageData, width, height } = state;

		const d = imageData.data;
		const size = width * height;

		for(var i=0; i<size; i++){
			const pLoc = i * 4;
			const intensity = ((data[i] - min) / range) * 255;
			d[pLoc] = d[pLoc + 1] = d[pLoc + 2] = 0;
			d[pLoc + colour] = intensity;
			d[pLoc + 3] = 255;
		}
		ctx.putImageData(imageData, 0, 0);
	},

	draw(canvas) {
		// handle different types of drawImage functions
		let args = [...arguments].slice(1);
		if(args.length > 0){
			args.unshift(canvas.domNode);
			state.ctx.drawImage.apply(state.ctx, args);
		}else{
			state.ctx.drawImage(canvas.domNode, 0, 0);
		}		
	},

	transform(scaleX, skewX, skewY, scaleY, translateX, translateY) {
		state.ctx.transform(scaleX, skewX, skewY, scaleY, translateX, translateY);
	},

	clear() {
		state.ctx.fillRect(0, 0, state.width, state.height);
	},

	save() {
		state.ctx.save();
	},

	restore() {
		state.ctx.restore();
	},

	getImageData() {
		return state.ctx.getImageData(0, 0, state.width, state.height);
	}

});

// create a basic canvas
module.exports.createCanvas = (width, height) => {

	const c = document.createElement('canvas'),
		  ctx = c.getContext('2d');

	c.width = width;
	c.height = height;

	const state = {
		width,
		height,
		domNode: c,
		ctx: ctx,
		imageData: ctx.getImageData(0, 0, width, height)		
	};

	return Object.assign(state, CanvasBehaviours(state));
};

const DataCanvasBehaviours = state => ({

	draw() {

		const { data, canvas, tempCanvas, colour,
			x, y, zoom
		} = state;

		// calculate data drawing range
		let lowest = state.range[0];
		let range = state.range[1] - lowest;

		if(state.options.rectify){
			lowest = 0;
			range = data.max();
		}else if(!state.options.noscale){
			lowest = data.min();
			range = data.max() - lowest;
		}

		canvas.paintGreyscale(data, colour, lowest, range);

		// take care of zooming / pixelation
		tempCanvas.draw(canvas);

		const targetWidth = x * zoom;
		const targetHeight = y * zoom;

		canvas.domNode.width = targetWidth;
		canvas.domNode.height = targetHeight;

		canvas.ctx.imageSmoothingEnabled = false;
		canvas.ctx.mozImageSmoothingEnabled = false;

		canvas.draw(tempCanvas, 0, 0, x, y, 0, 0, targetWidth, targetHeight);
	},

	clear(){
		state.canvas.ctx.fillRect(0, 0, state.x, state.y);
	},

	domNode() {
		return state.canvas.c;
	}

});

// create a data canvas that can draw the data when necessary
module.exports.createDataCanvas = (x, y, data, options = {}) => {

	const colours = {
		RED: 0,
		GREEN: 1,
		BLUE: 2
	};

	const state = {
		x,
		y,
		data,
		options,
		totalPixels: x * y,
		zoom: options.zoom || 1,
		canvas: module.exports.createCanvas(x, y),
		tempCanvas: module.exports.createCanvas(x, y),
		range: options.range || [0, 1],
		colour: options.colour ? colours[options.colour] : colours.GREEN
	};

	return Object.assign(state,
		DataCanvasBehaviours(state));
};