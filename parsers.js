const Promise = require('bluebird');
const axios = require('axios');
const cheerio = require('cheerio');
const request = require('request');
const bot = require('./botconfig');

const parseNews = (publisherName, chatId) => {
    switch (publisherName) {
        case "Interfax": return parseInterfax(); break;
        case "Новое Время": return parseNV(); break;
        case "Європейська Правда": return parseEP(); break;
        case "Українська Правда": return parseUP(); break;
        case "Reuters": return parseReuters(); break;
        case "Радіо Свобода": return parseRadioSvoboda(); break;
        case "AFP": return parseAFP(); break;
        case "AP": return parseAP(); break;
        case "BBC UA": return parseBBCUA(); break;
        // case "Coronavirus UA": return parseCVUA(chatId); break;
        default: break;
    }
}

const parseInterfax = () => {
    var URL = 'https://interfax.com.ua/news/latest.html';

    return new Promise((resolve, reject) => {
        axios.get(URL)
            .then((res) => {
                // parsing keys and preArray
                var body = res.data;
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
            })
            .catch((error) => {
                console.log('Interfax parsing error: ' + error);
                reject("Interfax parsing error");
            });
    });
};

const parseNV = () => {
    var URL = 'https://nv.ua/allnews.html';

    return new Promise((resolve, reject) => {
        axios.get(URL)
            .then((res) => {
                // parsing keys and preArray
                var body = res.data;
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
            })
            .catch((error) => {
                console.log('Новое Время parsing error: ' + error);
                reject("Новое Время parsing error");
            });
    });
};

const parseEP = () => {
    var URL = 'https://www.eurointegration.com.ua/news/';

    return new Promise((resolve, reject) => {
        axios.get(URL)
            .then((res) => {
                // parsing keys and preArray
                var body = res.data;
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
            })
            .catch((error) => {
                console.log('Європейська Правда parsing error: ' + error);
                reject("Європейська Правда parsing error");
            });
    });
};

const parseUP = () => {
    var URL = 'https://www.pravda.com.ua/news/';

    return new Promise((resolve, reject) => {
        axios.get(URL)
            .then((res) => {
                // parsing keys and preArray
                var body = res.data;
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
            })
            .catch((error) => {
                console.log('Українська Правда parsing error: ' + error);
                reject("Українська Правда parsing error");
            });
    });
};

const parseReuters = () => {
    var URL = 'https://ru.reuters.com/news';

    return new Promise((resolve, reject) => {
        axios.get(URL)
            .then((res) => {
                // parsing keys and preArray
                var body = res.data;
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
            })
            .catch((error) => {
                console.log('Reuters parsing error: ' + error);
                reject("Reuters parsing error");
            });
    });
};

const parseRadioSvoboda = () => {
    var URL = 'https://www.radiosvoboda.org/p/4399.html';

    return new Promise((resolve, reject) => {
        axios.get(URL)
            .then((res) => {
                // parsing keys and preArray
                var body = res.data;
                var start = '<div class="media-block-wrap"';
                var end = '<a class="link-more"';
                // var textStart = '<a';
                var hrefKey = 'href="';
                var newsBody = body.substring(body.indexOf(start) + start.length, body.indexOf(end));
                var arr = newsBody.split('<a').reverse();

                // select urls if not empty
                var newsUrls = arr.map(x => {
                    // var text = x.substring(x.indexOf(textStart) + textStart.length);
                    return x.substring(x.indexOf(hrefKey) + hrefKey.length, x.indexOf('">'));
                }).filter(x => x.indexOf("/") != -1).map(x => "https://www.radiosvoboda.org" + x).filter((v, i, a) => a.indexOf(v) === i);

                resolve(newsUrls);
            })
            .catch((error) => {
                console.log('Радіо Свобода parsing error: ' + error);
                reject("Радіо Свобода parsing error");
            });
    });
};

const parseAFP = () => {
    var URL = 'https://www.afp.com/en';

    return new Promise((resolve, reject) => {
        axios.get(URL)
            .then((res) => {
                // parsing keys and preArray
                var body = res.data;
                var start = '>Latest wires<';
                var end = '<div class="load_more_news';
                // var textStart = '<a';
                var hrefKey = 'href="';
                var newsBody = body.substring(body.indexOf(start) + start.length, body.indexOf(end));
                var arr = newsBody.split('<a').reverse();

                // select urls if not empty
                var newsUrls = arr.map(x => {
                    // var text = x.substring(x.indexOf(textStart) + textStart.length);
                    return x.substring(x.indexOf(hrefKey) + hrefKey.length, x.indexOf('">'));
                }).filter(x => x.indexOf("/") != -1).map(x => "https://www.afp.com" + x).filter((v, i, a) => a.indexOf(v) === i);

                resolve(newsUrls);
            })
            .catch((error) => {
                console.log('AFP parsing error: ' + error);
                reject("AFP parsing error");
            });
    });
};

const parseAP = () => {
    var URL = 'https://apnews.com';

    return new Promise((resolve, reject) => {
        axios.get(URL)
            .then((res) => {
                // parsing keys and preArray
                var body = res.data;
                var start = '>Most Recent<';
                var end = '</article>';
                // var textStart = '<a';
                var hrefKey = 'href="';
                var newsBody = body.substring(body.indexOf(start) + start.length, body.indexOf(end));
                var arr = newsBody.split('data-key="card-headline"').reverse();

                // select urls if not empty
                var newsUrls = arr.map(x => {
                    // var text = x.substring(x.indexOf(textStart) + textStart.length);
                    return x.substring(x.indexOf(hrefKey) + hrefKey.length, x.indexOf('">'));
                }).filter(x => x.indexOf("/") != -1).map(x => "https://apnews.com" + x).filter((v, i, a) => a.indexOf(v) === i);

                resolve(newsUrls);
            })
            .catch((error) => {
                console.log('AP parsing error: ' + error);
                reject("AP parsing error");
            });
    });
};

const parseBBCUA = () => {
    var URL = 'https://www.bbc.com/ukrainian';

    return new Promise((resolve, reject) => {
        axios.get(URL)
            .then((res) => {
                // parsing keys and preArray
                var body = res.data;
                var start = '<section role="region" aria-labelledby="Top-stories"';
                var end = '</section>';
                // var textStart = '<a';
                var hrefKey = 'href="';
                var newsBody = body.substring(body.indexOf(start) + start.length, body.indexOf(end));
                var arr = newsBody.split('<a').reverse();

                // select urls if not empty
                var newsUrls = arr.map(x => {
                    // var text = x.substring(x.indexOf(textStart) + textStart.length);
                    return x.substring(x.indexOf(hrefKey) + hrefKey.length, x.indexOf('" '));
                }).filter(x => x.indexOf("/ukrainian") != -1).map(x => "https://www.bbc.com" + x).filter((v, i, a) => a.indexOf(v) === i);

                resolve(newsUrls);
            })
            .catch((error) => {
                console.log('AP parsing error: ' + error);
                reject("AP parsing error");
            });
    });
};

// const parseCVUA = (chatId) => {
//     return new Promise((resolve, reject) => {
//         bot.sendPhoto(chatId, "https://public.tableau.com/static/images/mo/monitor_15841091301660/sheet4/1.png", {
//             // caption: "https://public.tableau.com/profile/publicviz#!/vizhome/monitor_15841091301660/sheet0",
//             reply_markup: {
//                 inline_keyboard: [[{
//                     text: 'Details',
//                     switch_inline_query: 'share',
//                     url: "https://public.tableau.com/profile/publicviz#!/vizhome/monitor_15841091301660/sheet0"
//                 }]]
//             }
//         });
//         resolve(true);
//     });
// };

module.exports = {
    parseNews
};