const repository = require('./repository');
const bot = require('./botconfig');
const parser = require('./parsers');

const sendInterfaxNews = (chatId, isWebJob) => {
    parser.parseInterfax(chatId, isWebJob).then((newsUrls) => {
        insertAndSendUnique(chatId, newsUrls, "Interfax", isWebJob);
    });
};

const sendNVNews = (chatId, isWebJob) => {
    parser.parseNV(chatId, isWebJob).then((newsUrls) => {
        insertAndSendUnique(chatId, newsUrls, "Новое Время", isWebJob);
    });
};

const sendEPNews = (chatId, isWebJob) => {
    parser.parseEP(chatId, isWebJob).then((newsUrls) => {
        insertAndSendUnique(chatId, newsUrls, "Європейська Правда", isWebJob);
    });
};

const sendUPNews = (chatId, isWebJob) => {
    parser.parseUP(chatId, isWebJob).then((newsUrls) => {
        insertAndSendUnique(chatId, newsUrls, "Українська Правда", isWebJob);
    });
};

const sendReutersNews = (chatId, isWebJob) => {
    parser.parseReuters(chatId, isWebJob).then((newsUrls) => {
        insertAndSendUnique(chatId, newsUrls, "Reuters", isWebJob);
    });
};

const insertAndSendUnique = (chatId, newsUrls, publisherName, isWebJob) => {
    const news = repository.getNews(chatId, newsUrls);

    // select unique news to be inserted and sent
    newsUrls = newsUrls.filter(x => news.filter(y => y.url == x) == 0);

    if (newsUrls.length == 0) {
        if (!isWebJob)
            bot.sendMessage(chatId, `You have got all recent news from ${publisherName}! ✅`);
        return;
    }

    repository.insertAndSendNews(chatId, newsUrls);
};

const deleteAll = (chatId) => {
    var allNews = repository.getAllNews(chatId);

    for (let i = 0; i < allNews.length; ++i) {
        bot.deleteMessage(chatId, allNews[i].messageId);
    }

    repository.deleteAllNews(chatId);
};

module.exports = {
    sendInterfaxNews,
    sendNVNews,
    sendEPNews,
    sendUPNews,
    sendReutersNews,
    deleteAll
};