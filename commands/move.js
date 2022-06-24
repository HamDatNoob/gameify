const { SlashCommandBuilder } = require('@discordjs/builders');
const { randomID } = require('../scripts/random.js');
const moveData = require("../models/moveData.js");
const gameData = require("../models/gameData.js");

module.exports = {
	data: new SlashCommandBuilder()
	.setName('move')
	.setDescription('Lets you communicate with the game, you must be in a game to use this command')
	.addNumberOption(option => option
		.setName('move')
		.setDescription('The move to execute')
		.setRequired(true)
		.setAutocomplete(true)
	),
	async execute(interaction){
		const move = interaction.options._hoistedOptions[0].value;

		let moves;
		const channelMoveData = await moveData.find({ channel: interaction.channelId });
		for(let i in channelMoveData){
			if(channelMoveData[i]?.user == interaction.user.id){
				moves = channelMoveData[i];
			}
		}

		let game;
		const channelGameData = await gameData.find({ channel: interaction.channelId });
		for(let i in channelGameData){
			if(channelGameData[i]?.players[0] == interaction.user.id){
				game = channelGameData[i];
			}
		}

		if(moves == null){
			moves = { move: '', turn: 0, history: [] };
		}

		const history = Array.from(moves.history);
		history.push(move);

		const turn = moves.turn + 1;

		let next;
		if(game.players.length == game.players.indexOf(interaction.user.id) + 1){
			next = game.players[0];
		}else{
			next = game.players[game.players.indexOf(interaction.user.id) + 1];
		}

		await moveData.findByIdAndDelete(moves._id);

		const moveDataUpload = new moveData({
            _id: randomID(10),
			gameId: game._id,
            channel: interaction.channelId,
            user: interaction.user.id,
            move: move,
			turn: turn,
			history: history,
			next: next
        });
        moveDataUpload.save();

		return interaction.reply({ content: 'Move sent! (click the "Dismiss message" button below to remove this message)', ephemeral: true });
	}
}