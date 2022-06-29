const jimp = require('jimp');
const { MessageEmbed, MessageAttachment } = require('discord.js');
const moveData = require('../models/moveData.js');
const gameData = require('../models/gameData.js');
const positionData = require('../models/postitionData.js');
const fs = require('fs');
const { randomID } = require('../scripts/random.js');

module.exports = {
    name: 'connect4',
    async execute(interaction, players, gameId){
        const startEmbed = new MessageEmbed()
        .setTitle('Connect 4')
        .setDescription(`<@${players[0].id}> vs <@${players[1].id}>\n\nUse the /move command to make a move!\nExample: "/move 5" to mark colomn 5!\n\nIt is ${players[0]}'s Turn!`)
        .setColor('#4cb99D')
        .setImage('https://cdn.discordapp.com/attachments/872600292586303490/991546189889683577/board.png?size=4096')
        .setFooter({ text: `Game ID: ${gameId}` })
        .setTimestamp();

        await interaction.reply({ embeds: [startEmbed] });

        let won = false;
        let turn = 0;
		let positions = [
            ['?', '?', '?', '?', '?', '?'],
            ['?', '?', '?', '?', '?', '?'],
            ['?', '?', '?', '?', '?', '?'],
            ['?', '?', '?', '?', '?', '?'],
            ['?', '?', '?', '?', '?', '?'],
            ['?', '?', '?', '?', '?', '?'],
            ['?', '?', '?', '?', '?', '?']
        ];
        const winCon = /rrrr|yyyy/;
        let towers = [0, 0, 0, 0, 0, 0, 0];

        while(won == false){
            let moves = await moveData.findOne({ gameId: gameId });

            if(moves == null || moves?.turn == turn) continue;
			await positionData.deleteOne({ gameId: gameId });

            let piece = { x: (moves.move - 1) * 68 + 27, y: (towers[moves.move - 1]) * 68 + 27 };

            let turnMark;
			let turnBin;
			let turnSymbol;
			let next;
            if(turn % 2 == 0){
                turnMark = 5;
				turnBin = 0;
				turnSymbol = 'r'
				next = 1;
            }else{
                turnMark = 6;
				turnBin = 1;
				turnSymbol = 'y'
				next = 0;
            }

            positions[moves.move - 1].splice(positions[moves.move - 1].indexOf('?'), 1, turnSymbol);
            towers[moves.move - 1] += 1;

            const positionDataUpload = new positionData({
				_id: randomID(10),
				gameId: gameId,
				channel: interaction.channelId,
				positions: towers
			});
			positionDataUpload.save();

			let images;
			if(turn == 0){
            	images = fs.readdirSync('./images/connect4').filter(file => file.endsWith('.png'));
			}else{
				images = fs.readdirSync('./images/connect4').filter(file => file.endsWith('.png'));
                images.splice(0, 1, `active/${gameId}.png`);
			}
			
			let jimps = [];

            for(let i in images){
                let img = `images/connect4/${images[i]}`;

                jimps.push(jimp.read(img));
            }

            await Promise.all(jimps).then(function(d){
                return Promise.all(jimps);
            }).then(function(data){
                data[0].flip(false, true); // lol its upside down but its actually quite convinent
        
                data[0].composite(data[turnMark], piece.x, piece.y);

                let pos = [];
                for(let i in positions){
                    pos.push(positions[i].join(''));
                }

                let newEmbed;
                for(let i in pos){
                    i = parseInt(i);

                    if(pos[i].match(winCon)){
                        data[0].composite(data[7 + turnBin], i * 68 + 47, (6 - towers[i]) + 22);

                        newEmbed = new MessageEmbed(startEmbed)
						.setImage(`attachment://${gameId}.png`)
						.setDescription(`<@${players[0].id}> vs <@${players[1].id}>\n\n${players[turnBin]} has won!`);
                        
                        won = true;
                    }
    
                    for(let ii in pos[i]){
                        ii = parseInt(ii);

                        if(i > 3) break; // will throw error past this point
    
                        if((pos[i][ii] + pos[i+1][ii] + pos[i+2][ii] + pos[i+3][ii]).match(winCon)){
                            data[0].composite(data[3 + turnBin], i * 68 + 22, ii * 68 + 47);

                            newEmbed = new MessageEmbed(startEmbed)
                            .setImage(`attachment://${gameId}.png`)
                            .setDescription(`<@${players[0].id}> vs <@${players[1].id}>\n\n${players[turnBin]} has won!`);

                            won = true;
                        }
    
                        if(ii < 2){ // skips this check after this point
                            if((pos[i][ii] + pos[i+1][ii+1] + pos[i+2][ii+2] + pos[i+3][ii+3]).match(winCon)){
                                data[0].composite(data[1 + turnBin], i * 68 + 28, ii * 68 + 28);

                                newEmbed = new MessageEmbed(startEmbed)
                                .setImage(`attachment://${gameId}.png`)
                                .setDescription(`<@${players[0].id}> vs <@${players[1].id}>\n\n${players[turnBin]} has won!`);
                                
                                won = true;
                            }
                        }
    
                        if(ii > 2){ // skips this check after this point
                            if((pos[i][ii] + pos[i+1][ii-1] + pos[i+2][ii-2] + pos[i+3][ii-3]).match(winCon)){
                                data[1 + turnBin].flip(true, false);
                                data[0].composite(data[1 + turnBin], i * 68 + 28, ii * 68 + 28);

                                newEmbed = new MessageEmbed(startEmbed)
                                .setImage(`attachment://${gameId}.png`)
                                .setDescription(`<@${players[0].id}> vs <@${players[1].id}>\n\n${players[turnBin]} has won!`);

                                won = true;
                            }
                        }
                    }
                }

                if(won == false){
                    newEmbed = new MessageEmbed(startEmbed)
                    .setImage(`attachment://${gameId}.png`)
                    .setDescription(`<@${players[0].id}> vs <@${players[1].id}>\n\nUse the /move command to make a move!\n\nIt is ${players[next]}'s Turn!`);
                }

                data[0].flip(false, true); // unflip it

                data[0].write(`./images/connect4/active/${gameId}.png`, (err) => {
                    if(err) console.log(err);

					const attachment = new MessageAttachment(`./images/connect4/active/${gameId}.png`);
					
					interaction.editReply({ embeds: [newEmbed], files: [attachment] });
				});
            });

            turn++;
        }

        await gameData.findByIdAndDelete(gameId);
		await moveData.deleteOne({ gameId: gameId })
		await positionData.deleteOne({ gameId: gameId });
		fs.unlinkSync(`./images/connect4/active/${gameId}.png`);
    }
}