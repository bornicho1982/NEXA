import { SignJWT } from 'jose';
import { chromium } from 'playwright';
import fs from 'fs';

const SESSION_SECRET_KEY = "n3x4_d2_s3ss10n_k3y_2026_s3cur3!!";
const SECRET_BYTES = new TextEncoder().encode(SESSION_SECRET_KEY);

async function createToken() {
    // Mock User matching Prisma Schema & Bungie Types
    const user = {
        id: "test-user-id-123",
        bungieId: "4611686018428388323",
        displayName: "Audit Guardian",
        profilePicturePath: "/icons/icon-192.png",
        membershipType: 3,
        destinyMembershipId: "4611686018428388323"
    };

    return await new SignJWT({ user })
        .setProtectedHeader({ alg: "HS256" })
        .setExpirationTime("1h")
        .setIssuedAt()
        .sign(SECRET_BYTES);
}

async function run() {
    console.log("🔍 Starting Application Audit...");

    // Workaround for Windows Environment in Subagent
    if (!process.env.HOME && process.env.USERPROFILE) {
        process.env.HOME = process.env.USERPROFILE;
    }

    const browser = await chromium.launch({
        headless: false, // Visual Mode
        slowMo: 1000,    // 1s delay per action
        args: ['--ignore-certificate-errors', '--no-sandbox']
    });

    const context = await browser.newContext({
        ignoreHTTPSErrors: true,
        viewport: { width: 1280, height: 720 },
        baseURL: "https://localhost:3000"
    });

    // Inject Session
    const token = await createToken();
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
    const errors: string[] = [];

    page.on('console', msg => {
        if (msg.type() === 'error') {
            const text = msg.text();
            console.log(`❌ [Console Error] ${text}`);
            errors.push(text);
        }
    });

    page.on('pageerror', err => {
        console.log(`❌ [Page Crash] ${err.message}`);
        errors.push(err.message);
    });

    page.on('response', response => {
        if (response.status() >= 400 && response.url().includes(process.env.NEXT_PUBLIC_APP_URL || "localhost")) {
            console.log(`❌ [HTTP Error] ${response.status()} ${response.url()}`);
            errors.push(`HTTP ${response.status()} at ${response.url()}`);
        }
    });

    try {
        // 1. Landing Page (Public)
        // Clear cookies first to test public view? No, we want to test authenticated view mostly. 
        // But let's check redirect behavior.

        console.log("➡️  Navigating to / (Landing)...");
        await page.goto('/');
        await page.waitForTimeout(2000);
        // Should redirect to dashboard if authenticated
        const url = page.url();
        console.log(`   Current URL: ${url}`);
        if (!url.includes("/dashboard")) {
            console.log("⚠️  Auth Redirect from Landing didn't happen (or intentional?)");
        }

        // 2. Dashboard
        console.log("➡️  Navigating to /dashboard...");
        await page.goto('/dashboard');
        await page.waitForLoadState('domcontentloaded');
        await page.screenshot({ path: 'audit-dashboard.png' });
        console.log("📸  Captured: audit-dashboard.png");

        // 3. Inventory
        console.log("➡️  Navigating to /inventory...");
        await page.goto('/inventory');
        await page.waitForLoadState('domcontentloaded');
        await page.waitForTimeout(3000); // Allow skeletons to resolve
        await page.screenshot({ path: 'audit-inventory.png' });
        console.log("📸  Captured: audit-inventory.png");

        // 4. Builds
        console.log("➡️  Navigating to /builds...");
        await page.goto('/builds');
        await page.waitForLoadState('domcontentloaded');
        await page.waitForTimeout(2000);
        await page.screenshot({ path: 'audit-builds.png' });
        console.log("📸  Captured: audit-builds.png");

        // 5. Loadouts
        console.log("➡️  Navigating to /loadouts...");
        await page.goto('/loadouts');
        await page.waitForLoadState('domcontentloaded');
        await page.waitForTimeout(2000);
        await page.screenshot({ path: 'audit-loadouts.png' });
        console.log("📸  Captured: audit-loadouts.png");

        // 6. AI Advisor
        console.log("➡️  Navigating to /ai...");
        await page.goto('/ai');
        await page.waitForLoadState('domcontentloaded');
        await page.waitForTimeout(2000);
        await page.screenshot({ path: 'audit-ai.png' });
        console.log("📸  Captured: audit-ai.png");

    } catch (err) {
        console.error("🚨 Audit Interrupted:", err);
    } finally {
        await browser.close();
        console.log("✅ Audit Complete.");
        if (errors.length > 0) {
            console.log("\n⚠️  Errors Found during Audit:");
            errors.forEach(e => console.log(`   - ${e}`));
        } else {
            console.log("\n✨  No visible errors detected!");
        }
    }
}

run();
