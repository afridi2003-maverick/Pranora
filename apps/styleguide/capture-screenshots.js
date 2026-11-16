import puppeteer from 'puppeteer-core';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const targetUrl = 'http://127.0.0.1:5173/';
const screenshotsDir = path.join(__dirname, 'screenshots');

async function capture() {
  console.log('Launching Chrome from:', chromePath);
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
  });

  const page = await browser.newPage();

  // Listen to console and error logs
  page.on('console', (msg) => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', (err) => console.error('PAGE ERROR:', err));

  // 1. Desktop - Light Mode - Bangla (Default)
  console.log('Capturing Desktop Light BN...');
  await page.setViewport({ width: 1280, height: 1000, deviceScaleFactor: 2 });
  await page.goto(targetUrl, { waitUntil: 'networkidle0' });
  await page.screenshot({ path: path.join(screenshotsDir, 'desktop-light-bn.png'), fullPage: false });

  // 2. Desktop - Light Mode - English
  console.log('Capturing Desktop Light EN...');
  // Click on "English" button
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const enBtn = buttons.find((b) => b.textContent?.trim() === 'English');
    enBtn?.click();
  });
  await new Promise((r) => setTimeout(r, 400));
  await page.screenshot({ path: path.join(screenshotsDir, 'desktop-light-en.png'), fullPage: false });

  // 3. Desktop - Dark Forest Mode - English
  console.log('Capturing Desktop Dark EN...');
  await page.evaluate(() => {
    const themeBtn = Array.from(document.querySelectorAll('button')).find((b) =>
      b.getAttribute('aria-label')?.includes('theme') || b.textContent?.includes('Light') || b.textContent?.includes('Dark')
    );
    themeBtn?.click();
  });
  await new Promise((r) => setTimeout(r, 400));
  await page.screenshot({ path: path.join(screenshotsDir, 'desktop-dark-en.png'), fullPage: false });

  // 4. Desktop - Dark Forest Mode - Bangla
  console.log('Capturing Desktop Dark BN...');
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const bnBtn = buttons.find((b) => b.textContent?.trim() === 'বাংলা');
    bnBtn?.click();
  });
  await new Promise((r) => setTimeout(r, 400));
  await page.screenshot({ path: path.join(screenshotsDir, 'desktop-dark-bn.png'), fullPage: false });

  // 5. Mobile - Dark Forest Mode - Bangla (390px)
  console.log('Capturing Mobile Dark BN (390px)...');
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });
  await new Promise((r) => setTimeout(r, 400));
  await page.screenshot({ path: path.join(screenshotsDir, 'mobile-dark-bn.png'), fullPage: false });

  // 6. Mobile - Light Mode - Bangla (390px)
  console.log('Capturing Mobile Light BN (390px)...');
  await page.evaluate(() => {
    const themeBtn = Array.from(document.querySelectorAll('button')).find((b) =>
      b.getAttribute('aria-label')?.includes('theme') || b.textContent?.includes('Light') || b.textContent?.includes('Dark')
    );
    themeBtn?.click();
  });
  await new Promise((r) => setTimeout(r, 400));
  await page.screenshot({ path: path.join(screenshotsDir, 'mobile-light-bn.png'), fullPage: false });

  // Verify horizontal overflow on 390px
  const hasOverflow = await page.evaluate(() => {
    return document.documentElement.scrollWidth > window.innerWidth;
  });
  console.log('Mobile 390px Horizontal Overflow Check:', hasOverflow ? 'FAILED (Overflow detected)' : 'PASSED (Clean fit)');

  await browser.close();
  console.log('All screenshots captured successfully!');
}

capture().catch((err) => {
  console.error('Capture script error:', err);
  process.exit(1);
});
