const jsonHandler = require("../data/json-handler");

const removeReactionMessage = async (client, message, args) => {
    const messageID = args[0];
    const emoji = args[1];
    const roleID = args[2];
    let channelID;
    if(args[3]){
        channelID = args[3]
    }
    else{
        channelID = message.channelId
    }
    const fileData = await jsonHandler.read('./data/reaction-messages.json');
    fileData.reactionMessages.splice(fileData.reactionMessages.indexOf({ messageID: messageID, emoji: emoji, roleID: roleID, channelID: channelID }), 1)
    jsonHandler.write('./data/reaction-messages.json', fileData)
    console.log(fileData.reactionMessages)
}

module.exports = removeReactionMessage;