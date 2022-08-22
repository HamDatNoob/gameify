const moveData = require("../../../models/moveData.js");
const positionData = require('../../../models/postitionData.js');
const { MessageEmbed, MessageAttachment, MessageActionRow, MessageButton } = require('discord.js');
const { randomID } = require("../../random.js");
const { sleep } = require("../../sleep.js");

async function validMoves(gameId, player, move, interaction){
    let pd = await positionData.findOne({ gameId: gameId });

    const cardData = pd?.positions[0];

    let hands = cardData.hands;

    let valid = [];
    for(let i in hands){
        if(hands[i].player != player) continue;

        let card = hands[i].hand[move - 1];

        for(let ii = 0; ii < hands[i].hand.length; ii++){
            if(cardData.discard.at(-1).color == card.color || cardData.discard.at(-1).symbol == card.symbol || card.color == 'action'){
                valid.push({ name: `${ii + 1}`, value: ii + 1 });
            }
        }

        if(card.color == 'action'){
            const embed = new MessageEmbed()
                .setTitle('Choose a Color')
                .setColor('#4cb99D')
                .setFooter({ text: `Game ID: ${gameId}` })
                .setTimestamp();
            const actionRow = new MessageActionRow()
                .addComponents(
                    new MessageButton()
                        .setCustomId('uno-wildButton-red')
                        .setLabel('Red')
                        .setStyle("DANGER"),
                    new MessageButton()
                        .setCustomId('uno-wildButton-yellow')
                        .setLabel('Yellow')
                        .setStyle("SECONDARY"),
                    new MessageButton()
                        .setCustomId('uno-wildButton-green')
                        .setLabel('Green')
                        .setStyle("SUCCESS"),
                    new MessageButton()
                        .setCustomId('uno-wildButton-blue')
                        .setLabel('Blue')
                        .setStyle("PRIMARY"),
                );

            await interaction.reply({ embeds: [embed], components: [actionRow], ephemeral: true });
        }
    }

    return valid;
}

module.exports = { validMoves };