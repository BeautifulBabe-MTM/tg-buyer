const puppeteer = require('puppeteer');
const fs = require('fs');

async function fetchAdidasProducts() {
    try {
        const browser = await puppeteer.launch({ headless: false });
        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
        await page.goto('https://www.adidas.com/us/new_arrivals', {
            waitUntil: 'networkidle2',
        });

        // Функция для создания задержки
        const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

        // Функция для медленной прокрутки страницы
        const slowScroll = async () => {
            let previousHeight;
            let currentHeight = await page.evaluate(() => document.documentElement.scrollHeight);
            console.log(`Initial height: ${currentHeight}`);

            while (true) {
                // Прокрутка страницы на 2000 пикселей вниз
                await page.evaluate(() => window.scrollBy(0, 2000));
                await delay(10000); // Увеличенное время ожидания для загрузки новых элементов

                // Проверка высоты страницы
                previousHeight = currentHeight;
                currentHeight = await page.evaluate(() => document.documentElement.scrollHeight);
                console.log(`Current height: ${currentHeight}`);

                // Если высота не изменилась или достигнут конец страницы
                if (currentHeight === previousHeight) break;
            }
        };

        await slowScroll();

        // Получение контента страницы после прокрутки
        const products = await page.evaluate(() => {
            const items = [];
            document.querySelectorAll('.grid-item').forEach(element => {
                const title = element.querySelector('.glass-product-card__title')?.textContent.trim() || 'No title available';
                const price = element.querySelector('.gl-price-item')?.textContent.trim() || 'No price available';
                if (title && price) {
                    items.push({
                        title,
                        price
                    });
                }
            });
            return items;
        });

        await browser.close();

        products.forEach(product => {
            console.log(`Title: ${product.title}`);
            console.log(`Price: ${product.price}`);
            console.log('--------------------------------');
        });

        fs.writeFile('adidas.json', JSON.stringify(products, null, 2), (err) => {
            if (err) {
                console.error('Error writing file:', err);
            } else {
                console.log('File successfully saved!');
            }
        });

        return products;
    } catch (error) {
        console.error('Error fetching products:', error);
        return [];
    }
}

module.exports = { fetchAdidasProducts };
