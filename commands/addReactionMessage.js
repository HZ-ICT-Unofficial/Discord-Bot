const jsonHandler = require("../data/json-handler");

const addReactionMessage = async (client, message, args) => {
    const messageID = args[0];
    const emoji = args[1];
    const roleID = args[2];
    const fileData = await jsonHandler.read('./data/reaction-messages.json');
    fileData.reactionMessages.push({ messageID: messageID, emoji: emoji, roleID: roleID, channelID: message.channelId });
    jsonHandler.write('./data/reaction-messages.json', fileData)

}

module.exports = addReactionMessage;