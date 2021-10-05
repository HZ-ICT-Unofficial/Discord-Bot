const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const fs = require('fs');
require('dotenv').config();

const rest = new REST({ version: '9' }).setToken(process.env.BOT_TOKEN);
const TEST_GUILD_ID = '892730236406472734';

const commands = [];
const commandFiles = fs.readdirSync(process.env.COMMANDS_DIR).filter(file => file.endsWith('.js'));
for (const fileName of commandFiles) {
	const command = require(`${process.env.COMMANDS_DIR}/${fileName}`);
    commands.push(command.info);
}

(async () => {
	try {
		console.log('Started refreshing application (/) commands.');
		await rest.put(
			Routes.applicationCommands(process.env.CLIENT_ID),
			{
				body: commands
			},
		);
		
		await rest.put(
			Routes.applicationGuildCommands(process.env.CLIENT_ID, TEST_GUILD_ID),
			{
				body: commands
			},
		);
		console.log('Successfully reloaded application (/) commands.');
	} catch (error) {
		console.error(error);
	}
})();