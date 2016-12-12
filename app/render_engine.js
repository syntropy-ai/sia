
// engine for creating dom renderers based on data

const RenderEngineBehaviours = state => ({

	addRenderer(def, network) {
		// extract the data
		let forLayer = def.data[0];
		if(def.data[0] instanceof Array){
			forLayer = def.data[0][0];
			def.data = def.data.map(d => this.resolveData(d, network));
		}else{
			def.data = this.resolveData(def.data, network);
		}

		// create the wrapping dom
		let domInner = document.createElement('div');
		let header = document.createElement('h2');
		domInner.id = 'renderer-' + state.currentId++;
		domInner.className = 'box renderer';
		domInner.dataset.forLayer = forLayer;
		if(def.hasOwnProperty('options') && def.options.hasOwnProperty('infoFunc')){
			let infoBtn = document.createElement('span');
			infoBtn.innerHTML = 'i';
			infoBtn.className = 'renderer-info';
			infoBtn.dataset.func = def.options.infoFunc;
			domInner.appendChild(infoBtn);
		}
		if(def.title) {
			header.innerHTML = def.title;
			domInner.appendChild(header);
		}
		state.domParent.appendChild(domInner);
		state.renderers.push(require('./renderers/' + def.type).create(def.data, domInner, def.options));
	},

	resolveData(def, network){
		if(def.length === 1){
			return network.getLayer(def[0]).getOutput();
		}else{
			return network.getLayer(def[0])[def[1]]();
		}
	},

	render(force = false) {
		state.iter++;
		let rendered = false;
		state.renderers.forEach(renderer => {
			rendered = renderer.render(state.iter, force) || rendered;
		});
		return rendered;
	}

});


module.exports.create = (domParentId, rendererDefs, network) => {

	const state = {
		renderers: [],
		domParent: document.getElementById(domParentId),
		currentId: 0,
		iter: 0
	};

	const engine = Object.assign({},
		RenderEngineBehaviours(state));

	// setup the initial renderers
	rendererDefs.forEach(def => engine.addRenderer(def, network));

	// perform an initial rendering
	engine.render(true);

	return engine;
};