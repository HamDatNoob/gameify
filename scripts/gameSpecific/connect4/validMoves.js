const positionData = require("../../../models/postitionData.js");
const allMoves = require('../../../json/gameInfo.json');

async function validMoves(gameId){
    let positions = await positionData.findOne({ gameId: gameId });
    const moves = allMoves[1].moves;

    positions = positions?.positions;

    if(positions == null || positions == undefined){
        positions = [0, 0, 0, 0, 0, 0, 0];
    }

    let valid = [];
    for(let i in positions){
        if(positions[i] >= 0 && positions[i] < 6){
            valid.push(moves[i])
        }
    }

    return valid;
}

module.exports = { validMoves };