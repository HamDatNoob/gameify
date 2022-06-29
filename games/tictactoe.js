const jimp = require('jimp');
const { MessageEmbed, MessageAttachment } = require('discord.js');
const moveData = require('../models/moveData.js');
const gameData = require('../models/gameData.js');
const positionData = require('../models/postitionData.js');
const fs = require('fs');
const { randomID } = require('../scripts/random.js');

module.exports = {
    name: 'tictactoe',
    async execute(interaction, players, gameId){
        const startEmbed = new MessageEmbed()
        .setTitle('Tic Tac Toe')
        .setDescription(`<@${players[0].id}> vs <@${players[1].id}>\n\nUse the /move command to make a move!\nExample: "/move 5" to mark square 5!\n\nIt is ${players[0]}'s Turn!`)
        .setColor('#4cb99D')
        .setImage('https://cdn.discordapp.com/attachments/872600292586303490/988689459065266206/board.png?size=4096')
        .setFooter({ text: `Game ID: ${gameId}` })
        .setTimestamp();

        await interaction.reply({ embeds: [startEmbed] });

        let won = false;
        let turn = 0;
		let positions = [undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined];
		const winCon = [ 'xxx', 'ooo'];
		const winTypes = { tr: { x: 31, y: 84 }, mr: { x: 31, y: 246 }, br: { x: 31, y: 411 }, lc: { x: 84, y: 31 }, mc: { x: 246, y: 31 }, rc: { x: 411, y: 31 }, db: { x: 41, y: 41 }, df: { x: 41, y: 41 } };
		const wins = Object.keys(winTypes);

        while(won == false){
            let moves = await moveData.findOne({ gameId: gameId });

            if(moves == null || moves?.turn == turn) continue;
			await positionData.deleteOne({ gameId: gameId });

            const xMarks = [0, 1, 2, 0, 1, 2, 0, 1, 2];
            const yMarks = [0, 0, 0, 1, 1, 1, 2, 2, 2];

            let mark = { x: 44 + 163 * xMarks[parseInt(moves.move) - 1], y:  44 + 163 * yMarks[parseInt(moves.move) - 1] };

            let turnMark;
			let turnBin;
			let turnSymbol;
			let next;
            if(turn % 2 == 0){
                turnMark = 1;
				turnBin = 0;
				turnSymbol = 'x'
				next = 1;
            }else{
                turnMark = 2;
				turnBin = 1;
				turnSymbol = 'o'
				next = 0;
            }

			positions.splice(moves.move - 1, 1, turnSymbol);

			const positionDataUpload = new positionData({
				_id: randomID(10),
				gameId: gameId,
				channel: interaction.channelId,
				positions: positions
			});
			positionDataUpload.save();

			let win; // shitty win detection
			if(winCon.includes(positions[0] + positions[1] + positions[2])) win = wins[0]; // top row
			if(winCon.includes(positions[3] + positions[4] + positions[5])) win = wins[1]; // middle row
			if(winCon.includes(positions[6] + positions[7] + positions[8])) win = wins[2]; // bottom row
			if(winCon.includes(positions[0] + positions[3] + positions[6])) win = wins[3]; // left colomn
			if(winCon.includes(positions[1] + positions[4] + positions[7])) win = wins[4]; // middle colomn
			if(winCon.includes(positions[2] + positions[5] + positions[8])) win = wins[5]; // right colomn
			if(winCon.includes(positions[0] + positions[4] + positions[8])) win = wins[6]; // diagonal backwards
			if(winCon.includes(positions[2] + positions[4] + positions[6])) win = wins[7]; // diagonal forwards

			if(turn == 8 && win == undefined) win = 'tie';

			let images;
			if(turn == 0){
            	images = ['images/tictactoe/board.png', 'images/tictactoe/x.png', 'images/tictactoe/o.png', 'images/tictactoe/horzRed.png', 'images/tictactoe/horzBlue.png', 'images/tictactoe/vertRed.png', 'images/tictactoe/vertBlue.png', 'images/tictactoe/diagRed.png', 'images/tictactoe/diagBlue.png'];
			}else{
				images = [`images/tictactoe/active/${gameId}.png`, 'images/tictactoe/x.png', 'images/tictactoe/o.png', 'images/tictactoe/horzRed.png', 'images/tictactoe/horzBlue.png', 'images/tictactoe/vertRed.png', 'images/tictactoe/vertBlue.png', 'images/tictactoe/diagRed.png', 'images/tictactoe/diagBlue.png'];
			}
			
			let jimps = [];

            for(let i in images){
                jimps.push(jimp.read(images[i]));
            }

            await Promise.all(jimps).then(function(d){
                return Promise.all(jimps);
            }).then(function(data){
                data[0].composite(data[turnMark], mark.x, mark.y);

				if(['tr', 'mr', 'br'].includes(win)){
					data[0].composite(data[3 + turnBin], winTypes[win].x, winTypes[win].y);
				}else if(['lc', 'mc', 'rc'].includes(win)){
					data[0].composite(data[5 + turnBin], winTypes[win].x, winTypes[win].y);
				}else if('df' == win){
					data[0].composite(data[7 + turnBin], winTypes[win].x, winTypes[win].y);
				}else if('db' == win){
					data[7 + turnBin].flip(true, false);
					data[0].composite(data[7 + turnBin], winTypes[win].x, winTypes[win].y);
				}
				
                data[0].write(`./images/tictactoe/active/${gameId}.png`, (err) => {
                    if(err) console.log(err);

					const attachment = new MessageAttachment(`./images/tictactoe/active/${gameId}.png`);
					
					let newEmbed;
					if(win == undefined){
						newEmbed = new MessageEmbed(startEmbed)
						.setImage(`attachment://${gameId}.png`)
						.setDescription(`<@${players[0].id}> vs <@${players[1].id}>\n\nUse the /move command to make a move!\n\nIt is ${players[next]}'s Turn!`);
					}else if(win == 'tie'){
						newEmbed = new MessageEmbed(startEmbed)
						.setImage(`attachment://${gameId}.png`)
						.setDescription(`<@${players[0].id}> vs <@${players[1].id}>\n\nThe game was a draw!`);
					}else{
						newEmbed = new MessageEmbed(startEmbed)
						.setImage(`attachment://${gameId}.png`)
						.setDescription(`<@${players[0].id}> vs <@${players[1].id}>\n\n${players[turnBin]} has won!`);
					}

					interaction.editReply({ embeds: [newEmbed], files: [attachment] });
				});
            });

			if(win != undefined){
				won = true;
			}

            turn++;
        }

		await gameData.findByIdAndDelete(gameId);
		await moveData.deleteOne({ gameId: gameId })
		await positionData.deleteOne({ gameId: gameId });
		fs.unlinkSync(`./images/tictactoe/active/${gameId}.png`);
    }
}   