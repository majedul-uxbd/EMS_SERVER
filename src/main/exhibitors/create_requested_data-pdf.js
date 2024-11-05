const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");
const { format } = require("date-fns");

/**
 * Calculate the height needed for text in a cell
 */
const calculateCellHeight = (doc, text, width, padding, options = {}) => {
  const isHeader = options.isHeader || false;
  const fontSize = 9;
  const lineHeight = fontSize * 1.2;

  if (isHeader) {
    doc.font("Helvetica-Bold");
  } else {
    doc.font("Helvetica");
  }
  doc.fontSize(fontSize);

  const textString = text || "";
  const textWidth = width - (padding * 2);
  const words = textString.toString().split(' ');
  let lines = [];
  let currentLine = '';

  words.forEach(word => {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    if (doc.widthOfString(testLine) <= textWidth) {
      currentLine = testLine;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  });
  if (currentLine) {
    lines.push(currentLine);
  }

  const contentHeight = lines.length * lineHeight;
  return Math.max(contentHeight + (padding * 2), 30); // Default minimum height
};

/**
 * Draw a table cell with the specified height
 */
const drawTableCell = (doc, text, x, y, width, height, options = {}) => {
  const isHeader = options.isHeader || false;
  const padding = 5;
  const fontSize = 9;

  if (isHeader) {
    doc.font("Helvetica-Bold");
  } else {
    doc.font("Helvetica");
  }
  doc.fontSize(fontSize);

  // Draw cell borders
  doc.lineWidth(0.5)
    .rect(x, y, width, height)
    .stroke();

  // Calculate vertical centering for text
  const textHeight = doc.heightOfString(text || "", { width: width - (padding * 2) });
  const verticalPadding = (height - textHeight) / 2;

  // Draw text with vertical centering
  doc.text(text || "", x + padding, y + verticalPadding, {
    width: width - (padding * 2),
    align: "left",
    lineGap: 2
  });
};

/**
 * Draw a complete row of the table
 */
const drawTableRow = (doc, rowData, colWidths, colPositions, y, options = {}) => {
  const padding = 5;
  let rowHeight;

  if (options.customHeight) {
    // Use custom height if specified
    rowHeight = options.customHeight;
  } else {
    // Calculate height based on content
    let maxHeight = 0;
    rowData.forEach((text, i) => {
      const cellHeight = calculateCellHeight(doc, text, colWidths[i], padding, options);
      maxHeight = Math.max(maxHeight, cellHeight);
    });
    rowHeight = maxHeight;
  }

  // Draw all cells with the determined height
  rowData.forEach((text, i) => {
    drawTableCell(
      doc,
      text,
      colPositions[i] - colWidths[i],
      y,
      colWidths[i],
      rowHeight,
      options
    );
  });

  return rowHeight;
};

/**
 * Generate PDF report for requested visitor data
 */
const generateRequestedVisitorPDF = async (data) => {
  const doc = new PDFDocument({
    size: "A4",
    layout: "landscape",
    margins: { top: 30, bottom: 30, left: 30, right: 30 },
  });

  // Define file path and create directory if it doesn't exist
  const uploadFolder = path.join(process.cwd(), "/uploads/interested_visitors");
  if (!fs.existsSync(uploadFolder)) fs.mkdirSync(uploadFolder, { recursive: true });
  const filePath = path.join(uploadFolder, "Interested_Visitor_List.pdf");

  // Create write stream
  const stream = fs.createWriteStream(filePath);
  doc.pipe(stream);

  // Page dimensions and margin
  const pageWidth = 842;
  const pageHeight = 595;
  const margin = 30;

  // Header and Title
  doc.image(
    path.join(process.cwd(), "/src/common/utilities/images/UXBD_logo.jpg"),
    pageWidth - 105,
    margin - 16,
    { width: 55, align: "right" }
  );
  doc
    .fontSize(16)
    .font("Helvetica-Bold")
    .fillColor("#030663")
    .text("Interested Visitor List", margin, margin + 10);
  doc
    .moveTo(margin, margin + 40)
    .lineTo(pageWidth - margin, margin + 40)
    .stroke();
  doc.fillColor("#000000");

  // Table configuration
  let currentY = margin + 50;
  const colWidths = [35, 110, 100, 75, 85, 85, 130, 130];
  const colLabels = [
    "Serial",
    "Name",
    "Email",
    "Contact No.",
    "Company",
    "Position",
    "Requested Projects",
    "Request Time",
  ];

  const colPositions = colWidths.reduce((acc, width) => {
    acc.push((acc[acc.length - 1] || margin) + width);
    return acc;
  }, []);

  // Draw initial headers
  currentY += drawTableRow(doc, colLabels, colWidths, colPositions, currentY, {
    isHeader: true,
    customHeight: 40 // Fixed height for header row
  });

  // Function to check if a row needs custom height
  const needsCustomHeight = (rowData) => {

    return rowData[6] && rowData[6].length > 40;
  };

  // Draw table rows
  data.forEach((visitor, index) => {
    // Check if we need a new page
    if (currentY + 50 > pageHeight - margin) {
      doc.addPage({
        size: "A4",
        layout: "landscape",
        margins: { top: 30, bottom: 30, left: 30, right: 30 },
      });
      currentY = margin;
      currentY += drawTableRow(doc, colLabels, colWidths, colPositions, currentY, {
        isHeader: true,
        customHeight: 40
      });
    }

    const fullName = `${visitor.f_name || ""} ${visitor.l_name || ""}`.trim();
    const rowData = [
      (index + 1).toString(),
      fullName,
      visitor.email || "",
      visitor.contact_no || "",
      visitor.company_name || "",
      visitor.position || "",
      visitor.project_names,
      format(new Date(visitor.created_at), "MMM dd, yyyy hh:mm:ss a"),
    ];

    // Determine if this row needs custom height
    const customHeight = needsCustomHeight(rowData) ? 80 : undefined; // Set to 80 for rows that need more height

    // Draw the row with optional custom height
    const rowHeight = drawTableRow(doc, rowData, colWidths, colPositions, currentY, {
      customHeight: customHeight
    });

    currentY += rowHeight;
  });

  // Finalize PDF
  doc.end();
  return filePath;
};

module.exports = { generateRequestedVisitorPDF };