const Discord = require("discord.js")
require("dotenv").config()
const clientIntents = new Discord.Intents(32767);
const client = new Discord.Client({ intents: clientIntents})
const prefix = '!'

client.once('ready', () => {
    console.log("Online!")
})

client.on('message', (message) => {
    if(!message.content.startsWith(prefix) || message.author.bot) return;

    const args = message.content.slice(prefix.length).split(" ");
    const command = args.shift().toLowerCase();

    switch(command){
        case 'ping':
            message.channel.send("Pong");
            break;
        default:
            break;
    }

})

client.login(process.env.TOKEN)