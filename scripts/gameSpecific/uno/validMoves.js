const positionData = require("../../../models/postitionData.js");

async function validMoves(gameId, player){
    let cardData = await positionData.findOne({ gameId: gameId });

    cardData = cardData?.positions[0];

    let hands = cardData.hands;

    let valid = [];
    for(let i in hands){
        if(hands[i].player != player) continue;

        for(let ii = 0; ii < hands[i].hand.length; ii++){
            valid.push({ name: `${ii + 1}`, value: ii + 1 });
        }
    }

    return valid;
}

module.exports = { validMoves };