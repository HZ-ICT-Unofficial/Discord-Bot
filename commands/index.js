const fs = require('fs');

const COMMANDS_DIR = './commands';
const isValidCommandFile = (fileName) => fileName.endsWith('.js') && fileName !== 'index.js';

const load = () => {
    const commands = {};
    fs.readdirSync(COMMANDS_DIR).filter(isValidCommandFile).forEach((fileName, index, arr) => {
        const commandName = fileName.split('.')[0];
        console.log(`Loading ${commandName} (${index + 1}/${arr.length})`);
        commands[commandName] = require(`./${fileName}`);
    });
    return commands;
}

module.exports = {
    load
}