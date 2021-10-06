const COMMANDS_DIR = '../commands';

const commandLoader = require(COMMANDS_DIR);

const commands = commandLoader.load();

const runCommand = (interaction) => {
    const command = commands[interaction.commandName];
    if (command) {
        command.run(interaction);
    }
}

module.exports = (interaction) => {
    if (interaction.user.bot) {
        return;
    }
    
    if (interaction.isCommand()) {
        runCommand(interaction);
    }
}