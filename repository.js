const sqlite = require('sqlite-sync'); //requiring
const Promise = require('bluebird');
const bot = require('./botconfig');

const initDb = () => {
    sqlite.connect('newsbot.db');

    sqlite.run(`CREATE TABLE IF NOT EXISTS messages(
    id  INTEGER PRIMARY KEY AUTOINCREMENT, 
    key TEXT NOT NULL UNIQUE,
    fromId INTEGER NOT NULL,
    messageId INTEGER NOT NULL);`,
        function (res) {
            if (res.error)
                throw res.error;
        });

    sqlite.run(`CREATE TABLE IF NOT EXISTS news(
        id  INTEGER PRIMARY KEY AUTOINCREMENT, 
        url TEXT NOT NULL,
        chatId INTEGER NOT NULL);`,
        function (res) {
            if (res.error)
                throw res.error;
        });
}

const getNews = (chatId, newsUrls) => {
    var newsSqlCheck = newsUrls.map(function () { return '?' }).join(',');
    return sqlite.run(`SELECT * FROM news where chatId = '${chatId}' AND url IN (${newsSqlCheck})`, newsUrls);
}

const insertAndSendNews = (chatId, newsUrls) => {
    return Promise.mapSeries(newsUrls, function (hrefUrl) {
        sqlite.insert("news", {
            url: hrefUrl,
            chatId: chatId,
        }, function (res) {
            if (res.error) {
                console.log(res);
            }
        });

        return bot.sendMessage(chatId, hrefUrl);
    });
}

module.exports = {
    initDb,
    getNews,
    insertAndSendNews
};