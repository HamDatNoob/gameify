const fs = require('fs');

module.exports = {
    name: 'interactionCreate',
    async execute(interaction){
        if(interaction.isCommand()){ //commands
            const command = interaction.client.commands.get(interaction.commandName);

            if(!command) return;

            try{
                await command.execute(interaction);
            }catch(error){
                console.error(error);
                return interaction.followUp({ content: '**An error occurred:** An unknown internal error occurred whilst completing this action!', ephemeral: true });
            }
        }else if(interaction.isSelectMenu()){ //select menus
            const selectMenuFiles = fs.readdirSync(`./components/selectMenus/${interaction.customId.split('-')[0]}`).filter(file => file.endsWith('.js'));
            for(const file of selectMenuFiles){
	            const component = require(`../components/selectMenus/${interaction.customId.split('-')[0]}/${file}`);

                if(component.name != interaction.customId.split('-')[1]) continue;
                
                try{
                    await component.execute(interaction);
                }catch(error){
                    console.error(error);
                    return interaction.followUp({ content: '**An error occurred:** An unknown internal error occurred whilst completing this action!', ephemeral: true });
                }
            }
        }else if(interaction.isButton()){ //buttons
            const buttonFiles = fs.readdirSync(`./components/buttons/${interaction.customId.split('-')[0]}`).filter(file => file.endsWith('.js'));
            for(const file of buttonFiles){
	            const component = require(`../components/buttons/${interaction.customId.split('-')[0]}/${file}`);
                
                if(component.name != interaction.customId.split('-')[1]) continue;
                
                try{
                    await component.execute(interaction);
                }catch(error){
                    console.error(error);
                    return interaction.followUp({ content: '**An error occurred:** An unknown internal error occurred whilst completing this action!', ephemeral: true });
                }
            }
        }else if(interaction.isAutocomplete()){ //autocompletes
            const autocompleteFiles = fs.readdirSync(`./components/autocompletes`).filter(file => file.endsWith('.js'));
            for(const file of autocompleteFiles){
	            const component = require(`../components/autocompletes/${file}`);

                if(component.name != interaction.commandName.concat('Autocomplete')) continue;

                try{
                    await component.execute(interaction);
                }catch(error){
                    console.error(error);
                    return;
                }
            }
        }else{ //nothing found
            return await interaction.reply({ content: '**An error occurred:** Invalid interaction!', ephemeral: true });
        }
    }
}; 