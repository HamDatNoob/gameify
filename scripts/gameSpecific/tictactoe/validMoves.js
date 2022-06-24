const positionData = require("../../../models/postitionData.js");
const allMoves = require('../../../json/gameMoves.json');

async function validMoves(gameId){
    let positions = await positionData.findOne({ gameId: gameId });
    const moves = allMoves[0].moves;

    positions = positions?.positions;

    if(positions == null || positions == undefined){
        positions = [undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined];
    }

    let valid = [];
    for(let i in positions){
        if(positions[i] == undefined){
            valid.push(moves[i])
        }
    }

    return valid;
}

module.exports = { validMoves };