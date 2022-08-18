const jimp = require('jimp');
const { MessageEmbed, MessageAttachment, MessageActionRow, MessageButton } = require('discord.js');
const moveData = require('../models/moveData.js');
const gameData = require('../models/gameData.js');
const positionData = require('../models/postitionData.js');
const fs = require('fs');
const { randomID, shuffle } = require('../scripts/random.js');
const { uno } = require('../json/decks.json');
const { fullLog } = require("../scripts/fullLog.js");


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

		const firstPositionUpload = new positionData({
			_id: randomID(10),
			gameId: gameId,
			channel: interaction.channelId,
			positions: [{ deck: deck, discard: discard, hands: hands }]
		});
		firstPositionUpload.save();

		let images = fs.readdirSync('./images/uno/backs').filter(file => file.endsWith('.png'));
		images.splice(0, 0, 'images/uno/backgrounds/table.png');
		let jimps = [];

		images.splice(10 + 1, 0, images.splice(2, 1)[0]); // moves 10+-back.png to the last spot

		for(let i in images){
			if(i != 0) images[i] = 'images/uno/backs/'.concat(images[i]);

			jimps.push(jimp.read(images[i]));
		}

		await Promise.all(jimps).then(function(d){
			return Promise.all(jimps);
		}).then(function(data){
			const rotation = 360 / players.length;

			let board = data[0].clone();

			let blanks = [];
			for(let i in players){
				blanks.push(data[0].clone())
			}

			for(let i in players){
				i = parseInt(i);

				let cards = hands[i].hand.length;
				if(cards > 10) cards = 10;

				blanks[i].rotate(rotation * i, false);
				blanks[i].composite(data[cards], 160, 385, { opacityDest: 0 });
				blanks[i].rotate(-rotation * i, false);
				blanks[i].contain(512, 512);
			}

			for(let i in players){
				board.composite(blanks[i], 0, 0);
			}

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
							.setCustomId('handButton')
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

			cardData = [{ deck: cardData[0].deck, discard: cardData[0].discard.push(c), hands: hands }]

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

				let board = data[0].clone();

				let blanks = [];
				for(let i in players){
					blanks.push(data[0].clone());
				}

				for(let i in players){
					i = parseInt(i);

					let cards = hands[i].hand.length;
					if(cards > 10) cards = 10;

					blanks[i].rotate(rotation * i, false);
					blanks[i].composite(data[cards], 160, 385, { opacityDest: 0 });
					blanks[i].rotate(-rotation * i, false);
					blanks[i].contain(512, 512);
				}

				for(let i in players){
					board.composite(blanks[i], 0, 0);
				}

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
								.setCustomId('handButton')
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