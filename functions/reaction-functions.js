const jsonHandler = require('../util/json-handler');
const silentError = require('../util/silent-error');

const reactionFunctions = {};
const reactionsPath = `${process.env.DATA_DIR}/reactions.json`;

const verifyReactionRole = async (client, messageReaction, reactionRole) => {
    const reactionChannel = await client.channels.fetch(reactionRole.channelId).catch(() => {
        jsonHandler.remove(reactionsPath, (storedReactionRole) => storedReactionRole.channelId === reactionRole.channelId);
    });
    if (!reactionChannel) {
        return false;
    }

    const reactionMessage = await reactionChannel.messages.fetch(reactionRole.messageId).catch(() => {
        jsonHandler.remove(reactionsPath, (storedReactionRole) => storedReactionRole.messageId === reactionRole.messageId);
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

    const fileData = await jsonHandler.read(reactionsPath);
    fileData.data.forEach(async (reactionRole) => {
        giveReactionRole(client, messageReaction, user, reactionRole);
    });
}

reactionFunctions.onMessageReactionRemoved = async (client, messageReaction, user) => {
    if (user.bot) {
        return;
    }

    const reactionData = {
        messageId: messageReaction.message.id,
        emoji: messageReaction.emoji.name,
        channel: messageReaction.message.channelId
    }

    const reactionRoles = await jsonHandler.find(reactionsPath, reactionData);
    if (reactionRoles.length === 0) {
        return;
    }

    reactionRoles.forEach((reactionRole) => {
        revokeReactionRole(client, messageReaction, user, reactionRole);
    });
}

module.exports = reactionFunctions;