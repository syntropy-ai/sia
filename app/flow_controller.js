
// object for managing system process

const controllerBehaviours = state => ({

	doIteration() {
		// run until play stops or we need to render
		// we also need to force a repaint after some frames to stop blocking
		for(let f=0; !state.renderEngine.render() && state.playing && f<state.maxFramesUntilRender; f++){
			let forceStop = state.network.run(state.index);
			state.index++;
			if(state.index % 100 === 0){ console.log(state.index); }

			if(forceStop){
				state.renderEngine.render(true);				
			}

			if(forceStop || (state.stopAt && state.stopAt === state.index)){ this.play(); }
		}

		// reloop if still playing
		if(state.playing){
			requestAnimationFrame(() => this.doIteration());
		}
	},

	play() {
		state.playing = !state.playing;
		state.playButton.textContent = (state.playing) ? 'Pause' : 'Play';

		if(state.playing){
			requestAnimationFrame(() => this.doIteration());
		}
	},

	step() {
		if(!state.playing){
			state.network.run(state.index);
			state.renderEngine.render(true);
			state.index++;
		}
	},

	save(folder) {
		let location = state.fileLocation;

		folder = folder || state.saveText.value;
		if(folder.length > 0){
			location += '/' + folder;
		}
		state.network.save(location);
	},

	load(folder) {
		let location = state.fileLocation;

		folder = folder || state.loadText.value;
		if(folder.length > 0){
			location += '/' + folder;
		}
		state.network.load(location);
		state.renderEngine.render(true);
	}

});


module.exports.create = (network, renderEngine, options = {}) => {

	const state = {
		framesSinceLastRender: 0,
		maxFramesUntilRender: 1000,
		network: network,
		renderEngine: renderEngine,
		playing: false,
		playButton: document.getElementById('play'),
		stepButton: document.getElementById('step'),
		saveButton: document.getElementById('save'),
		saveText: document.getElementById('saveloc'),
		loadButton: document.getElementById('load'),
		loadText: document.getElementById('loadloc'),
		index: 0,
		fileLocation: './data'
	};

	if(options.stopAt){
		state.stopAt = options.stopAt;
	}

	// build the controller
	const ctrl = Object.assign({},	
		controllerBehaviours(state));

	// bind the dom to behaviours
	state.playButton.addEventListener('click', () => ctrl.play());
	state.stepButton.addEventListener('click', () => ctrl.step());
	state.saveButton.addEventListener('click', () => ctrl.save());
	state.loadButton.addEventListener('click', () => ctrl.load());

	if(options.initialLoad){
		ctrl.load(options.initialLoad);
	}

	return ctrl;
};