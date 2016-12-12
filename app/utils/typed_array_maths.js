
// TypedArray overrides for adding useful array maths
// Non functional due to performance requirements

// cannot directly acces TypedArray.prototype;
const proto = Float64Array.prototype;

/***
Calculate the sum
***/
if(!proto.sum) {
	proto.sum = function() {
		var sum = 0;
		for(var i=0, len=this.length; i<len; ++i){
			sum += this[i];
		}
		return sum;
	};
}

/***
Calculate the inner dot product given a comparer array
***/
if(!proto.dot) {
	proto.dot = function(comparer) {
		var dot = 0;
		for(var i=0, len=this.length; i<len; ++i){
			dot += this[i] * comparer[i];
		}
		return dot;
	};
}

/***
Calculate the euclidean distance from another point
***/
if(!proto.distance) {
	proto.distance = function(comparer, root = false) {
		var dist = 0;
		for(var i=0, len=this.length; i<len; ++i){
			dist += Math.pow(this[i] - comparer[i], 2);
		}
		return root ? Math.sqrt(dist) : dist;	
	};
}

/***
Add all values in target array to this array
***/
if(!proto.add) {
	proto.add = function(arr) {
		for(var i=0, len=arr.length; i<len; ++i){
			this[i] += arr[i];
		}
		return this;
	};
}

/***
Subtract all values in target array, but don't go below zero
***/
if(!proto.subtract) {
	proto.subtract = function(arr) {
		if(arr.length){
			for(var i=0, len=this.length; i<len; ++i){
				this[i] -= Math.min(this[i], arr[i]);
			}	
		}else{
			for(var i=0, len=this.length; i<len; ++i){
				this[i] -= arr;
			}
		}
		return this;
	};
}

/***
Divide all values in the target array
***/
if(!proto.divide) {
	proto.divide = function(val){
		for(var i=0, len=this.length; i<len; ++i){
			this[i] /= val;
		}
		return this;
	};
}

/***
Scale all values in array by some scalar
***/
if(!proto.scale) {
	proto.scale = function(val) {
		for(var i=0, len=this.length; i<len; ++i){
			this[i] *= val;
		}
		return this;
	};	
}

/***
Normalise all values in the array to a target total energy
***/
if(!proto.normalise) {
	proto.normalise = function(energy = 1) {
		var square = 0;
		var len = this.length;

		for(var i=0; i<len; ++i) {
			square += this[i] * this[i];
		}

		var mag = Math.sqrt(square) / energy;
		if(mag !== 0){
			for(var j=0; j<len; ++j){
				this[j] /= mag;
			}
		}
		return this;
	};
}

/***
Rectify the values, which essentially removes negatives (to zero)
***/
if(!proto.rectify) {
	proto.rectify = function() {
		for(var i=0, len=this.length; i<len; ++i){
			this[i] = Math.max(0, this[i]);
		}
		return this;
	};
}

/***
Find the smallest value in the array
***/
if(!proto.min) {
	proto.min = function() {
		var min = Number.MAX_VALUE;
		for(var i=0, len=this.length; i<len; ++i){
			if(this[i] < min){
				min = this[i];
			}
		}
		return min;
	};
}

/***
Find the largest value in the array
***/
if(!proto.max) {
	proto.max = function() {
		var max = -Number.MAX_VALUE;
		for(var i=0, len=this.length; i<len; ++i){
			if(this[i] > max){
				max = this[i];
			}
		}
		return max;
	};
}

/***
Find the index of the item with the lowest value in the array
***/
if(!proto.minIndex) {
	proto.minIndex = function() {
		var min = Number.MAX_VALUE, minIndex = 0;		
		for(var i=0, len=this.length; i<len; ++i){
			if(this[i] < min){
				min = this[i];
				minIndex = i;
			}
		}
		return minIndex;
	};
}

/***
Find the index of the item with the highest value in the array
***/
if(!proto.maxIndex) {
	proto.maxIndex = function() {
		var max = -Number.MAX_VALUE, maxIndex = 0;		
		for(var i=0, len=this.length; i<len; ++i){
			if(this[i] > max){
				max = this[i];
				maxIndex = i;
			}
		}
		return maxIndex;
	};
}

/***
Find the mean of the array
***/
if(!proto.mean) {
	proto.mean = function() {
		var m = 0;
		for(var i=0, len=this.length; i<len; ++i){
			m += this[i];
		}
		return m / this.length;
	};
}

/***
Calculate the std deviation of the array
***/
if(!proto.std) {
	proto.std = function(mean) {
		// allow mean to be provided if precalculated
		if(!mean){
			mean = this.mean();
		}
		var sum = 0;
		for(var i=0, len=this.length; i<len; ++i){
			sum += (this[i] - mean) * (this[i] - mean);
		}
		return Math.sqrt(sum / this.length);
	};
}

/***
Run a convolution 3x3 filter over the array given dimensional width
***/
if(!proto.convolve) {
	proto.convolve = function(w, h, filter) {
		// create a temporary copy
		var copy = new Float64Array(this.length);
		copy.set(this);

		const side = 3,
			halfSide = Math.floor(side / 2);

		// step through each pixel
		for(var y=0; y<h; ++y){
			for(var x=0; x<w; ++x){

				var intensity = 0;

				// step through each filter position
				for(var fy=0; fy<side; ++fy){
					for(var fx=0; fx<side; ++fx){

						// get the related pixel positions
						var xRel = x - halfSide + fx;
						var yRel = y - halfSide + fy;

						// make sure related pixel is actually on image
						if(xRel >= 0 && xRel < w && yRel >=0 && yRel < h){
							var filterPixel = yRel * w + xRel;
							var weight = filter[fy * side + fx];
							intensity += copy[filterPixel] * weight;
						}
					}
				}

				this[y*w + x] = intensity;
			}
		}
		return this;
	};
}

/***
Return a new array that is a convolution of the current array
given the width, height, and width of current array
***/
if(!proto.convolution) {
	proto.convolution = function(w, cx, cy, cw, ch) {
		const output = new Float64Array(cw * ch);
		for(var y=0; y<ch; ++y){
			var yOff = (y + cy) * w;
			for(var x=0; x<cw; ++x){
				output[y*ch + x] = this[yOff + (x + cx)];
			}
		}
		return output;
	};
}

