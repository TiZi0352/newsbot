const needle = require('needle');
const repository = require('./repository');
const Nightmare = require('nightmare');
const nightmare = Nightmare({});
const bot = require('./botconfig');

const sendInterfaxNews = (chatId) => {
    var URL = 'https://interfax.com.ua/news/latest.html';

    needle.get(URL, function (err, res) {
        if (err) throw err;

        // parsing keys and preArray
        var body = res.body;
        var start = '<div class="articles-section-view">';
        var end = '<div class="pager">';
        var textStart = '<a class="article-link"';
        var hrefKey = 'href="';
        var newsBody = body.substring(body.indexOf(start) + start.length, body.indexOf(end));
        var arr = newsBody.split('<div class="grid article">').reverse();

        // select urls if not empty
        var newsUrls = arr.map(x => {
            var text = x.substring(x.indexOf(textStart) + textStart.length);
            return text.substring(text.indexOf(hrefKey) + hrefKey.length, text.indexOf('">'));
        }).filter(x => x.indexOf("/") != -1).map(x => "​​​​​​​​​https://interfax.com.ua" + x);

        const news = repository.getNews(chatId, newsUrls)

        // select unique news to be inserted and sent
        newsUrls = newsUrls.filter(x => news.filter(y => y.url == x) == 0);

        if (newsUrls.length == 0) {
            bot.sendMessage(chatId, "You have got all recently news from Interfax! ✅");
            return;
        }

        repository.insertAndSendNews(chatId, newsUrls);
    });
};

const sendNVNews = (chatId) => {
    var URL = 'https://nv.ua/allnews.html';

    needle.get(URL, function (err, res) {
        if (err) throw err;

        // parsing keys and preArray
        var body = res.body;
        var start = '<div class="page_results"';
        var end = '<div class="page_pagination">';
        var textStart = '<a class="result"';
        var hrefKey = 'href="';
        var newsBody = body.substring(body.indexOf(start) + start.length, body.indexOf(end));
        var arr = newsBody.split('<div class="one_result">').reverse();

        // select urls if not empty
        var newsUrls = arr.map(x => {
            var text = x.substring(x.indexOf(textStart) + textStart.length);
            return text.substring(text.indexOf(hrefKey) + hrefKey.length, text.indexOf('" data-vr-contentbox'));
        }).filter(x => x.indexOf("/") != -1).map(x => "​​​​​​​​​" + x);

        const news = repository.getNews(chatId, newsUrls)

        // select unique news to be inserted and sent
        newsUrls = newsUrls.filter(x => news.filter(y => y.url == x) == 0);

        if (newsUrls.length == 0) {
            bot.sendMessage(chatId, "You have got all recently news from Новое Время! ✅");
            return;
        }

        repository.insertAndSendNews(chatId, newsUrls);
    });
};

const sendEPNews = (chatId) => {
    var URL = 'https://www.eurointegration.com.ua/news/';

    nightmare
        .goto(URL)
        .evaluate(function () {
            return document.body.innerHTML;
        }).then(res => {
            // parsing keys and preArray
            var body = res;
            var start = '<div class="news_list"';
            var end = '<div class="archive-navigation">';
            var textStart = '<div class="article__title"';
            var hrefKey = 'href="';
            var newsBody = body.substring(body.indexOf(start) + start.length, body.indexOf(end));
            var arr = newsBody.split('<div class="article article_news').reverse();

            // select urls if not empty
            var newsUrls = arr.map(x => {
                var text = x.substring(x.indexOf(textStart) + textStart.length);
                return text.substring(text.indexOf(hrefKey) + hrefKey.length, text.indexOf('">'));
            }).filter(x => x.indexOf("/") != -1).map(x => "https://www.eurointegration.com.ua" + x);

            const news = repository.getNews(chatId, newsUrls)

            // select unique news to be inserted and sent
            newsUrls = newsUrls.filter(x => news.filter(y => y.url == x) == 0);

            if (newsUrls.length == 0) {
                bot.sendMessage(chatId, "You have got all recently news from Європейська Правда! ✅");
                return;
            }

            repository.insertAndSendNews(chatId, newsUrls);
        });
};

const sendReutersNews = (chatId) => {
    var URL = 'https://ru.reuters.com/news';

    needle.get(URL, function (err, res) {
        if (err) throw err;

        // parsing keys and preArray
        var body = res.body;
        var start = '<div class="primaryContent"';
        var end = '<div class="secondaryContent">';
        // var textStart = '<a';
        var hrefKey = 'href="';
        var newsBody = body.substring(body.indexOf(start) + start.length, body.indexOf(end));
        var arr = newsBody.split('<a').reverse();

        // select urls if not empty
        var newsUrls = arr.map(x => {
            // var text = x.substring(x.indexOf(textStart) + textStart.length);
            return x.substring(x.indexOf(hrefKey) + hrefKey.length, x.indexOf('"  >'));
        }).filter(x => x.indexOf("/article") != -1).map(x => "https://ru.reuters.com" + x);

        const news = repository.getNews(chatId, newsUrls)

        // select unique news to be inserted and sent
        newsUrls = newsUrls.filter(x => news.filter(y => y.url == x) == 0);

        if (newsUrls.length == 0) {
            bot.sendMessage(chatId, "You have got all recently news from Reuters! ✅");
            return;
        }

        repository.insertAndSendNews(chatId, newsUrls);
    });
};


module.exports = {
    sendInterfaxNews,
    sendNVNews,
    sendEPNews,
    sendReutersNews
};