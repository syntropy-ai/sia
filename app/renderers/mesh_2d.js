
/***
Renderer for drawing 2d points on a canvas.
If a second tensor is added, this is drawn as a topological mesh overlay.
***/

const Tensor = require('../tensor');

// Colour helpers
var CSS_COLOR_NAMES = ["Black","Blue","BlueViolet","Brown","BurlyWood","CadetBlue","Chartreuse","CornflowerBlue","Crimson","DarkCyan","DarkGoldenRod","DarkGreen","DarkKhaki","DarkMagenta","DarkOliveGreen","Darkorange","DarkOrchid","DarkRed","DarkSalmon","DarkSeaGreen","DarkSlateBlue","DarkSlateGray","DarkSlateGrey","DarkTurquoise","DarkViolet","DeepPink","DeepSkyBlue","DodgerBlue","FireBrick","ForestGreen","Fuchsia","Gainsboro","GhostWhite","Gold","GoldenRod","Gray","Grey","Green","GreenYellow","HoneyDew","HotPink","IndianRed","Indigo","Ivory","Khaki","Lavender","LavenderBlush","LawnGreen","LemonChiffon","LightBlue","LightCoral","LightCyan","LightGoldenRodYellow","LightGray","LightGrey","LightGreen","LightPink","LightSalmon","LightSeaGreen","LightSkyBlue","LightSlateGray","LightSlateGrey","LightSteelBlue","LightYellow","Lime","LimeGreen","Linen","Magenta","Maroon","MediumAquaMarine","MediumBlue","MediumOrchid","MediumPurple","MediumSeaGreen","MediumSlateBlue","MediumSpringGreen","MediumTurquoise","MediumVioletRed","MidnightBlue","MintCream","MistyRose","Moccasin","NavajoWhite","Navy","OldLace","Olive","OliveDrab","Orange","OrangeRed","Orchid","PaleGoldenRod","PaleGreen","PaleTurquoise","PaleVioletRed","PapayaWhip","PeachPuff","Peru","Pink","Plum","PowderBlue","Purple","Red","RosyBrown","RoyalBlue","SaddleBrown","Salmon","SandyBrown","SeaGreen","SeaShell","Sienna","Silver","SkyBlue","SlateBlue","SlateGray","SlateGrey","Snow","SpringGreen","SteelBlue","Tan","Teal","Thistle","Tomato","Turquoise","Violet","Wheat","White","WhiteSmoke","Yellow","YellowGreen"];
/*function getColor(index, width){
	index %= CSS_COLOR_NAMES.length;
	return CSS_COLOR_NAMES[index];
}*/
function getColour(x, y, width, height){
	var xAmt = x / width * 255;
	var yAmt = y / width * 255;
	return 'rgba(127,' + xAmt + ',' + yAmt + ',1.0)';
}

const Mesh2dBehaviours = state => ({

	render(iter, force = false) {

		// add the data point if necessary
		this.addDataPoint(iter);

		if(force || iter % state.framesPerRender === 0){	
			// clear the canvas
			this.clear();
			
			// draw the data points
			const totalPoints = Math.min(state.dataPointPos, state.dataPoints.items().length);
			for(var i=0; i<totalPoints; i++){
				var p = state.dataPoints.item(i);
				this.drawPoint(p[0], p[1], 3);
			}

			// draw the mesh
			const mesh = state.tensors[1];
			if(mesh){
				const items = mesh.items();
				const mWidth = state.meshRowSize;
				const mHeight = items.length / mWidth;

				for(var y=0; y<mHeight; y++){
					for(var x=0; x<mWidth; x++){
						var index = y * mWidth + x;
						var colour = getColour(x, y, mWidth, mHeight);
						var p = items[index];
						this.drawPoint(p[0], p[1], 5, colour);

						// draw edges
						/*var edgeSet = state.edges[index]
						for(var i=0; i<edgeSet.length; i++){
							var neighbour = items[edgeSet[i]];
							this.drawLine(p[0], p[1], neighbour[0], neighbour[1], colour);
						}*/
					}
				}
			}
		}
	},

	addDataPoint(iter) {
		if(state.lastIteration !== iter){
			state.dataPoints.item(state.dataPointPos % state.maxDataPoints)
							.set(state.tensors[0].item(0));
			state.dataPointPos++;
			state.lastIteration = iter;
		}
	},

	drawPoint(x, y, size = 1, colour = '#aaa') {
		state.ctx.fillStyle = colour;
		state.ctx.fillRect(x * state.width, y * state.height, size, size);
	},

	drawLine(aX, aY, bX, bY, colour = 'black') {
		const ctx = state.ctx;
		ctx.beginPath();
		ctx.moveTo(aX * state.width, aY * state.height);
		ctx.lineTo(bX * state.width, bY * state.height);
		ctx.strokeStyle = colour;
		ctx.stroke();		
	},

	clear() {
		state.ctx.clearRect(0, 0, state.width, state.height);
	}
});

module.exports.create = (tensors, domParent, options = {}) => {

	const canvas = document.createElement('canvas');
	canvas.style.backgroundColor = '#dadada';
	canvas.style.padding = '20px';
	const ctx = canvas.getContext('2d');

	const maxDataPoints = options.maxDataPoints || 100;

	// cater to no second tensor
	if(!tensors.length){
		tensors = [tensors];
	}

	const state = {
		canvas,
		ctx,
		maxDataPoints,
		tensors,
		framesPerRender: maxDataPoints,
		width: options.width || 500,
		height: options.height || 500,
		lastIteration: -1,
		dataPointPos: 0,
		dataPoints: Tensor.create(2, 1, maxDataPoints),
		meshRowSize: options.meshRowSize
	};

	state.canvas.width = state.width;
	state.canvas.height = state.height;

	domParent.appendChild(canvas);

	// build the cached edge set for mesh rendering
	/*if(tensors.length > 1){
		state.edges = [];
		const width = state.meshRowSize;
		const height = tensors[1].items().length / width;
		tensors[1].items().forEach((d, i) => {
			var x = i % width;
			var y = Math.floor(i / width);
			var e = [];
			for(var a=x;a<=x+1;a++){
				for(var b=y; b<=y+1; b++){
					if(!(a === x && b === y) && a >= 0 && b >= 0 && a < width && b < height){
						e.push(b * width + a);
					}
				}
			}
			state.edges.push(e);
		});
	}*/
	
	return Object.assign({},
		Mesh2dBehaviours(state));
};