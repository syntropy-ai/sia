
// some helpers for logging arrays and things

module.exports.joinRound = (arr, decs = 2, delim = ', ') => {
	let output = arr[0].toFixed(decs);
	for(let i=1; i<arr.length; i++){
		output += delim + arr[i].toFixed(decs);
	}
	return output;
};