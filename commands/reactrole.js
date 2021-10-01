const { SlashCommandBuilder } = require('@discordjs/builders');
const jsonHandler = require('../util/json-handler');
const reactionsPath = `${process.env.DATA_DIR}/reactions.json`;

const silentError = (err) => {
    return;
}

// TODO: Fix removing multiple roles at once from the same emoji.
// (Giving already works)

const matchesReaction = (reaction, newReactionData) => {
    return reaction.messageId === newReactionData.messageId
        && reaction.roleId === newReactionData.roleId
        && reaction.emoji === newReactionData.emoji
        && reaction.channelId === newReactionData.channelId;
}

const findExistingReactions = (currentReactions, newReactionData) => {
    return currentReactions.some(reaction => matchesReaction(reaction, newReactionData));
}

const showExistingReactionRoles = async (interaction) => {
    const messageId = interaction.options.getString('message_id', false);
    const role = interaction.options.getRole('role', false);
    const emoji = interaction.options.getString('emoji', false);
    const channel = interaction.options.getChannel('channel', false);

    const fileData = await jsonHandler.read(reactionsPath);
    if (messageId) {
        const results = await jsonHandler.find(reactionsPath, (reactionRole) => {
            let someBoolean = true;
            if (messageId && reactionRole.messageId !== messageId) {
                someBoolean = false;
            } else if (role && reactionRole.roleId !== role.id) {
                someBoolean = false;
            } else if (emoji && reactionRole.emoji !== emoji) {
                someBoolean = false;
            } else if (channel && reactionRole.channelId !== channel.id) {
                someBoolean = false;
            }

            return someBoolean;
        }, fileData);
        if (results) {
            console.log(results);
            // TODO: Show these in an embed
        }
    } else {
        // TODO: Show these in an embed
        console.log(fileData.data);
    }
    await interaction.reply('Showing existing reaction roles');
}

const run = async (interaction) => {
    const subcommand = interaction.options.getSubcommand(true);

    if (subcommand === 'show') {
        await showExistingReactionRoles(interaction);
        return;
    }

    const messageId = interaction.options.getString('message_id', true);
    const role = interaction.options.getRole('role', true);
    const emoji = interaction.options.getString('emoji', true);
    const channel = interaction.options.getChannel('channel', false) || interaction.channel;

    const message = await channel.messages.fetch(messageId).catch(silentError);
    if (!message) {
        await interaction.reply('The message could not be found!');
        return;
    }

    const fileData = await jsonHandler.read(reactionsPath);

    const newReactionData = {
        messageId: messageId,
        emoji: emoji,
        roleId: role.id,
        channelId: channel.id
    }

    if (subcommand === 'add' && !findExistingReactions(fileData.data, newReactionData)) {
        await jsonHandler.add(reactionsPath, newReactionData, fileData);
        await message.react(emoji);
        await interaction.reply('Added new reaction role!');
    } else if (subcommand === 'remove') {
        await jsonHandler.remove(reactionsPath, (storedReactionRole) => matchesReaction(storedReactionRole, newReactionData));
        await interaction.reply('Removed reaction role!')
    } else {
        await interaction.reply('This reaction role already exists!');
    }
}

const info = new SlashCommandBuilder()
    .setName('reactrole')
    .setDescription('Allows you to give roles based on reactions.')
    .addSubcommand(subcommand =>
        subcommand
            .setName('add')
            .setDescription('Adds a new reaction role.')
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
            )
    )
    .addSubcommand(subcommand => 
        subcommand
            .setName('remove')
            .setDescription('Removes an existing reaction role.')
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
            )
    )
    .addSubcommand(subcommand =>
        subcommand
            .setName('show')
            .setDescription('Shows existing reaction roles.')
            .addStringOption(option =>
                option
                    .setName('message_id')
                    .setDescription('The message id of the reaction role.')
            )
            .addStringOption(option =>
                option
                    .setName('emoji')
                    .setDescription('The emoji of a reaction role.')
            )
            .addRoleOption(option =>
                option
                    .setName('role')
                    .setDescription('The role of a reaction role.')
            )
            .addChannelOption(option =>
                option
                    .setName('channel')
                    .setDescription('The channel the reaction role is in.')
            )
    );

module.exports = {
    run: run,
    info: info
};