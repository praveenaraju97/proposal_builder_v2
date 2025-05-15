const API_BASE_URL = 'http://localhost:5000/api';

$(document).ready(function() {
    // Initialize sections
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
    
    // Generate preview content
    function generatePreview() {
        let previewHtml = `
            <div class="preview-header">
                <img src="logo.png" alt="Company Logo" class="preview-logo">
                <h1>${$('#proposalTitle').val() || 'Architecture Proposal'}</h1>
                <p>Prepared for: ${$('#clientName').val() || 'Client Name'}</p>
                <p>Project Address: ${$('#projectAddress').val() || 'Not specified'}</p>
                <p>Date: ${$('#proposalDate').val() || new Date().toLocaleDateString()}</p>
            </div>
            
            <h2>Introduction</h2>
            ${$('#companyOverview').val() || '<p>Company overview goes here.</p>'}
            
            <h2>Project Understanding</h2>
            ${$('#projectUnderstanding').val() || '<p>Project understanding description goes here.</p>'}
            
            <h2>Project Scope</h2>
        `;
        
        // Add scope items
        $('.scope-item').each(function() {
            const title = $(this).find('.scope-title').val();
            const description = $(this).find('.scope-description').val();
            
            if(title || description) {
                previewHtml += `
                    <h3>${title || 'Scope Item'}</h3>
                    <p>${description || 'Description of this scope item.'}</p>
                `;
            }
        });
        
        // Our Approach
        previewHtml += `
            <h2>Our Approach</h2>
            <h3>Design Philosophy</h3>
            ${$('#designPhilosophy').val() || '<p>Our design philosophy description.</p>'}
            
            <h3>Methodology</h3>
            ${$('#methodology').val() || '<p>Our project methodology description.</p>'}
            
            <h3>Key Differentiators</h3>
            ${$('#differentiators').val() || '<p>What makes our approach unique.</p>'}
        `;
        
        // Our Team
        previewHtml += `<h2>Our Team</h2>`;
        
        $('.team-member').each(function() {
            const name = $(this).find('.member-name').val();
            const role = $(this).find('.member-role').val();
            const bio = $(this).find('.member-bio').val();
            
            if(name || role || bio) {
                previewHtml += `
                    <h3>${name || 'Team Member'}</h3>
                    <p><strong>Role:</strong> ${role || 'Not specified'}</p>
                    <p>${bio || 'Bio not provided.'}</p>
                `;
            }
        });
        
        // Timeline
        previewHtml += `
            <h2>Project Timeline</h2>
            <p><strong>Start Date:</strong> ${$('#projectStartDate').val() || 'Not specified'}</p>
            <p><strong>Duration:</strong> ${$('#projectDuration').val() || 'Not specified'}</p>
            
            <h3>Milestones</h3>
        `;
        
        $('.milestone').each(function() {
            const name = $(this).find('.milestone-name').val();
            const start = $(this).find('.milestone-start').val();
            const end = $(this).find('.milestone-end').val();
            const deliverables = $(this).find('.milestone-deliverables').val();
            
            if(name || start || end || deliverables) {
                previewHtml += `
                    <h4>${name || 'Milestone'}</h4>
                    <p><strong>Dates:</strong> ${start || 'Not specified'} to ${end || 'Not specified'}</p>
                    <p><strong>Deliverables:</strong> ${deliverables || 'Not specified'}</p>
                `;
            }
        });
        
        // Budget
        previewHtml += `
            <h2>Project Budget</h2>
            <p><strong>Total Budget:</strong> $${$('#totalBudget').val() || '0.00'}</p>
            
            <table class="preview-table">
                <thead>
                    <tr>
                        <th>Item Description</th>
                        <th>Quantity</th>
                        <th>Unit Cost</th>
                        <th>Total</th>
                    </tr>
                </thead>
                <tbody>
        `;
        
        let grandTotal = 0;
        
        $('.budget-item').each(function() {
            const desc = $(this).find('.budget-description').val();
            const qty = $(this).find('.budget-quantity').val() || 0;
            const unit = $(this).find('.budget-unit-cost').val() || 0;
            const total = (qty * unit).toFixed(2);
            
            if(desc || qty || unit) {
                previewHtml += `
                    <tr>
                        <td>${desc || 'Item'}</td>
                        <td>${qty}</td>
                        <td>$${unit}</td>
                        <td>$${total}</td>
                    </tr>
                `;
                
                grandTotal += parseFloat(total);
            }
        });
        
        previewHtml += `
                    <tr class="budget-total-row">
                        <td colspan="3" style="text-align: right;"><strong>Total:</strong></td>
                        <td><strong>$${grandTotal.toFixed(2)}</strong></td>
                    </tr>
                </tbody>
            </table>
            
            <h3>Payment Schedule</h3>
            ${$('#paymentSchedule').val() || '<p>Payment schedule details not provided.</p>'}
        `;
        
        // Terms
        previewHtml += `
            <h2>Terms & Conditions</h2>
            ${$('#standardTerms').val() || '<p>Standard terms and conditions.</p>'}
            
            <h3>Additional Notes</h3>
            ${$('#additionalNotes').val() || '<p>No additional notes.</p>'}
        `;
        
        // Add footer
        previewHtml += `
            <div class="preview-footer">
                <p>${$('#companyName').val() || 'Architecture Company'} | ${$('#companyAddress').val() || '123 Design St, Creative City'}</p>
                <p>Phone: ${$('#companyPhone').val() || '(123) 456-7890'} | Email: ${$('#companyEmail').val() || 'info@architecture.com'}</p>
            </div>
        `;
        
        $('#previewContent').html(previewHtml);
    }
    
    // Generate Word document
    function generateWordDocument() {
        // We'll use the docx.js library to create a Word document
        const { Document, Paragraph, TextRun, HeadingLevel, Packer, Table, TableRow, TableCell, WidthType, AlignmentType } = docx;
        
        // Create document content based on form inputs
        const doc = new Document({
            styles: {
                paragraphStyles: [
                    {
                        id: "Normal",
                        name: "Normal",
                        run: {
                            size: 24, // 12pt
                            font: "Times New Roman"
                        },
                        paragraph: {
                            spacing: {
                                line: 276, // 1.15 line spacing
                            }
                        }
                    },
                    {
                        id: "Heading1",
                        name: "Heading 1",
                        basedOn: "Normal",
                        next: "Normal",
                        run: {
                            size: 48, // 24pt
                            bold: true,
                            color: "2E74B5"
                        },
                        paragraph: {
                            spacing: {
                                before: 240, // 12pt before
                                after: 120 // 6pt after
                            }
                        }
                    },
                    {
                        id: "Heading2",
                        name: "Heading 2",
                        basedOn: "Normal",
                        next: "Normal",
                        run: {
                            size: 36, // 18pt
                            bold: true,
                            color: "2E74B5"
                        },
                        paragraph: {
                            spacing: {
                                before: 240, // 12pt before
                                after: 120 // 6pt after
                            }
                        }
                    },
                    {
                        id: "Heading3",
                        name: "Heading 3",
                        basedOn: "Normal",
                        next: "Normal",
                        run: {
                            size: 30, // 15pt
                            bold: true
                        },
                        paragraph: {
                            spacing: {
                                before: 240, // 12pt before
                                after: 120 // 6pt after
                            }
                        }
                    }
                ]
            },
            sections: [{
                properties: {},
                children: [
                    // Cover page
                    new Paragraph({
                        text: $('#proposalTitle').val() || "Architecture Proposal",
                        heading: HeadingLevel.HEADING_1,
                        alignment: AlignmentType.CENTER,
                        spacing: {
                            after: 400
                        }
                    }),
                    new Paragraph({
                        text: "Prepared for:",
                        alignment: AlignmentType.CENTER
                    }),
                    new Paragraph({
                        text: $('#clientName').val() || "Client Name",
                        alignment: AlignmentType.CENTER,
                        bold: true
                    }),
                    new Paragraph({
                        text: "Project Address: " + ($('#projectAddress').val() || "Not specified"),
                        alignment: AlignmentType.CENTER
                    }),
                    new Paragraph({
                        text: "Date: " + ($('#proposalDate').val() || new Date().toLocaleDateString()),
                        alignment: AlignmentType.CENTER,
                        spacing: {
                            after: 400
                        }
                    }),
                    
                    // Introduction
                    new Paragraph({
                        text: "Introduction",
                        heading: HeadingLevel.HEADING_1
                    }),
                    new Paragraph({
                        text: $('#companyOverview').val() || "Company overview goes here.",
                        spacing: {
                            after: 200
                        }
                    }),
                    
                    // Project Understanding
                    new Paragraph({
                        text: "Project Understanding",
                        heading: HeadingLevel.HEADING_1
                    }),
                    new Paragraph({
                        text: $('#projectUnderstanding').val() || "Project understanding description goes here.",
                        spacing: {
                            after: 200
                        }
                    }),
                    
                    // Project Scope
                    new Paragraph({
                        text: "Project Scope",
                        heading: HeadingLevel.HEADING_1
                    }),
                    // Add scope items dynamically
                    ...generateScopeItemsForDocx(),
                    
                    // Our Approach
                    new Paragraph({
                        text: "Our Approach",
                        heading: HeadingLevel.HEADING_1
                    }),
                    new Paragraph({
                        text: "Design Philosophy",
                        heading: HeadingLevel.HEADING_2
                    }),
                    new Paragraph({
                        text: $('#designPhilosophy').val() || "Our design philosophy description.",
                        spacing: {
                            after: 200
                        }
                    }),
                    new Paragraph({
                        text: "Methodology",
                        heading: HeadingLevel.HEADING_2
                    }),
                    new Paragraph({
                        text: $('#methodology').val() || "Our project methodology description.",
                        spacing: {
                            after: 200
                        }
                    }),
                    new Paragraph({
                        text: "Key Differentiators",
                        heading: HeadingLevel.HEADING_2
                    }),
                    new Paragraph({
                        text: $('#differentiators').val() || "What makes our approach unique.",
                        spacing: {
                            after: 200
                        }
                    }),
                    
                    // Our Team
                    new Paragraph({
                        text: "Our Team",
                        heading: HeadingLevel.HEADING_1
                    }),
                    ...generateTeamMembersForDocx(),
                    
                    // Timeline
                    new Paragraph({
                        text: "Project Timeline",
                        heading: HeadingLevel.HEADING_1
                    }),
                    new Paragraph({
                        text: "Start Date: " + ($('#projectStartDate').val() || "Not specified"),
                        spacing: {
                            after: 100
                        }
                    }),
                    new Paragraph({
                        text: "Duration: " + ($('#projectDuration').val() || "Not specified"),
                        spacing: {
                            after: 200
                        }
                    }),
                    new Paragraph({
                        text: "Milestones",
                        heading: HeadingLevel.HEADING_2
                    }),
                    ...generateMilestonesForDocx(),
                    
                    // Budget
                    new Paragraph({
                        text: "Project Budget",
                        heading: HeadingLevel.HEADING_1
                    }),
                    new Paragraph({
                        text: "Total Budget: $" + ($('#totalBudget').val() || "0.00"),
                        spacing: {
                            after: 200
                        }
                    }),
                    // Budget table
                    ...generateBudgetTableForDocx(),
                    new Paragraph({
                        text: "Payment Schedule",
                        heading: HeadingLevel.HEADING_2
                    }),
                    new Paragraph({
                        text: $('#paymentSchedule').val() || "Payment schedule details not provided.",
                        spacing: {
                            after: 200
                        }
                    }),
                    
                    // Terms
                    new Paragraph({
                        text: "Terms & Conditions",
                        heading: HeadingLevel.HEADING_1
                    }),
                    new Paragraph({
                        text: $('#standardTerms').val() || "Standard terms and conditions.",
                        spacing: {
                            after: 200
                        }
                    }),
                    new Paragraph({
                        text: "Additional Notes",
                        heading: HeadingLevel.HEADING_2
                    }),
                    new Paragraph({
                        text: $('#additionalNotes').val() || "No additional notes.",
                        spacing: {
                            after: 200
                        }
                    }),
                    
                    // Footer
                    new Paragraph({
                        text: $('#companyName').val() || "Architecture Company",
                        alignment: AlignmentType.CENTER,
                        spacing: {
                            before: 400
                        }
                    }),
                    new Paragraph({
                        text: $('#companyAddress').val() || "123 Design St, Creative City",
                        alignment: AlignmentType.CENTER
                    }),
                    new Paragraph({
                        text: "Phone: " + ($('#companyPhone').val() || "(123) 456-7890") + " | Email: " + ($('#companyEmail').val() || "info@architecture.com"),
                        alignment: AlignmentType.CENTER
                    })
                ]
            }]
        });
        
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
});