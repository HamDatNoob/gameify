function random(floor, ceiling){
    floor = Math.floor(floor);
    ceiling = Math.ceil(ceiling);
    return Math.floor(Math.random() * (ceiling - floor + 1) + floor);
}

function randomID(limit){
    let floor = 1;
    let ceiling = "9".repeat(limit);
    let output = Math.floor(Math.random() * (ceiling - floor + 1) + floor);  
    
    let o = output.toString();

    let ID;
    if(o.length < limit){
        ID = "0".repeat(o.length) - 1 + o; 
    }else{
        ID = o;
    }
    
    if(ID < 0) ID /= -1;
    
    return `${ID}`;
}

module.exports = { random, randomID };