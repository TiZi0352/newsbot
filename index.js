const repository = require('./repository');
const bot = require('./botconfig');
const newsHandler = require('./newsHandler');
const schedule = require('node-schedule');
const parser = require('./parsers');

repository.initDb();

bot.on('message', (msg) => {
    const chatId = msg.chat.id;

    switch (msg.text) {
        case "/start": bot.sendMessage(chatId, "Welcome to News Bot!", menuOptions["home"]); break;
        case "Home": bot.sendMessage(chatId, "Home", menuOptions["home"]); break;
        case "Get news": bot.sendMessage(chatId, "Choose a publisher", menuOptions["publishers"]); break;
        case "Follow": followAction(chatId); break;
        case "Options": bot.sendMessage(chatId, "Choose an action", menuOptions["optionActions"]); break;

        case "Interfax": newsHandler.sendInterfaxNews(chatId); break;
        case "Новое Время": newsHandler.sendNVNews(chatId); break;
        case "Європейська Правда": bot.sendMessage(chatId, "It may take more time than others! Loading..."); newsHandler.sendEPNews(chatId); break;
        case "Українська Правда": bot.sendMessage(chatId, "It may take more time than others! Loading..."); newsHandler.sendUPNews(chatId); break;
        case "Reuters": newsHandler.sendReutersNews(chatId); break;

        case "Follow Interfax": followOrUnfollow(chatId, "Interfax", "Interfax has been successfully followed ✅", true); break;
        case "Follow Новое Время": followOrUnfollow(chatId, "Новое Время", "Новое Время has been successfully followed ✅", true); break;
        case "Follow Європейська Правда": followOrUnfollow(chatId, "Європейська Правда", "Європейська Правда has been successfully followed ✅", true); break;
        case "Follow Українська Правда": followOrUnfollow(chatId, "Українська Правда", "Українська Правда has been successfully followed ✅", true); break;
        case "Follow Reuters": followOrUnfollow(chatId, "Reuters", "Reuters has been successfully followed ✅", true); break;

        case "Unfollow Interfax": followOrUnfollow(chatId, "Interfax", "Interfax has been successfully unfollowed ✅"); break;
        case "Unfollow Новое Время": followOrUnfollow(chatId, "Новое Время", "Новое Время has been successfully unfollowed ✅"); break;
        case "Unfollow Європейська Правда": followOrUnfollow(chatId, "Європейська Правда", "Європейська Правда has been successfully unfollowed ✅"); break;
        case "Unfollow Українська Правда": followOrUnfollow(chatId, "Українська Правда", "Українська Правда has been successfully unfollowed ✅"); break;
        case "Unfollow Reuters": followOrUnfollow(chatId, "Reuters", "Reuters has been successfully unfollowed ✅"); break;

        case "Delete All News": newsHandler.deleteAll(chatId); break;
        case "/other":
            console.log("res" + parser.parseInterfax());
            break;
        default: bot.sendMessage(chatId, "Choose request from the menu!"); break;
    }
});

const followAction = (chatId) => {
    var follows = repository.getChatFolowings(chatId);
    var publishers = repository.getAllPublishers();

    var keyboards = [];
    var temp = [];

    for (let i = 0; i < publishers.length; i++) {
        var name = follows.filter(x => x.publisherName == publishers[i].name).length == 0 ? `Follow ${publishers[i].name}` : `Unfollow ${publishers[i].name}`;

        temp.push(name);

        if (temp.length % 2 == 0) {
            keyboards.push(temp);
            temp = [];
        }
        else if (i == publishers.length - 1) {
            keyboards.push(temp);
            temp = [];
        }
    }

    keyboards.push(["Home"]);

    bot.sendMessage(chatId, "Choose a publisher to follow", {
        "reply_markup": {
            "keyboard": keyboards
        }
    });
};

const followOrUnfollow = (chatId, publisherName, responseMessage, isFollow) => {
    repository.followOrUnfollow(chatId, publisherName, isFollow, callback)

    function callback() {
        bot.sendMessage(chatId, responseMessage);
        followAction(chatId);
    };
}

var j = schedule.scheduleJob('*/5 * * * *', function () {
    var follows = repository.getAllFollows();

    console.log(new Date());

    for (let i = 0; i < follows.length; ++i) {
        if (follows[i].publisherName == "Interfax")
            newsHandler.sendInterfaxNews(follows[i].chatId, true);

        if (follows[i].publisherName == "Новое Время")
            newsHandler.sendNVNews(follows[i].chatId, true);

        if (follows[i].publisherName == "Європейська Правда")
            newsHandler.sendEPNews(follows[i].chatId, true);

        if (follows[i].publisherName == "Українська Правда")
            newsHandler.sendUPNews(follows[i].chatId, true);

        if (follows[i].publisherName == "Reuters")
            newsHandler.sendReutersNews(follows[i].chatId, true);
    }
});

bot.onText(/\/get (.+)/, (msg, match) => {
    const chatId = msg.chat.id;
});

const menuOptions = {
    "home": {
        "reply_markup": {
            "keyboard": [["Follow", "Get news"], ["Options"]]
        }
    },
    "publishers": {
        "reply_markup": {
            "keyboard": [["Interfax", "Новое Время"], ["Європейська Правда", "Reuters"], ["Українська Правда"], ["Home"]]
        }
    },
    "optionActions": {
        "reply_markup": {
            "keyboard": [["Delete All News"], ["Home"]]
        }
    }
};