const fs = require('fs');
require('dotenv').config();

const commands = {};
const commandsDirectory = './commands';
const requireDirectory = '../commands';
const commandFiles = fs.readdirSync(commandsDirectory).filter((file) => file.endsWith('.js'));
for (const fileName of commandFiles) {
	const command = require(`${requireDirectory}/${fileName}`);
    const commandName = fileName.split('.')[0];
    if (typeof command.run !== 'function') {
        throw new Error('No run function has been defined');
    }
    
    if (typeof command.info !== 'object') {
        throw new Error('Invalid command info.');
    }
    commands[commandName] = command.run;
}

module.exports = commands;