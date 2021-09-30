const { SlashCommandBuilder } = require('@discordjs/builders');
const jsonHandler = require('../util/json-handler');

const silentError = (err) => {
    return;
} 

const matchesReaction = (reaction, newReactionData) => {
    return reaction.messageId === newReactionData.messageId
        && reaction.roleId === newReactionData.roleId
        && reaction.emoji === newReactionData.emoji
        && reaction.channelId === newReactionData.channelId;
}

const findExistingReactions = (currentReactions, newReactionData) => {
    return currentReactions.some(reaction => matchesReaction(reaction, newReactionData));
}

const run = async (interaction) => {
    const messageId = interaction.options.getString('message_id', true);
    const role = interaction.options.getRole('role', true);
    const emoji = interaction.options.getString('emoji', true);
    const channel = interaction.options.getChannel('channel_id', false) || interaction.channel;

    const message = await channel.messages.fetch(messageId).catch(silentError);
    if (!message) {
        await interaction.reply('The message could not be found!');
        return;
    }

    const fileData = await jsonHandler.read(`${process.env.DATA_DIR}/reactions.json`);
    const currentReactions = fileData.data;

    const newReactionData = {
        messageId: messageId,
        emoji: emoji,
        roleId: role.id,
        channelId: channel.id
    }

    if (!findExistingReactions(currentReactions, newReactionData)) {
        currentReactions.push(newReactionData);
        await jsonHandler.write(`${process.env.DATA_DIR}/reactions.json`, fileData);
        await message.react(emoji);
        await interaction.reply('Added new reaction role!');
    } else {
        await interaction.reply('This reaction role already exists!');
    }
}

const info = new SlashCommandBuilder()
    .setName('reactrole')
    .setDescription('Allows you to give roles based on reactions.')
    .addStringOption(option =>
        option
            .setName('message_id')
            .setDescription('The id of the message.')
            .setRequired(true))
    .addRoleOption(option =>
        option
            .setName('role')
            .setDescription('The role given once someone reacts.')
            .setRequired(true))
    .addStringOption(option =>
        option
            .setName('emoji')
            .setDescription('The emoji to react to.')
            .setRequired(true))
    .addChannelOption(option =>
        option
            .setName('channel')
            .setDescription('The channel where the message is located.')
            .setRequired(false));

module.exports = {
    run: run,
    info: info
};