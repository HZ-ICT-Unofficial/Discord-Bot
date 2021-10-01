const { SlashCommandBuilder } = require('@discordjs/builders');
const jsonHandler = require('../util/json-handler');
const reactionsPath = `${process.env.DATA_DIR}/reactions.json`;
const Discord = require('discord.js')

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

const filterReactions = (reactionRole, messageId, role, emoji, channel) => {
    let isFound = true;
    if (messageId && reactionRole.messageId !== messageId) {
        isFound = false;
    } else if (role && reactionRole.roleId !== role.id) {
        isFound = false;
    } else if (emoji && reactionRole.emoji !== emoji) {
        isFound = false;
    } else if (channel && reactionRole.channelId !== channel.id) {
        isFound = false;
    }
    return isFound;
}

const generateShowDescription = (reactionData) => {
    let description = 'Showing reaction roles';
    if (reactionData.messageId) {
        description += ` with a message id of ${reactionData.messageId}.`;
    }
    if (reactionData.role) {
        description += ` with the ${reactionData.role.name} role.`;
    }
    if (reactionData.emoji) {
        description += ` with the ${reactionData.emoji} emoji.`;
    }
    if (reactionData.channel) {
        description += ` within the ${reactionData.channel.name} channel.`;
    }

    return description;
}

const showExistingReactionRoles = async (interaction) => {
    const reactionData = {
        messageId: interaction.options.getString('message_id', false),
        emoji: interaction.options.getRole('role', false),
        role: interaction.options.getString('emoji', false),
        channel: interaction.options.getChannel('channel', false)
    }

    const results = await jsonHandler.find(reactionsPath, reactionData);

    if (!results) {
        await interaction.reply('No results could be found!');
        return;
    }

    const fields = [];
    
    await results.forEach(async (reactionRole) => {
        const role = await interaction.guild.roles.fetch(reactionRole.roleId);
        fields.push({
            name: `${reactionRole.emoji} ${role.name}`,
            value: `[Click to view message](https://discord.com/channels/${interaction.guild.id}/${reactionRole.channelId}/${reactionRole.messageId})`
        });
    });
    
    const description = generateShowDescription(reactionData);
    const embed = new Discord.MessageEmbed()
        .setColor('#717f80')
        .setTitle(`Reaction Messages`)
        .setDescription(description)
        .addFields(fields);
    
    interaction.channel.send({embeds: [embed]}).catch(silentError);
    await interaction.reply('Showing existing reaction roles.');
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