const Discord = require('discord.js');
const commands = require('./util/command-loader');
const reactionFunctions = require('./functions/reaction-functions');
require('dotenv').config();

// TODO: Memert (rimmert meme) command

const client = new Discord.Client({
    intents: new Discord.Intents(32767),
    partials: ['MESSAGE', 'CHANNEL', 'REACTION']
});

client.once('ready', () => {
	console.log('Ready!');
});

client.on('interactionCreate', (interaction) => {
    if (!interaction.isCommand()) {
        return;
    }
    
    const command = commands[interaction.commandName];
    if (command) {
        command(interaction);
    }
});

client.on('messageReactionAdd', (messageReaction, user) => reactionFunctions.onMessageReactionAdded(client, messageReaction, user));
client.on('messageReactionRemove', (messageReaction, user) => reactionFunctions.onMessageReactionRemoved(client, messageReaction, user));

client.login(process.env.BOT_TOKEN);