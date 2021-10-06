const fs = require('fs');
const jsonHandler = require('../util/json-handler');
const silentError = require('../util/silent-error');

// TODO: ADD REMOVE ROLE FUNCTION - AND IMPLEMENT IT IN REACTROLE.JS 'removeReactionRoles'

const DATA_DIR = './data';

const getReactionsPath = (guildId) => `${DATA_DIR}/${guildId}/reactions.json`;

const createDirectory = (location, name) => {
    return new Promise(async (resolve, reject) => {
        const dirPath = `${location}/${name}`;
        if (fs.existsSync(dirPath)) {
            return resolve(true);
        }

        fs.mkdir(dirPath, (err) => {
            if (err) {
                return reject(err);
            }
            return resolve(true);
        })
    });
}

const createGuildDirectory = async (guildId) => {
    return await createDirectory(DATA_DIR, guildId).catch(silentError);
}

const repairReactionData = async (guildId) => {
    const DEFAULT_REACTION_DATA = {
        data: []
    };

    await createGuildDirectory(guildId);
    return await jsonHandler.write(getReactionsPath(guildId), DEFAULT_REACTION_DATA);
}

const handleFileError = async (err, guildId) => {
    if (err.code === 'ENOENT') {
        return await repairReactionData(guildId);
    } else {
        console.error(err);
        return false;
    }
}

const clearChannelRoles = async (guildId, channelId) => {
    const reactionsPath = getReactionsPath(guildId);
    await jsonHandler.remove(reactionsPath, (storedReactionRole) => storedReactionRole.channelId === channelId);
}

const clearMessageRoles = async (guildId, messageId) => {
    const reactionsPath = getReactionsPath(guildId);
    await jsonHandler.remove(reactionsPath, (storedReactionRole) => storedReactionRole.messageId === messageId);
}

const verifyChannel = async (messageReaction, reactionRole) => {
    return await messageReaction.message.guild.channels.fetch(reactionRole.channelId).catch(async (err) => {
        console.error(err);
        await clearChannelRoles(messageReaction.message.guild.id, reactionRole.channelId);
    });
}

const verifyMessage = async (messageReaction, reactionRole, channel) => {
    return await channel.messages.fetch(reactionRole.messageId).catch(async (err) => {
        console.error(err);
        await clearMessageRoles(messageReaction.message.guild.id, reactionRole.messageId);
    });
}

const verifyReactionRole = async (messageReaction, reactionRole) => {
    const channel = await verifyChannel(messageReaction, reactionRole);
    if (!channel) {
        return false;
    }

    const message = await verifyMessage(messageReaction, reactionRole, channel);
    if (!message) {
        return false;
    }

    return messageReaction.message.id === reactionRole.messageId && messageReaction.emoji.name === reactionRole.emoji;
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
        member,
        role
    }
}

const giveReactionRole = async (messageReaction, user, reactionRole) => {
    const isValidRole = await verifyReactionRole(messageReaction, reactionRole);
    if (!isValidRole) {
        return;
    }
    
    const memberInfo = await getMemberInfo(messageReaction, user, reactionRole);
    if (memberInfo) {
        memberInfo.member.roles.add(memberInfo.role).catch(silentError);
    }
}

const revokeReactionRole = async (messageReaction, user, reactionRole) => {
    const isValidRole = await verifyReactionRole(messageReaction, reactionRole);
    if (!isValidRole) {
        return;
    }

    const memberInfo = await getMemberInfo(messageReaction, user, reactionRole);
    if (memberInfo) {
        memberInfo.member.roles.remove(memberInfo.role).catch(silentError);
    }
}

const findAll = async (guildId) => {
    const fileData = await jsonHandler.read(getReactionsPath(guildId)).catch(async (err) => await handleFileError(err, guildId));
    return fileData ? fileData.data : [];
}

const find = async (guildId, reactionData) => {
    const reactionRoles = await jsonHandler.find(getReactionsPath(guildId), reactionData).catch(async (err) => await handleFileError(err, guildId));
    return reactionRoles || [];
}

const query = async (guildId, reactionData) => {
    const reactionRoles = await jsonHandler.query(getReactionsPath(guildId), reactionData).catch(async (err) => await handleFileError(err, guildId));
    return reactionRoles || [];
}

const create = async (guildId, reactionData) => {
    let newReactionRole = await jsonHandler.addUnique(getReactionsPath(guildId), reactionData).catch(async (err) => await handleFileError(err, guildId));
    if (newReactionRole) {
        return newReactionRole;
    }
    return await jsonHandler.addUnique(getReactionsPath(guildId), reactionData).catch(silentError);
}

const remove = async (guildId, reactionData) => {
    const reactionRoles = await jsonHandler.remove(getReactionsPath(guildId), reactionData).catch(async (err) => await handleFileError(err, guildId));
    return reactionRoles || [];
}

module.exports = {
    giveReactionRole,
    revokeReactionRole,
    findAll,
    find,
    query,
    create,
    remove
}