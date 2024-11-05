const PDFDocument = require("pdfkit");
const path = require("path");
const { format } = require("date-fns");
const { setRejectMessage } = require("../../common/set-reject-message");
const { API_STATUS_CODE } = require("../../consts/error-status");

// Function to format datetime using date-fns
const formatDateTime = (isoString) => {
	return format(new Date(isoString), "MMM dd, yyyy, hh:mm:ss a");
};

// Modified function to return PDF buffer instead of saving to file
const generatePDF = (data) => {
	return new Promise((resolve, reject) => {
		try {
			const doc = new PDFDocument({
				size: "A4",
				layout: "landscape",
				margins: { top: 30, bottom: 30, left: 30, right: 30 }
			});

			// Create a buffer to store PDF data
			const chunks = [];
			doc.on('data', chunk => chunks.push(chunk));
			doc.on('end', () => resolve(Buffer.concat(chunks)));
			doc.on('error', reject);

			// Header section with logo and title
			doc.image(
				path.join(process.cwd(), "/src/common/utilities/images/UXBD_logo.jpg"),
				710,
				15,
				{
					width: 75,
					align: "right",
				}
			);

			doc
				.fontSize(19)
				.font("Helvetica-Bold")
				.fillColor("#030663")
				.text("List of Requested Documents", 50, 50);
			doc.moveTo(50, 90).lineTo(780, 90).stroke();

			doc.moveDown(1);
			doc.fillColor("#000000");

			// Define table layout for landscape orientation
			const tableTop = 130;
			const rowHeight = 30;
			const colXPositions = {
				serialNo: 50,
				projectName: 90,
				platform: 190,
				companyName: 290,
				title: 410,
				createdAt: 540,
			};
			const colWidths = {
				serialNo: 40,
				projectName: 100,
				platform: 100,
				companyName: 120,
				title: 130,
				createdAt: 130,
			};

			// Draw table headers with borders
			doc.fontSize(10).font("Helvetica-Bold");

			doc.text("Serial", colXPositions.serialNo, tableTop, {
				width: colWidths.serialNo,
				align: "center",
			});
			doc.text("Project Name", colXPositions.projectName, tableTop, {
				width: colWidths.projectName,
				align: "center",
			});
			doc.text("Platform", colXPositions.platform, tableTop, {
				width: colWidths.platform,
				align: "center",
			});
			doc.text("Company Name", colXPositions.companyName, tableTop, {
				width: colWidths.companyName,
				align: "center",
			});
			doc.text("Document Title", colXPositions.title, tableTop, {
				width: colWidths.title,
				align: "center",
			});
			doc.text("Request Time", colXPositions.createdAt, tableTop, {
				width: colWidths.createdAt,
				align: "center",
			});

			// Draw header borders
			Object.keys(colXPositions).forEach((key) => {
				doc
					.rect(colXPositions[key], tableTop - 5, colWidths[key], rowHeight)
					.stroke();
			});

			// Reset font to normal for table data
			doc.font("Helvetica");

			// Draw table rows with serial numbers
			data.forEach((row, index) => {
				const yPosition = tableTop + (index + 1) * rowHeight;
				const formattedDateTime = formatDateTime(row.created_at);

				doc.fontSize(8).text(index + 1, colXPositions.serialNo, yPosition, {
					width: colWidths.serialNo,
					align: "center",
				});
				doc.text(row.project_name, colXPositions.projectName, yPosition, {
					width: colWidths.projectName,
					align: "center",
				});
				doc.text(row.project_platform, colXPositions.platform, yPosition, {
					width: colWidths.platform,
					align: "center",
				});
				doc.text(row.company_name, colXPositions.companyName, yPosition, {
					width: colWidths.companyName,
					align: "center",
				});
				doc.text(row.title, colXPositions.title, yPosition, {
					width: colWidths.title,
					align: "center",
				});
				doc.text(formattedDateTime, colXPositions.createdAt, yPosition, {
					width: colWidths.createdAt,
					align: "center",
				});

				// Draw row borders
				Object.keys(colXPositions).forEach((key) => {
					doc
						.rect(colXPositions[key], yPosition - 5, colWidths[key], rowHeight)
						.stroke();
				});
			});

			doc.end();
		} catch (error) {
			reject(error);
		}
	});
};

// Modified function to return PDF buffer
const generatePDFReport = async (data) => {
	try {
		if (!Array.isArray(data) || data.length === 0) {
			throw setRejectMessage(
				API_STATUS_CODE.BAD_REQUEST,
				"Data is required and must be a non-empty array"
			);
		}

		const pdfBuffer = await generatePDF(data);
		return pdfBuffer;
	} catch (error) {
		console.error("Error generating PDF report:", error);
		return Promise.reject(
			setRejectMessage(
				API_STATUS_CODE.INTERNAL_SERVER_ERROR,
				"Failed to generate report"
			)
		);
	}
};

module.exports = { generatePDFReport };