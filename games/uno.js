const jimp = require('jimp');
const { MessageEmbed, MessageAttachment } = require('discord.js');
const moveData = require('../models/moveData.js');
const gameData = require('../models/gameData.js');
const positionData = require('../models/postitionData.js');
const fs = require('fs');
const { randomID, shuffle } = require('../scripts/random.js');
const { uno } = require('../json/decks.json');

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

		let discard = deck[0];
		deck.shift();

		const firstPositionUpload = new positionData({
			_id: randomID(10),
			gameId: gameId,
			channel: interaction.channelId,
			positions: [{ deck: deck, discard: discard, hands: hands }]
		});
		firstPositionUpload.save();

		// prob a smarter way to do this but im not smart enough lol
		let images = ["images/uno/table.png", "images/uno/backs/1-back.png", "images/uno/backs/2-back.png", "images/uno/backs/3-back.png", "images/uno/backs/4-back.png", "images/uno/backs/5-back.png", "images/uno/backs/6-back.png", "images/uno/backs/7-back.png", "images/uno/backs/8-back.png", "images/uno/backs/9-back.png", "images/uno/backs/10+-back.png"];
		let jimps = [];

		for(let i in images){
			jimps.push(jimp.read(images[i]));
		}

		await Promise.all(jimps).then(function(d){
			return Promise.all(jimps);
		}).then(function(data){
			const rotation = 360 / players.length;

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
				data[0].composite(blanks[i], 0, 0);
			}

			data[0].write(`./images/uno/active/${gameId}.png`, (err) => {
				if(err) console.log(err);

				const attachment = new MessageAttachment(`./images/uno/active/${gameId}.png`);
				const startEmbed = new MessageEmbed()
					.setTitle('Uno')
					.setDescription(`A game with ${playersForEmbed}\n\nUse the /move command to make a move!\nUse the /hand command to view your hand!\n\nIt is ${players[0]}'s Turn!`)
					.setColor('#4cb99D')
					.setImage(`attachment://${gameId}.png`)
					.setFooter({ text: `Game ID: ${gameId}` })
					.setTimestamp();
		
				interaction.reply({ embeds: [startEmbed], files: [attachment] });
			});
		});

		while (won == false) {
			let moves = await moveData.findOne({ gameId: gameId });

			if (moves == null || moves?.turn == turn) continue;
			await positionData.deleteOne({ gameId: gameId });

			cardData = [{ deck: deck, discard: discard, hands: hands }];

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
					data[0].composite(blanks[i], 0, 0);
				}

				data[0].write(`./images/uno/active/${gameId}.png`, (err) => {
					if(err) console.log(err);
				});
			});

			turn++;
		}

		await gameData.findByIdAndDelete(gameId);
		await moveData.deleteOne({ gameId: gameId })
		await positionData.deleteOne({ gameId: gameId });
		fs.unlinkSync(`./images/uno/active/${gameId}.png`);
	}
}   