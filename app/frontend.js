
// get an arbitrarily higher-order parent by selector
function getParent(query, el) {
	parent = el.parentElement;
	while(parent !== null) {
		if(parent.matches(query)) {
			return parent;
		}
		parent = parent.parentElement;
	}
	return false;
}

// abstraction for attaching events to dynamically created elements
function doOnClick(query, callback) {
	document.querySelector('body').addEventListener('click', function(e){
		if(e.target.matches(query)) {
			callback(e.target);
		} else {
			parent = getParent(query, e.target);
			if(parent) {
				callback(parent);
			} else {
				return false;
			}
		}
	});
}

// execute a function attached to a tensor
doOnClick('.tensor-wrap[data-func], .canvas-wrap[data-func]', function(el){
	let forLayer = getParent('.renderer', el).dataset.forLayer;
	let func = el.dataset.func;
	let i = el.dataset.index;
	// do the thing!
	window.network.layerLookup[forLayer][func](i);
});

// execute a function attached to a renderer
doOnClick('.renderer-info[data-func]', function(el){
	let forLayer = getParent('.renderer', el).dataset.forLayer;
	let func = el.dataset.func;
	// do the thing!
	window.network.layerLookup[forLayer][func]();
});
