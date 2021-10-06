const Discord = require('discord.js');
require('dotenv').config();

const eventHandlers = require('./event-handlers');

const client = new Discord.Client({
    intents: new Discord.Intents(32767),
    partials: ['MESSAGE', 'CHANNEL', 'REACTION']
});

client.once('ready', eventHandlers.ready);
client.on('interactionCreate', eventHandlers.interactionCreate);
client.on('messageReactionAdd', eventHandlers.messageReactionAdd);
client.on('messageReactionRemove', eventHandlers.messageReactionRemove);

client.login(process.env.BOT_TOKEN);