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

bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;

    if (registeredUsers.has(chatId)) {
        bot.sendMessage(chatId, 'Вы уже зарегистрированы. Команды бота теперь доступны.');
        const inlineKeyboard = [
            [{ text: 'Adidas', callback_data: 'store_0' }, { text: 'Zara', callback_data: 'store_1' }],
            [{ text: 'Nike', callback_data: 'store_2' }, { text: 'Puma', callback_data: 'store_3' }],
            [{ text: 'Bershka', callback_data: 'store_4' }, { text: 'Gap', callback_data: 'store_5' }],
            [{ text: `Levi's®`, callback_data: 'store_6' }, { text: 'Reebok', callback_data: 'store_7' }],
            [{ text: 'Lacoste', callback_data: 'store_8' }, { text: 'магаз 10', callback_data: 'store_9' }]
        ];

        bot.sendMessage(chatId, 'Выберите магазин:', {
            reply_markup: {
                inline_keyboard: inlineKeyboard
            }
        });
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

    if (phoneNumber === '212654836803' || phoneNumber === '380959312506' || phoneNumber === "380685247141") {
        registeredUsers.add(chatId);

        bot.sendMessage(chatId, `Привет, ${nameOfUser}\nДоступ разрешён! Команды бота теперь доступны.`, {
            reply_markup: {
                remove_keyboard: true
            }
        });

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
    } else {
        bot.sendMessage(chatId, 'Доступ запрещен. Ваш номер телефона не авторизован.');
    }
});

bot.on('callback_query', async (callbackQuery) => {
    const msg = callbackQuery.message;
    const chatId = msg.chat.id;
    const messageId = msg.message_id;
    const callbackData = callbackQuery.data;

    if (callbackData.startsWith('store_')) {
        const storeIndex = parseInt(callbackData.split('_')[1]);
        const selectedStore = stores[storeIndex];

        bot.sendMessage(chatId, `Вы выбрали: ${selectedStore}`);

        if (storeIndex === 0) {
            const products = await fetchAdidasProducts();

            if (products.length === 0) {
                bot.sendMessage(chatId, 'Найдено 0 товаров или произошла ошибка.');
                return;
            }

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

        else if (storeIndex === 1) {
            const products = await fetchZaraProducts();

            if (products.length === 0) {
                bot.sendMessage(chatId, 'Найдено 0 товаров или произошла ошибка.');
                return;
            }

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
        else if (storeIndex === 2) {
            const products = await fetchNikeProducts();

            if (products.length === 0) {
                bot.sendMessage(chatId, 'Найдено 0 товаров или произошла ошибка.');
                return;
            }

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
        else if (storeIndex === 3) {
            const products = await fetchPumaProducts();

            if (products.length === 0) {
                bot.sendMessage(chatId, 'Найдено 0 товаров или произошла ошибка.');
                return;
            }

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
        else if (storeIndex === 4) {
            const products = await fetchBershkaProducts();

            if (products.length === 0) {
                bot.sendMessage(chatId, 'Найдено 0 товаров или произошла ошибка.');
                return;
            }

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
        else if (storeIndex === 5) {
            const products = await fetchGapProducts();

            if (products.length === 0) {
                bot.sendMessage(chatId, 'Найдено 0 товаров или произошла ошибка.');
                return;
            }

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
        else if (storeIndex === 6) {
            const products = await fetchLevisProducts();

            if (products.length === 0) {
                bot.sendMessage(chatId, 'Найдено 0 товаров или произошла ошибка.');
                return;
            }

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
        else if (storeIndex === 7) {
            bot.sendMessage(chatId, 'На момент разработки магазин Reebok не работал.')
        }
        else if (storeIndex === 8) {
            const products = await fetchLacosteProducts();

            if (products.length === 0) {
                bot.sendMessage(chatId, 'Найдено 0 товаров или произошла ошибка.');
                return;
            }

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
        else {
            bot.sendMessage(chatId, 'Этот магазин еще не поддерживается.');
        }
    } else if (callbackData === 'add_to_channel') {
        bot.deleteMessage(chatId, messageId);
        // логика для добавления товаров в канал
        const confirmationMessage = await bot.sendMessage(chatId, 'Товары будут добавлены в канал через 3 секунды...');

        bot.deleteMessage(chatId, messageId)
        setTimeout(async () => {
            // и здесь можно добавить логику для добавления товаров в канал
            bot.sendMessage(chatId, 'Товары добавлены в канал.');
            bot.deleteMessage(chatId, confirmationMessage.message_id);
        }, 3000);
    }
});

bot.onText(/\/info/, async (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, `Help Buyer Bot 🤖 Информация:\n\n` +
        `• Запуск бота через команду /start.\n\n` +
        `• Все внутренние функции бота доступны только авторизованным пользователям.\n\n` +
        `• Бот не подходит для иных целей, помимо тех, для которых он был создан.\n\n` +
        `• Авторизироваться самостоятельно через бота невозможно. Удачного использования! 🍀`);
});