function random(floor, ceiling){
    floor = Math.floor(floor);
    ceiling = Math.ceil(ceiling);
    return Math.floor(Math.random() * (ceiling - floor + 1) + floor);
}

function randomID(limit){
    let floor = 1 + "0".repeat(limit - 1);
    let ceiling = "9".repeat(limit);

    let o = random(floor, ceiling);

    if(o < 0) o /= -1;
    
    return `${o}`;
}

function shuffle(deck){
    for(let i = deck.length - 1; i > 0; i--){
        let j = Math.floor(Math.random() * i);
        let temp = deck[i];
        deck[i] = deck[j];
        deck[j] = temp;
    }
    
    return deck;
}

module.exports = { random, randomID, shuffle };