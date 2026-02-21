import { chromium } from 'playwright';
import path from 'path';

async function run() {
    console.log("Launching browser...");
    // Ensure HOME is set for playwright (Windows workaround)
    if (!process.env.HOME && process.env.USERPROFILE) {
        process.env.HOME = process.env.USERPROFILE;
    }

    const browser = await chromium.launch({
        headless: true,
        args: ['--ignore-certificate-errors']
    });
    const page = await browser.newPage();

    console.log("Navigating to https://localhost:3000...");
    try {
        await page.goto('https://localhost:3000', {
            waitUntil: 'networkidle',
            timeout: 10000 // 10s
        });

        const title = await page.title();
        console.log(`Page Title: ${title}`);

        await page.screenshot({ path: 'test-screenshot.png', fullPage: true });
        console.log("Screenshot saved to test-screenshot.png");

    } catch (err) {
        console.error("Navigation failed:", err);
    } finally {
        await browser.close();
    }
}

run().catch(console.error);
