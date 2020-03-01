const repository = require('./repository');
const bot = require('./botconfig');
const newsHandler = require('./newshandler');

repository.initDb();

bot.on('message', (msg) => {
    const chatId = msg.chat.id;

    switch (msg.text) {
        case "/start": bot.sendMessage(chatId, "Hello"); break;
        case "/interfaxnews": newsHandler.sendInterfaxNews(chatId); break;
        case "/nvnews": newsHandler.sendNVNews(chatId); break;
        case "/epnews": bot.sendMessage(chatId, "It may take more time than others! Loading..."); newsHandler.sendEPNews(chatId); break;
        case "/reutersnews": newsHandler.sendReutersNews(chatId); break;
        case "/other": bot.sendMessage(chatId, "https://www.rbc.ua/ukr/news/kolichestvo-smertey-koronavirusa-mire-priblizhaetsya-1583019405.html"); break;
        default: bot.sendMessage(chatId, "Choose request from the menu!"); break;
    }
});

// bot.onText(/\/get ([^;'\"])/, (msg, match) => {
bot.onText(/\/get (.+)/, (msg, match) => {
    const chatId = msg.chat.id;
    const key = match[1];
    bot.sendMessage(chatId, "Як справи?");
});