const repository = require('./repository');
const bot = require('./botconfig');
const newsHandler = require('./newsHandler');
const schedule = require('node-schedule');
const parser = require('./parsers');
const staticData = require('./staticData');
const nodemailer = require('nodemailer');

repository.initDb();

bot.on('message', (msg) => {
    const chatId = msg.chat.id;

    // var transporter = nodemailer.createTransport({
    //     service: 'gmail',
    //     auth: {
    //         user: 'taras.zoshchuk@gmail.com',
    //         pass: 'Supermultigmail321'
    //     }
    // });

    // var mailOptions = {
    //     from: 'vladimir.putin@gmail.com',
    //     to: '',
    //     subject: 'Sending Email using Node.js',
    //     text: 'That was easy!'
    // };

    // transporter.sendMail(mailOptions, function (error, info) {
    //     if (error) {
    //         console.log(error);
    //     } else {
    //         console.log('Email sent: ' + info.response);
    //     }
    // });

    if (msg.text == "/start")
        bot.sendMessage(chatId, "Welcome to News Bot!", staticData.menuOptions["home"]);
    else if (msg.text == "Home")
        bot.sendMessage(chatId, "Home", staticData.menuOptions["home"]);
    else if (msg.text == "Get news")
        bot.sendMessage(chatId, "Choose a publisher", staticData.menuOptions["publishers"]);
    else if (msg.text == "Follow")
        followAction(chatId);
    else if (msg.text == "Options")
        optionAction(chatId);
    else if (msg.text == "Delete All News")
        newsHandler.deleteAll(chatId);
    else if (msg.text == "Receive Emails")
        repository.addEmailFollow(chatId);
    else if (msg.text == "Not Receive Emails")
        ;

    if (staticData.publishers.includes(msg.text)) {
        if (msg.text == 'COVID-19 UA')
            newsHandler.COVIDUAHandle(chatId);
        else
            newsHandler.sendNews(msg.text, chatId);
    }

    // bot.sendMessage(chatId, "Choose request from the menu!");
});

bot.onText(/\Follow (.+)/, (msg, match) => {
    const chatId = msg.chat.id;

    if (staticData.publishers.includes(match[1]))
        followOrUnfollow(chatId, match[1], `${match[1]} has been successfully followed ✅`, true);
});

bot.onText(/\Unfollow (.+)/, (msg, match) => {
    const chatId = msg.chat.id;

    if (staticData.publishers.includes(match[1]))
        followOrUnfollow(chatId, match[1], `${match[1]} has been successfully unfollowed ✅`);
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

const optionAction = (chatId) => {
    var emailFollows = repository.getEmailChatFolowings(chatId);

    var keyboards = [];

    keyboards.push(["Delete All News", (emailFollows.length ? "Not Receive Emails" : "Receive Emails")]);

    keyboards.push(["Home"]);

    bot.sendMessage(chatId, "Choose an action", {
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

schedule.scheduleJob('*/1 * * * *', function () {
    var follows = repository.getAllFollows();

    console.log(new Date());

    for (let i = 0; i < follows.length; ++i) {
        if (follows[i].publisherName != 'COVID-19 UA')
            newsHandler.sendNews(follows[i].publisherName, follows[i].chatId, true);
    }
});

schedule.scheduleJob('30 10 * * *', function () {
    var follows = repository.getAllFollows();

    for (let i = 0; i < follows.length; ++i) {
        if (follows[i].publisherName == 'COVID-19 UA')
            newsHandler.COVIDUAHandle(follows[i].chatId);
    }
});

bot.onText(/\/get (.+)/, (msg, match) => {
    const chatId = msg.chat.id;
});