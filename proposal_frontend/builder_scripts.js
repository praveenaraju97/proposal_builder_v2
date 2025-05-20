
const API_BASE_URL = 'http://localhost:5000/api';
// Function to collect PDFs to merge
async function collectPDFs() {
    const pdfs = [];
    
    // Check Letter of Offer
    if ($('#letterOffer').is(':checked')) {
        if ($('#letterOfferDefault').is(':checked')) {
            const defaultPdfPath = 'assets/pdf/letterOffer_default.pdf';
            const pdfBytes = await fetchPDF(defaultPdfPath);
            pdfs.push(pdfBytes);
        } else if ($('#letterOfferCustom').is(':checked')) {
            const fileInput = document.getElementById('letterOfferFile');
            if (fileInput.files[0]) {
                const pdfBytes = await readFileAsArrayBuffer(fileInput.files[0]);
                pdfs.push(pdfBytes);
            }
        }
    }
    
    // Check Main Agreement
    if ($('#mainAgreement').is(':checked')) {
        if ($('#mainAgreementDefault').is(':checked')) {
            const defaultPdfPath = 'assets/pdf/mainAgreement_default.pdf';
            const pdfBytes = await fetchPDF(defaultPdfPath);
            pdfs.push(pdfBytes);
        } else if ($('#mainAgreementCustom').is(':checked')) {
            const fileInput = document.getElementById('mainAgreementFile');
            if (fileInput.files[0]) {
                const pdfBytes = await readFileAsArrayBuffer(fileInput.files[0]);
                pdfs.push(pdfBytes);
            }
        }
    }
    
    return pdfs;
}

async function fetchPDF(url) {
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    return arrayBuffer;
}

function readFileAsArrayBuffer(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsArrayBuffer(file);
    });
}

function downloadPDF(bytes, filename) {
    const blob = new Blob([bytes], { type: 'application/pdf' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
}

function showPDFPreview(fileInput, previewContainer) {
    const file = fileInput[0].files[0];
    if (!file) return;

    filePreviews[fileInput.attr('id')] = {
        name: file.name,
        type: file.type,
        size: file.size
    };

    const reader = new FileReader();
    reader.onload = function(e) {
        // Show PDF preview using object tag
        previewContainer.html(`
            <object data="${e.target.result}" type="application/pdf" width="100%" height="300px">
                <p>PDF preview not available. <a href="${e.target.result}">Download file instead</a></p>
            </object>
            <div class="file-info mt-2">
                <p class="file-name"><strong>${file.name}</strong></p>
                <p class="file-size">${formatFileSize(file.size)}</p>
            </div>
        `);
        previewContainer.show();
    };
    reader.readAsDataURL(file);
}

// Updated generatePreview()
function generatePreview(livePreviewOnly = false) {
    let previewHtml = '';
    let pageNumber = 1;

    const sectionsToShow = livePreviewOnly ? 
        $('.proposal-section.active') : 
        $('.proposal-section:visible');

    // Always add cover page first
    if (!livePreviewOnly || $('#cover-section').hasClass('active')) {
        previewHtml += `
            <div class="pdf-page" data-sec="cover-section">
                <div class="section-content text-center">
                    <img src="./assets/pdf/archcorp logo.png" alt="Company Logo" class="preview-logo mb-4">
                    <h1 class="mb-4">${$('#proposalTitle').val() || 'Proposal'}</h1>
                    <p class="mb-3">Prepared for: ${$('#clientName').val() || 'Client Name'}</p>
                    <p class="mb-3">Project Address: ${$('#projectAddress').val() || 'Not specified'}</p>
                    <p>Date: ${$('#proposalDate').val() || new Date().toLocaleDateString()}</p>
                </div>
               
            </div>
        `;
    }

    // Generate content for each visible section
    sectionsToShow.each(function() {
        const sectionId = $(this).attr('id');
        if (sectionId !== 'cover-section') {
            previewHtml += `
                <div class="pdf-page" data-sec="${sectionId}">
                    <div class="section-header">
                        <h2>${$(this).find('h2').first().text()}</h2>
                    </div>
                    <div class="section-content">
                        ${generateSectionContent($(this))}
                    </div>
                    
                </div>
            `;
        }
    });

    $('#previewContent').html(previewHtml);
}

function generateSectionPreview($section, liveOnly) {
  let html = '';
  let pageNum = 1;
  const id = $section.attr('id');

  // if it's the cover-section or liveOnly === false, include cover page first
  if (id === 'cover-section' || !liveOnly) {
    html += `
      <div class="pdf-page">
        <div class="section-content text-center">
          <img src="./assets/pdf/archcorp logo.png" class="preview-logo mb-4">
          <h1>${$('#proposalTitle').val() || 'Proposal'}</h1>
          <p>Prepared for: ${$('#clientName').val() || ''}</p>
          <p>Project Address: ${$('#projectAddress').val() || ''}</p>
          <p>Date: ${$('#proposalDate').val() || new Date().toLocaleDateString()}</p>
        </div>
      
      </div>
    `;
  }

  // now the actual section
  if (id !== 'cover-section') {
    html += `
      <div class="pdf-page">
        <div class="section-header">
          <h2>${$section.find('h2').text()}</h2>
        </div>
        <div class="section-content">
          ${generateSectionContent($section)}
        </div>
       
      </div>
    `;
  }

  $('#previewContent').html(html);
}


// Helper function to generate section content
function generateSectionContent(section) {
    const sectionId = section.attr('id');
    let content = '';

    switch(sectionId) {
        case 'man-month-section':
            content = `
                <table class="preview-table">
                    <thead>
                        <tr>
                            <th>Position / Location</th>
                            <th>Role</th>
                            <th>Man Month Rate</th>
                            <th>Allocation</th>
                            <th>Monthly Fee</th>
                            <th>Remarks</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${$('.man-month-entry').map(function() {
                            return `<tr>
                                <td>${$(this).find('.mm-position').val() || ''}</td>
                                <td>${$(this).find('.mm-role').val() || ''}</td>
                                <td>${$(this).find('.mm-rate').val() || ''}</td>
                                <td>${$(this).find('.mm-allocation').val() || ''}</td>
                                <td>${$(this).find('.mm-fee').val() || ''}</td>
                                <td>${$(this).find('.mm-remarks').val() || ''}</td>
                            </tr>`;
                        }).get().join('')}
                    </tbody>
                </table>`;
            break;

        case 'editable-design-payment-section':
            content = `
                <table class="preview-table">
                    <thead>
                        <tr>
                            <th>Stage</th>
                            <th>%age to be Paid</th>
                            <th>On Submission</th>
                            <th>On Approval</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${$('.design-payment-entry').map(function() {
                            return `<tr>
                                <td>${$(this).find('.design-stage').val() || ''}</td>
                                <td>${$(this).find('.design-percentage').val() || ''}</td>
                                <td>${$(this).find('.design-submission').val() || ''}</td>
                                <td>${$(this).find('.design-approval').val() || ''}</td>
                            </tr>`;
                        }).get().join('')}
                    </tbody>
                </table>`;
            break;

        case 'general-scope-section':
            content = `
                <table class="preview-table">
                    <thead>
                        <tr>
                            <th>Disciplines and Services</th>
                            <th>Service By</th>
                            <th>Inclusions</th>
                            <th>Remarks</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${$('.scope-service-entry').map(function() {
                            return `<tr>
                                <td>${$(this).find('.scope-discipline').val() || ''}</td>
                                <td>${$(this).find('.scope-service-by').val() || ''}</td>
                                <td>${$(this).find('.scope-inclusions').val() || ''}</td>
                                <td>${$(this).find('.scope-remarks').val() || ''}</td>
                            </tr>`;
                        }).get().join('')}
                    </tbody>
                </table>`;
            break;

        case 'stages-deliverables-section':
            content = $('.stage-entry').map(function() {
                return `
                    <div class="stage-block mb-4">
                        <h3>${$(this).find('.stage-title').val() || 'Stage'}</h3>
                        <p><strong>Tasks & Activities:</strong> ${$(this).find('.stage-tasks').val() || ''}</p>
                        <table class="preview-table">
                            <thead>
                                <tr>
                                    <th>Deliverable</th>
                                    <th>Format</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${$(this).find('.deliverable-entry').map(function() {
                                    return `<tr>
                                        <td>${$(this).find('.deliverable-name').val() || ''}</td>
                                        <td>${$(this).find('.deliverable-format').val() || ''}</td>
                                        <td>${$(this).find('.deliverable-status').val() || ''}</td>
                                    </tr>`;
                                }).get().join('')}
                            </tbody>
                        </table>
                    </div>`;
            }).get().join('');
            break;

        case 'editable-additional-rates-section':
            content = `
                <h4>Design Stage</h4>
                <table class="preview-table">
                    <thead>
                        <tr>
                            <th>Position</th>
                            <th>AED/Hour</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${$('.design-service-rates .additional-rate-entry').map(function() {
                            return `<tr>
                                <td>${$(this).find('.rate-position').val() || ''}</td>
                                <td>${$(this).find('.rate-hourly').val() || ''}</td>
                            </tr>`;
                        }).get().join('')}
                    </tbody>
                </table>
                <h4 class="mt-4">Construction Stage</h4>
                <table class="preview-table">
                    <thead>
                        <tr>
                            <th>Position</th>
                            <th>AED/Hour</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${$('.construction-service-rates .additional-rate-entry').map(function() {
                            return `<tr>
                                <td>${$(this).find('.rate-position').val() || ''}</td>
                                <td>${$(this).find('.rate-hourly').val() || ''}</td>
                            </tr>`;
                        }).get().join('')}
                    </tbody>
                </table>`;
            break;

        case 'terms-section':
            content = `
                <div class="terms-content">
                    <h4>Standard Terms</h4>
                    <p>${$('#standardTerms').val() || ''}</p>
                    <h4>Additional Notes</h4>
                    <p>${$('#additionalNotes').val() || ''}</p>
                </div>`;
            break;
    }

    return content;
}

// Updated generateWordDocument()
function generateWordDocument() {
    const { Document, Paragraph, TextRun, HeadingLevel } = docx;
    
    const doc = new Document({
        sections: [{
            children: [
                // New Agreement Section
                new Paragraph({
                    text: "Agreement Overview",
                    heading: HeadingLevel.HEADING_1
                }),
                new Paragraph({
                    text: "Client Details:",
                    heading: HeadingLevel.HEADING_2
                }),
                new Paragraph(
                    new TextRun({
                        text: `Name: ${$('#clientNameFull').val()}`,
                        bold: true
                    })
                ),
                // ... rest of DOCX content
                
                // Original DOCX content
            ]
        }]
    });

    // Original download logic
    // Generate the Word file and download it
    Packer.toBlob(doc).then(blob => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = ($('#proposalTitle').val() || 'architecture_proposal') + '.docx';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    });

}

// Helper function to generate scope items for Word doc
function generateScopeItemsForDocx() {
    const { Paragraph, HeadingLevel } = docx;
    const items = [];
    
    $('.scope-item').each(function() {
        const title = $(this).find('.scope-title').val();
        const description = $(this).find('.scope-description').val();
        
        if(title || description) {
            items.push(
                new Paragraph({
                    text: title || "Scope Item",
                    heading: HeadingLevel.HEADING_2
                }),
                new Paragraph({
                    text: description || "Description of this scope item.",
                    spacing: {
                        after: 200
                    }
                })
            );
        }
    });
    
    return items;
}


// Helper function to generate team members for Word doc
function generateTeamMembersForDocx() {
    const { Paragraph, HeadingLevel } = docx;
    const members = [];
    
    $('.team-member').each(function() {
        const name = $(this).find('.member-name').val();
        const role = $(this).find('.member-role').val();
        const bio = $(this).find('.member-bio').val();
        
        if(name || role || bio) {
            members.push(
                new Paragraph({
                    text: name || "Team Member",
                    heading: HeadingLevel.HEADING_2
                }),
                new Paragraph({
                    text: "Role: " + (role || "Not specified"),
                    spacing: {
                        after: 100
                    }
                }),
                new Paragraph({
                    text: bio || "Bio not provided.",
                    spacing: {
                        after: 200
                    }
                })
            );
        }
    });
    
    return members;
}


// Helper function to generate milestones for Word doc
function generateMilestonesForDocx() {
    const { Paragraph } = docx;
    const milestones = [];
    
    $('.milestone').each(function() {
        const name = $(this).find('.milestone-name').val();
        const start = $(this).find('.milestone-start').val();
        const end = $(this).find('.milestone-end').val();
        const deliverables = $(this).find('.milestone-deliverables').val();
        
        if(name || start || end || deliverables) {
            milestones.push(
                new Paragraph({
                    text: name || "Milestone",
                    heading: HeadingLevel.HEADING_3
                }),
                new Paragraph({
                    text: "Dates: " + (start || "Not specified") + " to " + (end || "Not specified"),
                    spacing: {
                        after: 100
                    }
                }),
                new Paragraph({
                    text: "Deliverables: " + (deliverables || "Not specified"),
                    spacing: {
                        after: 200
                    }
                })
            );
        }
    });
    
    return milestones;
}



// Helper function to generate budget table for Word doc
function generateBudgetTableForDocx() {
    const { Table, TableRow, TableCell, Paragraph, WidthType, AlignmentType } = docx;
    const rows = [];
    let grandTotal = 0;
    
    // Header row
    rows.push(
        new TableRow({
            children: [
                new TableCell({
                    children: [new Paragraph("Item Description")],
                    width: { size: 40, type: WidthType.PERCENTAGE }
                }),
                new TableCell({
                    children: [new Paragraph("Quantity")],
                    width: { size: 15, type: WidthType.PERCENTAGE }
                }),
                new TableCell({
                    children: [new Paragraph("Unit Cost")],
                    width: { size: 20, type: WidthType.PERCENTAGE }
                }),
                new TableCell({
                    children: [new Paragraph("Total")],
                    width: { size: 25, type: WidthType.PERCENTAGE }
                })
            ]
        })
    );
    
    // Data rows
    $('.budget-item').each(function() {
        const desc = $(this).find('.budget-description').val();
        const qty = $(this).find('.budget-quantity').val() || 0;
        const unit = $(this).find('.budget-unit-cost').val() || 0;
        const total = (qty * unit).toFixed(2);
        
        if(desc || qty || unit) {
            rows.push(
                new TableRow({
                    children: [
                        new TableCell({
                            children: [new Paragraph(desc || "Item")]
                        }),
                        new TableCell({
                            children: [new Paragraph(qty.toString())],
                            alignment: AlignmentType.RIGHT
                        }),
                        new TableCell({
                            children: [new Paragraph("$" + unit.toString())],
                            alignment: AlignmentType.RIGHT
                        }),
                        new TableCell({
                            children: [new Paragraph("$" + total)],
                            alignment: AlignmentType.RIGHT
                        })
                    ]
                })
            );
            
            grandTotal += parseFloat(total);
        }
    });
    
    // Total row
    rows.push(
        new TableRow({
            children: [
                new TableCell({
                    children: [new Paragraph("")],
                    columnSpan: 3
                }),
                new TableCell({
                    children: [new Paragraph({
                        text: "$" + grandTotal.toFixed(2),
                        bold: true
                    })],
                    alignment: AlignmentType.RIGHT
                })
            ]
        })
    );
    
    return [
        new Table({
            rows: rows,
            width: { size: 100, type: WidthType.PERCENTAGE }
        })
    ];
}

// Add saveProposal function if not exists or update existing one
function saveProposal(data, isUpdate = false, moveToNext = false) {
    const method = isUpdate ? 'PUT' : 'POST';
    const url = isUpdate ? `${API_BASE_URL}/proposals/${data._id}` : `${API_BASE_URL}/proposals`;
    
    // pull _id off and collect the rest into `payload`
    const { _id, ...payload } = data;

    return $.ajax({
        url: url,
        method: method,
        crossDomain: true,
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        data: JSON.stringify(payload),
        success: (response) => {
            alert(isUpdate ? 'Proposal updated successfully!' : 'Proposal saved successfully!');
            
            if (moveToNext) {
                // Move to next section
                const currentSection = $('.proposal-section.active');
                const nextSection = currentSection.next('.proposal-section');
                if (nextSection.length) {
                    // Update active section
                    $('.proposal-section').removeClass('active');
                    nextSection.addClass('active');
                    
                    // Update navigation
                    const nextSectionId = nextSection.attr('id');
                    $('#proposalSections a').removeClass('active');
                    $(`#proposalSections a[href="#${nextSectionId}"]`).addClass('active');
                    
                    // Scroll to top of new section
                    nextSection[0].scrollIntoView({ behavior: 'smooth' });
                }
            }
            
            // Store proposal ID if it's a new proposal
            if (!isUpdate && response._id) {
                const urlParams = new URLSearchParams(window.location.search);
                urlParams.set('proposal', JSON.stringify(response));
                window.history.replaceState({}, '', `${window.location.pathname}?${urlParams}`);
            }
            
            return response;
        },
        error: function(xhr, status, error) {
            console.error('Save Error:', { xhr, status, error });
            alert('Failed to save proposal. Please try again.');
        }
    });
}

// Extend collectSectionData to handle new sections
function collectSectionData(section) {
    const data = {};

    section.find('input, textarea, select').each(function() {
        const field = $(this);
        const id = field.attr('id');
        if (id) {
            if (field.attr('type') === 'checkbox') {
                data[id] = field.is(':checked');
            } else {
                data[id] = field.val();
            }
        }
    });

    // Collect design payment stage data
    if (section.attr('id') === 'editable-design-payment-section') {
        data.designPayments = [];
        $('.design-payment-entry').each(function() {
            data.designPayments.push({
                stage: $(this).find('.design-stage').val(),
                percentage: $(this).find('.design-percentage').val(),
                submission: $(this).find('.design-submission').val(),
                approval: $(this).find('.design-approval').val()
            });
        });
    }

    // Collect additional service rate data
    if (section.attr('id') === 'editable-additional-rates-section') {
        data.additionalRates = [];
        // $('.additional-rate-entry').each(function() {
        //     data.additionalRates.push({
        //         position: $(this).find('.rate-position').val(),
        //         rate: $(this).find('.rate-hourly').val(),
        //         role: $(this).find('.rate-const-role').val()
        //     });
        // });
        data.constructionStageRates = [];

        $('.design-service-rates .additional-rate-entry').each(function () {
            data.designStageRates.push({
                position: $(this).find('.rate-position').val(),
                rate: $(this).find('.rate-hourly').val()
            });
        });

        $('.construction-service-rates .additional-rate-entry').each(function () {
            data.constructionStageRates.push({
                position: $(this).find('.rate-position').val(),
                rate: $(this).find('.rate-hourly').val()
            });
        });
    }
    if (section.attr('id') === 'man-month-section') {
        data.manMonthRates = [];

        $('.man-month-entry').each(function () {
            data.manMonthRates.push({
                position: $(this).find('.mm-position').val(),
                role: $(this).find('.mm-role').val(),
                rate: $(this).find('.mm-rate').val(),
                allocation: $(this).find('.mm-allocation').val(),
                fee: $(this).find('.mm-fee').val(),
                remarks: $(this).find('.mm-remarks').val()
            });
        });
    }

    // Add these cases to the collectSectionData() function

    if (section.attr('id') === 'general-scope-section') {
        data.scopeServices = [];
        $('.scope-service-entry').each(function() {
            data.scopeServices.push({
                discipline: $(this).find('.scope-discipline').val(),
                serviceBy: $(this).find('.scope-service-by').val(),
                inclusions: $(this).find('.scope-inclusions').val(),
                remarks: $(this).find('.scope-remarks').val()
            });
        });
    }

    if (section.attr('id') === 'stages-deliverables-section') {
        data.stagesDeliverables = [];
        $('.stage-entry').each(function() {
            const stage = {
                title: $(this).find('.stage-title').val(),
                tasks: $(this).find('.stage-tasks').val(),
                deliverables: []
            };

            $(this).find('.deliverable-entry').each(function() {
                stage.deliverables.push({
                    name: $(this).find('.deliverable-name').val(),
                    format: $(this).find('.deliverable-format').val(),
                    status: $(this).find('.deliverable-status').val()
                });
            });

            data.stagesDeliverables.push(stage);
        });
    }

    // Add to collectSectionData() for the documents section
    if (section.attr('id') === 'documents-section') {
        data.documents = {
            letterOffer: {
                included: $('#letterOffer').is(':checked'),
                type: $('input[name="letterOfferType"]:checked').val(),
                file: filePreviews['letterOfferFile'] || null
            },
            mainAgreement: {
                included: $('#mainAgreement').is(':checked'),
                type: $('input[name="mainAgreementType"]:checked').val(),
                file: filePreviews['mainAgreementFile'] || null
            },
            appendixA: filePreviews['appendixAFile'] || null,
            appendixB: filePreviews['appendixBFile'] || null,
            appendixC: filePreviews['appendixCFile'] || null
        };
    }


    data.section = section.attr('id');
    data.status = 'draft';
    return data;
}




// Helper function to collect section data
function collectSectionData(section) {
    const data = {};
    
    // Collect form data from the section
    section.find('input, textarea, select').each(function() {
        const field = $(this);
        const id = field.attr('id');
        if (id) {
            if (field.attr('type') === 'checkbox') {
                data[id] = field.is(':checked');
            } else {
                data[id] = field.val();
            }
        }
    });
    
    // Add section identifier
    data.section = section.attr('id');
    data.status = 'draft';
    
    return data;
}

// Updated PDF generation function
async function generatePDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

    // 1️⃣ Render all HTML proposal sections to images/pages, except documents-section
    const pagesEls = document.querySelectorAll('.pdf-page');
    let htmlPages = [];
    let docSectionIndex = -1;

    // Track section order and identify where "documents-section" occurs
    for (let i = 0; i < pagesEls.length; i++) {
        const secId = pagesEls[i].dataset.sec;
        if (secId === 'documents-section') {
            docSectionIndex = i;
            // Do not render this section as a page, skip
            continue;
        }

        if (htmlPages.length > 0) doc.addPage();
        const canvas = await html2canvas(pagesEls[i], {
            scale: 2, useCORS: true, windowWidth: 1024, windowHeight: 1448
        });
        const imgData = canvas.toDataURL('image/jpeg', 1.0);
        doc.addImage(imgData, 'JPEG', 15, 15, 180, 0, undefined, 'FAST');
        htmlPages.push(secId);
    }

    // 2️⃣ Load into PDF-Lib for merging and inserting constituent PDFs
    const merged = await PDFLib.PDFDocument.create();
    const raw = await doc.output('arraybuffer');
    const base = await PDFLib.PDFDocument.load(raw);

    // Preload logo image
    const logoUrl = 'assets/pdf/archcorp logo.png';
    const logoBytes = await fetch(logoUrl).then(r => r.arrayBuffer());
    const logoImg = await merged.embedPng(logoBytes);

    // Helper: Get all constituent PDFs
    async function getConstituentPDFs() {
        let pdfList = [];
        if ($('#letterOffer').is(':checked')) {
            let bytes;
            if ($('#letterOfferDefault').is(':checked')) {
                bytes = await fetchPDF('assets/pdf/letterOffer_default.pdf');
            } else {
                bytes = await readFileAsArrayBuffer($('#letterOfferFile')[0].files[0]);
            }
            pdfList.push(bytes);
        }
        if ($('#mainAgreement').is(':checked')) {
            let bytes;
            if ($('#mainAgreementDefault').is(':checked')) {
                bytes = await fetchPDF('assets/pdf/mainAgreement_default.pdf');
            } else {
                bytes = await readFileAsArrayBuffer($('#mainAgreementFile')[0].files[0]);
            }
            pdfList.push(bytes);
        }
        return pdfList;
    }

    let pageIdx = 0;
    for (let i = 0; i < htmlPages.length; i++) {
        // Always add the page from the base PDF
        const [pg] = await merged.copyPages(base, [i]);
        merged.addPage(pg);
        pageIdx++;

        // After the section that was just added, if that was before the skipped 'documents-section',
        // now append the constituent PDFs in their place.
        if (i === docSectionIndex - 1 || (docSectionIndex === 0 && i === 0)) {
            // Insert PDFs here
            let pdfBytesList = await getConstituentPDFs();
            for (const pdfBytes of pdfBytesList) {
                const srcPdf = await PDFLib.PDFDocument.load(pdfBytes);
                const partPages = await merged.copyPages(srcPdf, srcPdf.getPageIndices());
                for (const p of partPages) {
                    merged.addPage(p);
                    pageIdx++;
                }
            }
        }
    }

    // 3️⃣ Stamp logo & page number on every page, including appended ones
    const allPages = merged.getPages();
    for (let idx = 0; idx < allPages.length; idx++) {
        const page = allPages[idx];
        const { width, height } = page.getSize();
        // Logo at top right
        page.drawImage(logoImg, {
            x: width - 60, y: height - 50, width: 40,
        });
        // Page number at bottom right
        page.drawText(`Page ${idx + 1}`, {
            x: width - 70, y: 30, size: 10,
            color: PDFLib.rgb(0.4, 0.4, 0.4),
        });
    }

    // 4️⃣ Save and trigger download
    const out = await merged.save();
    downloadPDF(out, 'proposal.pdf');
}



// Function to show PDF preview
function showPDFPreview(pdfSource, container) {
    container.html(`
        <div class="pdf-preview">
            <object data="${pdfSource}" type="application/pdf" width="100%" height="500px">
                <p>Unable to display PDF. <a href="${pdfSource}" target="_blank">Download</a> instead.</p>
            </object>
        </div>
    `);
    container.show();
}



$(document).ready(function() {

    $('.section-live-preview').prop('checked', true).trigger('change');

    // Initial proposal section selector
    $('#sectionSelectForm').submit(function (e) {
        e.preventDefault();

        const selectedSections = [];
        const sidebarList = $('#proposalSections');
        const filePreviews = {};
        sidebarList.empty();

        // Clear previously shown sections
        $('.proposal-section').removeClass('active').hide();

        // Build sidebar and show only selected sections
        $('.section-option:checked').each(function (index) {
            const sectionId = $(this).val();
            selectedSections.push(sectionId);

            const sectionName = $(`#${sectionId} h2`).text() || sectionId.replace(/-/g, ' ');
            sidebarList.append(`
                <li class="nav-item">
                    <a class="nav-link${index === 0 ? ' active' : ''}" href="#${sectionId}">${sectionName}</a>
                </li>
            `);

            // Show only selected sections
            $(`#${sectionId}`).addClass('active').show();
        });

        // Hide section selector
        $('#sectionSelector').hide();

        // Activate first section
        $('.proposal-section').removeClass('active');
        $(`#${selectedSections[0]}`).addClass('active');
    });

    // Original code
    $('.proposal-section').first().addClass('active');
    
    // Navigation between sections
    $(document).on('click', '#proposalSections a', function(e) {
        e.preventDefault();
        const target = $(this).attr('href');
        $('.proposal-section').removeClass('active');
        $(target).addClass('active');
        $('#proposalSections a').removeClass('active');
        $(this).addClass('active');
    });

    // Original add/remove item functions
    // ...
    // Add scope item
    $('.add-scope').click(function() {
        const newItem = $('.scope-item').first().clone();
        newItem.find('input').val('');
        newItem.find('textarea').val('');
        $('.scope-items').append(newItem);
    });
    
    // Remove scope item
    $(document).on('click', '.remove-scope', function() {
        if($('.scope-item').length > 1) {
            $(this).closest('.scope-item').remove();
        } else {
            alert('You need at least one scope item.');
        }
    });

    // Add team member
    $('.add-member').click(function() {
        const newMember = $('.team-member').first().clone();
        newMember.find('input').val('');
        newMember.find('textarea').val('');
        $('.team-members').append(newMember);
    });
    
    // Remove team member
    $(document).on('click', '.remove-member', function() {
        if($('.team-member').length > 1) {
            $(this).closest('.team-member').remove();
        } else {
            alert('You need at least one team member.');
        }
    });
    
    // Add milestone
    $('.add-milestone').click(function() {
        const newMilestone = $('.milestone').first().clone();
        newMilestone.find('input').val('');
        $('.milestones').append(newMilestone);
    });
    
    // Remove milestone
    $(document).on('click', '.remove-milestone', function() {
        if($('.milestone').length > 1) {
            $(this).closest('.milestone').remove();
        } else {
            alert('You need at least one milestone.');
        }
    });
    
    // Add budget item
    $('.add-budget-item').click(function() {
        const newItem = $('.budget-item').first().clone();
        newItem.find('input').val('');
        $('.budget-items').append(newItem);
    });
    
    // Remove budget item
    $(document).on('click', '.remove-budget-item', function() {
        if($('.budget-item').length > 1) {
            $(this).closest('.budget-item').remove();
        } else {
            alert('You need at least one budget item.');
        }
    });

    // Calculate budget totals
    $(document).on('input', '.budget-quantity, .budget-unit-cost', function() {
        const item = $(this).closest('.budget-item');
        const quantity = parseFloat(item.find('.budget-quantity').val()) || 0;
        const unitCost = parseFloat(item.find('.budget-unit-cost').val()) || 0;
        const total = quantity * unitCost;
        item.find('.budget-total').val(total.toFixed(2));
    });
    
    // Image preview functionality
    $('#coverImage, #processImage, #signatureImage, .member-photo').change(function() {
        const previewId = $(this).attr('id') + 'Preview';
        const previewDiv = $('#' + previewId);
        
        if (this.files && this.files[0]) {
            const reader = new FileReader();
            
            reader.onload = function(e) {
                previewDiv.html('<img src="' + e.target.result + '">');
                previewDiv.show();
            }
            
            reader.readAsDataURL(this.files[0]);
        }
    });
    
    // Add image button
    $('#addImageBtn').click(function() {
        const activeSection = $('.proposal-section.active');
        const imageInput = $('<div class="form-group"><label>Image</label><input type="file" class="form-control image-upload" accept="image/*"><div class="image-preview mt-2"></div></div>');
        activeSection.append(imageInput);
    });
    
    // Add table button - show modal
    $('#addTableBtn').click(function() {
        $('#tableModal').modal('show');
    });
    
    // Insert table from modal
    $('#insertTable').click(function() {
        const rows = parseInt($('#tableRows').val());
        const cols = parseInt($('#tableCols').val());
        const caption = $('#tableCaption').val();
        
        if (rows > 0 && cols > 0) {
            let tableHtml = '';
            
            if (caption) {
                tableHtml += `<div class="table-caption">${caption}</div>`;
            }
            
            tableHtml += '<table class="preview-table"><thead><tr>';
            
            // Add header row
            for (let i = 0; i < cols; i++) {
                tableHtml += `<th>Header ${i+1}</th>`;
            }
            
            tableHtml += '</tr></thead><tbody>';
            
            // Add data rows
            for (let i = 0; i < rows; i++) {
                tableHtml += '<tr>';
                for (let j = 0; j < cols; j++) {
                    tableHtml += '<td>Data</td>';
                }
                tableHtml += '</tr>';
            }
            
            tableHtml += '</tbody></table>';
            
            const activeSection = $('.proposal-section.active');
            activeSection.append(tableHtml);
            
            $('#tableModal').modal('hide');
            $('#tableRows').val(3);
            $('#tableCols').val(3);
            $('#tableCaption').val('');
        }
    });
    
    
    // Preview proposal
  
    $('#previewBtn').on('click', async function() {
        const $liveSecs = $('.section-live-preview:checked')
                            .closest('.proposal-section');
        let html = '';
        let pageNum = 1;

        for (const secEl of $liveSecs.toArray()) {
            const $sec   = $(secEl);
            const id     = $sec.attr('id');

            // 1️⃣ Build the section’s own HTML page
            html += `
            <div class="pdf-page" data-sec="${id}">
                <div class="page-header">
                <img src="./assets/pdf/archcorp logo.png"
                    class="preview-logo-top-right" alt="Logo">
                </div>
                <div class="section-header">
                <h2>${$sec.find('h2').text()}</h2>
                </div>
                <div class="section-content">
                ${generateSectionContent($sec)}
                </div>
            `;

            // 2️⃣ If this is the “Constituent Documents” section, inject PDFs inline
            if (id === 'documents-section') {
            // Letter of Offer
            if ($('#letterOffer').is(':checked')) {
                if ($('#letterOfferDefault').is(':checked')) {
                html += `
                    <div class="pdf-preview">
                    <p><em>The selected documents (Letter of Offer) will be merged into the final output PDF and are not shown in the preview here.</em></p>
                    </div>
                `;
                } else {
                const file = $('#letterOfferFile')[0].files[0];
                if (file) {
                    const url = URL.createObjectURL(file);
                    html += `
                    <div class="pdf-preview">
                        <object data="${url}"
                                type="application/pdf" width="100%" height="300px">
                        <p>Download your Letter of Offer: 
                            <a href="${url}">here</a>
                        </p>
                        </object>
                    </div>
                    `;
                }
                }
            }
            // Main Agreement Body
            if ($('#mainAgreement').is(':checked')) {
                if ($('#mainAgreementDefault').is(':checked')) {
                html += `
                    <div class="pdf-preview">
                    <p><em>The selected constituent PDFs (Main Agreement) will be appended to the proposal PDF download and are not shown in this preview.</em></p>
                    </div>
                `;
                } else {
                const file = $('#mainAgreementFile')[0].files[0];
                if (file) {
                    const url = URL.createObjectURL(file);
                    html += `
                    <div class="pdf-preview">
                        <object data="${url}"
                                type="application/pdf" width="100%" height="300px">
                        <p>Download your Main Agreement: 
                            <a href="${url}">here</a>
                        </p>
                        </object>
                    </div>
                    `;
                }
                }
            }
            }

            // 3️⃣ Close out this page
            html += `
                <div class="page-footer">
                </div>
            </div>
            `;
        }

        $('#previewContent').html(html);
        $('#previewModal').modal('show');
    });
    
    
    
    // toggle live preview
    $(document).on('change', '.section-live-preview', function() {
        const $toggle = $(this);
        const liveOnly = $toggle.is(':checked');

        // find the section this switch lives in
        const $section = $toggle.closest('.proposal-section');

        // regenerate preview for just this section
        generateSectionPreview($section, liveOnly);
    });


    


    

    // Original event handlers
    // ...
    

    document.addEventListener('DOMContentLoaded', function() {
            // Get proposal data from URL if exists
            const urlParams = new URLSearchParams(window.location.search);
            const proposalParam = urlParams.get('proposal');
            
            if (proposalParam) {
                try {
                    const proposalData = JSON.parse(decodeURIComponent(proposalParam));
                    // Fill form fields with proposal data
                    $('#proposalTitle').val(proposalData.title);
                    $('#clientName').val(proposalData.client_name);
                    $('#projectAddress').val(proposalData.project_address);
                    // ... populate other fields as needed
                } catch (e) {
                    console.error('Error parsing proposal data:', e);
                }
            }
        });
    // Update the section button group generation
    $('.proposal-section').each(function() {
        const buttonGroup = `
            <div class="button-group mt-3">
                <button class="btn btn-primary save-section">Save</button>
                <button class="btn btn-success save-continue-section">Save & Continue</button>
                <button class="btn btn-secondary clear-section">Clear</button>
            </div>
        `;
        $(this).append(buttonGroup);
    });

    // Handle save section
    $('.save-section').click(function() {
        const section = $(this).closest('.proposal-section');
        const sectionData = {};
        
        // Collect form data from the section
        section.find('input, textarea').each(function() {
            const field = $(this);
            sectionData[field.attr('id')] = field.val();
        });

        // Check if we're updating an existing proposal
        const urlParams = new URLSearchParams(window.location.search);
        const proposalParam = urlParams.get('proposal');
        const isUpdate = !!proposalParam;

        if (isUpdate) {
            const existingData = JSON.parse(decodeURIComponent(proposalParam));
            sectionData._id = existingData._id;
        }

        saveProposal(sectionData, isUpdate);
    });

    // Handle save and continue
    $('.save-continue-section').click(function() {
        const section = $(this).closest('.proposal-section');
        const sectionData = collectSectionData(section);
        
        // Check if we're updating an existing proposal
        const urlParams = new URLSearchParams(window.location.search);
        const proposalParam = urlParams.get('proposal');
        const isUpdate = !!proposalParam;

        if (isUpdate) {
            const existingData = JSON.parse(decodeURIComponent(proposalParam));
            sectionData._id = existingData._id;
        }

        saveProposal(sectionData, isUpdate, true);
    });

    // Handle clear section
    $('.clear-section').click(function() {
        if (confirm('Are you sure you want to clear this section? This will not affect saved data.')) {
            const section = $(this).closest('.proposal-section');
            section.find('input:not([type="button"]):not([type="submit"]):not([type="reset"])').val('');
            section.find('textarea').val('');
            section.find('.image-preview').empty().hide();
        }
    });

    


    
    // Design Payment Stage - Add Entry
    $('.add-design-payment').click(function() {
        const newEntry = $('.design-payment-entry').first().clone();
        newEntry.find('input').val('');
        $('.design-payment-stages').append(newEntry);
    });

    // Remove Design Payment Entry
    $(document).on('click', '.remove-design-payment', function() {
        if ($('.design-payment-entry').length > 1) {
            $(this).closest('.design-payment-entry').remove();
        } else {
            alert('At least one payment stage is required.');
        }
    });

    
    // Add Design Stage Rate
    $('.add-design-rate').click(function () {
        const newRate = $('.design-service-rates .additional-rate-entry').first().clone();
        newRate.find('input').val('');
        $('.design-service-rates').append(newRate);
    });

    // Add Construction Stage Rate
    $('.add-construction-rate').click(function () {
        const newRate = $('.construction-service-rates .additional-rate-entry').first().clone();
        newRate.find('input').val('');
        $('.construction-service-rates').append(newRate);
    });

    // Remove Rate Entry (shared)
    $(document).on('click', '.remove-additional-rate', function () {
        const container = $(this).closest('.additional-rate-entry').parent();
        if (container.find('.additional-rate-entry').length > 1) {
            $(this).closest('.additional-rate-entry').remove();
        } else {
            alert('At least one rate must be maintained.');
        }
    });

    // Add Man Month entry
    $('.add-man-month').click(function () {
        const newEntry = $('.man-month-entry').first().clone();
        newEntry.find('input, textarea').val('');
        $('.man-month-entries').append(newEntry);
    });

    // Remove Man Month entry
    $(document).on('click', '.remove-man-month', function () {
        if ($('.man-month-entry').length > 1) {
            $(this).closest('.man-month-entry').remove();
        } else {
            alert('At least one entry is required.');
        }
    });

    // Add Scope Service Entry
    $('.add-scope-service').click(function() {
        const newEntry = $('.scope-service-entry').first().clone();
        newEntry.find('input, textarea').val('');
        $('.scope-services-entries').append(newEntry);
    });

    // Remove Scope Service Entry
    $(document).on('click', '.remove-scope-service', function() {
        if ($('.scope-service-entry').length > 1) {
            $(this).closest('.scope-service-entry').remove();
        } else {
            alert('At least one service entry is required.');
        }
    });

    // Add Stage
    $('.add-stage').click(function() {
        const newStage = $('.stage-entry').first().clone();
        newStage.find('input, textarea').val('');
        $('.stage-entries').append(newStage);
    });

    // Remove Stage
    $(document).on('click', '.remove-stage', function() {
        if ($('.stage-entry').length > 1) {
            $(this).closest('.stage-entry').remove();
        } else {
            alert('At least one stage is required.');
        }
    });

    // Add Deliverable
    $(document).on('click', '.add-deliverable', function() {
        const newDeliverable = $('.deliverable-entry').first().clone();
        newDeliverable.find('input').val('');
        $(this).closest('.stage-entry').find('.deliverable-entries').append(newDeliverable);
    });

    // Remove Deliverable
    $(document).on('click', '.remove-deliverable', function() {
        if ($(this).closest('.stage-entry').find('.deliverable-entry').length > 1) {
            $(this).closest('.deliverable-entry').remove();
        } else {
            alert('At least one deliverable is required.');
        }
    });

      // Toggle file upload fields based on radio selection
    $(document).on('change', '.doc-option', function() {
        const containerId = $(this).closest('.form-check').find('.form-check-input').attr('id') + 'Upload';
        if ($(this).val() === 'custom') {
            $('#' + containerId).show();
        } else {
            $('#' + containerId).hide();
            $('#' + containerId.replace('Upload', 'File')).val('');
        }
    });

    // Store file data for preview
    const filePreviews = {};

    $(document).on('change', 'input[type="file"]', function() {
        const fileInput = $(this);
        const fileId = fileInput.attr('id');
        const previewId = fileId + 'Preview';
        const previewContainer = $('#' + previewId);
        
        if (fileInput[0].files && fileInput[0].files[0]) {
            const file = fileInput[0].files[0];
            filePreviews[fileId] = {
                name: file.name,
                type: file.type,
                size: file.size
            };
            
            // Show file info in preview
            let iconClass = 'fa-file';
            if (file.type.includes('pdf')) iconClass = 'fa-file-pdf';
            else if (file.type.includes('word') || file.name.endsWith('.doc') || file.name.endsWith('.docx')) {
                iconClass = 'fa-file-word';
            }
            
            previewContainer.html(`
                <div class="file-preview">
                    <i class="fas ${iconClass} fa-3x"></i>
                    <p class="file-name">${file.name}</p>
                    <p class="file-size">${formatFileSize(file.size)}</p>
                </div>
            `);
            previewContainer.show();
        } else {
            delete filePreviews[fileId];
            previewContainer.empty().hide();
        }
    });
    // Helper function to format file size
    // Format file size
    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    // Toggle file upload fields based on radio selection
    $(document).on('change', '.doc-option', function() {
        const containerId = $(this).closest('.form-check').find('.form-check-input').attr('id') + 'Upload';
        if ($(this).val() === 'custom') {
            $('#' + containerId).show();
        } else {
            $('#' + containerId).hide();
            $('#' + containerId.replace('Upload', 'File')).val('');
            $('#' + containerId.replace('Upload', 'FilePreview')).empty().hide();
        }
    });

    // Toggle file upload fields based on radio selection
    $(document).on('change', '.doc-option', function() {
        const containerId = $(this).closest('.form-check').find('.form-check-input').attr('id') + 'Upload';
        if ($(this).val() === 'custom') {
            $('#' + containerId).show();
        } else {
            $('#' + containerId).hide();
            $('#' + containerId.replace('Upload', 'File')).val('');
            $('#' + containerId.replace('Upload', 'FilePreview')).empty().hide();
        }
    });


    
    
});

// Add after document.ready
$(document).ready(function() {
    // Handle document type selection
    $('.doc-option').change(function() {
        const documentType = $(this).attr('name').replace('Type', '');
        const uploadDiv = $(`#${documentType}Upload`);
        const previewDiv = $(`#${documentType}FilePreview`);
        
        if ($(this).val() === 'custom') {
            uploadDiv.show();
            previewDiv.empty();
        } else {
            uploadDiv.hide();
            // Show default PDF
            const defaultPdfPath = `assets/pdf/${documentType}_default.pdf`;
            showPDFPreview(defaultPdfPath, previewDiv);
        }
    });

    // Handle file uploads
    $('input[type="file"][accept=".pdf"]').change(function() {
        const file = this.files[0];
        const previewDiv = $(this).siblings('.file-preview-container');
        
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                showPDFPreview(e.target.result, previewDiv);
            };
            reader.readAsDataURL(file);
        }
    });

    
    // Initialize document options
    $('.doc-option[value="default"]:checked').each(function() {
        const documentType = $(this).attr('name').replace('Type', '');
        const previewDiv = $(`#${documentType}FilePreview`);
        const defaultPdfPath = `assets/pdf/${documentType}_default.pdf`;
        showPDFPreview(defaultPdfPath, previewDiv);
    });

    // Update the click handler for download button
    $('#downloadBtn').click(function() {
        generatePDF();
    });

    $('#downloadFromPreview').click(function() {
        generatePDF();
    });

});

// Add these functions after the existing code


