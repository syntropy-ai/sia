
/***
Renderer for drawing 2d points on a canvas.
If a second tensor is added, this is drawn as a topological mesh overlay.
***/

const Tensor = require('../tensor');

// Colour helpers
var CSS_COLOR_NAMES = ["Black","Blue","BlueViolet","Brown","BurlyWood","CadetBlue","Chartreuse","CornflowerBlue","Crimson","DarkCyan","DarkGoldenRod","DarkGreen","DarkKhaki","DarkMagenta","DarkOliveGreen","Darkorange","DarkOrchid","DarkRed","DarkSalmon","DarkSeaGreen","DarkSlateBlue","DarkSlateGray","DarkSlateGrey","DarkTurquoise","DarkViolet","DeepPink","DeepSkyBlue","DodgerBlue","FireBrick","ForestGreen","Fuchsia","Gainsboro","GhostWhite","Gold","GoldenRod","Gray","Grey","Green","GreenYellow","HoneyDew","HotPink","IndianRed","Indigo","Ivory","Khaki","Lavender","LavenderBlush","LawnGreen","LemonChiffon","LightBlue","LightCoral","LightCyan","LightGoldenRodYellow","LightGray","LightGrey","LightGreen","LightPink","LightSalmon","LightSeaGreen","LightSkyBlue","LightSlateGray","LightSlateGrey","LightSteelBlue","LightYellow","Lime","LimeGreen","Linen","Magenta","Maroon","MediumAquaMarine","MediumBlue","MediumOrchid","MediumPurple","MediumSeaGreen","MediumSlateBlue","MediumSpringGreen","MediumTurquoise","MediumVioletRed","MidnightBlue","MintCream","MistyRose","Moccasin","NavajoWhite","Navy","OldLace","Olive","OliveDrab","Orange","OrangeRed","Orchid","PaleGoldenRod","PaleGreen","PaleTurquoise","PaleVioletRed","PapayaWhip","PeachPuff","Peru","Pink","Plum","PowderBlue","Purple","Red","RosyBrown","RoyalBlue","SaddleBrown","Salmon","SandyBrown","SeaGreen","SeaShell","Sienna","Silver","SkyBlue","SlateBlue","SlateGray","SlateGrey","Snow","SpringGreen","SteelBlue","Tan","Teal","Thistle","Tomato","Turquoise","Violet","Wheat","White","WhiteSmoke","Yellow","YellowGreen"];
function getColor(index){
	index %= CSS_COLOR_NAMES.length;
	return CSS_COLOR_NAMES[index];
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
				this.drawPoint(p[0] * state.width, p[1] * state.height, 3, '#ff0000');
			}

			// draw the mesh
			
		}
	},

	addDataPoint(iter) {
		if(state.lastIteration !== iter){
			state.dataPoints.item(state.dataPointPos % state.maxDataPoints)
							.set(state.tensors.item(0));
			state.dataPointPos++;
			state.lastIteration = iter;
		}
	},

	drawPoint(x, y, size = 1, colour = '#aaa') {
		state.ctx.fillStyle = colour;
		state.ctx.fillRect(x, y, size, size);
	},

	drawLine(aX, aY, bX, bY, colour = 'black') {
		const ctx = state.ctx;
		ctx.beginPath();
		ctx.moveTo(aX, aY);
		ctx.lineTo(bX, bY);
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
		dataPoints: Tensor.create(2, 1, maxDataPoints)
	};

	state.canvas.width = state.width;
	state.canvas.height = state.height;

	domParent.appendChild(canvas);

	return Object.assign({},
		Mesh2dBehaviours(state));
};