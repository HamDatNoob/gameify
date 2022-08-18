const positionData = require("../models/postitionData.js");
const info = require('../json/gameInfo.json');
const { MessageEmbed, MessageAttachment, MessageActionRow, MessageButton } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { randomID } = require('../scripts/random.js');
const moveData = require("../models/moveData.js");
const gameData = require("../models/gameData.js");
const { fullLog } = require("../scripts/fullLog.js");
const fs = require('fs');
const jimp = require('jimp');

module.exports = {
	data: new SlashCommandBuilder()
	.setName('hand')
	.setDescription('View your hand, only applicable in certain games.'),
	async execute(interaction){

		let game;
		const channelGameData = await gameData.find({ channel: interaction.channelId });
		for(let i in channelGameData){
			if(channelGameData[i]?.players.includes(interaction.user.id) && info[channelGameData[i]?.type]?.hands == true){
				game = channelGameData[i];

				break;
			}else{
				return interaction.reply({ content: '**An error occurred:** You are not in a valid game!', ephemeral: true });
			}
		}

		const posData = await positionData.findOne({ gameId: game._id });

		const playerHand = posData.positions[0].hands.filter(v => v.player == interaction.user.id)[0].hand;

		let images = [fs.readdirSync('./images/uno/symbols').filter(file => file.endsWith('.png')), fs.readdirSync('./images/uno/colors').filter(file => file.endsWith('.png')), fs.readdirSync('./images/uno/backgrounds').filter(file => file.endsWith('.png'))];
		let jimps = [];

		for(let i in images[0]){
			images[0][i] = 'images/uno/symbols/'.concat(images[0][i]);

			jimps.push(jimp.read(images[0][i]));
		}

		for(let i in images[1]){
			images[1][i] = 'images/uno/colors/'.concat(images[1][i]);

			jimps.push(jimp.read(images[1][i]));
		}

		for(let i in images[2]){
			images[2][i] = 'images/uno/backgrounds/'.concat(images[2][i]);

			jimps.push(jimp.read(images[2][i]));
		}

		await Promise.all(jimps).then(function(d){
			return Promise.all(jimps);
		}).then(function(data){
			const dataKey = { '+2': 0, '+4': 1, '0': 2, '1': 3, '2': 4, '3': 5, '4': 6, '5': 7, '6': 8, '7': 9, '8': 10, '9': 11, 'reverse': 12, 'skip': 13, 'wild': 14, 'action': 15, 'blue': 16, 'green': 17, 'red': 18, 'yellow': 19, '01-10': 20, '11-20': 21, '21-30': 22, '31-40': 23, '41-50': 24, 'bottom': 25, 'table': 26 };

			let x = 56;
			let y = 16;
			let r = 0;

			for(let i in playerHand){
				if(i != 10){
					x += 32;
				}else{
					x = 88;
					y += 96;
					r++;

					data[dataKey['01-10']].contain(456, y + 112, jimp.HORIZONTAL_ALIGN_CENTER | jimp.VERTICAL_ALIGN_TOP);
					data[dataKey['01-10']].composite(data[20 + r], 0, y);
				}

				data[dataKey['01-10']].composite(data[dataKey[playerHand[i].color]], x, y);
				data[dataKey['01-10']].composite(data[dataKey[playerHand[i].symbol]], x, y);
			}

			data[dataKey['01-10']].contain(456, y + 112, jimp.HORIZONTAL_ALIGN_CENTER | jimp.VERTICAL_ALIGN_TOP);
			data[dataKey['01-10']].composite(data[dataKey['bottom']], 0, y + 96);

			data[dataKey['01-10']].write(`./images/hands/${game._id}.png`, (err) => {
				if(err) console.log(err);

				const attachment = new MessageAttachment(`./images/hands/${game._id}.png`);
				const startEmbed = new MessageEmbed()
					.setTitle('Your hand')
					.setColor('#4cb99D')
					.setImage(`attachment://${game._id}.png`)
					.setFooter({ text: `Game ID: ${game._id}` })
					.setTimestamp();
				interaction.reply({ embeds: [startEmbed], files: [attachment], ephemeral: true });
			});
		});
    }
}