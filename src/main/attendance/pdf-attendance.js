const PDFDocument = require("pdfkit");
const { format } = require("date-fns");
const { pool } = require("../../../database/db");
const { setRejectMessage } = require("../../common/set-reject-message");
const { API_STATUS_CODE } = require("../../consts/error-status");
const path = require("path");

/**
 * Fetch attendance data based on the exhibition ID.
 * @param {number} exhibitionId - The ID of the exhibition.
 * @returns {Promise<Array>} - List of attendance records.
 */
const fetchAttendanceData = async (exhibitionId) => {
    try {
        if (!exhibitionId) {
            throw new Error("Exhibition ID is required");
        }

        const query = `
            SELECT 
                exhibitions.exhibitions_title,
                exhibitions.exhibition_venue,
                exhibition_days.day_title,
                exhibition_days.exhibition_date,
                CASE 
                    WHEN attendances.visitors_id IS NOT NULL THEN CONCAT(visitors.f_name, ' ', visitors.l_name)
                    WHEN attendances.exhibitor_id IS NOT NULL THEN CONCAT(exhibitors.f_name, ' ', exhibitors.l_name)
                    ELSE 'Unknown'
                END as attendee_name,
                CASE 
                    WHEN attendances.visitors_id IS NOT NULL THEN 'Visitor'
                    WHEN attendances.exhibitor_id IS NOT NULL THEN 'Exhibitor'
                    ELSE 'Unknown'
                END as attendee_type,
                CONCAT(user.f_name, ' ', user.l_name) as taken_by,
                attendances.time
            FROM exhibitions
            INNER JOIN exhibition_days ON exhibition_days.exhibitions_id = exhibitions.id
            INNER JOIN attendances ON attendances.exhibition_days_id = exhibition_days.id
            LEFT JOIN user ON user.id = attendances.taken_by
            LEFT JOIN visitors ON visitors.id = attendances.visitors_id
            LEFT JOIN user as exhibitors ON exhibitors.id = attendances.exhibitor_id
            WHERE exhibitions.id = ?
            ORDER BY exhibition_days.exhibition_date, attendances.time;
        `;

        // Debug log
        // console.log('Query params:', exhibitionId);

        const result = await pool.query(query, [exhibitionId]);

        // Debug log
        // console.log('Query result:', result);

        // Check if result exists and has rows property
        if (!result) {
            console.error("No result from database");
            throw new Error("No response from database");
        }

        // For MySQL, the rows might be in result[0]
        const rows = Array.isArray(result) ? result[0] : result.rows;

        if (!rows) {
            console.error("No rows in result:", result);
            return [];
        }

        return rows;

    } catch (error) {
        // console.error("Error fetching attendance data:", error);
        throw setRejectMessage(
            API_STATUS_CODE.INTERNAL_SERVER_ERROR,
            error.message || "Failed to fetch attendance data"
        );
    }
};

/**
 * Generate an attendance PDF report.
 * @param {Array} data - Attendance data.
 * @returns {Promise<Buffer>} - PDF as a buffer.
 */
const generateAttendancePDF = (data, lg) => {
    return new Promise((resolve, reject) => {
        try {
            // Debug log

            // Validate input data
            if (!data) {
                throw new Error("Data is required");
            }

            if (!Array.isArray(data)) {
                throw new Error("Input data must be an array");
            }

            if (data.length === 0) {
                // Create a simple PDF for no data
                const doc = new PDFDocument({
                    size: "A4",
                    margins: { top: 30, bottom: 30, left: 30, right: 30 }
                });

                const chunks = [];
                doc.on("data", (chunk) => chunks.push(chunk));
                doc.on("end", () => resolve(Buffer.concat(chunks)));
                doc.on("error", reject);

                if (lg === 'ja') {
                    doc.fontSize(19).font(path.join(process.cwd(), "/src/common/utilities/font/NotoSansJP-Bold.ttf"))
                        .text("出席レポート", { align: "center" });
                    doc.moveDown();
                    doc.fontSize(12).font(path.join(process.cwd(), "/src/common/utilities/font/NotoSansJP-Regular.ttf"))
                        .text("この展示会の出席記録が見つかりませんでした。", { align: "center" });
                    doc.moveDown();
                    doc.fontSize(8)
                        .text(`生成日: ${new Date().toLocaleString()}`, 50, doc.page.height - 50);
                } else {
                    doc.fontSize(19).font(path.join(process.cwd(), "/src/common/utilities/font/NotoSansJP-Bold.ttf"))
                        .text("Attendance Report", { align: "center" });
                    doc.moveDown();
                    doc.fontSize(12).font(path.join(process.cwd(), "/src/common/utilities/font/NotoSansJP-Regular.ttf"))
                        .text("No attendance records found for this exhibition.", { align: "center" });
                    doc.moveDown();
                    doc.fontSize(8)
                        .text(`Generated on: ${new Date().toLocaleString()}`, 50, doc.page.height - 50);
                }

                doc.end();
                return;
            }

            const doc = new PDFDocument({
                size: "A4",
                margins: { top: 30, bottom: 30, left: 30, right: 30 }
            });

            const chunks = [];
            doc.on("data", (chunk) => chunks.push(chunk));
            doc.on("end", () => resolve(Buffer.concat(chunks)));
            doc.on("error", reject);

            // Safely extract general details with fallbacks
            const exhibitions_title = data[0]?.exhibitions_title || "N/A";
            const exhibition_venue = data[0]?.exhibition_venue || "N/A";

            // Add exhibition details
            if (lg === 'ja') {
                // Header with exhibition details
                doc.fontSize(18).font(path.join(process.cwd(), "/src/common/utilities/font/NotoSansJP-Bold.ttf"))
                    .text("出席レポート", { align: "center" });
                doc.moveDown();

                // Add exhibition details with indent
                const labelX = 50;  // Align with the table's left column
                const valueX = 120; // Position slightly to the right of labels for values

                // Save current y position
                let currentupY = doc.y;
                doc.fontSize(12).font(path.join(process.cwd(), "/src/common/utilities/font/NotoSansJP-Bold.ttf"))
                    .text("展示:", labelX, currentupY);
                doc.fontSize(11).font(path.join(process.cwd(), "/src/common/utilities/font/NotoSansJP-Regular.ttf"))
                    .text(exhibitions_title, valueX, currentupY);

                // Update y position for the next row
                currentupY += doc.currentLineHeight();

                // Add venue details
                doc.fontSize(12).font(path.join(process.cwd(), "/src/common/utilities/font/NotoSansJP-Bold.ttf"))
                    .text("会場:", labelX, currentupY);
                doc.fontSize(11).font(path.join(process.cwd(), "/src/common/utilities/font/NotoSansJP-Regular.ttf"))
                    .text(exhibition_venue, valueX, currentupY);
                doc.moveDown(1).moveTo(50, doc.y).lineTo(550, doc.y).stroke();
            } else {
                // Header with exhibition details
                doc.fontSize(18).font(path.join(process.cwd(), "/src/common/utilities/font/NotoSansJP-Bold.ttf"))
                    .text("Attendance Report", { align: "center" });
                doc.moveDown();

                // Add exhibition details with indent
                const labelX = 50;  // Align with the table's left column
                const valueX = 120; // Position slightly to the right of labels for values

                // Save current y position
                let currentupY = doc.y;
                doc.fontSize(12).font(path.join(process.cwd(), "/src/common/utilities/font/NotoSansJP-Bold.ttf"))
                    .text("Exhibition:", labelX, currentupY);
                doc.fontSize(11).font(path.join(process.cwd(), "/src/common/utilities/font/NotoSansJP-Regular.ttf"))
                    .text(exhibitions_title, valueX, currentupY);

                // Update y position for the next row
                currentupY += doc.currentLineHeight();

                // Add venue details
                doc.fontSize(12).font(path.join(process.cwd(), "/src/common/utilities/font/NotoSansJP-Bold.ttf"))
                    .text("Venue:", labelX, currentupY);
                doc.fontSize(11).font(path.join(process.cwd(), "/src/common/utilities/font/NotoSansJP-Regular.ttf"))
                    .text(exhibition_venue, valueX, currentupY);
                doc.moveDown(1).moveTo(50, doc.y).lineTo(550, doc.y).stroke();
            }

            // Table setup with adjusted columns
            const tableTop = doc.y + 20;
            const rowHeight = 20;
            const colXPositions = {
                dayTitle: 50,
                date: 120,
                attendee: 190,
                type: 320,
                takenBy: 390,
                time: 480
            };
            const colWidths = {
                dayTitle: 70,
                date: 70,
                attendee: 130,
                type: 70,
                takenBy: 90,
                time: 70
            };

            // Draw table headers
            doc.fontSize(10).font(path.join(process.cwd(), "/src/common/utilities/font/NotoSansJP-Bold.ttf"));
            if (lg === 'ja') {
                Object.entries({
                    "日付タイトル": "dayTitle", // Day Title
                    "日付": "date",           // Date
                    "出席者": "attendee",      // Attendee
                    "種類": "type",           // Type
                    "記録者": "takenBy",       // Taken By
                    "時間": "time"            // Time
                }).forEach(([header, key]) => {
                    doc.text(header, colXPositions[key], tableTop, {
                        width: colWidths[key],
                        align: "center"
                    });
                    doc.rect(colXPositions[key], tableTop - 5, colWidths[key], rowHeight).stroke();
                });
            } else {
                Object.entries({
                    "Day Title": "dayTitle",
                    "Date": "date",
                    "Attendee": "attendee",
                    "Type": "type",
                    "Taken By": "takenBy",
                    "Time": "time"
                }).forEach(([header, key]) => {
                    doc.text(header, colXPositions[key], tableTop, {
                        width: colWidths[key],
                        align: "center"
                    });
                    doc.rect(colXPositions[key], tableTop - 5, colWidths[key], rowHeight).stroke();
                });
            }


            // Add table rows
            let currentY = tableTop + rowHeight;
            data.forEach((row, index) => {
                // Check if we need a new page
                if (currentY + rowHeight > doc.page.height - 50) {
                    doc.addPage();
                    currentY = 50; // Reset Y position for new page
                }

                doc.fontSize(8).font(path.join(process.cwd(), "/src/common/utilities/font/NotoSansJP-Regular.ttf"));

                // Format date using date-fns
                const formattedDate = row.exhibition_date
                    ? format(new Date(row.exhibition_date), "PP")
                    : "N/A";

                // Format time using toLocaleTimeString
                const formattedTime = row.time
                    ? format(new Date(`1970-01-01T${row.time}Z`), 'hh:mm:ss a')
                    : "N/A";

                // Safely access row data with fallbacks
                const rowData = {
                    dayTitle: row.day_title || "N/A",
                    date: formattedDate,
                    attendee: row.attendee_name || "N/A",
                    type: row.attendee_type || "N/A",
                    takenBy: row.taken_by || "N/A",
                    time: formattedTime
                };

                // Draw cell contents and borders
                Object.entries(rowData).forEach(([key, value]) => {
                    doc.text(value, colXPositions[key], currentY, {
                        width: colWidths[key],
                        align: "center"
                    });
                    doc.rect(colXPositions[key], currentY - 5, colWidths[key], rowHeight).stroke();
                });

                currentY += rowHeight;
            });

            // Add footer with localized timestamp
            // doc.fontSize(8)
            //     .text(`Generated on: ${new Date().toLocaleString()}`, 50, doc.page.height - 50);

            doc.end();
        } catch (error) {
            console.error("Error generating PDF:", error);
            reject(error);
        }
    });
};

module.exports = {
    fetchAttendanceData,
    generateAttendancePDF,
};