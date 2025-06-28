const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
    const browser = await puppeteer.launch({ headless: false }); // Set to true for headless mode
    const page = await browser.newPage();

    const url = 'https://domusgpt.github.io/vib34d-gemini/'; // Replace with your actual GitHub Pages URL

    const consoleLogs = [];
    page.on('console', msg => {
        consoleLogs.push(msg.text());
    });

    page.on('pageerror', error => {
        consoleLogs.push(`Page Error: ${error.message}`);
    });

    page.on('requestfailed', request => {
        consoleLogs.push(`Request Failed: ${request.url()} - ${request.failure().errorText}`);
    });

    try {
        await page.goto(url, { waitUntil: 'networkidle0' });
        // await page.screenshot({ path: 'screenshot.png', fullPage: true }); // Commented out for manual inspection
        console.log('Browser opened. Inspect manually.');

        // Keep the browser open for a few seconds for manual inspection
        await new Promise(resolve => setTimeout(resolve, 10000)); 

        fs.writeFileSync('console_output.txt', consoleLogs.join('\n'));
        console.log('Console output saved to console_output.txt');

    } catch (error) {
        console.error('Error during Puppeteer test:', error);
    } finally {
        await browser.close();
    }
})();