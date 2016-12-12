/***
	Filters that work on image datas (canvas)
***/

const proto = ImageData.prototype;

/***
Compress an image data down to greyscale floats
***/
if(!proto.compress) {
	proto.compress = function() {
		var d = this.data;
		var output = new Float64Array(d.length / 4);
		for(var i=0, len=output.length; i<len; ++i){
			var p = i*4;
			output[i] = ((d[p] + d[p+1] + d[p+2]) / 3) / 255;
		}
		return output;
	};
}
