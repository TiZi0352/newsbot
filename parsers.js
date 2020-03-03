const needle = require('needle');
const repository = require('./repository');
const Nightmare = require('nightmare');
const nightmare = Nightmare({});
const bot = require('./botconfig');
const Promise = require('bluebird');

const parseInterfax = (chatId, isWebJob) => {
    var URL = 'https://interfax.com.ua/news/latest.html';

    return new Promise((resolve, reject) => {
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

            resolve(newsUrls);
        });
    });
};

const parseNV = (chatId, isWebJob) => {
    var URL = 'https://nv.ua/allnews.html';

    return new Promise((resolve, reject) => {
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

            resolve(newsUrls);
        });
    });
};

const parseEP = (chatId, isWebJob) => {
    var URL = 'https://www.eurointegration.com.ua/news/';

    return new Promise((resolve, reject) => {
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

                resolve(newsUrls);
            });
    });
};

const parseUP = (chatId, isWebJob) => {
    var URL = 'https://www.pravda.com.ua/news/';

    return new Promise((resolve, reject) => {
        nightmare
            .goto(URL)
            .evaluate(function () {
                return document.body.innerHTML;
            }).then(res => {
                // parsing keys and preArray
                var body = res;
                var start = '<div class="news news_all" id="endless"';
                var end = '<div id="needmore">';
                var textStart = '<div class="article__title"';
                var hrefKey = 'href="';
                var newsBody = body.substring(body.indexOf(start) + start.length, body.indexOf(end));
                var arr = newsBody.split('<div class="article__time"').reverse();

                // select urls if not empty
                var newsUrls = arr.map(x => {
                    var text = x.substring(x.indexOf(textStart) + textStart.length);
                    return text.substring(text.indexOf(hrefKey) + hrefKey.length, (text.indexOf('target="_blank"') == -1 ? text.indexOf('">') : text.indexOf('" target')));
                }).filter(x => x.indexOf("/") != -1).map(x => x.indexOf("com.ua") == -1 ? "https://www.pravda.com.ua" + x : x);

                resolve(newsUrls);
            });
    });
};

const parseReuters = (chatId, isWebJob) => {
    var URL = 'https://ru.reuters.com/news';

    return new Promise((resolve, reject) => {
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
            }).filter(x => x.indexOf("/article") != -1).map(x => "https://ru.reuters.com" + x).filter((v, i, a) => a.indexOf(v) === i);

            resolve(newsUrls);
        });
    });
};

module.exports = {
    parseInterfax,
    parseNV,
    parseEP,
    parseUP,
    parseReuters
};