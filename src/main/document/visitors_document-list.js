const PDFDocument = require("pdfkit");
const path = require("path");
const { format } = require("date-fns");
const { setRejectMessage, setServerResponse } = require("../../common/set-server-response");
const { API_STATUS_CODE } = require("../../consts/error-status");

// Function to format datetime using date-fns
const formatDateTime = (isoString) => {
	return format(new Date(isoString), "MMM dd, yyyy, hh:mm:ss a");
};

// Utility function to replace null, undefined, or empty values with "N/A"
const getValidValue = (value) => {
	return value == null || value === "" ? "N/A" : value;
};

// Modified function to return PDF buffer instead of saving to file
const generatePDF = (data, lg) => {
	const lgKey = lg;
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
				path.join(process.cwd(), "/src/common/utilities/images/UXAP_logo.jpg"),
				710,
				15,
				{
					width: 75,
					align: "right",
				}
			);

			if (lgKey === 'ja') {
				doc.fontSize(19)
					.font(path.join(process.cwd(), "/src/common/utilities/font/NotoSansJP-Bold.ttf"))
					.fillColor("#030663")
					.text("依頼された書類の一覧", 50, 50);

				doc.fontSize(12)
					.font(path.join(process.cwd(), "/src/common/utilities/font/NotoSansJP-Regular.ttf"))
					.fillColor("#000000")
					.text("すべての時間は日本標準時で表示されています", 50, 75);
			} else {
				doc.fontSize(19)
					.font(path.join(process.cwd(), "/src/common/utilities/font/NotoSansJP-Bold.ttf"))
					.fillColor("#030663")
					.text("List of Requested Documents", 50, 50);

				doc.fontSize(12)
					.font(path.join(process.cwd(), "/src/common/utilities/font/NotoSansJP-Regular.ttf"))
					.fillColor("#000000")
					.text("All times are shown here in Japanese Standard Time", 50, 75);
			}

			// Draw a horizontal line for section separation
			doc.moveTo(50, 100).lineTo(780, 100).stroke();

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
			doc.fontSize(10).font(path.join(process.cwd(), "/src/common/utilities/font/NotoSansJP-Bold.ttf"));

			if (lgKey === 'ja') {
				doc.text("シリアル", colXPositions.serialNo, tableTop, {
					width: colWidths.serialNo,
					align: "center",
				});
				doc.text("プロジェクト名", colXPositions.projectName, tableTop, {
					width: colWidths.projectName,
					align: "center",
				});
				doc.text("プラットフォーム", colXPositions.platform, tableTop, {
					width: colWidths.platform,
					align: "center",
				});
				doc.text("会社名", colXPositions.companyName, tableTop, {
					width: colWidths.companyName,
					align: "center",
				});
				doc.text("文書タイトル", colXPositions.title, tableTop, {
					width: colWidths.title,
					align: "center",
				});
				doc.text("リクエスト時間", colXPositions.createdAt, tableTop, {
					width: colWidths.createdAt,
					align: "center",
				});

			} else {
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
			}

			// Draw header borders
			Object.keys(colXPositions).forEach((key) => {
				doc
					.rect(colXPositions[key], tableTop - 5, colWidths[key], rowHeight)
					.stroke();
			});

			// Reset font to normal for table data
			doc.font(path.join(process.cwd(), "/src/common/utilities/font/NotoSansJP-Regular.ttf"));

			// Draw table rows with serial numbers
			data.forEach((row, index) => {
				const yPosition = tableTop + (index + 1) * rowHeight;
				const formattedDateTime = row.created_at ? formatDateTime(row.created_at) : "N/A";

				doc.fontSize(8).text(index + 1, colXPositions.serialNo, yPosition, {
					width: colWidths.serialNo,
					align: "center",
				});
				doc.text(getValidValue(row.project_name), colXPositions.projectName, yPosition, {
					width: colWidths.projectName,
					align: "center",
				});
				doc.text(getValidValue(row.project_platform), colXPositions.platform, yPosition, {
					width: colWidths.platform,
					align: "center",
				});
				doc.text(getValidValue(row.company_name), colXPositions.companyName, yPosition, {
					width: colWidths.companyName,
					align: "center",
				});
				doc.text(getValidValue(row.title), colXPositions.title, yPosition, {
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
const generatePDFReport = async (data, lg) => {
	try {
		if (data.length === 0) {
			return Promise.reject(
				setServerResponse(
					API_STATUS_CODE.BAD_REQUEST,
					'data_is_required_and_must_be_a_non_empty_array',
					lg
				)
			);
		}

		const pdfBuffer = await generatePDF(data, lg);
		return pdfBuffer;
	} catch (error) {
		console.error("Error generating PDF report:", error);
		return Promise.reject(
			setServerResponse(
				API_STATUS_CODE.BAD_REQUEST,
				'failed_to_generate_report',
				lg
			)
		);
	}
};

module.exports = { generatePDFReport };
