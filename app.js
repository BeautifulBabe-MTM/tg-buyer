const TelegramBot = require('node-telegram-bot-api');
const { fetchProducts } = require('./parser');

const token = '6673628321:AAE98WdYUWbeh30QJc3REwfEWei1qOIr2CU';
const bot = new TelegramBot(token, { polling: true });

bot.onText(/\/start/, async (msg) => {
    const chatId = msg.chat.id;
    const products = await fetchProducts();

    if (products.length === 0) {
        bot.sendMessage(chatId, 'No products found or an error occurred.');
        return;
    }

    let response = 'Here are some products:\n\n';
    products.forEach(product => {
        response += `Title: ${product.title}\nPrice: ${product.price}\nLink: ${product.link}\n\n`;
    });

    bot.sendMessage(chatId, response);
});