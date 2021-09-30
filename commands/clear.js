const { SlashCommandBuilder } = require('@discordjs/builders');
const silentError = require('../util/silent-error');

const run = async (interaction) => {
    const rawMessageCount = Number(interaction.options.getInteger('message_count', true));
    if (!isNaN(rawMessageCount)) {
        const messageCount = Math.max(0, Math.min(99, rawMessageCount))
        const messages = await interaction.channel.messages.fetch({ limit: messageCount + 1 }).catch(silentError);
        if (messages) {
            await interaction.reply(`Cleared ${messageCount} messages!`);
            await interaction.channel.bulkDelete(messages);
        }
    }
}

const info = new SlashCommandBuilder()
    .setName('clear')
    .setDescription('Clears the chat')
    .addIntegerOption(option =>
        option
            .setName('message_count')
            .setDescription('The amount of messages to delete.')
            .setRequired(true))

module.exports = {
    run: run,
    info: info
};