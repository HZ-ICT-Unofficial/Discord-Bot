const Discord = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const jsonHandler = require('../util/json-handler');

const generateRandomInt = (min, max) => {
    return Math.floor(min + Math.random() * (max - min));
}

const pickRandomMemert = async () => {
    const fileData = await jsonHandler.read('./data/illegal-memes.json');
    const max = fileData.data.length;
    const randomIndex = generateRandomInt(0, max);
    return fileData.data[randomIndex];
}

const generateMemertEmbed = (url) => {
    return new Discord.MessageEmbed({
        title: 'Uh oh!',
        description: 'A memert appeared, quick try to catch him!',
        image: {
            url: url
        }
    });
}

const run = async (interaction) => {
    await interaction.reply('Loading memert..');
    const memertUrl = await pickRandomMemert();
    const embed = generateMemertEmbed(memertUrl);
    await interaction.editReply('Memert loaded!');
    await interaction.channel.send({embeds: [embed]});
    await interaction.deleteReply();
}

const info = new SlashCommandBuilder()
    .setName('memert')
    .setDescription('Shows a random memert');

module.exports = {
    run: run,
    info: info
}