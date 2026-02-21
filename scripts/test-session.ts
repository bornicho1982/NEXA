import { SignJWT } from 'jose';
import { chromium, BrowserContext } from 'playwright';
import path from 'path';

const SESSION_SECRET_KEY = "n3x4_d2_s3ss10n_k3y_2026_s3cur3!!"; // from .env.local
const SECRET_BYTES = new TextEncoder().encode(SESSION_SECRET_KEY);

async function createToken() {
    const user = {
        id: "test-user-id-123",
        bungieId: "4611686018428388323", // Real Bungie ID format
        displayName: "Test Guardian",
        profilePicturePath: null,
        membershipType: 3, // Steam
        destinyMembershipId: "4611686018428388323"
    };

    return await new SignJWT({ user })
        .setProtectedHeader({ alg: "HS256" })
        .setExpirationTime("7d")
        .setIssuedAt()
        .sign(SECRET_BYTES);
}

async function run() {
    console.log("Generating fake session...");
    const token = await createToken();

    // Ensure HOME is set for playwright (Windows workaround)
    if (!process.env.HOME && process.env.USERPROFILE) {
        process.env.HOME = process.env.USERPROFILE;
    }

    console.log("Launching browser...");
    // HEADLESS: FALSE -> Browser will pop up on YOUR screen!
    const browser = await chromium.launch({
        headless: true,
        args: ['--ignore-certificate-errors', '--no-sandbox']
    });
    const context = await browser.newContext({
        ignoreHTTPSErrors: true,
        baseURL: "https://localhost:3000"
    });

    // Set cookie
    await context.addCookies([{
        name: "nexa-session",
        value: token,
        domain: "localhost",
        path: "/",
        httpOnly: true,
        secure: true,
        sameSite: "Lax"
    }]);

    const page = await context.newPage();

    // DEBUG: Log browser errors to terminal
    page.on('console', msg => {
        if (msg.type() === 'error') console.log(`[BROWSER ERROR] ${msg.text()}`);
    });
    page.on('pageerror', err => {
        console.log(`[PAGE CRASH] ${err.message}`);
    });
    page.on('response', response => {
        if (response.status() >= 400) {
            console.log(`[HTTP ERROR] ${response.status()} ${response.url()}`);
        }
    });

    try {
        console.log("Navigating to /dashboard...");
        await page.goto('/dashboard');
        await page.waitForLoadState('domcontentloaded'); // Changed from networkidle (sometimes hangs on WS)

        const title = await page.title();
        console.log(`Page Title: "${title}"`);
        await page.screenshot({ path: 'test-dashboard.png', fullPage: true });
        console.log("Screenshot saved: test-dashboard.png");

        console.log("Navigating to /inventory...");
        await page.goto('/inventory');
        // Wait for items to load (client side skeletons might appear first)
        await page.waitForTimeout(2000);
        await page.screenshot({ path: 'test-inventory.png', fullPage: true });
        console.log("Screenshot saved: test-inventory.png");

        console.log("Navigating to /builds...");
        await page.goto('/builds');
        await page.waitForTimeout(2000);
        await page.screenshot({ path: 'test-builds.png', fullPage: true });
        console.log("Screenshot saved: test-builds.png");

    } catch (err) {
        console.error("Test failed:", err);
    } finally {
        await browser.close();
    }
}

run().catch(console.error);
