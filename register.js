const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const fs = require('fs');
require('dotenv').config();

const rest = new REST({ version: '9' }).setToken(process.env.BOT_TOKEN);

const commands = [];
const commandFiles = fs.readdirSync(`./commands`).filter(file => file.endsWith('.js'));
for (const fileName of commandFiles) {
	const command = require(`./commands/${fileName}`);
    commands.push(command.info);
}

(async () => {
	try {
		console.log('Started refreshing application (/) commands.');

		await rest.put(
			Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
			{
				body: commands
			},
		);

		console.log('Successfully reloaded application (/) commands.');
	} catch (error) {
		console.error(error);
	}
})();