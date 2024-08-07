const TelegramBot = require('node-telegram-bot-api');
const { fetchAdidasProducts } = require('./AdidasParser');

const token = '6673628321:AAE98WdYUWbeh30QJc3REwfEWei1qOIr2CU';
const bot = new TelegramBot(token, { polling: true });

const stores = [
    'Adidas', 'Zara', 'Nike', 'Puma', 'Bershka',
    'магаз 6', 'магаз 7', 'магаз 8', 'магаз 9', 'магаз 10'
];

const registeredUsers = new Set();

bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;

    if (registeredUsers.has(chatId)) {
        bot.sendMessage(chatId, 'Вы уже зарегистрированы. Команды бота теперь доступны.');
        // Отправляем пользователю список магазинов, если он уже зарегистрирован
        const inlineKeyboard = [
            [{ text: 'Adidas', callback_data: 'store_0' }, { text: 'Zara', callback_data: 'store_1' }],
            [{ text: 'Nike', callback_data: 'store_2' }, { text: 'Puma', callback_data: 'store_3' }],
            [{ text: 'Bershka', callback_data: 'store_4' }, { text: 'магаз 6', callback_data: 'store_5' }],
            [{ text: 'магаз 7', callback_data: 'store_6' }, { text: 'магаз 8', callback_data: 'store_7' }],
            [{ text: 'магаз 9', callback_data: 'store_8' }, { text: 'магаз 10', callback_data: 'store_9' }]
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

    if (phoneNumber === '212654836803' || phoneNumber === '380959312506') {
        registeredUsers.add(chatId); // Добавляем пользователя в зарегистрированные

        bot.sendMessage(chatId, `Привет, ${nameOfUser}\nДоступ разрешён! Команды бота теперь доступны.`, {
            reply_markup: {
                remove_keyboard: true
            }
        });

        const inlineKeyboard = [
            [{ text: 'Adidas', callback_data: 'store_0' }, { text: 'Zara', callback_data: 'store_1' }],
            [{ text: 'Nike', callback_data: 'store_2' }, { text: 'Puma', callback_data: 'store_3' }],
            [{ text: 'Bershka', callback_data: 'store_4' }, { text: 'магаз 6', callback_data: 'store_5' }],
            [{ text: 'магаз 7', callback_data: 'store_6' }, { text: 'магаз 8', callback_data: 'store_7' }],
            [{ text: 'магаз 9', callback_data: 'store_8' }, { text: 'магаз 10', callback_data: 'store_9' }]
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
    const callbackData = callbackQuery.data;

    if (callbackData.startsWith('store_')) {
        const storeIndex = parseInt(callbackData.split('_')[1]);
        const selectedStore = stores[storeIndex]; // Получаем название магазина из массива

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

            // Отправка сообщения с инлайн кнопкой через 5 секунд
            setTimeout(() => {
                bot.sendMessage(chatId, 'Хотите добавить все товары в канал?', {
                    reply_markup: {
                        inline_keyboard: [
                            [{ text: 'Добавить все товары в канал', callback_data: 'add_to_channel' }]
                        ]
                    }
                });
            }, 5000);
        } else {
            bot.sendMessage(chatId, 'Этот магазин еще не поддерживается.');
        }
    } else if (callbackData === 'add_to_channel') {
        // Логика для добавления товаров в канал
        // Подтверждение добавления
        bot.sendMessage(chatId, 'Товары будут добавлены в канал через 3 секунды...');

        setTimeout(async () => {
            // Здесь можно добавить логику для добавления товаров в канал
            bot.sendMessage(chatId, 'Товары добавлены в канал.');
        }, 3000);
    }
});

bot.onText(/\/products/, async (msg) => {
    const chatId = msg.chat.id;

    if (!registeredUsers.has(chatId)) {
        bot.sendMessage(chatId, 'Вы не зарегистрированы. Пожалуйста, отправьте свой номер.');
        return;
    }

    const products = await fetchAdidasProducts();

    if (products.length === 0) {
        bot.sendMessage(chatId, 'Найдено 0 товаров или произошла ошибка.');
        return;
    }

    products.forEach(product => {
        bot.sendMessage(chatId, `Название: ${product.title}\nЦена: ${product.price}\n\n\n`);
    });
});
