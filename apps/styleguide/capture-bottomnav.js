import puppeteer from 'puppeteer-core';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const targetUrl = 'http://127.0.0.1:5173/';
const screenshotsDir = path.join(__dirname, 'screenshots');

async function capture() {
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 1400, deviceScaleFactor: 2 });
  await page.goto(targetUrl, { waitUntil: 'networkidle0' });

  // Scroll down to bottom navigation & list items
  await page.evaluate(() => {
    window.scrollTo(0, 3900);
  });
  await new Promise((r) => setTimeout(r, 600));

  await page.screenshot({ path: path.join(screenshotsDir, 'desktop-bottomnav-lists.png'), fullPage: false });

  await browser.close();
}

capture();
