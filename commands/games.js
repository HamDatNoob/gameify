const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const gameRules = require('../json/gameRules.json');

module.exports = {
	data: new SlashCommandBuilder()
	.setName('games')
	.setDescription('Displays all games available to be played'),
	async execute(interaction){
		let games = [];
		for(let i in gameRules){
			games.push({ name: gameRules[i].displayName, value: `${gameRules[i].minPlayers} - ${gameRules[i].maxPlayers} Players` })
		}

		const gamesEmbed = new MessageEmbed()
		.setTitle('Games')
		.setColor('4AB99F')
		.setThumbnail('https://cdn.discordapp.com/avatars/883565793143582731/3a32f2a0c5fb561cf9b1f5107aaaeed3.webp')
		.addFields(games);

		return interaction.reply({ embeds: [gamesEmbed], ephemeral: true });
	}
}