const TelegramBot = require('node-telegram-bot-api');
const { fetchAdidasProducts } = require('./AdidasParser');
const { fetchZaraProducts } = require('./ZaraParser');
const { fetchNikeProducts } = require('./NikeParser');
const { fetchPumaProducts } = require('./PumaParser');
const { fetchBershkaProducts } = require('./BershkaParser');
const { fetchGapProducts } = require('./GapParser');
const { fetchLevisProducts } = require('./LevisParser');
const { fetchReebokProducts } = require('./ReebokParser');
const { fetchLacosteProducts } = require('./LacosteParser');


const token = '6673628321:AAE98WdYUWbeh30QJc3REwfEWei1qOIr2CU';
const bot = new TelegramBot(token, { polling: true });

const stores = [
    'Adidas®', 'Zara®', 'Nike®', 'Puma®', 'Bershka®',
    'Gap®', `Levi's®`, 'Reebok®', 'Lacoste', 'магаз 10'
];

const registeredUsers = new Set();
const userStoreSelection = new Map();

bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;

    if (registeredUsers.has(chatId)) {
        bot.sendMessage(chatId, 'Вы уже зарегистрированы. Команды бота теперь доступны.');
        sendStoreSelectionKeyboard(chatId);
    } else {
        bot.sendMessage(chatId, 'Пожалуйста, отправьте свой номер:', {
            reply_markup: {
                keyboard: [
                    [
                        {
                            text: "Отправить номер",
                            request_contact: true
                        }
                    ]
                ],
                resize_keyboard: true,
                one_time_keyboard: true
            }
        });
    }
});

bot.on('contact', async (msg) => {
    const chatId = msg.chat.id;
    const phoneNumber = msg.contact.phone_number;
    const nameOfUser = msg.contact.first_name;

    if (['+212654836803', '380959312506', '380685247141'].includes(phoneNumber)) {
        registeredUsers.add(chatId);

        bot.sendMessage(chatId, `Привет, ${nameOfUser}\nДоступ разрешён! Команды бота теперь доступны.`, {
            reply_markup: {
                remove_keyboard: true
            }
        });

        sendStoreSelectionKeyboard(chatId);
    } else {
        bot.sendMessage(chatId, 'Доступ запрещен. Ваш номер телефона не авторизован.');
    }
});

function sendStoreSelectionKeyboard(chatId) {
    const inlineKeyboard = [
        [{ text: 'Adidas', callback_data: 'store_0' }, { text: 'Zara', callback_data: 'store_1' }],
        [{ text: 'Nike', callback_data: 'store_2' }, { text: 'Puma', callback_data: 'store_3' }],
        [{ text: 'Bershka', callback_data: 'store_4' }, { text: 'Gap', callback_data: 'store_5' }],
        [{ text: `Levi's`, callback_data: 'store_6' }, { text: 'Reebok', callback_data: 'store_7' }],
        [{ text: 'Lacoste', callback_data: 'store_8' }, { text: 'магаз 10', callback_data: 'store_9' }]
    ];

    bot.sendMessage(chatId, 'Выберите магазин:', {
        reply_markup: {
            inline_keyboard: inlineKeyboard
        }
    });
}

bot.on('callback_query', (callbackQuery) => {
    const chatId = callbackQuery.message.chat.id;
    const callbackData = callbackQuery.data;

    if (callbackData.startsWith('store_')) {
        const storeIndex = parseInt(callbackData.split('_')[1]);
        const selectedStore = stores[storeIndex];

        userStoreSelection.set(chatId, selectedStore); // Save the store selection for the user

        bot.sendMessage(chatId, `Вы выбрали: ${selectedStore}\nПожалуйста, отправьте ссылку на товары.`);
    }
});

bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    if (userStoreSelection.has(chatId)) {
        const selectedStore = userStoreSelection.get(chatId);

        let products = [];
        if (selectedStore === 'Adidas®') {
            products = await fetchAdidasProducts(text);
        } else if (selectedStore === 'Zara®') {
            products = await fetchZaraProducts(text);
        } else if (selectedStore === 'Nike®') {
            products = await fetchNikeProducts(text);
        } else if (selectedStore === 'Puma®') {
            products = await fetchPumaProducts(text);
        } else if (selectedStore === 'Bershka®') {
            products = await fetchBershkaProducts(text);
        } else if (selectedStore === 'Gap®') {
            products = await fetchGapProducts(text);
        } else if (selectedStore === `Levi's®`) {
            products = await fetchLevisProducts(text);
        } else if (selectedStore === 'Reebok®') {
            bot.sendMessage(chatId, 'На момент разработки магазин Reebok не работал.');
        } else if (selectedStore === 'Lacoste') {
            products = await fetchLacosteProducts(text);
        } else {
            bot.sendMessage(chatId, 'Этот магазин еще не поддерживается.');
            return;
        }

        if (products.length === 0) {
            bot.sendMessage(chatId, 'Найдено 0 товаров или произошла ошибка.');
        } else {
            products.forEach(product => {
                bot.sendMessage(chatId, `Название: ${product.title}\nЦена: ${product.price}\n\n\n`);
            });

            setTimeout(() => {
                bot.sendMessage(chatId, 'Хотите добавить все товары в канал?', {
                    reply_markup: {
                        inline_keyboard: [
                            [{ text: 'Добавить все товары в канал', callback_data: 'add_to_channel' }]
                        ]
                    }
                });
            }, 5000);
        }
        userStoreSelection.delete(chatId); // Clear the selection after processing
    }
});