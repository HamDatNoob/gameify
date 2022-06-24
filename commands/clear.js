const gameData = require('../models/gameData.js');
const moveData = require('../models/moveData.js');
const positionData = require('../models/postitionData.js');
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('clear')
    .setDescription('Clears databases for the current channel'),
    async execute(interaction){
        let channel = interaction.channelId;

        await gameData.deleteMany({ channel: channel }).then(function(){});     
        await moveData.deleteMany({ channel: channel }).then(function(){});
        await positionData.deleteMany({ channel: channel }).then(function(){});

        interaction.reply({ content: 'Cleared databases for the current channel!', ephemeral: true });
    }
}