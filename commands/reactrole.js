const { SlashCommandBuilder } = require('@discordjs/builders');
const jsonHandler = require('../util/json-handler');
const reactionsPath = `${process.env.DATA_DIR}/reactions.json`;
const Discord = require('discord.js');

const silentError = () => {
    return;
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

const showReactionRoles = async (interaction) => {
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
    const embed = new Discord.MessageEmbed({
        color: '#717f80',
        title: 'Reaction messages',
        description: description,
        fields: fields
    });
    
    interaction.channel.send({embeds: [embed]}).catch(silentError);
    await interaction.reply('Showing results');
}

const addReactionRole = async (interaction) => {
    const channel = interaction.options.getChannel('channel', false) || interaction.channel;

    const newReactionData = {
        messageId: interaction.options.getString('message_id', true),
        emoji: interaction.options.getString('emoji', true),
        roleId: interaction.options.getRole('role', true).id,
        channelId: channel.id
    }

    const message = await channel.messages.fetch(newReactionData.messageId).catch(silentError);
    if (!message) {
        await interaction.reply('The message could not be found!');
        return;
    }

    if (!jsonHandler.find(reactionsPath, newReactionData)) {
        await jsonHandler.add(reactionsPath, newReactionData);
        await message.react(emoji);
        await interaction.reply('Added new reaction role!');
    } else {
        await interaction.reply('This reaction role already exists!');
    }
}

const removeReactionRoles = async (interaction) => {
    const reactionData = {
        messageId: interaction.options.getString('message_id', false),
        emoji: interaction.options.getRole('role', false),
        role: interaction.options.getString('emoji', false),
        channel: interaction.options.getChannel('channel', false)
    }

    const removedCount = await jsonHandler.remove(reactionsPath, reactionData);
    if (removedCount > 0) {
        await interaction.reply(`Removed ${removedCount} reaction roles!`);
    } else {
        await interaction.reply('Could not find any reaction roles to remove!');
    }
}

const subcommands = {
    'show': showReactionRoles,
    'add': addReactionRole,
    'remove': removeReactionRoles
}

const run = async (interaction) => {
    const subcommandName = interaction.options.getSubcommand(true);
    const subcommand = subcommands[subcommandName];
    if (subcommand) {
        await subcommand(interaction);
    } else {
        throw new Error(`Did you forget to add a subcommand? Failed to run ${subcommandName}!`)
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
            )
            .addRoleOption(option =>
                option
                    .setName('role')
                    .setDescription('The role given once someone reacts.')
            )
            .addStringOption(option =>
                option
                    .setName('emoji')
                    .setDescription('The emoji to react to.')
            )
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