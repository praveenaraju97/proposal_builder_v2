const express = require('express');
const cors = require('cors');
const fs = require('fs');
const puppeteer = require('puppeteer');
const bodyParser = require('body-parser');
const multer = require('multer');
const { PDFDocument } = require('pdf-lib');
// const pdfjsLib = require('pdfjs-dist/legacy/build/pdf.js');


const app = express();
const upload = multer();
app.use(cors({
    origin: ['http://127.0.0.1:8000', 'http://localhost:8000', 'null'], // Add allowed origins
}));
app.use(bodyParser.text({ limit: '10mb', type: 'text/html' }));


// const BASE64_LOGO = fs.readFileSync('./archcorp logo.png', { encoding: 'base64' }); // or paste base64 string



// Utility: Find which PDF page contains the marker text
async function findPageIndexByMarker(pdfBuffer, markerText) {
    const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs');
    const pdf = await pdfjsLib.getDocument({ data: pdfBuffer }).promise;
    for (let i = 0; i < pdf.numPages; i++) {
        const page = await pdf.getPage(i + 1);
        const content = await page.getTextContent();
        const text = content.items.map(item => item.str).join(' ');
        if (text.includes(markerText)) {
            return i; // 0-based index
        }
    }
    return -1;
}

app.post('/api/generate-pdf', async (req, res) => {
    console.log("Reached generate pdf")
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

// Use multer to parse multipart/form-data
// Endpoint expects: html (string), and 0+ files named 'projectBriefPdf', 'constituentPdf', etc.
app.post('/api/merge-pdf', upload.fields([
    { name: 'uploads[project-brief-section]', maxCount: 1 }
]), async (req, res) => {
    console.log('req.files:', req.files);
    try {
        // 1. Render mainHtml to PDF using Puppeteer
        const mainHtml = req.body.mainHtml;
        if (!mainHtml) {
            return res.status(400).send('Missing mainHtml');
        }
        // --- Ensure your buildProposalHtml() includes the marker ---
        // <div data-section="project-brief-section">___MARKER_project-brief-section___</div>

        const browser = await puppeteer.launch({ headless: "new" });
        const page = await browser.newPage();
        await page.setContent(mainHtml, { waitUntil: 'networkidle0' });
        const proposalBuffer = await page.pdf({ format: 'A4', printBackground: true });
        await browser.close();

        // 2. Get uploaded Project Brief PDF, if any
        const projectBriefFile = req.files && req.files['uploads[project-brief-section]']
            ? req.files['uploads[project-brief-section]'][0]
            : null;
        if (!projectBriefFile) {
            // No upload: just return rendered proposal PDF
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', 'attachment; filename="final-proposal.pdf"');
            return res.end(Buffer.from(proposalBuffer));
        }

        // 3. Find the marker page index in rendered PDF
        const markerText = '___MARKER_project-brief-section___';
        let pageIndex = await findPageIndexByMarker(proposalBuffer, markerText);
        if (pageIndex === -1) {
            // Marker not found: insert at the end
            const tempDoc = await PDFDocument.load(proposalBuffer);
            pageIndex = tempDoc.getPageCount() - 1;
        }


        console.log("First bytes (hex):", projectBriefFile.buffer.slice(0, 8).toString('hex'));
        console.log("First bytes (ascii):", projectBriefFile.buffer.slice(0, 8).toString('ascii'));
        console.log("Is Buffer:", Buffer.isBuffer(projectBriefFile.buffer));
        console.log("Buffer length:", projectBriefFile.buffer.length);

        // 4. Merge: Copy pages up to & including Project Brief, insert PDF, then rest
        const proposalDoc = await PDFDocument.load(proposalBuffer);
        const briefDoc = await PDFDocument.load(projectBriefFile.buffer);
        const mergedDoc = await PDFDocument.create();



        // Add proposal pages up to and including Project Brief
        for (let i = 0; i <= pageIndex; i++) {
            const [page] = await mergedDoc.copyPages(proposalDoc, [i]);
            mergedDoc.addPage(page);
        }

        // Insert all uploaded Project Brief pages
        const briefPages = await mergedDoc.copyPages(briefDoc, briefDoc.getPageIndices());
        for (const p of briefPages) mergedDoc.addPage(p);

        // Add remaining proposal pages
        for (let i = pageIndex + 1; i < proposalDoc.getPageCount(); i++) {
            const [page] = await mergedDoc.copyPages(proposalDoc, [i]);
            mergedDoc.addPage(page);
        }

        const mergedBuffer = await mergedDoc.save();

        // 5. Respond with the merged PDF
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename="final-proposal.pdf"');
        res.end(Buffer.from(mergedBuffer));

    } catch (err) {
        console.error('PDF merge error:', err);
        res.status(500).send('PDF merge error');
    }
});

app.listen(8000, () => {
    console.log('PDF server running on port 5000');
});
