const puppeteer = require('puppeteer');
const fs = require('fs');

async function fetchPumaProducts() {
    try {
        const browser = await puppeteer.launch({ headless: false });
        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
        
        const allProducts = [];
        let hasMorePages = true;
        let pageNumber = 1;

        while (hasMorePages) {
            console.log(`Fetching page ${pageNumber}...`);
            await page.goto(`https://ua.puma.com/uk/novinki.html`, { waitUntil: 'networkidle2' });

            const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
            const slowScroll = async () => {
                let previousHeight;
                let currentHeight = await page.evaluate(() => document.documentElement.scrollHeight);

                while (true) {
                    await page.evaluate(() => window.scrollBy(0, 2000));
                    await delay(1000);

                    previousHeight = currentHeight;
                    currentHeight = await page.evaluate(() => document.documentElement.scrollHeight);

                    if (currentHeight === previousHeight) break;
                }
            };

            await slowScroll();

            const products = await page.evaluate(() => {
                const items = [];
                document.querySelectorAll('.product-item').forEach(element => {
                    const title = element.querySelector('.product-item__name-w')?.textContent.trim() || 'No title available';
                    const price = element.querySelector('.price')?.textContent.trim() || 'No price available';
                    if (title && price && price !== 'No price available') {
                        items.push({ title, price });
                    }
                });
                return items;
            });

            if (products.length > 0) {
                allProducts.push(...products);
            } else {
                hasMorePages = false;
            }

            const isNextPageAvailable = await page.evaluate(() => {
                const nextButton = document.querySelector('.pagination__next');
                return nextButton && !nextButton.classList.contains('disabled');
            });

            if (!isNextPageAvailable) {
                hasMorePages = false;
            }

            pageNumber++;
        }

        await browser.close();

        fs.writeFile('puma.json', JSON.stringify(allProducts, null, 2), (err) => {
            if (err) {
                console.error('Error writing file:', err);
            } else {
                console.log('File successfully saved!');
            }
        });

        return allProducts;
    } catch (error) {
        console.error('Error fetching products:', error);
        return [];
    }
}

module.exports = { fetchPumaProducts };