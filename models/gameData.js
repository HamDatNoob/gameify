const mongoose = require('mongoose');

const gameDataSchema = new mongoose.Schema({
    _id: {
        type: String,
        required: true
    },
    type: {
        type: Number,
        required: true
    },
    players: {
        type: Array,
        required: true
    },
    channel: {
        type: String,
        required: true
    }
});

const gameData = mongoose.model('gameData', gameDataSchema);
module.exports = gameData;