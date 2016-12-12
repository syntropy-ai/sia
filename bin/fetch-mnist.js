#!/usr/bin/env node

const request = require('request');
const fs = require('fs');
const zlib = require('zlib');

// utils
var mkdirSync = function(path) {
	try {
		fs.mkdirSync(path);
	} catch(e) {
		if ( e.code != 'EEXIST' ) throw e;
	}
}

// make directory if it doesn't exist
const MNIST_dir = './input_data/mnist';
mkdirSync('./input_data');
mkdirSync(MNIST_dir);

// download and unzip
console.log('Downloading...');
let downloads = [];
const files = [
	{ name: 'images_train', url: 'http://yann.lecun.com/exdb/mnist/train-images-idx3-ubyte.gz' },
	{ name: 'labels_train', url: 'http://yann.lecun.com/exdb/mnist/train-labels-idx1-ubyte.gz' },
	{ name: 'images_test', url: 'http://yann.lecun.com/exdb/mnist/t10k-images-idx3-ubyte.gz' },
	{ name: 'labels_test', url: 'http://yann.lecun.com/exdb/mnist/t10k-labels-idx1-ubyte.gz' }
];
files.forEach(f => {
	downloads.push(new Promise((resolve, reject) => {
		let stream = request(f.url).pipe(zlib.createGunzip()).pipe(fs.createWriteStream(MNIST_dir + '/' + f.name));
		stream.on('finish', () => resolve());
	}));
});

// done
Promise.all(downloads).then(values => {
	console.log('Done');
}, reason => {
	console.log('Failure: ', reason);
});