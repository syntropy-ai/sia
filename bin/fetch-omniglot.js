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
const Omniglot_dir = './input_data/omniglot';
mkdirSync('./input_data');
mkdirSync(Omniglot_dir);

// download and unzip
console.log('Downloading...');
let downloads = [];
const files = [
	{ name: 'images_background.json', url: 'https://raw.githubusercontent.com/GusRuss89/omniglot-data-preprocessor/master/output/images_background.json' },
	{ name: 'images_background.png', url: 'https://raw.githubusercontent.com/GusRuss89/omniglot-data-preprocessor/master/output/images_background.png' },
	{ name: 'images_evaluation.json', url: 'https://raw.githubusercontent.com/GusRuss89/omniglot-data-preprocessor/master/output/images_evaluation.json' },
	{ name: 'images_evaluation.png', url: 'https://raw.githubusercontent.com/GusRuss89/omniglot-data-preprocessor/master/output/images_evaluation.png' }
];
files.forEach(f => {
	downloads.push(new Promise((resolve, reject) => {
		let stream = request(f.url).pipe(fs.createWriteStream(Omniglot_dir + '/' + f.name));
		stream.on('finish', () => resolve());
	}));
});

// done
Promise.all(downloads).then(values => {
	console.log('Done');
}, reason => {
	console.log('Failure: ', reason);
});