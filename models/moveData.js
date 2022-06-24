const mongoose = require('mongoose');

const moveDataSchema = new mongoose.Schema({
    _id: {
        type: String,
        required: true
    },
    gameId: {
        type: String,
        required: true
    },
    channel: {
        type: String,
        required: true
    },
    user: {
        type: String,
        required: true
    },
    move: {
        type: String,
        required: true
    },
    turn: {
        type: Number,
        required: true
    },
    next: {
        type: String,
        required: true
    }
});

const moveData = mongoose.model('moveData', moveDataSchema);
module.exports = moveData;