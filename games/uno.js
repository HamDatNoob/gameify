const jimp = require('jimp');
const { MessageEmbed, MessageAttachment, MessageActionRow, MessageButton } = require('discord.js');
const moveData = require('../models/moveData.js');
const gameData = require('../models/gameData.js');
const positionData = require('../models/postitionData.js');
const fs = require('fs');
const { random, randomID, shuffle } = require('../scripts/random.js');
const { sleep } = require('../scripts/sleep.js');
const { uno } = require('../json/decks.json');
const { fullLog } = require("../scripts/fullLog.js");
const { QuickDB } = require("quick.db");
const db = new QuickDB({ filePath: "databases/uno.sqlite" });	

module.exports = {
	name: 'uno',
	async execute(interaction, players, gameId) {
		let playersForEmbed = [];
		for (let i in players) {
			playersForEmbed.push(`<@${players[i].id}>`);
		}
		playersForEmbed = playersForEmbed.join(', ').replace(/, ([^,]*)$/, ', and $1'); // regex vomit for the oxford comma logic (x, y ->, and<- z)

		let won = false;
		let turn = 0;
		let deck = shuffle(uno);
		let p = 0;

		let hands = [];
		for (let i in players) {
			let dealer = [];
			for (let ii = 0; ii < 7; ii++) {
				dealer.push(deck[0]);
				deck.shift();
			}

			hands.push({ player: players[i].id, hand: dealer })
		}

		let discard = [deck[0]];
		deck.shift();

		console.log(discard);

		const firstPositionUpload = new positionData({
			_id: randomID(10),
			gameId: gameId,
			channel: interaction.channelId,
			positions: [{ deck: deck, discard: discard, hands: hands }]
		});
		firstPositionUpload.save();

		let images = [fs.readdirSync('./images/uno/symbols').filter(file => file.endsWith('.png')), fs.readdirSync('./images/uno/colors').filter(file => file.endsWith('.png')), fs.readdirSync('./images/uno/backgrounds').filter(file => file.endsWith('.png')), fs.readdirSync('./images/uno/backs').filter(file => file.endsWith('.png'))];
		let jimps = [];

		images[3].splice(9, 0, images[3].splice(1, 1)[0]); // moves 10+-back.png to the last spot in it's array

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
		
		for(let i in images[3]){
			images[3][i] = 'images/uno/backs/'.concat(images[3][i]);

			jimps.push(jimp.read(images[3][i]));
		}

		const dataKey = { '+2': 0, '+4': 1, '0': 2, '1': 3, '2': 4, '3': 5, '4': 6, '5': 7, '6': 8, '7': 9, '8': 10, '9': 11, 'reverse': 12, 'skip': 13, 'wild': 14, 'action': 15, 'blue': 16, 'green': 17, 'red': 18, 'yellow': 19, '01-10': 20, '11-20': 21, '21-30': 22, '31-40': 23, '41-50': 24, 'bottom': 25, 'table': 26, '1-back': 27, '2-back': 28, '3-back': 29, '4-back': 30, '5-back': 31, '6-back': 32, '7-back': 33, '8-back': 34, '9-back': 35, '10+-back': 36, 'back': 37 };

		await Promise.all(jimps).then(function(d){
			return Promise.all(jimps);
		}).then(function(data){
			const rotation = 360 / players.length;

			let board = data[dataKey['table']].clone();

			let blanks = [];
			for(let i in players){
				blanks.push(data[dataKey['table']].clone())
			}

			for(let i in players){
				i = parseInt(i);

				let cards = hands[i].hand.length;
				if(cards > 10) cards = 10;

				blanks[i].rotate(rotation * i, false);
				blanks[i].composite(data[26 + cards], 160, 385, { opacityDest: 0 });
				blanks[i].rotate(-rotation * i, false);
				blanks[i].contain(512, 512);
			}

			for(let i in players){
				board.composite(blanks[i], 0, 0);
			}

			board.composite(data[dataKey['back']], 168, 152);

			board.composite(data[dataKey[discard[0].color]], 280, 152);
			board.composite(data[dataKey[discard[0].symbol]], 280, 152);

			board.write(`./images/uno/active/${gameId}.png`, (err) => {
				if(err) console.log(err);

				const attachment = new MessageAttachment(`./images/uno/active/${gameId}.png`);
				const embed = new MessageEmbed()
					.setTitle('Uno')
					.setDescription(`A game with ${playersForEmbed}\n\nUse the /move command to make a move!\nUse the /hand command to view your hand!\n\nIt is ${players[0]}'s Turn!`)
					.setColor('#4cb99D')
					.setImage(`attachment://${gameId}.png`)
					.setFooter({ text: `Game ID: ${gameId}` })
					.setTimestamp();
				const actionRow = new MessageActionRow()
					.addComponents(
						new MessageButton()
							.setCustomId('uno-handButton')
							.setLabel('View Hand')
							.setStyle("SECONDARY")
					);
		
				interaction.reply({ embeds: [embed], files: [attachment], components: [actionRow] });
			});
		});

		while (won == false) {
			let moves = await moveData.findOne({ gameId: gameId });

			if (moves == null || moves?.turn == turn) continue;
			await positionData.deleteOne({ gameId: gameId });

			cardData = [{ deck: deck, discard: discard, hands: hands }];

			let m = parseInt(moves.move) - 1;
			let p = moves.user;
			
			hands = cardData[0].hands;
			let hand = hands.filter(v => v.player == p)[0].hand;
			
			let c = hand[m];

			let pIndex = players.map(v => v.id).indexOf(p);

			hand.splice(hand.indexOf(c), 1);
			hands.splice(pIndex, 1, { player: p, hand: hand });

			if(c.color == 'action'){
				for(let i=0; i<30; i++){
					let newColor = await db.get(`wildColor.${gameId}.color`);

					if(newColor){
						c.color = newColor;

						await db.delete(`wildColor.${gameId}.color`);

						break;
					}
					
					await sleep(1);
				}

				if(c.color == 'action'){
					await interaction.followUp({ content: `No color was chosen for <@${p}>'s wild card; choosing a random color!` }).then(async v => {
						c.color = ['red', 'yellow', 'green', 'blue'].at(random(0, 3));

						sleep(5).then(async a => {
							v.delete();
						});
					});	
				}
			}

			cardData[0].discard.push(c);

			cardData = [{ deck: cardData[0].deck, discard: cardData[0].discard, hands: hands }];

			const positionDataUpload = new positionData({
				_id: randomID(10),
				gameId: gameId,
				channel: interaction.channelId,
				positions: cardData
			});
			positionDataUpload.save();

            await Promise.all(jimps).then(function(d){
                return Promise.all(jimps);
            }).then(function(data){
				const rotation = 360 / players.length;

				let board = data[dataKey['table']].clone();

				let blanks = [];
				for(let i in players){
					blanks.push(data[dataKey['table']].clone());
				}

				for(let i in players){
					i = parseInt(i);

					let cards = hands[i].hand.length;
					if(cards > 10) cards = 10;

					blanks[i].rotate(rotation * i, false);
					blanks[i].composite(data[26 + cards], 160, 385, { opacityDest: 0 });
					blanks[i].rotate(-rotation * i, false);
					blanks[i].contain(512, 512);
				}

				for(let i in players){
					board.composite(blanks[i], 0, 0);
				}

				board.composite(data[dataKey['back']], 168, 152);

				board.composite(data[dataKey[c.color]], 280, 152);
				board.composite(data[dataKey[c.symbol]], 280, 152);

				board.write(`./images/uno/active/${gameId}.png`, (err) => {
					if(err) console.log(err);

					const attachment = new MessageAttachment(`./images/uno/active/${gameId}.png`);
					const embed = new MessageEmbed()
						.setTitle('Uno')
						.setDescription(`A game with ${playersForEmbed}\n\nUse the /move command to make a move!\nUse the /hand command to view your hand!\n\nIt is ${players[pIndex]}'s Turn!`)
						.setColor('#4cb99D')
						.setImage(`attachment://${gameId}.png`)
						.setFooter({ text: `Game ID: ${gameId}` })
						.setTimestamp();
					const actionRow = new MessageActionRow()
						.addComponents(
							new MessageButton()
								.setCustomId('uno-handButton')
								.setLabel('View Hand')
								.setStyle("SECONDARY")
						);

					interaction.editReply({ embeds: [embed], files: [attachment], components: [actionRow] });
				});
			});

			turn++;
		}

		await gameData.findByIdAndDelete(gameId);
		await moveData.deleteOne({ gameId: gameId });
		await positionData.deleteOne({ gameId: gameId });
		fs.unlinkSync(`./images/uno/active/${gameId}.png`);
		fs.unlinkSync(`./images/hands/${gameId}.png`);
	}
}   