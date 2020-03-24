const repository = require('./repository');
const bot = require('./botconfig');
const parser = require('./parsers');

const sendNews = (publisherName, chatId, isWebJob) => {
    if ((publisherName == "Українська Правда" || publisherName == "Європейська Правда") && !isWebJob)
        bot.sendMessage(chatId, "It may take more time than others! Loading...");

    parser.parseNews(publisherName, chatId).then((newsUrls) => {
        insertAndSendUnique(chatId, newsUrls, publisherName, isWebJob);
    }).catch((res) => {
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
    deleteAll,
    sendNews
};