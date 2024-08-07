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

        await page.waitForSelector('.grid-item', { timeout: 60000 });

        await page.waitForFunction(() => document.querySelectorAll('.grid-item').length > 0, { timeout: 60000 });

        const html = await page.content();
        console.log('HTML content:', html.substring(0, 2000)); 

        const productCount = await page.evaluate(() => document.querySelectorAll('.grid-item').length);
        console.log('Number of product cards found:', productCount);

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