const TelegramBot = require('node-telegram-bot-api');
const token = '7515841693:AAGyKACQTEMqUynpdj8Et3s_7znP9BSBnEY'; // Replace with your token
const bot = new TelegramBot(token, { polling: true });

bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, 'Hello, World!');
});
