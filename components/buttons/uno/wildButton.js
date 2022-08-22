const { QuickDB } = require("quick.db");
const db = new QuickDB({ filePath: "databases/uno.sqlite" });
const { sleep } = require('../../../scripts/sleep.js');

module.exports = {
    name: 'wildButton',
    async execute(interaction){
        const color = interaction.customId.split('-')[2];
        const gameId = interaction.message.embeds[0].footer.text.slice(9);

        if(!await db.get(`wildColor.${gameId}.color`)){
            await db.set(`wildColor.${gameId}.color`, color);
            await interaction.reply({ content: `The color is now ${color}!` });
            
            await sleep(5);
            await interaction.deleteReply();
        }else{
            await interaction.reply({ content: `You cannot change the color again!`, ephemeral: true });
        }
    }
}