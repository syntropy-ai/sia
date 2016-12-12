
// renderer for an array of tensors

const TensorSetRendererBehaviours = state => ({

    render(iter, force = false) {
        state.tensorRenderers.forEach(tr => tr.render(iter, force));
    }

});

module.exports.create = (tensors, domParent, options = {}) => {

    const state = {
        tensors
    };

    // build the renderers
    let renderer = options.tensorRenderer || 'tensor';

    let itemInfoFunc = options.itemInfoFunc;
    options.itemInfoFunc = null;

    state.tensorRenderers = tensors.map((tensor, i) => {    
        let tensorParent = document.createElement('div');
        tensorParent.className = 'tensor-wrap';
        if(typeof itemInfoFunc !== 'undefined') {
            tensorParent.dataset.index = i;
            tensorParent.dataset.func = itemInfoFunc;
        }

        domParent.appendChild(tensorParent);
        return require('./' + renderer).create(tensor, tensorParent, options);
    });

    return Object.assign({}, 
        TensorSetRendererBehaviours(state));
};