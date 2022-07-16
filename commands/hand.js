const positionData = require("../models/postitionData.js");
const allMoves = require('../json/gameInfo.json');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { randomID } = require('../scripts/random.js');
const moveData = require("../models/moveData.js");
const gameData = require("../models/gameData.js");
const gameMoves = require('../json/gameInfo.json');

module.exports = {
	data: new SlashCommandBuilder()
	.setName('hand')
	.setDescription('View your hand, only applicable in certain games.'),
	async execute(interaction){

    }
}