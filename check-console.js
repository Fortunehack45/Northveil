import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  page.on('console', msg => console.log('BROWSER_LOG:', msg.type(), msg.text()));
  page.on('pageerror', err => console.log('BROWSER_ERROR:', err.toString()));

  await page.goto('http://localhost:5173', { waitUntil: 'networkidle2' });

  // Wait a bit to let the app render
  await new Promise(r => setTimeout(r, 2000));

  await browser.close();
})(); 
