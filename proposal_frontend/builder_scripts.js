// builder_scripts.js

// Initialize editors and global variables
let editors = {};
let currentSection = null;

document.addEventListener('DOMContentLoaded', () => {
    // Initialize CKEditor for introduction section
    ClassicEditor.create(document.querySelector('#editor'))
        .then(editor => {
            editors['intro'] = editor;
        })
        .catch(error => {
            console.error('Error initializing intro editor:', error);
        });

    // Initialize section navigation
    initSectionNavigation();
    
    // Initialize dynamic form elements
    initDynamicForms();
    
    // Initialize file upload handlers
    initFileUploads();
    
    // Initialize preview/download handlers
    initPreviewHandlers();
});

function initSectionNavigation() {
    // Smooth scroll for sidebar links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            currentSection = document.querySelector(targetId);
            currentSection.scrollIntoView({ behavior: 'smooth' });
        });
    });

    // Live preview toggles
    document.querySelectorAll('.section-live-preview').forEach(toggle => {
        toggle.addEventListener('change', function() {
            const sectionId = this.closest('.proposal-section').id;
            const previewContent = generateSectionContent(sectionId);
            updateLivePreview(sectionId, previewContent, this.checked);
        });
    });
}

function initDynamicForms() {
    // Add/remove scope services
    document.querySelector('.add-scope-service').addEventListener('click', () => {
        const newRow = document.querySelector('.scope-service-entry').cloneNode(true);
        newRow.querySelectorAll('input').forEach(input => input.value = '');
        document.querySelector('.scope-services-entries').appendChild(newRow);
    });

    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('remove-scope-service')) {
            e.target.closest('tr').remove();
        }
    });

    // Add/remove man-month entries
    document.querySelector('.add-man-month').addEventListener('click', () => {
        const newRow = document.querySelector('.man-month-entry').cloneNode(true);
        newRow.querySelectorAll('textarea').forEach(t => t.value = '');
        document.querySelector('.man-month-entries').appendChild(newRow);
    });

    // Add/remove payment stages
    document.querySelector('.add-design-payment').addEventListener('click', () => {
        const newEntry = document.querySelector('.design-payment-entry').cloneNode(true);
        newEntry.querySelectorAll('input').forEach(input => input.value = '');
        document.querySelector('.design-payment-stages').appendChild(newEntry);
    });

    // Auto-expand textareas
    document.addEventListener('input', function(e) {
        if (e.target.classList.contains('auto-expand')) {
            e.target.style.height = 'auto';
            e.target.style.height = e.target.scrollHeight + 'px';
        }
    });
}

function initFileUploads() {
    // Cover image upload
    document.getElementById('coverImage').addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                document.getElementById('coverImagePreview').innerHTML = `
                    <img src="${e.target.result}" class="img-fluid" alt="Cover preview">
                `;
            };
            reader.readAsDataURL(file);
        }
    });

    // Document upload handlers
    document.querySelectorAll('input[type="file"]').forEach(input => {
        input.addEventListener('change', function(e) {
            const previewId = this.id + 'Preview';
            const previewContainer = document.getElementById(previewId);
            if (this.files[0]) {
                previewContainer.innerHTML = `
                    <div class="file-preview">
                        <i class="fas fa-file-pdf"></i>
                        ${this.files[0].name}
                    </div>
                `;
            }
        });
    });
}

function initPreviewHandlers() {
    // Preview button
    document.getElementById('previewBtn').addEventListener('click', () => {
        const content = generateFullPreview();
        const previewWindow = window.open('', '_blank');
        previewWindow.document.write(content);
    });

    // Download PDF button
    document.getElementById('downloadBtn').addEventListener('click', async () => {
        try {
            const content = generateFullPreview();
            
            // Send HTML to Python backend
            const response = await fetch('http://localhost:5001/generate-pdf', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ html: content })
            });
    
            // Handle PDF response
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'proposal.pdf';
            a.click();
            
        } catch (error) {
            console.error('PDF generation failed:', error);
            alert('PDF generation failed. Please check console.');
        }
    });
}

function generateFullPreview() {
    let content = `
        <!DOCTYPE html>
        <html>
        <head>
            <link rel="stylesheet" href="builder_styles.css">
            <style>
                ${generatePreviewStyles()}
            </style>
        </head>
        <body class="pdf-preview">
    `;

    // Generate each section's content
    document.querySelectorAll('.proposal-section').forEach(section => {
        const sectionId = section.id;
        const sectionContent = generateSectionContent(sectionId);
        content += `
            <div class="section-container">
                ${sectionContent}
                <div class="page-break"></div>
            </div>
        `;
    });

    content += `</body></html>`;
    return content;
}

function generateSectionContent(sectionId) {
    const section = document.getElementById(sectionId);
    const clone = section.cloneNode(true);
    
    // Remove form elements
    clone.querySelectorAll('input, textarea, select, button').forEach(element => {
        if (element.type !== 'hidden') {
            if (element.type === 'checkbox' || element.type === 'radio') {
                if (element.checked) {
                    element.parentNode.insertAdjacentText('beforeend', ' ✓');
                }
                element.remove();
            } else if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                const wrapper = document.createElement('div');
                wrapper.className = 'preview-field';
                wrapper.textContent = element.value || element.textContent;
                element.replaceWith(wrapper);
            } else {
                element.remove();
            }
        }
    });

    // Process tables
    clone.querySelectorAll('table').forEach(table => {
        table.classList.add('preview-table');
    });

    // Process images
    clone.querySelectorAll('.image-preview').forEach(preview => {
        const img = preview.querySelector('img');
        if (img) {
            preview.innerHTML = `<img src="${img.src}" class="img-fluid" style="max-width: 80%;">`;
        }
    });

    return clone.innerHTML;
}

function generatePreviewStyles() {
    return `
        body { font-family: 'Roboto', sans-serif; line-height: 1.6; }
        h1, h2, h3 { color: #2c3e50; border-bottom: 2px solid #3498db; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th { background: #3498db; color: white; padding: 10px; }
        td { padding: 8px; border: 1px solid #ddd; }
        .preview-table { margin: 20px 0; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
        .page-break { page-break-before: always; }
        .img-fluid { max-width: 100%; height: auto; }
        .file-preview { padding: 10px; background: #f8f9fa; border-radius: 4px; }
    `;
}

// Helper function for live preview updates
function updateLivePreview(sectionId, content, visible) {
    const previewWindow = document.querySelector('#previewContent');
    if (!previewWindow) return;

    const sectionPreview = previewWindow.querySelector(`#preview-${sectionId}`);
    if (visible) {
        if (!sectionPreview) {
            const div = document.createElement('div');
            div.id = `preview-${sectionId}`;
            div.innerHTML = content;
            previewWindow.appendChild(div);
        }
    } else {
        if (sectionPreview) sectionPreview.remove();
    }
}