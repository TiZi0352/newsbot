const repository = require('./repository');
const bot = require('./botconfig');
const newsHandler = require('./newsHandler');
const schedule = require('node-schedule');

repository.initDb();

bot.on('message', (msg) => {
    const chatId = msg.chat.id;

    console.log(msg);

    switch (msg.text) {
        case "/start": bot.sendMessage(chatId, "Welcome to News Bot!", menuOptions["home"]); break;
        case "Home": bot.sendMessage(chatId, "Home", menuOptions["home"]); break;
        case "Get news": bot.sendMessage(chatId, "Choose a publisher", menuOptions["publishers"]); break;
        case "Follow": followAction(chatId); break;
        case "Options": bot.sendMessage(chatId, "Choose an action", menuOptions["optionActions"]); break;

        case "Interfax": newsHandler.sendInterfaxNews(chatId); break;
        case "Новое Время": newsHandler.sendNVNews(chatId); break;
        case "Європейська Правда": bot.sendMessage(chatId, "It may take more time than others! Loading..."); newsHandler.sendEPNews(chatId); break;
        case "Reuters": newsHandler.sendReutersNews(chatId); break;

        case "Follow Interfax": repository.followPublisher(chatId, "Interfax").then(x => bot.sendMessage(chatId, "Interfax has been successfully followed ✅")); break;
        case "Follow Новое Время": newsHandler.followPublisher(chatId, "Новое Время").then(x => bot.sendMessage(chatId, "Новое Время has been successfully followed ✅")); break;
        case "Follow Європейська Правда": newsHandler.followPublisher(chatId, "Європейська Правда").then(x => bot.sendMessage(chatId, "Європейська Правда has been successfully followed ✅")); break;
        case "Follow Reuters": newsHandler.followPublisher(chatId, "Reuters").then(x => bot.sendMessage(chatId, "Reuters has been successfully followed ✅")); break;

        case "Unfollow Interfax": repository.unfollowPublisher(chatId, "Interfax").then(x => bot.sendMessage(chatId, "Interfax has been successfully unfollowed ✅")); break;
        case "Unfollow Новое Время": newsHandler.unfollowPublisher(chatId, "Новое Время").then(x => bot.sendMessage(chatId, "Новое Время has been successfully unfollowed ✅")); break;
        case "Unfollow Європейська Правда": newsHandler.unfollowPublisher(chatId, "Європейська Правда").then(x => bot.sendMessage(chatId, "Європейська Правда has been successfully unfollowed ✅")); break;
        case "Unfollow Reuters": newsHandler.unfollowPublisher(chatId, "Reuters").then(x => bot.sendMessage(chatId, "Reuters has been successfully unfollowed ✅")); break;

        case "Delete All News": newsHandler.deleteAll(chatId); break;
        case "/other": bot.sendMessage(chatId, "https://www.rbc.ua/ukr/news/kolichestvo-smertey-koronavirusa-mire-priblizhaetsya-1583019405.html"); break;
        default: bot.sendMessage(chatId, "Choose request from the menu!"); break;
    }
});

const followAction = (chatId) => {
    var folows = repository.getChatFolowings(chatId)
    var publishers = repository.getAllPublishers();

    console.log(publishers);

    var keyboards = [];
    var temp = [];

    for (let i = 0; i < publishers.length; i++) {
        temp.push(publishers[i].name);

        console.log(temp);

        if (temp.length % 2 == 0) {
            keyboards.push(temp);
            temp.length = 0;
        }
        // else if (i == publishers.length - 1) {
        //     keyboards.push(temp);
        //     temp.length = 0;
        // }
    }

    keyboards.push(["Home"]);

    console.log(keyboards);

    bot.sendMessage(chatId, "Choose a publisher to follow", {
        "reply_markup": {
            "keyboard": keyboards
        }
    });
};

var j = schedule.scheduleJob('*/1 * * * *', function () {
    console.log('The answer to life, the universe, and everything!');
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
            "keyboard": [["Interfax", "Новое Время"], ["Європейська Правда", "Reuters"], ["Home"]]
        }
    },
    "optionActions": {
        "reply_markup": {
            "keyboard": [["Delete All News"], ["Home"]]
        }
    }
};