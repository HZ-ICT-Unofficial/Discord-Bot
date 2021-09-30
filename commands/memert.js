const Discord = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const jsonHandler = require('../util/json-handler');

const pickRandomMemert = async () => {
    const fileData = await jsonHandler.read('../data/illegal-memes.json');

}

const generateMemertEmbed = (url) => {
    const embed = new Discord.MessageEmbed({
        title: 'Uh oh!',
        description: 'A memert appeared, quick try to catch him!',
        image: {
            url: url
        }
    });

    return embed;
}

const run = async (interaction) => {
    await interaction.editReply('Loading memert..');

    const memertUrl = await pickRandomMemert();
    const embed = generateMemertEmbed(memertUrl);

    await interaction.channel.send(embed);
    await interaction.deleteReply();
}

const info = new SlashCommandBuilder()
    .setName('memert')
    .setDescription('Shows a random memert')

module.exports = {
    run: run,
    info: info
}