const mongoose = require('mongoose');
const { dbURI } = require('../config.json');

module.exports = {
	name: 'ready',
	once: true,
	execute(client) {
		mongoose.connect(dbURI, {
			useNewUrlParser: true,
			useUnifiedTopology: true
		}).then(() => {
			console.log('\nDatabase found and connected.');
			console.log(`Ready! Logged in as ${client.user.tag}!\n`);
			client.user.setActivity('games!');
		}).catch((err) => {
			console.log(err);
		})
	},
};