const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto('https://a1-satta.com/chart', { waitUntil: 'networkidle0' });
  
  const data = await page.evaluate(() => {
    const urls = Array.from(document.querySelectorAll('a'))
      .map(a => a.href)
      .filter(href => href.includes('/chart/'));
    return urls;
  });
  
  console.log(data);
  await browser.close();
})();
