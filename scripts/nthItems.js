function nthItems(array, n){
    const r = [];
    for(let i = n - 1, l = array.length; i < l; i += n){
        r.push(array[i]);
    }
    return r;
}

module.exports = { nthItems };