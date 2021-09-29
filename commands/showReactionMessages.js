const jsonHandler = require("../data/json-handler");
const Discord = require("discord.js")

const showReactionMessages = async (client, message, args) => {
    const fields = []
    const fileData = await jsonHandler.read('./data/reaction-messages.json')
    const filteredrmsg = fileData.reactionMessages.filter((reactionMessage) => reactionMessage.channelID == message.channelId)
    console.log(filteredrmsg)
    await filteredrmsg.forEach(async (reactionMessage) => {
        console.log(reactionMessage)
        const role = await message.guild.roles.fetch(reactionMessage.roleID)
        fields.push({name: `${role.name}`, value: `Message ID: ${reactionMessage.messageID} \nRole ID: ${reactionMessage.roleID} \nEmoji: ${reactionMessage.emoji}`})
        console.log(fields)
    })
    const embed = new Discord.MessageEmbed()
        .setColor("#717f80")
        .setTitle(`Reaction Messages for ${message.channel.name}`)
        .setDescription("A list of all the Reaction Messages that have been created here in the server:")
        .addFields(fields)
    
    console.log(embed)
    message.channel.send({embeds: [embed]})
}

module.exports = showReactionMessages;