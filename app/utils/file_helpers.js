
// helper for loading binary files

const fs = require('fs'),
	path = require('path');

// loads a binary file via url, returning a promise that resolves upon completion
module.exports.loadBinary = url => new Promise((resolve, reject) => {

	const oReq = new XMLHttpRequest();
	oReq.open('GET', url, true);
	oReq.responseType = 'arraybuffer';

	oReq.onload = (oEvent) => resolve(oReq.response);
	oReq.onerror = (oError) => reject(oError);

	oReq.send(null);
});

function toBuffer(ab) {
    var buffer = new Buffer(ab.byteLength);
    var view = new Uint8Array(ab.buffer);
    for (var i = 0; i < buffer.length; ++i) {
        buffer[i] = view[i];
    }
    return buffer;
}

function folderExists(folder){
	try{
		return fs.statSync(folder).isDirectory();
	}catch(err){
		return false;
	}
}

module.exports.saveBuffer = function(filename, buffer) {
	console.log('Saving buffer:', filename);
	let b = toBuffer(buffer);

	// make sure folder exists
	const folder = path.dirname(filename);
	if(!folderExists(folder)){
		fs.mkdirSync(folder);
	}

	fs.writeFileSync(filename, b, 'binary');
	console.log('Saving complete.');
}

function toArrayBuffer(buffer) {
    var ab = new ArrayBuffer(buffer.length);
    var view = new Uint8Array(ab);
    for (var i = 0; i < buffer.length; ++i) {
        view[i] = buffer[i];
    }
    return ab;
}

module.exports.loadBuffer = function(filename){
	console.log('Loading Buffer:', filename);
	try{
		let data = toArrayBuffer(fs.readFileSync(filename));
		console.log('Loading complete.');
		return data;	
	}catch(e){
		return null;
	}	
};