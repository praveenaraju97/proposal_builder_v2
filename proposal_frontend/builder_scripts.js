$(document).ready(function() {

    // Initial proposal section selector
    $('#sectionSelectForm').submit(function (e) {
        e.preventDefault();

        const selectedSections = [];
        const sidebarList = $('#proposalSections');
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
    $('#proposalSections a').click(function(e) {
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
    $('#previewBtn').click(function() {
        generatePreview();
        $('#previewModal').modal('show');
    });
    
    // Download from preview
    $('#downloadFromPreview').click(function() {
        generateWordDocument();
    });
    
    // Direct download
    $('#downloadBtn').click(function() {
        generatePreview();
        generateWordDocument();
    });
    
    // Toggle live preview
    $('#togglePreview').change(function() {
        if($(this).is(':checked')) {
            // Set up live preview
            $('.wysiwyg, input, textarea').on('input change', generatePreview);
        } else {
            // Remove live preview
            $('.wysiwyg, input, textarea').off('input change', generatePreview);
        }
    });

    // Updated generatePreview()
    function generatePreview() {
        let previewHtml = `
            <div class="preview-header">
                ${/* Original cover content */''}
                <img src="logo.png" alt="Company Logo" class="preview-logo">
                <h1>${$('#proposalTitle').val() || 'Architecture Proposal'}</h1>
                <p>Prepared for: ${$('#clientName').val() || 'Client Name'}</p>
                <p>Project Address: ${$('#projectAddress').val() || 'Not specified'}</p>
                <p>Date: ${$('#proposalDate').val() || new Date().toLocaleDateString()}</p>
            </div>

            <!-- New Agreement Overview -->
            <h2>Agreement Overview</h2>
            <div class="row">
                <div class="col-md-6">
                    <h3>Client Details</h3>
                    <p><strong>Name:</strong> ${$('#clientNameFull').val()}</p>
                    <p><strong>Representative:</strong> ${$('#clientRep').val()}</p>
                    <p><strong>Email:</strong> ${$('#clientEmail').val()}</p>
                </div>
                <div class="col-md-6">
                    <h3>Consultant Details</h3>
                    <p><strong>Name:</strong> ${$('#consultantName').val()}</p>
                    <p><strong>Representative:</strong> ${$('#consultantRep').val()}</p>
                    <p><strong>Phone:</strong> ${$('#consultantPhone').val()}</p>
                </div>
            </div>
            <div class="row">
                <div class="col-md-4">
                    <p><strong>Date:</strong> 08 June 2023</p>
                </div>
                <div class="col-md-4">
                    <p><strong>Project:</strong> BOB2 Jumeirah Garden City</p>
                </div>
                <div class="col-md-4">
                    <p><strong>Plot No:</strong> 3347643</p>
                </div>
            </div>

            <!-- Constituent Documents -->
            <h2>Constituent Documents</h2>
            <ul>
                ${$('#letterOffer').is(':checked') ? '<li>Letter of Offer & Acceptance</li>' : ''}
                ${$('#mainAgreement').is(':checked') ? '<li>Main Agreement Body</li>' : ''}
                <li>Appendix A: Scope of Services</li>
                <li>Appendix B: Remuneration and Payment</li>
                <li>Appendix C: Services of Others & Facilities</li>
            </ul>

            ${/* Original preview content */''}
        `;

        // Design Payment Stages Preview
        previewHtml += `
            <h2>Design Payment Stages</h2>
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
        `;

        $('.design-payment-entry').each(function() {
            const stage = $(this).find('.design-stage').val() || '';
            const percentage = $(this).find('.design-percentage').val() || '';
            const submission = $(this).find('.design-submission').val() || '';
            const approval = $(this).find('.design-approval').val() || '';

            previewHtml += `
                <tr>
                    <td>${stage}</td>
                    <td>${percentage}</td>
                    <td>${submission}</td>
                    <td>${approval}</td>
                </tr>
            `;
        });

        previewHtml += `
                </tbody>
            </table>
        `;

        // // Additional Service Rates Preview
        // previewHtml += `
        //     <h2>Schedule of Rates for Additional Service</h2>
        //     <table class="preview-table">
        //         <thead>
        //             <tr>
        //                 <th>Position</th>
        //                 <th>AED/Hour</th>
        //                 <th>Construction Stage Role</th>
        //             </tr>
        //         </thead>
        //         <tbody>
        // `;

        // $('.additional-rate-entry').each(function() {
        //     const position = $(this).find('.rate-position').val() || '';
        //     const hourly = $(this).find('.rate-hourly').val() || '';
        //     const role = $(this).find('.rate-const-role').val() || '';

        //     previewHtml += `
        //         <tr>
        //             <td>${position}</td>
        //             <td>${hourly}</td>
        //             <td>${role}</td>
        //         </tr>
        //     `;
        // });

        // previewHtml += `
        //         </tbody>
        //     </table>
        // `;
        previewHtml += `
            <h2>Schedule of Rates for Additional Service</h2>

            <h4>Design Stage</h4>
            <table class="preview-table">
                <thead>
                    <tr>
                        <th>Position</th>
                        <th>AED/Hour</th>
                    </tr>
                </thead>
                <tbody>
        `;

        $('.design-service-rates .additional-rate-entry').each(function () {
            const position = $(this).find('.rate-position').val() || '';
            const hourly = $(this).find('.rate-hourly').val() || '';
            previewHtml += `
                <tr>
                    <td>${position}</td>
                    <td>${hourly}</td>
                </tr>
            `;
        });

        previewHtml += `
                </tbody>
            </table>

            <h4>Construction Stage</h4>
            <table class="preview-table">
                <thead>
                    <tr>
                        <th>Position</th>
                        <th>AED/Hour</th>
                    </tr>
                </thead>
                <tbody>
        `;

        $('.construction-service-rates .additional-rate-entry').each(function () {
            const position = $(this).find('.rate-position').val() || '';
            const hourly = $(this).find('.rate-hourly').val() || '';
            previewHtml += `
                <tr>
                    <td>${position}</td>
                    <td>${hourly}</td>
                </tr>
            `;
        });
        previewHtml += `
                </tbody>
            </table>
        `;
        // Man Month Deployment Preview
        previewHtml += `
            <h2>Man Month Rates and Proposed Deployment</h2>
            <table class="preview-table">
                <thead>
                    <tr>
                        <th>Position / Location</th>
                        <th>Role</th>
                        <th>Man Month Rate</th>
                        <th>Allocation</th>
                        <th>Proposed Monthly Fee</th>
                        <th>Remarks</th>
                    </tr>
                </thead>
                <tbody>
        `;

        $('.man-month-entry').each(function () {
            const pos = $(this).find('.mm-position').val() || '';
            const role = $(this).find('.mm-role').val() || '';
            const rate = $(this).find('.mm-rate').val() || '';
            const alloc = $(this).find('.mm-allocation').val() || '';
            const fee = $(this).find('.mm-fee').val() || '';
            const rem = $(this).find('.mm-remarks').val() || '';

            previewHtml += `
                <tr>
                    <td>${pos}</td>
                    <td>${role}</td>
                    <td>${rate}</td>
                    <td>${alloc}</td>
                    <td>${fee}</td>
                    <td>${rem}</td>
                </tr>
            `;
        });
        previewHtml += `
                </tbody>
            </table>
        `;

        $('#previewContent').html(previewHtml);

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

    // Original event handlers
    // ...
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

    const API_BASE_URL = 'http://localhost:5000/api';

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

    // Additional Service Rate - Add Entry
    // $('.add-additional-rate').click(function() {
    //     const newRate = $('.additional-rate-entry').first().clone();
    //     newRate.find('input').val('');
    //     $('.additional-service-rates').append(newRate);
    // });

    // // Remove Additional Rate Entry
    // $(document).on('click', '.remove-additional-rate', function() {
    //     if ($('.additional-rate-entry').length > 1) {
    //         $(this).closest('.additional-rate-entry').remove();
    //     } else {
    //         alert('At least one rate is required.');
    //     }
    // });
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

});