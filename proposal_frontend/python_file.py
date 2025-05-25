import os
import pdfkit
from bs4 import BeautifulSoup

def generate_proposal_pdf(html_file, output_pdf):
    # Configure PDF options
    options = {
        'page-size': 'A4',
        'margin-top': '20mm',
        'margin-right': '15mm',
        'margin-bottom': '20mm',
        'margin-left': '15mm',
        'encoding': 'UTF-8',
        'header-right': '[title]',
        'footer-center': '[page]/[toPage]',
        'custom-header': [
            ('Accept-Encoding', 'gzip')
        ],
        'enable-local-file-access': None,
        'print-media-type': None,
        'user-style-sheet': 'pdf_styles.css'
    }

    # Process HTML content
    with open(html_file, 'r', encoding='utf-8') as f:
        soup = BeautifulSoup(f.read(), 'html.parser')

    # Add page breaks between sections
    sections = soup.select('.proposal-section')
    for section in sections:
        page_break = soup.new_tag('div', style='page-break-before: always;')
        section.insert_before(page_break)

    # Remove sidebar and unnecessary elements
    for elem in soup.select('.sidebar, .toolbar, .nav, .form-check, button'):
        elem.decompose()

    # Clean up form elements
    for input_elem in soup.select('input, textarea, select'):
        if input_elem.get('type') in ['checkbox', 'radio', 'file']:
            input_elem.decompose()
        else:
            # Preserve user inputs
            value = input_elem.get('value', '')
            input_elem.replace_with(value)

    # Save processed HTML
    temp_html = 'temp_processed.html'
    with open(temp_html, 'w', encoding='utf-8') as f:
        f.write(str(soup))

    # Generate PDF
    pdfkit.from_file(temp_html, output_pdf, options=options)
    
    # Clean up
    os.remove(temp_html)

from flask import Flask, request, send_file
from flask_cors import CORS
app = Flask(__name__)
# Enable CORS for all routes
CORS(app, resources={r"/*": {"origins": ["http://127.0.0.1:5000", "http://localhost:5000"]}})

@app.route('/generate-pdf', methods=['POST'])
def handle_pdf_generation():
    # Get HTML content from client
    html_content = request.json['html']
    
    # Save to temporary file
    with open('temp.html', 'w') as f:
        f.write(html_content)
    
    # Generate PDF
    output_pdf = 'proposal.pdf'
    generate_proposal_pdf('temp.html', output_pdf)
    
    # Return PDF
    return send_file(output_pdf, as_attachment=True)

if __name__ == '__main__':
    app.run(port=5001)