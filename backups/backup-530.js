// Global variables
let activeEditor = null;
let selectedSections = [];

const pdfOptions = {
    margin: [15, 15, 15, 15], // T/R/B/L
    filename: 'professional_proposal.pdf',
    image: { type: 'jpeg', quality: 0.95 },
    html2canvas: { 
        scale: 2,
        logging: true,
        useCORS: true,
        letterRendering: true,
        scrollY: 0,
        scrollX: 0,
        windowWidth: 794 // A4 width in pixels at 96 DPI
    },
    jsPDF: { 
        unit: 'mm', 
        format: 'a4', 
        orientation: 'portrait',
        compress: true
    },
    pagebreak: { 
        mode: ['css', 'legacy'],
        before: '.page-break',
        avoid: ['tr', 'td', 'th', '.prevent-break']
    }
};

// Document ready function
$(document).ready(function() {
    initializeProposalBuilder();
    setupEventListeners();
    setupModalAccessibility();
});

function initializeProposalBuilder() {
    // Set default date to today
    $('#proposalDate').val(new Date().toISOString().substr(0, 10));
    
    // Initialize section selector form
    $('#sectionSelectForm').on('submit', function(e) {
        e.preventDefault();
        startProposalBuilder();
    });
}

function setupEventListeners() {
    // Preview button
    $('#previewBtn').click(generateProposalPreview);
    
    // Download button
    $('#downloadBtn').click(function() {
        generateProfessionalPDF(false);
    });
    
    // Download from preview modal
    $('#downloadFromPreview').click(function() {
        generateProfessionalPDF(false);
        $('#previewModal').modal('hide');
    });
    
    // Section live preview toggles
    $(document).on('change', '.section-live-preview', function() {
        const sectionId = $(this).closest('.proposal-section').attr('id');
        if ($(this).is(':checked')) {
            $(`#${sectionId}`).addClass('live-preview-active');
        } else {
            $(`#${sectionId}`).removeClass('live-preview-active');
        }
    });
    
    // Add table button
    $('#addTableBtn').click(function() {
        $('#tableModal').modal('show');
    });
    
    // Insert table button
    $('#insertTable').click(function() {
        insertTable();
    });
    
    // Add image button
    $('#addImageBtn').click(function() {
        $('#imageUpload').click();
    });
    
    // Cover image upload
    $('#coverImage').change(function(e) {
        handleImageUpload(e, '#coverImagePreview');
    });
    
    // Project brief file upload
    $('#projectBriefFile').change(function(e) {
        handleFileUpload(e, '#projectBriefFilePreview');
    });
    
    // Document upload handlers
    $('input[type="file"]').not('#coverImage, #projectBriefFile').change(function(e) {
        const previewId = `${$(this).attr('id')}Preview`;
        handleFileUpload(e, `#${previewId}`);
    });
    
    // Document type radio buttons
    $('.doc-option').change(function() {
        const uploadDivId = `${$(this).attr('name').replace('Type', 'Upload')}`;
        if ($(this).val() === 'custom') {
            $(`#${uploadDivId}`).show();
        } else {
            $(`#${uploadDivId}`).hide();
        }
    });
    
    // Add dynamic content buttons
    $('.add-scope-service').click(addScopeServiceEntry);
    $('.add-stage-deliverable').click(addStageDeliverableEntry);
    $('.add-man-month').click(addManMonthEntry);
    $('.add-design-payment').click(addDesignPaymentEntry);
    $('.add-design-rate').click(addDesignRateEntry);
    $('.add-construction-rate').click(addConstructionRateEntry);
    
    // Remove dynamic content buttons
    $(document).on('click', '.remove-scope-service', removeScopeServiceEntry);
    $(document).on('click', '.remove-stage-deliverable', removeStageDeliverableEntry);
    $(document).on('click', '.remove-man-month', removeManMonthEntry);
    $(document).on('click', '.remove-design-payment', removeDesignPaymentEntry);
    $(document).on('click', '.remove-additional-rate', removeAdditionalRateEntry);
}

function setupModalAccessibility() {
    // Handle modal show event
    $('#previewModal').on('shown.bs.modal', function() {
        // Remove aria-hidden when modal is visible
        $(this).removeAttr('aria-hidden');
        
        // Focus the first focusable element (close button)
        $(this).find('.btn-close').focus();
        
        // Trap focus within modal
        trapFocus($(this));
    });

    // Handle modal hide event
    $('#previewModal').on('hidden.bs.modal', function() {
        // Restore aria-hidden when modal is hidden
        $(this).attr('aria-hidden', 'true');
        
        // Return focus to the preview button
        $('#previewBtn').focus();
    });

    // Prevent focus on downloadFromPreview before modal is shown
    $('#downloadFromPreview').on('focus', function() {
        if (!$('#previewModal').hasClass('show')) {
            $(this).blur(); // Remove focus if modal is not fully shown
        }
    });
}

// Focus trapping function
function trapFocus($modal) {
    const focusableElements = $modal.find('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    const firstFocusable = focusableElements.first();
    const lastFocusable = focusableElements.last();

    $modal.on('keydown.trapFocus', function(e) {
        if (e.key === 'Tab') {
            if (e.shiftKey) { // Shift + Tab
                if (document.activeElement === firstFocusable[0]) {
                    e.preventDefault();
                    lastFocusable.focus();
                }
            } else { // Tab
                if (document.activeElement === lastFocusable[0]) {
                    e.preventDefault();
                    firstFocusable.focus();
                }
            }
        }
    });

    // Clean up trapFocus event when modal is hidden
    $('#previewModal').on('hidden.bs.modal', function() {
        $modal.off('keydown.trapFocus');
    });
}

function startProposalBuilder() {
    // Get selected sections
    selectedSections = $('.section-option:checked').map(function() {
        return $(this).val();
    }).get();
    
    // Validate selected sections
    if (selectedSections.length === 0) {
        alert('Please select at least one section to include in the proposal.');
        return;
    }
    
    // Hide all sections first
    $('.proposal-section').hide();
    
    // Show selected sections
    selectedSections.forEach(sectionId => {
        $(`#${sectionId}`).show();
    });
    
    // Populate sidebar navigation
    populateSidebarNavigation();
    
    // Scroll to top
    $('html, body').animate({ scrollTop: 0 }, 'slow');
}

function populateSidebarNavigation() {
    const $sidebar = $('#proposalSections');
    $sidebar.empty();
    
    selectedSections.forEach(sectionId => {
        const sectionTitle = $(`#${sectionId} h2`).text();
        $sidebar.append(`
            <li class="nav-item">
                <a class="nav-link" href="#${sectionId}">${sectionTitle}</a>
            </li>
        `);
    });
    
    // Initialize scrollspy
    $('body').scrollspy({ target: '#proposalSections' });
}

function generateProposalPreview() {
    generatePreviewContentWithAssets().then(previewContent => {
        $('#previewContent').html(previewContent);
        $('#previewModal').modal('show');
    }).catch(error => {
        console.error('Error generating preview:', error);
        alert('An error occurred while generating the preview. Please try again.');
    });
}

async function generatePreviewContentWithAssets() {
    let previewHTML = '<div class="preview-container pdf-export">';
    let previewSectionIds = $('.proposal-section.live-preview-active').map(function() {
        return $(this).attr('id');
    }).get();
    // Handle cover section images first
    if (previewSectionIds.includes('cover-section')) {
        previewHTML += await generateCoverSectionContent();
    }
    
    // Handle other sections
    let sectionCounter = 1;
    for (const sectionId of previewSectionIds) {
        if (sectionId !== 'cover-section') {
            const sectionContent = await generateSectionContent(sectionId, sectionCounter);
            previewHTML += sectionContent;
            sectionCounter++;
        }
    }
    
    previewHTML += '</div>';
    return previewHTML;
}

async function generateCoverSectionContent() {
    const title = $('#proposalTitle').val() || 'Architecture Proposal';
    const client = $('#clientName').val() || 'Client Name';
    const address = $('#projectAddress').val() || 'Project Address';
    const date = $('#proposalDate').val() ? new Date($('#proposalDate').val()).toLocaleDateString() : new Date().toLocaleDateString();
    
    let coverImage = '';
    const coverImageFile = $('#coverImage')[0].files[0];
    if (coverImageFile) {
        coverImage = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(`<img src="${e.target.result}" class="img-fluid cover-image-preview" alt="Cover Image" style="max-width: 100%; max-height: 300px;">`);
            reader.onerror = reject;
            reader.readAsDataURL(coverImageFile);
        });
    }
    
    return `
        <div class="preview-section cover-section">
            <div class="cover-page">
                <div class="page-header">
                    <span>Proposal ${generateProposalNumber()}</span>
                </div>
                ${coverImage}
                <h1 class="proposal-title">${title}</h1>
                <div class="client-info">
                    <h3>Prepared for:</h3>
                    <p>${client}</p>
                    <p>${address}</p>
                </div>
                <div class="date-info">
                    <p>Date: ${date}</p>
                </div>
                <div class="page-footer">
                    <span>Generated by Archcorp Proposal Builder</span>
                </div>
            </div>
        </div>
    `;
}

async function generateSectionContent(sectionId, sectionNumber) {
    const $section = $(`#${sectionId}`);
    const sectionTitle = $section.find('h2').text();
    let sectionContent = '';
    
    switch(sectionId) {
        case 'intro-section':
            sectionContent = introEditor ? introEditor.getData() : '<p>Introduction content will appear here.</p>';
            break;
            
        case 'project-brief-section':
            const briefText = projectBriefEditor ? projectBriefEditor.getData() : '';
            const briefFile = $('#projectBriefFile')[0].files[0];
            let briefFileContent = '';
            
            if (briefFile) {
                if (briefFile.type.startsWith('image/')) {
                    briefFileContent = await new Promise((resolve, reject) => {
                        const reader = new FileReader();
                        reader.onload = (e) => resolve(`<img src="${e.target.result}" class="img-fluid brief-image" alt="Project Brief Image" style="max-width: 100%; max-height: 300px;">`);
                        reader.onerror = reject;
                        reader.readAsDataURL(briefFile);
                    });
                } else if (briefFile.type === 'application/pdf') {
                    briefFileContent = `<p>PDF Attachment: ${briefFile.name} (Note: PDF content will be appended separately)</p>`;
                } else {
                    briefFileContent = `<p>File: ${briefFile.name}</p>`;
                }
            }
            
            sectionContent = briefText + briefFileContent;
            break;
            
        case 'agreement-section':
            sectionContent = `
                <div class="row">
                    <div class="col-md-6">
                        <h4>Client Information</h4>
                        <p><strong>Name:</strong> ${$('#clientNameFull').val() || 'Not provided'}</p>
                        <p><strong>Representative:</strong> ${$('#clientRep').val() || 'Not provided'}</p>
                        <p><strong>Email:</strong> ${$('#clientEmail').val() || 'Not provided'}</p>
                    </div>
                    <div class="col-md-6">
                        <h4>Consultant Information</h4>
                        <p><strong>Name:</strong> ${$('#consultantName').val() || 'Not provided'}</p>
                        <p><strong>Representative:</strong> ${$('#consultantRep').val() || 'Not provided'}</p>
                        <p><strong>Telephone:</strong> ${$('#consultantPhone').val() || 'Not provided'}</p>
                    </div>
                </div>
                <div class="row mt-3">
                    <div class="col-md-4">
                        <p><strong>Date of Agreement:</strong> ${$('#agreementDate').val() || 'Not provided'}</p>
                    </div>
                    <div class="col-md-4">
                        <p><strong>Project:</strong> ${$('#projectName').val() || 'Not provided'}</p>
                    </div>
                    <div class="col-md-4">
                        <p><strong>Plot No:</strong> ${$('#plotNumber').val() || 'Not provided'}</p>
                    </div>
                </div>
            `;
            break;
            
        case 'documents-section':
            sectionContent = '<h4>Constituent Documents</h4><ul>';
            
            if ($('#letterOffer').is(':checked')) {
                if ($('#letterOfferDefault').is(':checked')) {
                    sectionContent += '<li>Letter of Offer & Acceptance (Default Document)</li>';
                } else {
                    const file = $('#letterOfferFile')[0].files[0];
                    if (file) {
                        sectionContent += `<li>Letter of Offer & Acceptance: ${file.name}</li>`;
                    }
                }
            }
            
            if ($('#mainAgreement').is(':checked')) {
                if ($('#mainAgreementDefault').is(':checked')) {
                    sectionContent += '<li>Main Agreement Body (Default Document)</li>';
                } else {
                    const file = $('#mainAgreementFile')[0].files[0];
                    if (file) {
                        sectionContent += `<li>Main Agreement Body: ${file.name}</li>`;
                    }
                }
            }
            
            sectionContent += '</ul>';
            break;
            
        case 'general-scope-section':
            sectionContent = '<table class="table table-bordered scope-services-table"><thead><tr><th>Service</th><th>Mandatory</th><th>Optional</th><th>In-House</th><th>External</th><th>Appointed By Archcorp</th><th>Appointed By Client</th></tr></thead><tbody>';
            
            $('.scope-service-entry').each(function() {
                const service = $(this).find('.scope-service').val() || 'Not specified';
                const mandatory = $(this).find('.scope-mandatory').is(':checked') ? '✓' : '';
                const optional = $(this).find('.scope-optional').is(':checked') ? '✓' : '';
                const inhouse = $(this).find('.scope-inhouse').is(':checked') ? '✓' : '';
                const external = $(this).find('.scope-external').is(':checked') ? '✓' : '';
                const appointedArchcorp = $(this).find('.scope-appointed-achcorp').val() || 'No';
                const appointedClient = $(this).find('.scope-appointed-client').val() || 'No';
                
                sectionContent += `
                    <tr>
                        <td>${service}</td>
                        <td class="text-center">${mandatory}</td>
                        <td class="text-center">${optional}</td>
                        <td class="text-center">${inhouse}</td>
                        <td class="text-center">${external}</td>
                        <td>${appointedArchcorp}</td>
                        <td>${appointedClient}</td>
                    </tr>
                `;
            });
            
            sectionContent += '</tbody></table>';
            break;
            
        case 'stages-deliverables-section':
            sectionContent = window.deliverablesEditor ? window.deliverablesEditor.getData() : '<p>Stages and deliverables content will appear here.</p>';
            break;
            
        case 'man-month-section':
            sectionContent = '<table class="table table-bordered man-month-table"><thead><tr><th>Position/Location</th><th>Role</th><th>Man Month Rate</th><th>Allocation</th><th>Monthly Fee</th><th>Remarks</th></tr></thead><tbody>';
            
            $('.man-month-entry').each(function() {
                const position = $(this).find('.mm-position').val() || 'Not specified';
                const role = $(this).find('.mm-role').val() || 'Not specified';
                const rate = $(this).find('.mm-rate').val() || 'Not specified';
                const allocation = $(this).find('.mm-allocation').val() || 'Not specified';
                const fee = $(this).find('.mm-fee').val() || 'Not specified';
                const remarks = $(this).find('.mm-remarks').val() || 'Not specified';
                
                sectionContent += `
                    <tr>
                        <td>${position}</td>
                        <td>${role}</td>
                        <td>${rate}</td>
                        <td>${allocation}</td>
                        <td>${fee}</td>
                        <td>${remarks}</td>
                    </tr>
                `;
            });
            
            sectionContent += '</tbody></table>';
            break;
            
        case 'editable-design-payment-section':
            sectionContent = '<table class="table table-bordered design-payment-table"><thead><tr><th>Stage</th><th>%age to be Paid</th><th>On Submission</th><th>On Approval</th></tr></thead><tbody>';
            
            $('.design-payment-entry').each(function() {
                const stage = $(this).find('.design-stage').val() || 'Not specified';
                const percentage = $(this).find('.design-percentage').val() || 'Not specified';
                const submission = $(this).find('.design-submission').val() || 'Not specified';
                const approval = $(this).find('.design-approval').val() || 'Not specified';
                
                sectionContent += `
                    <tr>
                        <td>${stage}</td>
                        <td>${percentage}</td>
                        <td>${submission}</td>
                        <td>${approval}</td>
                    </tr>
                `;
            });
            
            sectionContent += '</tbody></table>';
            break;
            
        case 'editable-additional-rates-section':
            sectionContent = '<h4>Design Stage Rates</h4><table class="table table-bordered additional-rates-table"><thead><tr><th>Position</th><th>AED/Hour</th></tr></thead><tbody>';
            
            $('.design-service-rates .additional-rate-entry').each(function() {
                const position = $(this).find('.rate-position').val() || 'Not specified';
                const hourly = $(this).find('.rate-hourly').val() || 'Not specified';
                
                sectionContent += `
                    <tr>
                        <td>${position}</td>
                        <td>${hourly}</td>
                    </tr>
                `;
            });
            
            sectionContent += '</tbody></table><h4>Construction Stage Rates</h4><table class="table table-bordered additional-rates-table"><thead><tr><th>Position</th><th>AED/Hour</th></tr></thead><tbody>';
            
            $('.construction-service-rates .additional-rate-entry').each(function() {
                const position = $(this).find('.rate-position').val() || 'Not specified';
                const hourly = $(this).find('.rate-hourly').val() || 'Not specified';
                
                sectionContent += `
                    <tr>
                        <td>${position}</td>
                        <td>${hourly}</td>
                    </tr>
                `;
            });
            
            sectionContent += '</tbody></table>';
            break;
            
        case 'terms-section':
            sectionContent = $('#standardTerms').val() || '<p>Standard terms and conditions will appear here.</p>';
            
            const signatureFile = $('#signatureImage')[0].files[0];
            if (signatureFile) {
                const signatureImage = await new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = (e) => resolve(`<img src="${e.target.result}" class="signature-image" alt="Signature">`);
                    reader.onerror = reject;
                    reader.readAsDataURL(signatureFile);
                });
                sectionContent += `<div class="signature-section mt-4"><h4>Signature</h4>${signatureImage}</div>`;
            }
            break;
            
        default:
            sectionContent = $section.find('.form-control, .wysiwyg').map(function() {
                return $(this).val() || $(this).text();
            }).get().join('<br>') || '<p>Content not available.</p>';
    }
    
    return `
        <div class="preview-section" id="preview-${sectionId}">
            <div class="page-header">
                <span>Proposal ${generateProposalNumber()}</span>
            </div>
            <h2><span class="section-number">${sectionNumber}.</span> ${sectionTitle}</h2>
            <div class="section-content">
                ${sectionContent}
            </div>
            <div class="page-footer">
                <span>Generated by Archcorp Proposal Builder</span>
            </div>
        </div>
    `;
}

function waitForImages(element) {
    return new Promise((resolve) => {
        const images = element.getElementsByTagName('img');
        let loaded = 0;
        
        if (images.length === 0) {
            resolve();
            return;
        }

        for (const img of images) {
            if (img.complete) {
                loaded++;
            } else {
                img.onload = () => {
                    loaded++;
                    if (loaded === images.length) resolve();
                };
                img.onerror = () => {
                    loaded++;
                    if (loaded === images.length) resolve();
                };
            }
        }
        
        if (loaded === images.length) resolve();
    });
}

function waitForContentRendering(element) {
    return new Promise((resolve) => {
        element.offsetHeight; // Force reflow
        setTimeout(resolve, 100); // Allow rendering
    });
}

async function generateProfessionalPDF(isPreview = true) {
    try {
        // Ensure fonts are loaded
        await document.fonts.ready;

        // Generate content with assets
        const content = await generatePreviewContentWithAssets();
        
        if (!content || content === '<div class="preview-container pdf-export"></div>') {
            alert('No content available to generate PDF. Please ensure sections are selected and filled.');
            return;
        }

        // Create temporary container
        let tempDiv = document.createElement('div');
        tempDiv.className = 'pdf-temporary-container';
        //tempDiv.style.width = '794px'; // A4 width in pixels at 96 DPI

        // Inject styles into temporary container
        const styleElement = document.createElement('style');
        styleElement.textContent = document.querySelector('style').textContent;
        tempDiv.appendChild(styleElement);

        // Set content
        tempDiv.innerHTML += content;
        document.body.appendChild(tempDiv);

        // Wait for images and content rendering
        await waitForImages(tempDiv);
        await waitForContentRendering(tempDiv);

        if (isPreview) {
            $('#previewContent').html(tempDiv.innerHTML);
            $('#previewModal').modal('show');
            document.body.removeChild(tempDiv);
            return;
        }

        // Generate PDF
        html2pdf()
            .set(pdfOptions)
            .from(tempDiv)
            .toContainer()
            .toCanvas()
            .toPdf()
            .get('pdf')
            .then(pdf => {
                const totalPages = pdf.internal.getNumberOfPages();
                for (let i = 1; i <= totalPages; i++) {
                    pdf.setPage(i);
                    try {
                        pdf.setFont('Helvetica', 'normal'); // Use built-in font
                        pdf.setFontSize(9);
                        pdf.setTextColor(100);
                        pdf.text(
                            `Page ${i} of ${totalPages}`,
                            pdf.internal.pageSize.width - 30,
                            pdf.internal.pageSize.height - 10
                        );
                        pdf.setLineWidth(0.5);
                        pdf.setDrawColor(44, 62, 80);
                        pdf.line(15, 15, 195, 15);
                        pdf.setFontSize(10);
                        pdf.text(`Proposal ${generateProposalNumber()}`, 15, 12);
                    } catch (fontError) {
                        console.error('Font error:', fontError);
                        pdf.setFont('times', 'normal');
                        pdf.setFontSize(9);
                        pdf.setTextColor(100);
                        pdf.text(
                            `Page ${i} of ${totalPages}`,
                            pdf.internal.pageSize.width - 30,
                            pdf.internal.pageSize.height - 10
                        );
                        pdf.setLineWidth(0.5);
                        pdf.setDrawColor(44, 62, 80);
                        pdf.line(15, 15, 195, 15);
                        pdf.setFontSize(10);
                        pdf.text(`Proposal ${generateProposalNumber()}`, 15, 12);
                    }
                }
            })
            .save()
            .finally(() => {
                document.body.removeChild(tempDiv);
            });
    } catch (error) {
        console.error('PDF generation error:', error);
        alert('An error occurred while generating the PDF. Please try again.');
    }
}

// Dynamic content management functions
function addScopeServiceEntry() {
    const newEntry = `
        <tr class="scope-service-entry">
            <td>
                <input type="text" class="form-control scope-service" placeholder="e.g., Architectural Design">
            </td>
            <td class="text-center">
                <input type="checkbox" class="scope-mandatory">
            </td>
            <td class="text-center">
                <input type="checkbox" class="scope-optional">
            </td>
            <td class="text-center">
                <input type="checkbox" class="scope-inhouse">
            </td>
            <td class="text-center">
                <input type="checkbox" class="scope-external">
            </td>
            <td>
                <select class="form-control scope-appointed-achcorp">
                    <option value="Yes">Yes</option>
                    <option value="No" selected>No</option>
                </select>
            </td>
            <td>
                <select class="form-control scope-appointed-client">
                    <option value="Yes">Yes</option>
                    <option value="No" selected>No</option>
                </select>
            </td>
            <td class="text-center align-middle">
                <button class="btn btn-sm btn-danger remove-scope-service">Remove</button>
            </td>
        </tr>
    `;
    $('.scope-services-entries').append(newEntry);
}

function removeScopeServiceEntry() {
    $(this).closest('.scope-service-entry').remove();
}

function addStageDeliverableEntry() {
    const newEntry = `
        <tr class="stage-deliverable-entry">
            <td class="editable-cell">Stage name</td>
            <td class="editable-cell">Tasks & activities</td>
            <td class="editable-cell">Deliverables</td>
            <td class="editable-cell">Format</td>
            <td class="editable-cell">Timeline</td>
        </tr>
    `;
    $('.stages-deliverables-entries').append(newEntry);
}

function removeStageDeliverableEntry() {
    $(this).closest('.stage-deliverable-entry').remove();
}

function addManMonthEntry() {
    const newEntry = `
        <tr class="man-month-entry">
            <td><textarea class="form-control auto-expand mm-position" placeholder="Position/Location" rows="1"></textarea></td>
            <td><textarea class="form-control auto-expand mm-role" placeholder="Role description" rows="1"></textarea></td>
            <td><textarea class="form-control auto-expand mm-rate" placeholder="Rate" rows="1"></textarea></td>
            <td><textarea class="form-control auto-expand mm-allocation" placeholder="Allocation %" rows="1"></textarea></td>
            <td><textarea class="form-control auto-expand mm-fee" placeholder="Monthly fee" rows="1"></textarea></td>
            <td><textarea class="form-control auto-expand mm-remarks" placeholder="Remarks" rows="1"></textarea></td>
            <td class="text-center align-middle">
                <button class="btn btn-sm btn-danger remove-man-month">Remove</button>
            </td>
        </tr>
    `;
    $('.man-month-entries').append(newEntry);
}

function removeManMonthEntry() {
    $(this).closest('.man-month-entry').remove();
}

function addDesignPaymentEntry() {
    const newEntry = `
        <div class="design-payment-entry row mb-3">
            <div class="col-md-3">
                <input type="text" class="form-control design-stage" placeholder="e.g., Concept Design">
            </div>
            <div class="col-md-2">
                <input type="text" class="form-control design-percentage" placeholder="e.g., 10%">
            </div>
            <div class="col-md-3">
                <input type="text" class="form-control design-submission" placeholder="e.g., 100%">
            </div>
            <div class="col-md-3">
                <input type="text" class="form-control design-approval" placeholder="e.g., 0%">
            </div>
            <div class="col-md-1 d-flex align-items-end">
                <button class="btn btn-sm btn-danger remove-design-payment">Remove</button>
            </div>
        </div>
    `;
    $('.design-payment-stages').append(newEntry);
}

function removeDesignPaymentEntry() {
    $(this).closest('.design-payment-entry').remove();
}

function addDesignRateEntry() {
    const newEntry = `
        <div class="additional-rate-entry row mb-3">
            <div class="col-md-5">
                <input type="text" class="form-control rate-position" placeholder="e.g., Architect">
            </div>
            <div class="col-md-4">
                <input type="number" class="form-control rate-hourly" placeholder="e.g., 300">
            </div>
            <div class="col-md-2 d-flex align-items-end">
                <button class="btn btn-sm btn-danger remove-additional-rate">Remove</button>
            </div>
        </div>
    `;
    $('.design-service-rates').append(newEntry);
}

function addConstructionRateEntry() {
    const newEntry = `
        <div class="additional-rate-entry row mb-3">
            <div class="col-md-5">
                <input type="text" class="form-control rate-position" placeholder="e.g., Site Engineer">
            </div>
            <div class="col-md-4">
                <input type="number" class="form-control rate-hourly" placeholder="e.g., 350">
            </div>
            <div class="col-md-2 d-flex align-items-end">
                <button class="btn btn-sm btn-danger remove-additional-rate">Remove</button>
            </div>
        </div>
    `;
    $('.construction-service-rates').append(newEntry);
}

function removeAdditionalRateEntry() {
    $(this).closest('.additional-rate-entry').remove();
}

function handleImageUpload(event, previewSelector) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        $(previewSelector).html(`<img src="${e.target.result}" class="img-fluid" style="max-height: 200px;">`);
    };
    reader.onerror = function() {
        alert('Error loading image. Please try another file.');
    };
    reader.readAsDataURL(file);
}

function handleFileUpload(event, previewSelector) {
    const file = event.target.files[0];
    if (!file) return;

    if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = function(e) {
            $(previewSelector).html(`<img src="${e.target.result}" class="img-fluid" style="max-height: 200px;">`);
        };
        reader.onerror = function() {
            alert('Error loading image. Please try another file.');
        };
        reader.readAsDataURL(file);
    } else if (file.type === 'application/pdf') {
        $(previewSelector).html(`
            <div class="file-preview">
                <i class="fas fa-file-pdf fa-3x text-danger"></i>
                <p>${file.name}</p>
            </div>
        `);
    } else {
        $(previewSelector).html(`
            <div class="file-preview">
                <i class="fas fa-file-alt fa-3x text-primary"></i>
                <p>${file.name}</p>
            </div>
        `);
    }
}

function insertTable() {
    const rows = parseInt($('#tableRows').val());
    const cols = parseInt($('#tableCols').val());
    const caption = $('#tableCaption').val();
    
    if (rows < 1 || cols < 1) {
        alert('Please enter valid row and column numbers');
        return;
    }
    
    let tableHtml = '<table class="table table-bordered preview-table">';
    
    if (caption) {
        tableHtml += `<caption>${caption}</caption>`;
    }
    
    tableHtml += '<thead><tr>';
    for (let i = 0; i < cols; i++) {
        tableHtml += '<th>Header</th>';
    }
    tableHtml += '</tr></thead><tbody>';
    
    for (let i = 0; i < rows; i++) {
        tableHtml += '<tr>';
        for (let j = 0; j < cols; j++) {
            tableHtml += '<td>Content</td>';
        }
        tableHtml += '</tr>';
    }
    
    tableHtml += '</tbody></table>';
    
    if (activeEditor) {
        activeEditor.model.change(writer => {
            const viewFragment = activeEditor.data.processor.toView(tableHtml);
            const modelFragment = activeEditor.data.toModel(viewFragment);
            activeEditor.model.insertContent(modelFragment);
        });
    } else {
        $('.proposal-section.live-preview-active').find('.form-control:last').after(tableHtml);
    }
    
    $('#tableModal').modal('hide');
}

function generateProposalNumber() {
    const date = new Date();
    return `ARC-${date.getFullYear()}${(date.getMonth()+1).toString().padStart(2,'0')}-${Math.floor(1000 + Math.random() * 9000)}`;
}