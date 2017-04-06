#!/usr/bin/env node

const request = require('request');
const fs = require('fs');
const unzipper = require('unzipper');

// utils
var mkdirSync = function(path) {
	try {
		fs.mkdirSync(path);
	} catch(e) {
		if ( e.code != 'EEXIST' ) throw e;
	}
}

// make directory if it doesn't exist
const file_dir = './input_data/whitened_patches';
mkdirSync('./input_data');
mkdirSync(file_dir);

// download and unzip
console.log('Downloading...');
const file = {
    name: 'whitened_patches.zip',
    url: 'https://s3-ap-southeast-2.amazonaws.com/syntropy.xyz/whitened_patches.zip'
}

let download = new Promise((resolve, reject) => {
    let stream = request(file.url).pipe(fs.createWriteStream(file_dir + '/' + file.name));
    stream.on('finish', () => resolve());
});

download.then(() => {
    console.log('Finished Downloading');
    console.log('Extracting...');
    fs.createReadStream(file_dir + '/' + file.name)
        .pipe(unzipper.Extract({ path: file_dir }));
    console.log('Done');
}).catch(err => {
    console.log(err);
    console.log(`There was an error. Try downloading manually from ${file.url} and then unzipping into ${file_dir}`);
});