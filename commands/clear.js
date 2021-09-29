const clear = (client, message, args) => {
    const rawMessageCount = Number(args[0]);
    if(!isNaN(rawMessageCount)){
        const messageCount = Math.max(0, Math.min(99, rawMessageCount))
        message.channel.messages.fetch({limit: messageCount + 1}).then((messages) => message.channel.bulkDelete(messages))
    }
}

module.exports = clear;