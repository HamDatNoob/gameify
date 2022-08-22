module.exports = {
    name: 'handButton',
    async execute(interaction){
        try{
            await require('../../../commands/hand.js').execute(interaction);
        }catch(error){
            console.error(error);
            return interaction.reply({ content: '**An error occurred:** An unknown internal error occurred whilst completing this action!', ephemeral: true });
        }
    }
}