const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setContent('<div>Test PDF</div>');
  await page.pdf({
    path: 'test-output.pdf',
    format: 'A4',
    printBackground: true,
    displayHeaderFooter: true,
    margin: { top: '80px', bottom: '80px' },
    headerTemplate: '<div style="font-size:18px;text-align:center;">HEADER TEST</div>',
    footerTemplate: '<div style="font-size:12px;text-align:center;">Page <span class="pageNumber"></span> of <span class="totalPages"></span></div>',
  });
  await browser.close();
})();
