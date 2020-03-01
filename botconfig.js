const TelegramBot = require('node-telegram-bot-api');

const token = '1133105459:AAEZH2ATVdqGE7klNisHkEmt1u5tNk7HkDM';
const bot = new TelegramBot(token, { polling: true });

bot.on("polling_error", (err) => console.log(err));

module.exports = bot;