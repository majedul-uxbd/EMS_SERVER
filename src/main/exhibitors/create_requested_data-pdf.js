const fs = require("fs");
const path = require("path");
const _ = require("lodash");
const { jsPDF } = require("jspdf");
const { API_STATUS_CODE } = require("../../consts/error-status");
require('jspdf-autotable');

// Constants
const FONT_PATHS = {
	bold: path.join(process.cwd(), "src/common/utilities/font/NotoSansJP-Bold.ttf"),
	regular: path.join(process.cwd(), "src/common/utilities/font/NotoSansJP-Regular.ttf")
};

const LOGO_PATH = path.join(process.cwd(), "src/common/utilities/images/UXAP_logo.jpg");

const TABLE_HEADERS = {
	ja: [
		"シリアル",
		"名前",
		"メール",
		"連絡先",
		"会社",
		"位置",
		"リクエストされたプロジェクト"
	],
	en: [
		"Serial",
		"Name",
		"Email",
		"Contact No.",
		"Company",
		"Position",
		"Requested Projects"
	]
};

// Helper Functions
const generateBodyData = (lgKey, bodyData) => {
	const tableHeader = TABLE_HEADERS[lgKey] || TABLE_HEADERS.en;

	const tableRows = bodyData.map((record, index) => {
		const fullName = `${record.f_name || ""} ${record.l_name || ""}`.trim();
		return [
			(index + 1).toString(),
			fullName,
			record.email || "",
			record.contact_no || "",
			record.company_name || "",
			record.position || "",
			record.project_names || ""
		];
	});

	return { tableHeader, tableRows };
};

const loadFonts = async () => {
	try {
		// Verify fonts exist
		await Promise.all([
			fs.promises.access(FONT_PATHS.bold),
			fs.promises.access(FONT_PATHS.regular)
		]);

		// Read font files and convert to base64
		const [boldFont, regularFont] = await Promise.all([
			fs.promises.readFile(FONT_PATHS.bold, { encoding: 'base64' }),
			fs.promises.readFile(FONT_PATHS.regular, { encoding: 'base64' })
		]);

		return { boldFont, regularFont };
	} catch (error) {
		throw new Error("Required fonts not found: " + error.message);
	}
};

const setupDocument = async (doc, lgKey) => {
	const leftMargin = 30;

	try {
		// Load and convert logo to base64
		const logoBase64 = await fs.promises.readFile(LOGO_PATH, { encoding: 'base64' });

		// Add header content based on language
		if (lgKey === 'ja') {
			doc.setFont("NotoSansJP", "bold")
				.setFontSize(25)
				.text("興味のある訪問者のリスト", leftMargin, 65)
				.addImage(`data:image/jpeg;base64,${logoBase64}`, 'JPEG', 565, 30, 47, 48)
				.setLineWidth(1)
				.line(leftMargin, 80, 608, 80);
		} else {
			doc.setFont("NotoSansJP", "bold")
				.setFontSize(25)
				.text("List of Interested Visitors", leftMargin, 65)
				.addImage(`data:image/jpeg;base64,${logoBase64}`, 'JPEG', 565, 30, 47, 48)
				.setLineWidth(1)
				.line(leftMargin, 80, 608, 80);
		}
	} catch (error) {
		console.error('Error loading logo:', error);
		// Continue without logo if there's an error
		if (lgKey === 'ja') {
			doc.setFont("NotoSansJP", "bold")
				.setFontSize(25)
				.text("興味のある訪問者のリスト", leftMargin, 65)
				.setLineWidth(1)
				.line(leftMargin, 80, 608, 80);
		} else {
			doc.setFont("NotoSansJP", "bold")
				.setFontSize(25)
				.text("List of Interested Visitors", leftMargin, 65)
				.setLineWidth(1)
				.line(leftMargin, 80, 608, 80);
		}
	}
};

// Main Function
const generateRequestedVisitorPDF = async (data) => {
	if (!data?.data || !Array.isArray(data.data) || data.data.length === 0) {
		return Promise.resolve(
			setServerResponse(
				API_STATUS_CODE.BAD_REQUEST,
				'valid_visitor_data_array_is_required',
				lgKey
			)
		)
	}

	const lgKey = data.lg || 'en';
	const fileSavePath = path.join(process.cwd(), "uploads", "reports");

	// Ensure directory exists
	await fs.promises.mkdir(fileSavePath, { recursive: true });

	try {
		// Load fonts
		const fonts = await loadFonts();

		// Initialize PDF document
		const doc = new jsPDF({
			orientation: "landscape",
			unit: "px",
			format: 'a4',
			compress: true,
			putOnlyUsedFonts: true
		});

		// Setup fonts
		doc.addFileToVFS("NotoSansJP-Bold.ttf", fonts.boldFont);
		doc.addFont("NotoSansJP-Bold.ttf", "NotoSansJP", "bold");
		doc.addFileToVFS("NotoSansJP-Regular.ttf", fonts.regularFont);
		doc.addFont("NotoSansJP-Regular.ttf", "NotoSansJP", "regular");

		// Setup document layout
		await setupDocument(doc, lgKey);

		// Generate table data
		const tableData = generateBodyData(lgKey, data.data);

		// Generate table
		doc.autoTable({
			startY: 120,
			margin: { top: 100, left: 30, right: 30 },
			theme: 'striped',
			styles: {
				font: "NotoSansJP",
				cellPadding: 3,
				fontSize: 10
			},
			headStyles: {
				fillColor: '#030663',
				halign: 'center',
				valign: 'middle',
				fontStyle: "bold",
			},
			bodyStyles: {
				halign: 'center',
				valign: 'middle',
				fontStyle: "regular",
			},
			columnStyles: {
				0: { cellWidth: 'auto' },
				1: { cellWidth: 'auto' },
				2: { cellWidth: 'auto' },
				3: { cellWidth: 'auto' },
				4: { cellWidth: 'auto' },
				5: { cellWidth: 'auto' },
				6: { cellWidth: 'auto' },
			},
			head: [tableData.tableHeader],
			body: tableData.tableRows,
		});

		// Save PDF
		const filePath = path.join(fileSavePath, "requested-visitors-report.pdf");
		await fs.promises.writeFile(filePath, Buffer.from(doc.output("arraybuffer")));

		return filePath;
	} catch (error) {
		// console.error("PDF Generation Error:", error);
		return Promise.resolve(
			setServerResponse(
				API_STATUS_CODE.BAD_REQUEST,
				'failed_to_generate_report',
				lgKey
			)
		)
	}
};

module.exports = { generateRequestedVisitorPDF };