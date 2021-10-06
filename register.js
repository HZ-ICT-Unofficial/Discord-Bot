const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
require('dotenv').config();

const commandLoader = require('./commands');
const rest = new REST({ version: '9' }).setToken(process.env.BOT_TOKEN);

const getCommandsInfo = () => {
	const commands = commandLoader.load();
	return Object.values(commands).map((command) => command.info);
}

const saveGlobalCommands = async (commandsInfo) => {
	await rest.put(
		Routes.applicationCommands(process.env.CLIENT_ID),
		{
			body: commandsInfo
		},
	);
}

const saveGuildCommands = async (guildId, commandsInfo) => {
	await rest.put(
		Routes.applicationGuildCommands(process.env.CLIENT_ID, guildId),
		{
			body: commandsInfo
		},
	);
}

(async () => {
	try {
		console.log('Started refreshing commands.');
		
		const TESTING_GUILD_ID = '892730236406472734';
		const commandsInfo = getCommandsInfo();

		// saveGlobalCommands([]);
		saveGuildCommands(TESTING_GUILD_ID, commandsInfo);

		console.log('Successfully reloaded commands.');
	} catch (error) {
		console.error(error);
	}
})();