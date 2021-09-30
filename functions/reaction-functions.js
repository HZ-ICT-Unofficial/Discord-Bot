const jsonHandler = require('../util/json-handler');
const silentError = require('../util/silent-error');

const reactionFunctions = {};

const verifyReactionRole = async (client, messageReaction, reactionRole) => {
    const reactionChannel = await client.channels.fetch(reactionRole.channelId).catch(() => {
        jsonHandler.remove(`${process.env.DATA_DIR}/reactions.json`, (storedReactionRole) => storedReactionRole.channelId === reactionRole.channelId);
    });
    if (!reactionChannel) {
        return false;
    }

    const reactionMessage = await reactionChannel.messages.fetch(reactionRole.messageId).catch(() => {
        jsonHandler.remove(`${process.env.DATA_DIR}/reactions.json`, (storedReactionRole) => storedReactionRole.messageId === reactionRole.messageId);
    });
    if (!reactionMessage) {
        return false;
    }
    
    return messageReaction.message === reactionMessage && messageReaction.emoji.name === reactionRole.emoji;
}

const getMemberInfo = async (messageReaction, user, reactionRole) => {
    const member = await messageReaction.message.guild.members.fetch(user.id).catch(silentError);
    if (!member) {
        return;
    }
    
    const role = await messageReaction.message.guild.roles.fetch(reactionRole.roleId).catch(silentError);
    if (!role) {
        return;
    }

    return {
        member: member,
        role: role
    }
} 

const giveReactionRole = async (client, messageReaction, user, reactionRole) => {
    const verified = await verifyReactionRole(client, messageReaction, reactionRole);
    if (verified) {
        const memberInfo = await getMemberInfo(messageReaction, user, reactionRole);
        memberInfo.member.roles.add(memberInfo.role);
    }    
}

const revokeReactionRole = async (client, messageReaction, user, reactionRole) => {
    const verified = await verifyReactionRole(client, messageReaction, reactionRole);
    if (verified) {
        const memberInfo = await getMemberInfo(messageReaction, user, reactionRole);
        memberInfo.member.roles.remove(memberInfo.role);
    }
}

reactionFunctions.onMessageReactionAdded = async (client, messageReaction, user) => {
    if (user.bot) {
        return;
    }

    const fileData = await jsonHandler.read(`${process.env.DATA_DIR}/reactions.json`);
    fileData.data.forEach(async (reactionRole) => {
        giveReactionRole(client, messageReaction, user, reactionRole);
    });
}

reactionFunctions.onMessageReactionRemoved = async (client, messageReaction, user) => {
    if (user.bot) {
        return;
    }

    const reactionRole = await jsonHandler.findFirst(`${process.env.DATA_DIR}/reactions.json`, (storedReactionRole) => {
        return storedReactionRole.messageId === messageReaction.message.id
            && storedReactionRole.channelId === messageReaction.message.channelId
            && storedReactionRole.emoji === messageReaction.emoji.name;
    });
    
    if (reactionRole) {
        revokeReactionRole(client, messageReaction, user, reactionRole);
    }
}

module.exports = reactionFunctions;