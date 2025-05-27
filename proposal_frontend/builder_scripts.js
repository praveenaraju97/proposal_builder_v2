
const API_BASE_URL = 'http://localhost:5001/api';
// Function to collect PDFs to merge


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


function adjustTextareaHeight(textarea) {
    textarea.style.height = 'auto';
    textarea.style.height = (textarea.scrollHeight) + 'px';
}

$(document).on('input', '.auto-expand', function() {
    adjustTextareaHeight(this);
});

// Initialize textarea heights on load and when adding new entries
function initTextareas() {
    $('.auto-expand').each(function() {
        adjustTextareaHeight(this);
    });
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
        let extraClass = '';

        // Only add landscape class to "stages-deliverables-section"
        if (sectionId === 'stages-deliverables-section') {
            extraClass = 'landscape';
        }

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

        case 'agreement-section':
            content = `
                <div class="row">
                <div class="col-6">
                    <p><strong>Client:</strong> ${$('#clientNameFull').val() || '—'}</p>
                    <p><strong>Representative:</strong> ${$('#clientRep').val() || '—'}</p>
                    <p><strong>Email:</strong> ${$('#clientEmail').val() || '—'}</p>
                </div>
                <div class="col-6">
                    <p><strong>Consultant:</strong> ${$('#consultantName').val() || '—'}</p>
                    <p><strong>Rep.:</strong> ${$('#consultantRep').val() || '—'}</p>
                    <p><strong>Tel.:</strong> ${$('#consultantPhone').val() || '—'}</p>
                </div>
                </div>
                <div class="row mt-3">
                <div class="col-4"><p><strong>Date of Agreement:</strong> ${$('input[readonly][value]').filter((i,el)=>el.parentNode.querySelector('label').textContent==='Date of Agreement').val() || '—'}</p></div>
                <div class="col-4"><p><strong>Project:</strong> ${$('input[readonly][value]').filter((i,el)=>el.parentNode.querySelector('label').textContent==='Project').val() || '—'}</p></div>
                <div class="col-4"><p><strong>Plot No:</strong> ${$('input[readonly][value]').filter((i,el)=>el.parentNode.querySelector('label').textContent==='Plot No').val() || '—'}</p></div>
                </div>
            `;
            break;
        case 'intro-section':
           
            // 1. Grab the raw HTML from CKEditor…
            let introHtml = introEditor ? introEditor.getData() : '';
            // 2. Inject our preview-table class into every <table>
            introHtml = introHtml.replace(
                /<table(?![^>]*\bpreview-table\b)/g,
                '<table class="preview-table"'
            );
            // 3. Wrap it for rendering
            content = `
                <div class="intro-content">
                    ${introHtml}
                </div>
                    `;
            break;
        case 'project-brief-section':
            // 1. Get the raw HTML from CKEditor (if initialized)
            let rawHtml = projectBriefEditor
                ? projectBriefEditor.getData().trim()
                : '';

            // 2. Inject our preview-table class into any <table> tags
            if (rawHtml) {
                rawHtml = rawHtml.replace(
                    /<table(?![^>]*\bpreview-table\b)/g,
                    '<table class="preview-table"'
                );
            }

            // 3. Grab the file input for fallback
            const fileInput = $('#projectBriefFile')[0];
            let body = '';

            // 4. Decide what to render
            if (rawHtml) {
                // Use the rich‐text content (with tables already tagged)
                body = rawHtml;
            }
            else if (fileInput.files && fileInput.files[0]) {
                const f   = fileInput.files[0];
                const url = URL.createObjectURL(f);

                if (f.type.startsWith('image/')) {
                    body = `<img src="${url}" style="max-width:100%;height:auto;">`;
                }
                else if (f.type === 'application/pdf') {
                    // live preview note; actual merge in PDF happens later
                    body = `<p><em>Your uploaded PDF (“${f.name}”) will be appended in the final download.</em></p>`;
                }
                else {
                    body = `<p><a href="${url}" target="_blank">${f.name}</a></p>`;
                }
            }
            else {
                body = '<p><em>No brief or file provided.</em></p>';
            }

            // 5. Wrap it all in your container
            content = `
                <div class="project-brief-content">
                    ${body}
                </div>
            `;
            break;
        

        

        case 'man-month-section':
            content = `
                <table class="preview-table">
                    <thead>
                        <tr>
                            <th>Position/Location</th>
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
                                <td class="preserve-whitespace">${$(this).find('.mm-position').val() || '—'}</td>
                                <td class="preserve-whitespace">${$(this).find('.mm-role').val() || '—'}</td>
                                <td class="preserve-whitespace">${$(this).find('.mm-rate').val() || '—'}</td>
                                <td class="preserve-whitespace">${$(this).find('.mm-allocation').val() || '—'}</td>
                                <td class="preserve-whitespace">${$(this).find('.mm-fee').val() || '—'}</td>
                                <td class="preserve-whitespace">${$(this).find('.mm-remarks').val() || '—'}</td>
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
            const tick ='<span style="font-size:0.9em;">☑️</span>';
            const cross = '<span style="color: #dc3545; font-size: 1.2em;">⨯</span>'; // Red mathematical cross

            content = `
            <table class="preview-table">
                <thead>
                <tr>
                    <th>Service</th>
                    <th>Mandatory</th>
                    <th>Optional</th>
                    <th>In-House</th>
                    <th>External</th>
                    <th>Appointed By Archcorp</th>
                    <th>Appointed By Client</th>
                </tr>
                </thead>
                <tbody>
                ${$('.scope-service-entry').map(function() {
                    const $r = $(this);
                    const svc = $r.find('.scope-service').val() || '—';

                    // Use Unicode symbols for tick and cross with inline color
                    const mand = $r.find('.scope-mandatory').is(':checked') ? tick : cross;
                    const opt  = $r.find('.scope-optional').is(':checked') ? tick : cross;
                    const inh  = $r.find('.scope-inhouse').is(':checked') ? tick : cross;
                    const ext  = $r.find('.scope-external').is(':checked') ? tick : cross;

                    // Only bold "Yes"; leave "No" unbolded
                    const apptArch   = $r.find('.scope-appointed-achcorp').val() || 'No';
                    const archCell   = apptArch === 'Yes'
                    ? '<td class="text-center"><strong>Yes</strong></td>'
                    : '<td class="text-center">No</td>';

                    const apptClient = $r.find('.scope-appointed-client').val() || 'No';
                    const clientCell = apptClient === 'Yes'
                    ? '<td class="text-center"><strong>Yes</strong></td>'
                    : '<td class="text-center">No</td>';

                    return `
                    <tr>
                        <td>${svc}</td>
                        <td class="text-center">${mand}</td>
                        <td class="text-center">${opt}</td>
                        <td class="text-center">${inh}</td>
                        <td class="text-center">${ext}</td>
                        ${archCell}
                        ${clientCell}
                    </tr>
                    `;
                }).get().join('')}
                </tbody>
            </table>`;
            break;



        case 'stages-deliverables-section':
            let raw = window.deliverablesEditor
                ? window.deliverablesEditor.getData().trim()
                : '';

            if (raw) {
                // 1. Ensure <table> has class="preview-table"
                raw = raw.replace(
                /<table(?![^>]*class=)/g,
                '<table class="preview-table"'
                );
                raw = raw.replace(
                /<table(?![^>]*preview-table)/g,
                match => match.replace(/class="/, 'class="preview-table ')
                );

                // ✅ 2. Ensure table has inline style to enforce layout
                raw = raw.replace(/<table([^>]*)>/g, (match, attrs) => {
                if (!attrs.includes('style=')) {
                    return `<table${attrs} style="table-layout:fixed;width:100%">`;
                }
                return match;
                });
            } else {
                raw = '<p><em>No stages & deliverables defined.</em></p>';
            }

            content = raw;
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
            let standardHtml = TermsEditor ? TermsEditor.getData() : '';
            // 2. Inject our preview-table class into every <table>
            standardHtml = standardHtml.replace(
                /<table(?![^>]*\bpreview-table\b)/g,
                '<table class="preview-table"'
            );
            content = `
                <div class="terms-content">
                    ${standardHtml}
                </div>`;
            break;
    }

    return content;
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
        $('.man-month-entry').each(function() {
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
                remarks: $(this).find('.scope-remarks').val(),
                archcorp:   $(this).find('.scope-appointed-achcorp').val() || 'No',
                client:   $(this).find('.scope-appointed-client').val() || 'No',
            });
        });
    }

   if (section.attr('id') === 'stages-deliverables-section') {
        data.stagesDeliverables = [];
        $('.stage-deliverable-entry').each(function() {
            data.stagesDeliverables.push({
                stage: $(this).find('.stage-title').val(),
                tasks: $(this).find('.stage-tasks').val(),
                deliverables: $(this).find('.deliverable-name').val(),
                format: $(this).find('.deliverable-format').val(),
                timeline: $(this).find('.deliverable-timeline').val()
            });
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



function replaceImgSrcWithBase64(html) {
    // Only for your specific logo path; can be extended for more images.
    const logoDataURL = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAACkAAAAHACAYAAABHGawxAAABgGlDQ1BJQ0MgUHJvZmlsZQAASImVlwdUU0kYx9+9R8QvQ0NJCQhJSopCglJTWmUlJSqIqKCgoIwoKSmpKQhKSEpMRGBiAgkKwIv6+rs6hASlO+/nvWfnfuO/55z7zr3nHu43aP9HnZDLgjA0KgmCTUGkOQ8ThBJqEImJACJKoiESdRkwlNjoAiIxSwSBUQu7AfRk2xnJMjDsODzTjxA4Q83JnLuikxiVIsA1EIfUlfAvkBvPZQFkItKqQ7IkMwR2wtKi+hEZbA1AfwtyzxWm7GhQHctJjPVBBkJUuBkiFiiw6iy+I3yj1Z4qlrRL3iN8O9EomU8IFC7f8U4gAEswA8cLP9uxHGHif9ItJ+92ByADwL8BZZs4STVQp3iEc74Tu9bHyv0q6jP54vwDwBhR0QPpU4+E4nOV5ZJm7wrnHGRMu+F05PdSt5o5i7hrNxJ04tID4CB+AFDhMR4OxkN8AAAAJcEhZcwAALiMAAC4jAXilP3YAAAJXSURBVHhe7drRDYJAEAXg6xny62nY9RcbDkS0JkCTssPMEAAAAAAADw7DLs8Yay6EmQlvuyc2M0kY4+jfaG14SlZtFJckZrhtxf/66l5VtUSxA2Zwq5ykhnLUaS4vAXG9DJc3IVR9hhkUS7TgJQ7RmsyNOoRUqSn+f8EptkUwT8YkeS/A/H/EblBaMZEoAOVyrE5ylZ7qSqkFwPhZK83Ag+XitvFKKheALlqL0L0swSUZpYTkKQYrBJi+v+yKBRVSBSlBoRYrpNLko6R4CBTlEKQ9TPwYFJl5ojAfEuUgpCkOdYAUapPkFzCGI/wA5lhIAelJQmlKaFAcOKULZSGgFP4FCoQkVU4jAog+BUvhwAot4iKQZBTiFwOAIj7L3NL5/gmnKooMoJSf8yZmyYED9CGP6h5BTnoAAAAAAAAAAAAAAOB4B4FSAAE/6qx2AAAAAElFTkSuQmCC'; // your base64 here
    return html.replace(/<img[^>]+src=['"]\.\/assets\/pdf\/archcorp logo\.png['"][^>]*>/g,
                        `<img src="${logoDataURL}" class="preview-logo-top-right" alt="Logo">`);
}

function getSectionHtmlAndOrientation($sec) {
    const id = $sec.attr('id');
    // Only "stages-deliverables-section" is landscape
    const orientation = (id === 'stages-deliverables-section') ? 'landscape' : 'portrait';

    if (id === 'cover-section') {
        // Build cover page using current form values
        const title = $('#proposalTitle').val() || 'Consultancy Services Proposal';
        const client = $('#clientName').val() || 'Client Name';
        const address = $('#projectAddress').val() || 'Project Address';
        const date = $('#proposalDate').val() || new Date().toLocaleDateString();

        const html = `
            <div class="pdf-page cover-page" data-sec="cover-section">
                <div class="cover-content">
                    <h1 class="cover-title mb-4">${title}</h1>
                    <div class="client-info mb-3">Prepared for: ${client}</div><br>
                    <div class="project-info mb-3">Project Address: ${address}</div><br>
                    <div class="date-info">Date: ${date}</div>
                </div>
            </div>

        `;
        
        return { html, orientation };
    }


    // Get section title (first h2)
    const sectionTitle = $sec.find('h2').first().text();
    // Generate content - use your app's function
    let sectionContent = '';
    if (typeof generateSectionContent === 'function') {
        sectionContent = generateSectionContent($sec);
    } else {
        // Fallback: just use HTML inside section
        sectionContent = $sec.html();
    }
    // Compose page HTML
    const html = `
        <div class="pdf-page${orientation === 'landscape' ? ' landscape' : ''}" data-sec="${id}">
            <div class="section-header"><h2>${sectionTitle}</h2></div>
            <div class="section-content">${sectionContent}</div>
        </div>
    `;
    return { html, orientation };
}

// Collect all checked/active sections to export
function getSectionsForPDF() {
    const sections = [];
    $('.proposal-section').each(function() {
        const $sec = $(this);
        // Only include if checked (or adapt to your logic)
        const isChecked = $sec.find('.section-live-preview').is(':checked');
        if (!isChecked) return;
        sections.push(getSectionHtmlAndOrientation($sec));
    });
    return sections;
}

function buildProposalHtml() {
    // Get all included sections (with .section-live-preview checked)
    const includedSections = Array.from(document.querySelectorAll('.proposal-section')).filter(section => {
        const cb = section.querySelector('.section-live-preview');
        return cb && cb.checked;
    });

    let htmlSections = '';

    includedSections.forEach((section, idx) => {
        const $section = $(section);
        const titleEl = section.querySelector('h2, h1');
        const sectionTitle = titleEl ? titleEl.innerText : 'Section';
        const sectionContent = generateSectionContent($section);

        // Cover Page
        if (idx === 0 && section.id === 'cover-section') {
            htmlSections += `
                <div class="section pdf-section cover-page">
                    <div class="cover-content">
                        <div style="font-size:2.5rem;">${section.querySelector('#proposalTitle') ? section.querySelector('#proposalTitle').value : 'Consultancy Services Proposal'}</div>
                        <div style="margin-top:40px; font-size:1.2rem;">
                            <b>Prepared for:</b> ${section.querySelector('#clientName') ? section.querySelector('#clientName').value : ''}<br>
                            <b>Project Address:</b> ${section.querySelector('#projectAddress') ? section.querySelector('#projectAddress').value : ''}<br>
                            <b>Date:</b> ${section.querySelector('#proposalDate') ? section.querySelector('#proposalDate').value : ''}
                        </div>
                    </div>
                </div>
            `;
        } else {
            // Other sections
            htmlSections += `
                <div class="section pdf-section">
                    <div class="section-title">${sectionTitle}</div>
                    <hr class="hr" />
                    <div class="section-content">${sectionContent}</div>
                </div>
            `;
        }

        // Add page break if not the last included section
        if (idx < includedSections.length - 1) {
            htmlSections += `<div class="page-break"></div>`;
        }
    });

    // Compose final HTML
    return `
        <html>
        <head>
        <style>
            body { 
                font-family: 'Arial','Georgia', serif; 
                color: #333;
                line-height: 1.6;
                margin: 0;
                padding: 40px 0;
            }
            .cover-content {
                min-height: 50vh;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                text-align: center;
                padding: 20px;
                max-width: 800px;
                width: 100%;
                page-break-after: always;
            }

            .section-title {
                font-size: 1.8rem;
                font-weight: 600;
                color: #2c3e50;
                margin-bottom: 1.2rem;
                padding-bottom: 0.4rem;
                border-bottom: 2px solid #3498db;
                text-transform: uppercase;
                letter-spacing: 1px;
            }
            .logo { 
                margin-bottom: 40px;
                width: 150px;
                opacity: 0.9;
            }
            .section.pdf-section {
                max-width: 680px;
                margin: 0 auto;
                padding: 40px 0;
                page-break-after: always;
            }
            .section-content {
                font-size: 1rem;
                text-align: justify;               
            }                
            .hr {
                border: none;
                border-top: 1px solid #ddd;
                margin: 2rem 0;
            }
            
            table {
                width: 100%;
                border-collapse: collapse;
                margin: 1.5rem 0;
                box-shadow: 0 1px 3px rgba(0,0,0,0.1);              
            }
            th {
                background-color: #2c3e50;
                color: white;
                padding: 0.8rem;
                text-align: left;
                font-weight: 600;
            }
            td {
                padding: 0.8rem;
                border-bottom: 1px solid #ecf0f1;
                vertical-align: top;
            }
            tr:nth-child(even) {
                background-color: #f8f9fa;
            }
            .cover-title {
                font-size: 2.8rem;
                color: #2c3e50;
                margin-bottom: 1.5rem;
                text-align: center;
                line-height: 1.2;
                font-weight: 300;
            }
            .cover-title {
                font-size: 2.5rem;
                font-weight: 600;
                color: #2c3e50;
                margin-bottom: 40px;
            }

            .client-info {
                font-size: 1.2rem;
                line-height: 1.8;
            }
            .project-details {
                margin-top: 4rem;
                font-size: 1.05rem;
            }
            @page {
                size: A4;
                margin: 20mm;
            }
            


            


        </style>
        </head>
        <body>
        ${htmlSections}
        </body>
        </html>
        `;

}


// Function that actually generates the PDF, when clicked on download button
// async function generatePDF() {

//     // 1. Get included sections (those with checked 'Include in Proposal')
//     let sectionsHtml = '';
//     document.querySelectorAll('.proposal-section').forEach(section => {
//         const checkbox = section.querySelector('.section-live-preview');
//         if (checkbox && checkbox.checked) {
//             // Extract title (first h2, or customize as needed)
//             const titleEl = section.querySelector('h2, h1');
//             const sectionTitle = titleEl ? titleEl.innerText : 'Section';
//             // Remove buttons, inputs, file pickers, etc.:
//             const clone = section.cloneNode(true);
//             // Remove controls
//             clone.querySelectorAll('input,button,textarea,select,label').forEach(el => el.remove());
//             // Clean up excess margin if needed:
//             clone.style.margin = '0 auto';
//             // Section content (without controls)
//             let sectionContent = clone.innerHTML.trim();

//             sectionsHtml += `
//                 <div class="section pdf-section">
//                     <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAACkAAAAHACAYAAABHGawxAAABgGlDQ1BJQ0MgUHJvZmlsZQAASImVlwdUU0kYx9+9R8QvQ0NJCQhJSopCglJTWmUlJSqIqKCgoIwoKSmpKQhKSEpMRGBiAgkKwIv6+rs6hASlO+/nvWfnfuO/55z7zr3nHu43aP9HnZDLgjA0KgmCTUGkOQ8ThBJqEImJACJKoiESdRkwlNjoAiIxSwSBUQu7AfRk2xnJMjDsODzTjxA4Q83JnLuikxiVIsA1EIfUlfAvkBvPZQFkItKqQ7IkMwR2wtKi+hEZbA1AfwtyzxWm7GhQHctJjPVBBkJUuBkiFiiw6iy+I3yj1Z4qlrRL3iN8O9EomU8IFC7f8U4gAEswA8cLP9uxHGHif9ItJ+92ByADwL8BZZs4STVQp3iEc74Tu9bHyv0q6jP54vwDwBhR0QPpU4+E4nOV5ZJm7wrnHGRMu+F05PdSt5o5i7hrNxJ04tID4CB+AFDhMR4OxkN8AAAAJcEhZcwAALiMAAC4jAXilP3YAAAJXSURBVHhe7drRDYJAEAXg6xny62nY9RcbDkS0JkCTssPMEAAAAAAADw7DLs8Yay6EmQlvuyc2M0kY4+jfaG14SlZtFJckZrhtxf/66l5VtUSxA2Zwq5ykhnLUaS4vAXG9DJc3IVR9hhkUS7TgJQ7RmsyNOoRUqSn+f8EptkUwT8YkeS/A/H/EblBaMZEoAOVyrE5ylZ7qSqkFwPhZK83Ag+XitvFKKheALlqL0L0swSUZpYTkKQYrBJi+v+yKBRVSBSlBoRYrpNLko6R4CBTlEKQ9TPwYFJl5ojAfEuUgpCkOdYAUapPkFzCGI/wA5lhIAelJQmlKaFAcOKULZSGgFP4FCoQkVU4jAog+BUvhwAot4iKQZBTiFwOAIj7L3NL5/gmnKooMoJSf8yZmyYED9CGP6h5BTnoAAAAAAAAAAAAAAOB4B4FSAAE/6qx2AAAAAElFTkSuQmCC"
//                          class="logo" />
//                     <div class="section-title">${sectionTitle}</div>
//                     <hr class="hr" />
//                     <div class="section-content">${sectionContent}</div>
//                 </div>
//                 <div class="page-break"></div>
//             `;
//         }
//     });

    
//     const printHtml = buildProposalHtml();

//     // 3. POST to Puppeteer server
//     fetch('http://localhost:5000/api/generate-pdf', {
//         method: 'POST',
//         headers: { 'Content-Type': 'text/html' },
//         body: printHtml
//     })
//     .then(response => {
//         if (!response.ok) throw new Error('PDF generation failed');
//         return response.blob();
//     })
//     .then(blob => {
//         const url = window.URL.createObjectURL(blob);
//         const a = document.createElement('a');
//         a.href = url;
//         a.download = 'proposal.pdf';
//         document.body.appendChild(a);
//         a.click();
//         document.body.removeChild(a);
//         window.URL.revokeObjectURL(url);
//     })
//     .catch(err => {
//         alert('Error generating PDF: ' + err.message);
//     });
// }

async function generatePDF() {
    const sections = getSectionsForPDF();
    if (!sections.length) {
        alert('No sections selected!');
        return;
    }
    try {
        const resp = await fetch('http://localhost:5000/api/generate-mixed-pdf', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(sections)
        });
        if (!resp.ok) throw new Error('PDF generation failed');
        const blob = await resp.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'proposal.pdf';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    } catch (err) {
        alert('Error generating PDF: ' + err.message);
    }
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

        initTextareas();

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

    $('#projectBriefFile').on('change', function() {
        const file = this.files[0];
        const preview = $('#projectBriefFilePreview');
        preview.empty();

        if (!file) {
            preview.hide();
            return;
        }

        const url = URL.createObjectURL(file);
        let html = '';

        if (file.type.startsWith('image/')) {
            html = `<img src="${url}" alt="${file.name}" style="max-width:100%;">`;
        } else if (file.type === 'application/pdf') {
            html = `
            <object data="${url}"
                    type="application/pdf"
                    width="100%" height="300px">
                <p>Download: <a href="${url}">${file.name}</a></p>
            </object>`;
        } else {
            html = `<p><a href="${url}" download="${file.name}">${file.name}</a></p>`;
        }

        preview.html(html).show();
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

    // Add a new Project Brief row
    $('.add-brief-entry').click(function() {
    const newRow = $('.project-brief-entry').first().clone();
    newRow.find('input').each(function() {
        if (this.type === 'checkbox') this.checked = false;
        else this.value = '';
    });
    $('.project-brief-entries').append(newRow);
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
   
    // Add Stage Deliverable Entry
    $('.add-stage-deliverable').click(function() {
        const newEntry = $('.stage-deliverable-entry').first().clone();
        newEntry.find('textarea').val('');
        $('.stages-deliverables-entries').append(newEntry);
        initTextareas(); // Initialize the new textareas
    });

    // Remove Stage Deliverable Entry
    $(document).on('click', '.remove-stage-deliverable', function() {
        if ($('.stage-deliverable-entry').length > 1) {
            $(this).closest('.stage-deliverable-entry').remove();
        } else {
            alert('At least one stage is required.');
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

            // —— start cover-page special case ——
            if (id === 'cover-section') {
                html += `
                    <div class="pdf-page text-center" data-sec="cover-section">
                        <h1>${$('#proposalTitle').val() || 'Consultancy Services Proposal'}</h1>
                        <p><strong>Prepared for:</strong> ${$('#clientName').val() || 'Client Name'}</p>
                        <p><strong>Project Address:</strong> ${$('#projectAddress').val() || 'Project Address'}</p>
                        <p><strong>Date:</strong> ${$('#proposalDate').val() || new Date().toLocaleDateString()}</p>
                    </div>
                `;
                pageNum++;
                continue;
            }

            // —— LANDSCAPE support: set extra class if section should be landscape ——
            let extraClass = '';
            if (id === 'stages-deliverables-section') {
                extraClass = 'landscape';
            }

            // 1️⃣ Build the section’s own HTML page
            html += `
            <div class="pdf-page ${extraClass}" data-sec="${id}">
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
                                    <object data="${url}" type="application/pdf" width="100%" height="300px">
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
                                    <object data="${url}" type="application/pdf" width="100%" height="300px">
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
            // // Hook download buttons
            // document.getElementById('downloadBtn').addEventListener('click', generatePDF);
            // document.getElementById('downloadFromPreview').addEventListener('click', generatePDF);
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

    // Add Man Month Entry
    $('.add-man-month').click(function() {
        const newEntry = $('.man-month-entry').first().clone();
        newEntry.find('textarea').val('');
        $('.man-month-entries').append(newEntry);
        initTextareas(); // Initialize the new textareas
    });

    // Remove Man Month Entry
    $(document).on('click', '.remove-man-month', function() {
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

    
});