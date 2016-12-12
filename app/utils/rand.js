
// singleton deterministic random object

const DEFAULT_SEED = 0x2F6E2B1;

const RandBehaviours = state => ({

	reset(seed) { state.seed = seed; },

	rand() {
		let seed = state.seed;
		// Robert Jenkins’ 32 bit integer hash function
		seed = ((seed + 0x7ED55D16) + (seed << 12))  & 0xFFFFFFFF;
		seed = ((seed ^ 0xC761C23C) ^ (seed >>> 19)) & 0xFFFFFFFF;
		seed = ((seed + 0x165667B1) + (seed << 5))   & 0xFFFFFFFF;
		seed = ((seed + 0xD3A2646C) ^ (seed << 9))   & 0xFFFFFFFF;
		seed = ((seed + 0xFD7046C5) + (seed << 3))   & 0xFFFFFFFF;
		seed = ((seed ^ 0xB55A4F09) ^ (seed >>> 16)) & 0xFFFFFFFF;
		state.seed = seed;
		return (seed & 0xFFFFFFF) / 0x10000000;
	},

	between(min, max) { return this.rand() * (max - min) + min; },
	betweenInt(min, max) { return Math.floor(this.rand() * (max - min)) + min; },

	gaussian(min, max) {
		var rand = 0;

		for(var i=0; i<6; i+=1){
			rand += this.between(min, max);
		}

		return rand / 6;
	}

});


module.exports = (seed => {

	const state = {
		seed: seed
	};

	return Object.assign({}, RandBehaviours(state));

})(DEFAULT_SEED);
