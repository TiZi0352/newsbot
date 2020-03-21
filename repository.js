const sqlite = require('sqlite-sync'); //requiring
const Promise = require('bluebird');
const bot = require('./botconfig');

const initDb = () => {
    sqlite.connect('newsbot.db');

    // sqlite.run(`DROP TABLE news`,
    //     function (res) {
    //         if (res.error)
    //             throw res.error;
    //     });

    sqlite.run(`CREATE TABLE IF NOT EXISTS news(
        id  INTEGER PRIMARY KEY AUTOINCREMENT, 
        url TEXT NOT NULL,
        chatId INTEGER NOT NULL,
        messageId INTEGER NOT NULL,
        date INTEGER NOT NULL,
        UNIQUE (url, chatId));`,
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
    //     name: "Українська Правда",
    //     url: "https://www.pravda.com.ua"
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

    // sqlite.insert("publishers", {
    //     name: "Радіо Свобода",
    //     url: "https://www.radiosvoboda.org"
    // }, function (res) {
    //     if (res.error) {
    //         console.log(res);
    //     }
    // });

    // sqlite.insert("publishers", {
    //     name: "AFP",
    //     url: "https://www.afp.com"
    // }, function (res) {
    //     if (res.error) {
    //         console.log(res);
    //     }
    // });

    // sqlite.insert("publishers", {
    //     name: "AP",
    //     url: "https://apnews.com"
    // }, function (res) {
    //     if (res.error) {
    //         console.log(res);
    //     }
    // });

    // sqlite.insert("publishers", {
    //     name: "BBC UA",
    //     url: "https://www.bbc.com/ukrainian"
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

const getNewsByChatIds = (chatIds, newsUrls) => {
    var newsSqlCheck = newsUrls.map(function () { return '?' }).join(',');
    var chatIdsSqlCheck = chatIds.map(function () { return '?' }).join(',');
    return sqlite.run(`SELECT * FROM news where chatId IN (${chatIdsSqlCheck}) AND url IN (${newsSqlCheck})`, newsUrls);
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
                        console.log("insertAndSendNews on insert" + res);
                    }
                });
            });
    });
}

const getAllPublishers = () => {
    return sqlite.run(`SELECT * FROM publishers`);
}

const getChatFolowings = (chatId) => {
    return sqlite.run(`SELECT * FROM follows where chatId = '${chatId}'`);
}

const getAllFollows = () => {
    var result = sqlite.run(`SELECT * FROM follows`);

    // find unique objects in array based on multiple properties
    result = result.filter(function (a) {
        var key = a.chatId + '|' + a.publisherName;
        if (!this[key]) {
            this[key] = true;
            return true;
        }
    }, Object.create(null));

    return result;
}

const followOrUnfollow = (chatId, publisherName, isFollow, callback) => {
    if (isFollow)
        sqlite.insert("follows", {
            chatId: chatId,
            publisherName: publisherName,
            date: new Date().getTime()
        }, function (res) {
            if (res.error)
                console.log("followOrUnfollow on insert" + res);
            else
                callback();
        });
    else
        sqlite.run(`DELETE FROM follows where chatId = '${chatId}' AND publisherName = '${publisherName}'`, {}, function (res) {
            if (res.error)
                console.log("followOrUnfollow on delete" + res);
            else
                callback();
        });
}

const deletePublisher = (publisherName) => {
    sqlite.run(`DELETE FROM publishers where name = '${publisherName}'`, {}, function (res) {
        if (res.error)
            console.log("deletePublisher" + res);
        else
            callback();
    });
}

module.exports = {
    initDb,
    getNews,
    insertAndSendNews,
    getAllNews,
    deleteAllNews,
    getChatFolowings,
    followOrUnfollow,
    getAllPublishers,
    getAllFollows,
    getNewsByChatIds,
    deletePublisher
};