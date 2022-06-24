const mongoose = require('mongoose');

const positionDataSchema = new mongoose.Schema({
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
    positions: {
        type: Array,
        required: true
    }
});

const positionData = mongoose.model('positionData', positionDataSchema);
module.exports = positionData;