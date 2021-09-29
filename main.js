const Discord = require("discord.js")
require("dotenv").config()

const client = new Discord.Client({ intents: [Discord.Intents.FLAGS.GUILDS]})

client.once('ready', () => {
    console.log("Online!")
})

client.login(process.env.TOKEN)



