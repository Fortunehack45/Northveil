const puppeteer = require('puppeteer'); 
(async () => { 
  const browser = await puppeteer.launch(); 
  const page = await browser.newPage(); 
  await page.goto('http://localhost:3001', {waitUntil: 'networkidle2'}); 
  
  const html = await page.content();
  console.log('HTML ROOT:', html.substring(0, 1000));
  
  const rootHtml = await page.$eval('#root', el => el.innerHTML).catch(e => e.message);
  console.log('ROOT HTML:', rootHtml);

  await page.screenshot({path: 'screenshot.png'});
  await browser.close(); 
})();
