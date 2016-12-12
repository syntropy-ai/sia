
// network behaviours

const NetworkBehaviours = state => ({

	run(globalIteration) {
		let stop = false;
		state.layers.forEach(layer => {
			const result = layer.obj.run(globalIteration);
			if(layer.options.log){
				layer.obj.log(globalIteration);
			}
			if(result === false){
				stop = true;
			}
		});
		return stop;
	},

	getLayer(id) {
		return state.layerLookup[id];
	},

	save(fileLocation) {
		state.layers.forEach(layer => layer.obj.save(fileLocation));
	},

	load(fileLocation) {
		state.layers.forEach(layer => layer.obj.load(fileLocation));
	}

});

// network object (stack of layers)

module.exports.create = (layerDefs, completed) => {

	const state = {
		layers: [],
		layerLookup: {}
	};

	let chain = Promise.resolve();
	layerDefs.forEach((def, i) => {
		chain = chain
			.then(() => {
				let loc = def.input ? './input_layers/' : './layers/';
				let previous = state.layers[i - 1];
				if(previous){ previous = previous.obj; }
				return require(loc + def.type).create(def, previous);
			})
			.then(layer => {
				const item = {
					obj: layer,
					options: def.options || {}
				};
				state.layers.push(item);
				if(def.id){
					state.layerLookup[def.id] = item.obj;
				}
			});
	});

	return chain.then(() => {
		// create the network and then run the post creation process
		// to give each layer a chance to communicate with other layers
		window.network = Object.assign(state, NetworkBehaviours(state));
		state.layers.forEach(layer => layer.obj.postCreate(window.network));
		return window.network;
	});
};
