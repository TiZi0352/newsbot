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
        chatId INTEGER NOT NULL,
        messageId INTEGER NOT NULL,
        date INTEGER NOT NULL);`,
        function (res) {
            if (res.error)
                throw res.error;
        });

    sqlite.run(`CREATE TABLE IF NOT EXISTS follows(
            id  INTEGER PRIMARY KEY AUTOINCREMENT, 
            publisherName TEXT NOT NULL,
            chatId INTEGER NOT NULL,
            date INTEGER NOT NULL);`,
        function (res) {
            if (res.error)
                throw res.error;
        });

    sqlite.run(`CREATE TABLE IF NOT EXISTS publishers(
            id  INTEGER PRIMARY KEY AUTOINCREMENT, 
            name TEXT NOT NULL UNIQUE,
            url TEXT NOT NULL UNIQUE);`,
        function (res) {
            if (res.error)
                throw res.error;
        });

    // sqlite.insert("publishers", {
    //     name: "Interfax",
    //     url: "https://interfax.com.ua"
    // }, function (res) {
    //     if (res.error) {
    //         console.log(res);
    //     }
    // });

    // sqlite.insert("publishers", {
    //     name: "Новое Время",
    //     url: "https://nv.ua"
    // }, function (res) {
    //     if (res.error) {
    //         console.log(res);
    //     }
    // });

    // sqlite.insert("publishers", {
    //     name: "Європейська Правда",
    //     url: "https://www.eurointegration.com.ua"
    // }, function (res) {
    //     if (res.error) {
    //         console.log(res);
    //     }
    // });

    // sqlite.insert("publishers", {
    //     name: "Reuters",
    //     url: "https://ru.reuters.com"
    // }, function (res) {
    //     if (res.error) {
    //         console.log(res);
    //     }
    // });
}

const getNews = (chatId, newsUrls) => {
    var newsSqlCheck = newsUrls.map(function () { return '?' }).join(',');
    return sqlite.run(`SELECT * FROM news where chatId = '${chatId}' AND url IN (${newsSqlCheck})`, newsUrls);
}

const getAllNews = (chatId) => {
    return sqlite.run(`SELECT * FROM news where chatId = '${chatId}'`);
}

const deleteAllNews = (chatId) => {
    return sqlite.run(`DELETE FROM news where chatId = '${chatId}'`);
}

const insertAndSendNews = (chatId, newsUrls) => {
    return Promise.mapSeries(newsUrls, function (hrefUrl) {
        return bot.sendMessage(chatId, hrefUrl)
            .then(x => {
                var objectToInsert = {
                    url: hrefUrl,
                    chatId: chatId,
                    messageId: x.message_id,
                    date: new Date().getTime()
                };

                sqlite.insert("news", objectToInsert, function (res) {
                    if (res.error) {
                        console.log(res);
                    }
                });
            });
    });
}

const getAllPublishers = () => {
    return sqlite.run(`SELECT * FROM publishers`);
}

const getChatFolowings = (chatId) => {
    return sqlite.run(`SELECT * FROM folows where chatId = '${chatId}'`);
}

const followPublisher = (chatId, publisherName) => {
    return new Promise(function () {
        return sqlite.insert("follows", {
            chatId: chatId,
            publisherName: publisherName,
            date: new Date().getTime()
        }, function (res) {
            if (res.error) {
                console.log(res);
            }
        });
    });
}

const unfollowPublisher = (chatId, publisherName) => {
    return sqlite.run(`DELETE FROM news where chatId = '${chatId}' AND publisherName = '${publisherName}'`);
}

// const getAllPublishers = () => {
//     return sqlite.run(`SELECT * FROM publishers`);
// }

module.exports = {
    initDb,
    getNews,
    insertAndSendNews,
    getAllNews,
    deleteAllNews,
    getChatFolowings,
    followPublisher,
    unfollowPublisher,
    getAllPublishers
};