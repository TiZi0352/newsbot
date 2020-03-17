const repository = require('./repository');
const bot = require('./botconfig');
const parser = require('./parsers');

const sendInterfaxNews = (chatId, isWebJob) => {
    parser.parseInterfax(chatId, isWebJob).then((newsUrls) => {
        insertAndSendUnique(chatId, newsUrls, "Interfax", isWebJob);
    }).catch((res) =>{
    });
};

const sendNVNews = (chatId, isWebJob) => {
    parser.parseNV(chatId, isWebJob).then((newsUrls) => {
        insertAndSendUnique(chatId, newsUrls, "Новое Время", isWebJob);
    }).catch((res) =>{
    });
};

const sendEPNews = (chatId, isWebJob) => {
    parser.parseEP(chatId, isWebJob).then((newsUrls) => {
        insertAndSendUnique(chatId, newsUrls, "Європейська Правда", isWebJob);
    }).catch((res) =>{
    });
};

const sendUPNews = (chatId, isWebJob) => {
    parser.parseUP(chatId, isWebJob).then((newsUrls) => {
        insertAndSendUnique(chatId, newsUrls, "Українська Правда", isWebJob);
    }).catch((res) =>{
    });
};

const sendReutersNews = (chatId, isWebJob) => {
    parser.parseReuters(chatId, isWebJob).then((newsUrls) => {
        insertAndSendUnique(chatId, newsUrls, "Reuters", isWebJob);
    }).catch((res) =>{
    });
};

const sendRadioSvobodaNews = (chatId, isWebJob) => {
    parser.parseRadioSvoboda(chatId, isWebJob).then((newsUrls) => {
        insertAndSendUnique(chatId, newsUrls, "Радіо Свобода", isWebJob);
    }).catch((res) =>{
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

const insertAndSendToFollowers = (chatIds, newsUrls, publisherName, news) => {
    var news = repository.getNews(chatId, newsUrls);

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
    sendRadioSvobodaNews,
    deleteAll
};