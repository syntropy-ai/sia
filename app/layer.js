
// common behaviours for all layers

module.exports = state => ({

	run() {
		console.error('Layer does not have a run() function implemented');
	},

	postCreate(network) {
		// dummy overridable function that is called on each layer
		// after the network has completed the creation process
	},

	getOutput() {
		return state.output;
	},

	save() {
		// no default behaviour at the moment
	},

	load() {
		// no default behaviour at the moment
	},

	// called after processing the layer if layer flagged to log
	log() {
		// no default behaviour at the moment
	}

});