
const FileHelpers = require('./utils/file_helpers'),
	Log = require('./utils/log');

const TensorBehaviours = state => ({

	getMem(){
		return state.mem;
	},

	items(){
		return state.items;
	},

	item(index = 0){
		return state.items[index];
	},

	dims(){
		return state.dims;
	},

	fill(value) {
		state.mem.fill(value);
		return this;
	},

	set(tensor){
		state.mem.set(tensor.getMem());
		return this;
	},

	setItems(data){
		state.items.forEach(i => i.set(data));
		return this;
	},

	sum() {
		return state.items.reduce((total, val) => total + val.sum(), 0);
	},

	rectify() {
		state.mem.rectify();
		return this;
	},

	// add all the mem values
	add(tensor){
		let a = state.mem,
			b = tensor.getMem();

		for(let i=0, len=a.length; i<len; ++i){
			a[i] += b[i];
		}
		return this;
	},

	subtract(tensor){
		let a = state.mem,
			b = tensor.getMem();

		for(let i=0, len=a.length; i<len; ++i){
			a[i] -= Math.min(a[i], b[i]);			
		}
		return this;
	},

	// dot all tensor items by some input, and place in output vector
	dot(input, output){
		for(let i=0, len=state.items.length; i<len; ++i){
			output[i] = input.dot(state.items[i]);
		}
	},

	// scale each tensor item by a vector scaler, with optional output tensor
	scale(amounts, tensor = this){
		for(let i=0, len=state.items.length; i<len; ++i){
			let tmult = state.items[i];
			let tout = tensor.item(i);
			let amt = amounts[i];

			for(let w=0, total=tout.length; w<total; ++w){
				tout[w] = Math.max(0, amt * tmult[w]);
			}
		}
		return this;
	},

	error(tensor){
		let a = state.mem,
			b = tensor.getMem(),
			err = 0;

		for(let i=0, len=a.length; i<len; ++i){
			err += Math.abs(a[i] - b[i]);
		}
		return err;
	},

	normaliseItems(){
		state.items.forEach(i => i.normalise());
	},

	save(location, name){
		FileHelpers.saveBuffer(location + '/' + name, state.mem);
	},

	load(location, name){
		let data = FileHelpers.loadBuffer(location + '/' + name);
		if(data){
			let cpy = new Float64Array(data);
			state.mem.set(cpy);
		}
	},

	log(rounding = 2) {
		state.items.forEach((item, i) => console.log(i, ':', Log.joinRound(item, rounding)));
	}

});

module.exports.create = (x, y = 1, totalItems = 1) => {

	const itemSize = x * y;
	const totalSize = itemSize * totalItems;

	const state = {
		dims: {
			x,
			y,
			totalItems,
			itemSize,
			totalSize
		},
		mem: new Float64Array(totalSize),
		items: new Array(totalItems)
	};

	// setup the subarray windows for easy lookup
	for(let i=0; i<totalItems; i++){
		let offset = i * itemSize;
		state.items[i] = state.mem.subarray(offset, offset + itemSize);
	}

	return Object.assign({}, TensorBehaviours(state));
};

module.exports.copy = tensor => {
	const tdims = tensor.dims();
	const newTensor = module.exports.create(tdims.x, tdims.y, tdims.totalItems);
	newTensor.set(tensor);
	return newTensor;
};