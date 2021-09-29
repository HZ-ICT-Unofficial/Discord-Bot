const jsonHandler = require("./data/json-handler")
const fs = require('fs');
const commands = {}
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
    const commandName = file.split(".js")[0].toLowerCase();
    const command = require(`./commands/${file}`);
    commands[commandName] = command;
}

require("dotenv").config()
const Discord = require("discord.js")
const clientIntents = new Discord.Intents(32767);
const client = new Discord.Client({ intents: clientIntents, partials: ['MESSAGE', 'CHANNEL', 'REACTION']})
const prefix = process.env.PREFIX

const clearReactionMessages = () => {
    // jsonHandler.read('data/reaction-messages.json').reactionMessages.forEach(())
}

client.once('ready', () => {
    console.log("Online!")
})

client.on('messageCreate', (message) => {
    if(!message.content.startsWith(prefix) || message.author.bot) return;

    const args = message.content.slice(prefix.length).split(" ");
    const commandName = args.shift().toLowerCase();
    const command = commands[commandName]
    if(command){
        command(client, message, args)
    }
})

client.on('messageReactionAdd', async (messageReaction, user) => {
    const fileData = await jsonHandler.read('data/reaction-messages.json')
    console.log(fileData)
    fileData.reactionMessages.forEach( async (reactionMessageObject) => {
        const reactionChannel = await client.channels.fetch(reactionMessageObject.channelID);
        const reactionMessage = await reactionChannel.messages.fetch(reactionMessageObject.messageID);

        if(messageReaction.message == reactionMessage){
            if(messageReaction.emoji.name == reactionMessageObject.emoji){
                const member = await messageReaction.message.guild.members.fetch(user.id)
                const role = await messageReaction.message.guild.roles.fetch(reactionMessageObject.roleID)
                member.roles.add(role)
            }
        }
    })
})
client.on('messageReactionRemove', async (messageReaction, user) => {
    const fileData = await jsonHandler.read('data/reaction-messages.json')
    console.log(fileData)
    fileData.reactionMessages.forEach( async (reactionMessageObject) => {
        const reactionChannel = await client.channels.fetch(reactionMessageObject.channelID);
        const reactionMessage = await reactionChannel.messages.fetch(reactionMessageObject.messageID);
        if(messageReaction.message == reactionMessage){
            if(messageReaction.emoji.name == reactionMessageObject.emoji){
                const member = await messageReaction.message.guild.members.fetch(user.id)
                const role = await messageReaction.message.guild.roles.fetch(reactionMessageObject.roleID)
                member.roles.remove(role)
            }
        }
    })
})

client.login(process.env.TOKEN)