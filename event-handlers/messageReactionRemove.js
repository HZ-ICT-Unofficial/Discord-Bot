const reactionFunctions = require('../functions/reactions');

module.exports = async (messageReaction, user) => {
    if (user.bot) {
        return;
    }
    
    const reactionRoles = await reactionFunctions.query(messageReaction.message.guild.id, {
        messageId: messageReaction.message.id,
        emoji: messageReaction.emoji.name,
        channelId: messageReaction.message.channelId
    });
    reactionRoles.forEach((reactionRole) => reactionFunctions.revokeReactionRole(messageReaction, user, reactionRole));
}