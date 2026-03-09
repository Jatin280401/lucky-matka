const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  const cities = {
    'farukh-nagar': 'https://a1-satta.com/chart/farukh-nagar',
    'sultanpur': 'https://a1-satta.com/chart/sultanpur',
    'udyapur': 'https://a1-satta.com/chart/udyapur',
    'mirjapur': 'https://a1-satta.com/chart/mirzapur',
    'bhadurghad': 'https://a1-satta.com/chart/bhadurgarh',
    'dlf-city': 'https://a1-satta.com/chart/dlf-city'
  };

  const results = {};

  for (const [slug, url] of Object.entries(cities)) {
    try {
      await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
      console.log(`Scraping ${slug}...`);
      
      const chartData = await page.evaluate(() => {
        const rows = document.querySelectorAll('table tbody tr');
        if (!rows || rows.length === 0) return null;
        
        // Months are usually columns 2-13 (index 1 to 12)
        const months = ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"];
        const data = {};
        months.forEach(m => data[m] = []);
        
        rows.forEach(row => {
          const cells = Array.from(row.querySelectorAll('td'));
          if (cells.length > 1) {
            months.forEach((m, idx) => {
              // cell 0 is date, cell 1 is JAN, 2 is FEB, etc
              if (cells[idx + 1]) {
                const val = cells[idx + 1].innerText.trim();
                data[m].push(val);
              }
            });
          }
        });
        
        return data;
      });
      
      results[slug] = chartData;
    } catch (e) {
      console.error(`Failed to scrape ${slug}:`, e.message);
    }
  }

  const fs = require('fs');
  fs.writeFileSync('extracted_chart_data.json', JSON.stringify(results, null, 2));
  console.log('Saved to extracted_chart_data.json');
  
  await browser.close();
})();
