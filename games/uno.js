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
	async execute(interaction, players, gameId){
		let playersForEmbed = [];
		for(let i in players){
			playersForEmbed.push(`<@${players[i].id}>`);
		}
		playersForEmbed = playersForEmbed.join(', ').replace(/, ([^,]*)$/, ', and $1'); // regex vomit for the oxford comma logic (x, y ->, and<- z)

		const startEmbed = new MessageEmbed()
		.setTitle('Ocho')
		.setDescription(`A game with ${playersForEmbed}\n\nUse the /move command to make a move!\nUse the /hand command to view your hand!\n\nIt is ${players[0]}'s Turn!`)
		.setColor('#4cb99D')
		.setImage('')
		.setFooter({ text: `Game ID: ${gameId}` })
		.setTimestamp();

		await interaction.reply({ embeds: [startEmbed] });

		let won = false;
		let turn = 0;
		let deck = shuffle(uno);
		let p = 0;

		let hands = [];
		for(let i in players){
			let dealer = [];
			for(let ii = 0; ii < 7; ii++){
				dealer.push(deck[0]);
				deck.shift();
			}

			hands.push({ player: players[i].id, hand: dealer })
		}

		let discard = [deck[0]];
		deck.shift();

		const positionDataUpload1 = new positionData({
			_id: randomID(10),
			gameId: gameId,
			channel: interaction.channelId,
			positions: [{ deck: deck, discard: discard, hands: hands }]
		});
		positionDataUpload1.save();
		
		while(won == false){
			let moves = await moveData.findOne({ gameId: gameId });

			if(moves == null || moves?.turn == turn) continue;
			await positionData.deleteOne({ gameId: gameId }); 

			cardData = [{ deck: deck, discard: discard, hands: hands }];

			const positionDataUpload2 = new positionData({
				_id: randomID(10),
				gameId: gameId,
				channel: interaction.channelId,
				positions: cardData
			});
			positionDataUpload2.save();

			let card;
			if(moves.move == 0){
				card = deck[0];
				deck.shift();

				hands[p].hand.push(card);
			}else{
				card = hands[p].hand[parseInt(moves.move)];
			}
			
			if(moves.extra == 1){
				for(let i = 0; i < 1; i++){
					hands[p].hand.push(deck[0]);
					deck.shift();
				}
			}else if(moves.extra == 2){
				for(let i = 0; i < 3; i++){
					hands[p].hand.push(deck[0]);
					deck.shift();
				}
			}

			turn++;
		}

		await gameData.findByIdAndDelete(gameId);
		await moveData.deleteOne({ gameId: gameId })
		await positionData.deleteOne({ gameId: gameId });
		fs.unlinkSync(`./images/tictactoe/active/${gameId}.png`);
	}
}   