const express = require('express');
const cors = require('cors');
const fs = require('fs');
const puppeteer = require('puppeteer');
const bodyParser = require('body-parser');

const app = express();
app.use(cors({
    origin: ['http://127.0.0.1:5000', 'http://localhost:5000']
}));
app.use(bodyParser.text({ limit: '10mb', type: 'text/html' }));


// const BASE64_LOGO = fs.readFileSync('./archcorp logo.png', { encoding: 'base64' }); // or paste base64 string

app.post('/api/generate-pdf', async (req, res) => {
    try {
        const htmlContent = req.body;

        // If your buildProposalHtml() only generates a <div> and not full HTML,
        // wrap it here!
        if (!htmlContent.includes('<html')) {
            htmlContent = `<!DOCTYPE html><html><head>
            <meta charset="utf-8">
            <title>Proposal</title>
            <style>body { font-family: Arial, sans-serif; }</style>
            </head><body>${htmlContent}</body></html>`;
        }

        const browser = await puppeteer.launch({
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        const page = await browser.newPage();
        await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

        const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true,
            displayHeaderFooter: true,
            margin: { top: '80px', bottom: '80px', left: '30px', right: '30px' },
            headerTemplate: `
              <div style="font-size:12px;text-align:center;color:#444;">
                <span>Archcorp Architectural Engineering</span>
              </div>
            `,
            footerTemplate: `
              <div style="font-size:12px;text-align:center;width:100%;color:#444;">
                Page <span class="pageNumber"></span> of <span class="totalPages"></span>
              </div>
            `
        });
        await browser.close();

        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': 'attachment; filename="proposal.pdf"',
        });
        res.send(pdfBuffer);
    } catch (error) {
        res.status(500).send('PDF generation failed: ' + error);
    }
});

app.listen(5000, () => {
    console.log('PDF server running on port 5000');
});
