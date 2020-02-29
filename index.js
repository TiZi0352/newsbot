const TelegramBot = require('node-telegram-bot-api');
const sqlite = require('sqlite-sync'); //requiring

const token = '1133105459:AAEZH2ATVdqGE7klNisHkEmt1u5tNk7HkDM';
const bot = new TelegramBot(token, { polling: true });

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

// sqlite.insert("messages", {
//     key: "hello",
//     fromId: "355418546",
//     messageId: 14
// });

// sqlite.insert("messages", {
//     key: "test",
//     fromId: "355418546",
//     messageId: 12
// });

// console.log(sqlite.run("SELECT * FROM messages"));


bot.onText(/\/get ([^;'\"])/, (msg, match) => {
    const chatId = msg.chat.id;
    const key = match[1];
    const message = getMessage(key);

    if (message.exists) {
        bot.forwardMessage(chatId, message.fromId, message.messageId);
    }
});

//1.   /add hi
//2.   [gif, audio, text, sticker]
bot.onText(/\/add ([^;'\"])/, (msg, match) => {
    const chatId = msg.chat.id;
    const key = match[1];
    const message = getMessage(key);

    if (message.exists) {
        bot.forwardMessage(chatId, message.fromId, message.messageId);
    }
});

// bot.on('message', (msg) => {
//     const chatId = msg.chat.id;
//     bot.sendMessage(chatId, JSON.stringify(msg));
// });

function getMessage(key) {
    const data = sqlite.run("SELECT * FROM messages where `key` = ? LIMIT 1", [key]);

    if (data.length == 0)
        return { exists: false }

    data[0].exists = true;
    return data[0];
};