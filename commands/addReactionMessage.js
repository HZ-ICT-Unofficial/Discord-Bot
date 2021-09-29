const jsonHandler = require("../data/json-handler");

const addReactionMessage = async (client, message, args) => {
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
    if(!(fileData.reactionMessages.some((reactionMessage) => { return reactionMessage.messageID == messageID && reactionMessage.emoji == emoji && reactionMessage.roleID == roleID}))){
        fileData.reactionMessages.push({ messageID: messageID, emoji: emoji, roleID: roleID, channelID: channelID });
        jsonHandler.write('./data/reaction-messages.json', fileData)
    }
    console.log(fileData.reactionMessages)
}

module.exports = addReactionMessage;