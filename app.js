const axios = require('axios');
const cheerio = require('cheerio');
const TelegramBot = require('node-telegram-bot-api');

const token = '6673628321:AAE98WdYUWbeh30QJc3REwfEWei1qOIr2CU';
const bot = new TelegramBot(token, { polling: true });
const siteURL = 'https://www.zara.com/us/en/man-special-prices-l806.html';

async function fetchProductData(url) {
    try {
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Accept-Language': 'en-US,en;q=0.9',
                'Accept-Encoding': 'gzip, deflate, br',
                'Connection': 'keep-alive'
            }
        });
        const body = response.data;

        const $ = cheerio.load(body);

        const products = [];
        const productElements = $('.product-grid-product__figure'); // Попробуйте изменить селектор по необходимости

        productElements.each((index, element) => {
            if (index < 5) { // Берем только первые 5 элементов
                const title = $(element).find('.product-card__title').text().trim() || 'Нет названия';
                const price = $(element).find('.product-card__price').text().trim() || 'Нет цены';
                const discountPrice = $(element).find('.product-card__price--sale').text().trim() || price;
                const link = $(element).find('.product-card__link').attr('href');
                const imageUrl = $(element).find('.product-card__image').attr('src');
                const description = $(element).find('.product-card__description').text().trim() || 'Описание недоступно';

                products.push({
                    title,
                    price,
                    discountPrice,
                    link: link ? `https://www.zara.com${link}` : 'Ссылка недоступна',
                    imageUrl,
                    description
                });
            }
        });

        console.log(`Found ${products.length} products`);
        return products;
    } catch (error) {
        console.error('Error fetching product data:', error);
        return [];
    }
}

async function sendProductData(chatId) {
    console.log('Начинаем загрузку данных...');
    const products = await fetchProductData(siteURL);
    console.log('Загрузка данных завершена.');

    if (products.length === 0) {
        await bot.sendMessage(chatId, 'Не удалось найти товары по указанной ссылке.');
    } else {
        console.log('Отправляем информацию о товарах...');
        for (const product of products) {
            const message = `
Название: ${product.title}
Цена: ${product.price}
Цена со скидкой: ${product.discountPrice}
Описание: ${product.description}
Ссылка: ${product.link}
            `;
            if (product.imageUrl) {
                await bot.sendPhoto(chatId, product.imageUrl, { caption: message });
            } else {
                await bot.sendMessage(chatId, message);
            }
        }
    }
}

bot.onText(/\/start/, async (msg) => {
    bot.sendMessage(msg.chat.id, 'Привет! Я отправлю тебе информацию о товарах с сайта Zara.');
    console.log('Начинаем отправку информации о продуктах...');
    await sendProductData(msg.chat.id);
    console.log('Информация о продуктах отправлена.');
});

bot.on('message', async (msg) => {
    if (msg.text.toLowerCase() === 'зара') {
        await sendProductData(msg.chat.id);
    }
});
