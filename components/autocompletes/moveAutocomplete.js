const gameData = require('../../models/gameData.js');
const moveData = require('../../models/moveData.js');
const { validMoves } = require('../../scripts/gameSpecific/tictactoe/validMoves.js');

module.exports = {
    name: 'moveAutocomplete',
    async execute(interaction){
        let game;
        const channelGameData = await gameData.find({ channel: interaction.channelId });
        for(let i in channelGameData){
            if(channelGameData.map(v => v.players[i]).includes(interaction.user.id)){
                game = channelGameData[i];
            }
        }

		let move;
		const channelMoveData = await moveData.find({ channel: interaction.channelId });
		for(let i in channelMoveData){
			if(channelMoveData[i].user == interaction.user.id){
				move = channelMoveData[i];
			}
		}

        move = move?.next;

        if(move == null || move == undefined){
			move = game.players[0];
		}

        if(move == interaction.user.id){
            return interaction.respond(await validMoves(game._id));
        }
    }
}