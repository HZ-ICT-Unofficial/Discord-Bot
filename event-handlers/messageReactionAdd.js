const reactionFunctions = require('../functions/reactions');

module.exports = async (messageReaction, user) => {
    if (user.bot) {
        return;
    }
    
    const reactionRoles = await reactionFunctions.findAll(messageReaction.message.guild.id);
    reactionRoles.forEach(reactionRole => reactionFunctions.giveReactionRole(messageReaction, user, reactionRole));
}