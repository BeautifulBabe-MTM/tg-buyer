const puppeteer = require('puppeteer');

async function fetchProducts() {
    try {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.goto('https://www.adidas.com/us/new_arrivals', {
            waitUntil: 'networkidle2',
        });

        // Задаем таймаут, если нужно дождаться загрузки данных
        await page.waitForTimeout(2000); 

        const products = await page.evaluate(() => {
            const items = [];
            document.querySelectorAll('.grid-item').forEach(element => {
                const title = element.querySelector('.product-title')?.textContent.trim() || '';
                const price = element.querySelector('.product-price')?.textContent.trim() || '';
                const link = element.querySelector('a')?.getAttribute('href') || '';
                if (title && price && link) {
                    items.push({ title, price, link });
                }
            });
            return items;
        });

        await browser.close();
        console.log('Products fetched:', products); // Отладочная информация
        return products;
    } catch (error) {
        console.error('Error fetching products:', error);
        return [];
    }
}

module.exports = { fetchProducts };
