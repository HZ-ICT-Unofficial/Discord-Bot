const { SlashCommandBuilder } = require('@discordjs/builders');
const jsonHandler = require('../util/json-handler');
const reactionsPath = `${process.env.DATA_DIR}/reactions.json`;
const Discord = require('discord.js');

const silentError = () => {
    return;
}

const generateFilterText = (reactionData) => {
    let filterText = '**Filters used:**';
    if (reactionData.messageId) {
        filterText += `\nMessage id: ${reactionData.messageId}`;
    }
    
    if (reactionData.roleId) {
        filterText += `\nRole: <@&${reactionData.roleId}>`;
    }

    if (reactionData.emoji) {
        filterText += `\nEmoji: ${reactionData.emoji}`;
    }
    
    if (reactionData.channelId) {
        filterText += `\nChannel: <#${reactionData.channelId}>`;
    }

    return filterText;
}

const isEmptyReactionData = (reactionData) => {
    return Object.values(reactionData).filter(x => x !== null).length > 0;
}

const generateDescription = (interaction, reactionData, results) => {
    let description = '';
    if (results.length > 0) {
        results.forEach((reactionRole, index) => {
            description += `${index + 1}. **<@&${reactionRole.roleId}>** ${reactionRole.emoji}\n[View message](https://discord.com/channels/${interaction.guild.id}/${reactionRole.channelId}/${reactionRole.messageId})\n\n`;
        });
    } else {
        description += 'No results could be found :(\n\n';
    }

    if (isEmptyReactionData(reactionData)) {
        description += generateFilterText(reactionData);
    }

    return description;
}

const getOptionalReactionData = (interaction) => {
    const role = interaction.options.getRole('role', false);
    const channel = interaction.options.getChannel('channel', false);
    const emoji = interaction.options.getString('emoji', false);
    const emojiMatch = emoji ? emoji.match(/(\p{Extended_Pictographic})/u) : null;

    return {
        messageId: interaction.options.getString('message_id', false),
        emoji: emojiMatch ? emojiMatch[1] : null,
        roleId: role ? role.id : null,
        channelId: channel ? channel.id : null
    }
}

const showReactionRoles = async (interaction) => {
    const reactionData = getOptionalReactionData(interaction);
    
    const results = await jsonHandler.find(reactionsPath, reactionData);
    const description = generateDescription(interaction, reactionData, results);
    
    const embed = new Discord.MessageEmbed({
        title: '🔍 Showing reaction roles',
        color: '#717f80',
        description: description
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

    const results = await jsonHandler.find(reactionsPath, newReactionData);
    if (results.length === 0) {
        await jsonHandler.add(reactionsPath, newReactionData);
        await message.react(newReactionData.emoji);
        await interaction.reply('Added new reaction role!');
    } else {
        await interaction.reply('This reaction role already exists!');
    }
}

const findMessageByReactionRole = async (interaction, reactionRole) => {
    const channel = await interaction.guild.channels.fetch(reactionRole.channelId).catch(silentError);
    if (!channel) {
        return;
    }

    const message = await channel.messages.fetch(reactionRole.messageId).catch(silentError);
    if (message) {
        return message;
    }
}

const removeBotReaction = async (interaction, reactionRole) => {
    const message = await findMessageByReactionRole(interaction, reactionRole);
    if (!message) {
        return;
    }

    const reaction = message.reactions.resolve(reactionRole.emoji);
    if (reaction) {
        await reaction.remove(interaction.client).catch(silentError);
    }
}

const removeEmojis = async (interaction, reactionRoles) => {
    await reactionRoles.forEach(async (reactionRole) => {
        removeBotReaction(interaction, reactionRole);
    });
}

const removeReactionRoles = async (interaction) => {
    const reactionData = getOptionalReactionData(interaction);

    const foundReactionRoles = await jsonHandler.remove(reactionsPath, reactionData);
    if (foundReactionRoles.length > 0) {
        await removeEmojis(interaction, foundReactionRoles);
        await interaction.reply(`Removed ${foundReactionRoles.length} reaction roles!`);
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
    if (!subcommand) {
        throw new Error(`Did you forget to add a subcommand? Failed to run ${subcommandName}!`);   
    }
    await subcommand(interaction);
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