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

        const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

        const slowScroll = async () => {
            let previousHeight;
            let currentHeight = await page.evaluate(() => document.documentElement.scrollHeight);
            console.log(`Initial height: ${currentHeight}`);

            while (true) {
                await page.evaluate(() => window.scrollBy(0, 2000));
                await delay(10000);

                previousHeight = currentHeight;
                currentHeight = await page.evaluate(() => document.documentElement.scrollHeight);
                console.log(`Current height: ${currentHeight}`);

                if (currentHeight === previousHeight) break;
            }
        };

        await slowScroll();

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

        const filteredProducts = products.filter(product => product.price !== 'No price available');

        filteredProducts.forEach(product => {
            console.log(`Title: ${product.title}`);
            console.log(`Price: ${product.price}`);
            console.log('--------------------------------');
        });

        fs.writeFile('adidas.json', JSON.stringify(filteredProducts, null, 2), (err) => {
            if (err) {
                console.error('Error writing file:', err);
            } else {
                console.log('File successfully saved!');
            }
        });

        return filteredProducts;
    } catch (error) {
        console.error('Error fetching products:', error);
        return [];
    }
}

module.exports = { fetchAdidasProducts };
