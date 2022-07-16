const { SlashCommandBuilder } = require('@discordjs/builders');
const { randomID } = require('../scripts/random.js');
const moveData = require("../models/moveData.js");
const gameData = require("../models/gameData.js");
const gameInfo = require('../json/gameInfo.json');
const { sleep } = require('../scripts/sleep.js');

module.exports = {
	data: new SlashCommandBuilder()
	.setName('move')
	.setDescription('Lets you communicate with the game, you must be in a game to use this command')
	.addStringOption(option => option
		.setName('move')
		.setDescription('The move to execute')
		.setRequired(true)
	),
	async execute(interaction){
		let move = interaction.options._hoistedOptions[0].value;

		let moves;
		const channelMoveData = await moveData.find({ channel: interaction.channelId });
		for(let i in channelMoveData){
			if(channelMoveData[i]?.next == interaction.user.id){
				moves = channelMoveData[i];
			}
		}

		let game;
		const channelGameData = await gameData.find({ channel: interaction.channelId });
		for(let i in channelGameData){
			if(channelGameData[i]?.players.includes(interaction.user.id)){
				game = channelGameData[i];
			}
		}

		if(game == undefined){
			return interaction.reply({ content: "**An error occurred:** You are not in a game!", ephemeral: true });
		}

		const { validMoves } = require(`../scripts/gameSpecific/${gameInfo[game.type].name}/validMoves.js`);

		const m = await validMoves(game._id, interaction.user.id);
		if(m.map(v => v.name).includes(move) == false){
			return interaction.reply({ content: `**An error occurred:** "${move}" is not a valid move!`, ephemeral: true });
		}

		move = parseInt(move);

		if(moves == null){
			moves = { move: '', turn: 0, next: game.players[0] };
		}

		if(moves.next != interaction.user.id){
			return interaction.reply({ content: `**An error occurred:** It is not your turn!`, ephemeral: true });
		}

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
			next: next
        });
        await moveDataUpload.save();

		await interaction.reply({ content: 'Move sent and recieved.' });
		await sleep(1.5);
		return interaction.deleteReply(1);
	}
}