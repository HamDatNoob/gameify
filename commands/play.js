const { SlashCommandBuilder } = require('@discordjs/builders');
const fs = require('fs')
const gameRules = require('../json/gameRules.json');
const { randomID } = require('../scripts/random.js');
const gameData = require("../models/gameData.js");

module.exports = {
	data: new SlashCommandBuilder()
	.setName('play')
	.setDescription('Starts a game, ping user(s) to add them to the game')
	.addNumberOption(game => game
		.setName('game')
		.setDescription('The game to play')
		.setRequired(true)
		.addChoices(
			{ name: 'Tic Tac Toe (2 Players)', value: 0 },
			{ name: 'Uno (2-8 Players)', value: 1 },
			{ name: 'Checkers (2 Players)', value: 2 }
		)
	)
	.addUserOption(p2 => p2
		.setName('player-2')
		.setDescription('A user to play against')
		.setRequired(false)
	)
	.addUserOption(p3 => p3
		.setName('player-3')
		.setDescription('A user to play against')
		.setRequired(false)
	)
	.addUserOption(p4 => p4
		.setName('player-4')
		.setDescription('A user to play against')
		.setRequired(false)
	)
	.addUserOption(p5 => p5
		.setName('player-5')
		.setDescription('A user to play against')
		.setRequired(false)	
	)
	.addUserOption(p6 => p6
		.setName('player-6')
		.setDescription('A user to play against')
		.setRequired(false)
	)
	.addUserOption(p7 => p7
		.setName('player-7')
		.setDescription('A user to play against')
		.setRequired(false)
	)
	.addUserOption(p8 => p8
		.setName('player-8')
		.setDescription('A user to play against')
		.setRequired(false)
	),
	async execute(interaction){
		const options = interaction.options._hoistedOptions;

		const g = options[0].value;
		
		const player1 = interaction.user;
		const player2 = options[1]?.user;
		const player3 = options[2]?.user;
		const player4 = options[3]?.user;
		const player5 = options[4]?.user;
		const player6 = options[5]?.user;
		const player7 = options[6]?.user;
		const player8 = options[7]?.user;
		
		const players = [player1, player2, player3, player4, player5, player6, player7, player8].filter(v => v != undefined);

		const channelData = await gameData.find({ channel: interaction.channelId });
		for(let i in players){
			if(players[i].bot){ // invalidates game if playing a bot
				return interaction.reply({ content: `**An error occurred:** Player ${parseInt(i) + 1}, <@${players[i].id}>, is a bot!`, ephemeral: true });
			}

			let dupeCount = players.slice(0, i) + players.slice(i + 1)
			if(dupeCount.includes(players[i])){ // invalidates game if playing agaisnt duplicate players
				return interaction.reply({ content: `**An error occurred:** Player ${parseInt(i) + 1}, <@${players[i].id}>, is a duplicate player!`, ephemeral: true });
			}
			
			for(let ii in channelData.map(v => v.players)){
				if(channelData.map(v => v.players[ii]).includes(players[i].id)){ // invalidates game if a player is already in another game in current channel
					return interaction.reply({ content: `**An error occurred:** Player ${parseInt(i) + 1}, <@${players[i].id}>, is already in a game in this channel!`, ephemeral: true });
				}
			}
		}

		if(gameRules[g].minPlayers > players.length){ // invalidates game if too few players are inputted
			return interaction.reply({ content: `**An error occurred:** Too few players for this game, the minimum is ${gameRules[g].minPlayers}!`, ephemeral: true });
		}else if(gameRules[g].maxPlayers < players.length){ // invalidates game if too many players are inputted
			return interaction.reply({ content: `**An error occurred:** Too many players for this game, the maximum is ${gameRules[g].maxPlayers}!`, ephemeral: true });
		}

		const gameId = randomID(10);

		const gameDataUpload = new gameData({
            _id: gameId,
            type: g,
            players: players,
            channel: interaction.channelId
        });
        gameDataUpload.save()
		
		const gameFiles = fs.readdirSync('./games').filter(file => file.endsWith('.js')); // syncs game files, finds correct game file, and sends data to the game
		for(const file of gameFiles){
			const game = require(`../games/${file}`);

			if(game.name != gameRules[g].name) continue;
			
			try{
				game.execute(interaction, players, gameId);
			}catch(error){
				await gameData.findByIdAndDelete(gameId); // removes all players from the game when an error occurs

				console.error(error);
				return interaction.followUp({ content: '**An error occurred:** An unknown internal error occurred whilst playing this game, game terminated. No losses were given!', ephemeral: true });
			}
		}
	}
}