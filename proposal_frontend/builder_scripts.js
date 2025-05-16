$(document).ready(function() {
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
});