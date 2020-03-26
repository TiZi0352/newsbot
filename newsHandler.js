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

const COVIDUAHandle = (chatId) => {
    parser.parseUPCOVIDUA().then((result) => {
        var conf = result.confirmed[result.confirmed.length - 1]
        var confChange = conf - result.confirmed[result.confirmed.length - 2]

        var recov = result.recovered[result.recovered.length - 1]
        var recovChange = recov - result.recovered[result.recovered.length - 2]

        var deaths = result.deaths[result.deaths.length - 1]
        var deathsChange = deaths - result.deaths[result.deaths.length - 2]

        var active = conf - recov - deaths;
        var activeChange = confChange - recovChange - deathsChange;

        bot.sendMessage(chatId,
            `<u>Ukraine</u>

Confirmed:   <b>${conf}</b> (${addSign(confChange)})
Deaths:          <b>${recov}</b> (${addSign(recovChange)})
Recovered:   <b>${deaths}</b> (${addSign(deathsChange)})
Active:            <b>${active}</b> (${addSign(activeChange)})

Updated:   <b>${result.display_updated}</b>`,
            { parse_mode: 'HTML' });

        function addSign(value) {
            return (value > 0 ? '+' : '') + value;
        }
    }).catch((res) => {
    });
}

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
    sendNews,
    COVIDUAHandle
};