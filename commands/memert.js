const Discord = require('discord.js');
const axios = require('axios');
const { SlashCommandBuilder } = require('@discordjs/builders');
const jsonHandler = require('../util/json-handler');

const memeStorage = `${process.env.DATA_DIR}/illegal-memes.json`;
const memeChannelId = '887998241210245151';

const generateRandomInt = (min, max) => {
    return Math.floor(min + Math.random() * (max - min));
}

const pickRandomMemert = async () => {
    const fileData = await jsonHandler.read(memeStorage);
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

const showMemert = async (interaction) => {
    const memertUrl = await pickRandomMemert();
    const embed = generateMemertEmbed(memertUrl);
    await interaction.reply('Memert loaded!');
    await interaction.channel.send({embeds: [embed]});
}

const validateImage = async (url) => {
    try {
        await axios.get(url);
        return true;
    } catch (err) {
        console.error(err);
        return false;
    }
}

const addMemert = async (interaction, memertUrl) => {
    const urlPrefix = `https://cdn.discordapp.com/attachments/${memeChannelId}/`;
    const mobileUrlPrefix = `https://media.discordapp.net/attachments/${memeChannelId}/`;
    memertUrl = memertUrl.replace(urlPrefix, '');
    memertUrl = memertUrl.replace(mobileUrlPrefix, '');
    const parts = memertUrl.split('/');

    const messageIdMatch = parts[0].match(/([0-9]+)/);
    if (!messageIdMatch) {
        await interaction.reply('Invalid memert url provided.');
        return;
    }
    const messageId = messageIdMatch[1];
    const rawFilePath = parts[1];
    const filePath = rawFilePath.replace(/\?.*/, '');

    const finalUrl = `${urlPrefix}${messageId}/${filePath}`;
    const finalCheck = await validateImage(finalUrl);
    if (finalCheck) {
        const results = await jsonHandler.find(memeStorage, finalUrl);
        if (results.length === 0) {
            await jsonHandler.add(memeStorage, finalUrl);
            await interaction.reply('Added new memert to the collection!');
        } else {
            await interaction.reply('This memert already exists in the collection!');
        }
    } else {
        await interaction.reply('Invalid memert url provided.');
    }
}

const run = async (interaction) => {
    const memertUrl = interaction.options.getString('image_url');
    if (memertUrl && memertUrl.length > 0) {
        await addMemert(interaction, memertUrl);
    } else {
        await showMemert(interaction);
    }
}

const info = new SlashCommandBuilder()
    .setName('memert')
    .setDescription('Shows a random memert')
    .addStringOption(option =>
        option
            .setName('image_url')
            .setDescription('The memert image to add to the collection.')
    );

module.exports = {
    run: run,
    info: info
}