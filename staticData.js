const publishers = [
    "Interfax",
    "Новое Время",
    "Європейська Правда",
    "Reuters",
    "Українська Правда",
    "Радіо Свобода",
    "AFP",
    "AP",
    "BBC UA",
    // "Coronavirus UA"
]

const menuOptions = {
    "home": {
        "reply_markup": {
            "keyboard": [["Follow", "Get news"], ["Options"]]
        }
    },
    "publishers": {
        "reply_markup": {
            "keyboard": [["Interfax", "Новое Время"], ["Європейська Правда", "Reuters"], ["Українська Правда", "Радіо Свобода"],
            ["AFP", "AP"], ["BBC UA"], ["Home"]]
        }
    },
    "optionActions": {
        "reply_markup": {
            "keyboard": [["Delete All News"], ["Home"]]
        }
    }
};

module.exports = {
    publishers,
    menuOptions
};