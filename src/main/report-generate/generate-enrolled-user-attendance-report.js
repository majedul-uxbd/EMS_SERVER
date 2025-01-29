/**
 * @author Md. Majedul Islam <https://github.com/majedul-uxbd> 
 * Software Engineer,
 * Ultra-X BD Ltd.
 *
 * @copyright All right reserved Ultra-X Asia Pacific
 * 
 * @description 
 * 
 */

const path = require("path");
const fs = require("fs");
const _ = require("lodash");
const { jsPDF } = require("jspdf");
const { logo } = require("../../common/utilities/images/logo");
const { API_STATUS_CODE } = require("../../consts/error-status");
const { setServerResponse } = require("../../common/set-server-response");
const { pool } = require("../../../database/db");
require('jspdf-autotable');


const getExhibitionDataQuery = async (exhibitionId) => {
    const _query = `
    SELECT
        id,
        exhibitions_title,
        exhibition_dates,
        exhibition_venue
    FROM
        exhibitions
    WHERE
        id = ?;
    `;

    try {
        const [results] = await pool.query(_query, exhibitionId);
        if (results.length > 0) {
            let data;
            results.map(item => {
                const dates = JSON.parse(item.exhibition_dates);
                const firstDate = dates[0]; // First date
                const lastDate = dates[dates.length - 1];

                data = {
                    id: item.id,
                    exhibitions_title: item.exhibitions_title,
                    exhibition_venue: item.exhibition_venue,
                    firstDate,
                    lastDate
                };
            });
            return data;
        } else {
            return false;
        }
    } catch (error) {
        return Promise.reject(error);
    }
};

const generateBodyData = async (lgKey, bodyData) => {
    let tableHeader;
    const tableRows = []; // To store formatted rows
    if (lgKey === 'ja') {
        tableHeader = ["名前", "役職", "会社", "ポジション", "展示データ", "撮影者", "入場時間"];
        for (let i = 0; i < bodyData.length; i++) {
            const record = bodyData[i];
            const fullName = `${record.f_name} ${record.l_name}`.trim();
            const takenBy = `${record.taken_by_f_name} ${record.taken_by_l_name}`.trim();
            const row = [
                fullName,
                record.role,
                record.company,
                record.position,
                record.exhibitions_day,
                takenBy,
                record.time
            ];
            tableRows.push(row);
        }
    } else {
        tableHeader = ["Name", "Role", "Company", "Position", "Exhibition Data", "Taken By", "Entry Time"];
        for (let i = 0; i < bodyData.length; i++) {
            const record = bodyData[i];
            const fullName = `${record.f_name} ${record.l_name}`.trim();
            const takenBy = `${record.taken_by_f_name} ${record.taken_by_l_name}`.trim();
            const row = [
                fullName,
                record.role,
                record.company,
                record.position,
                record.exhibitions_day,
                takenBy,
                record.time
            ];
            tableRows.push(row);
        }
    }


    return {
        tableHeader,
        tableRows
    }

}

/**
 * @description This function is used to generate enrolled visitor report 
 */
const generateEnrolledUserAttendanceReport = async (bodyData) => {
    const lgKey = bodyData.lg;
    if (_.isNil(bodyData.data)) {
        return Promise.reject(
            setServerResponse(
                API_STATUS_CODE.BAD_REQUEST,
                'visitor_data_is_required',
                lgKey,
            )
        )
    }
    if (_.isNil(bodyData.exhibitionId)) {
        return Promise.reject(
            setServerResponse(
                API_STATUS_CODE.BAD_REQUEST,
                'exhibition_id_is_required',
                lgKey,
            )
        )
    }
    const exhibitionData = await getExhibitionDataQuery(bodyData.exhibitionId);
    if (!exhibitionData) {
        return Promise.reject(
            setServerResponse(
                API_STATUS_CODE.BAD_REQUEST,
                'exhibition_is_not_found',
                lgKey,
            )
        )
    }
    const leftMargin = 30;
    const tableData = await generateBodyData(lgKey, bodyData.data);
    const document = new jsPDF({
        orientation: "landscape",
        unit: "px",
        compress: true,
        putOnlyUsedFonts: true,
        textAlign: 'right'
    });

    const fileSavePath = path.join(process.cwd(), "/uploads/reports");

    // Ensure directory exists
    if (!fs.existsSync(fileSavePath)) {
        fs.mkdirSync(fileSavePath, { recursive: true });
    }

    // Font setup
    const textFontBold = path.normalize(process.cwd() + "/src/common/utilities/font/NotoSansJP-Bold.ttf");
    const textFontRegular = path.normalize(process.cwd() + "/src/common/utilities/font/NotoSansJP-Regular.ttf");

    try {
        const japaneseFont1 = fs.readFileSync(textFontBold, "binary");
        const japaneseFont2 = fs.readFileSync(textFontRegular, "binary");

        document.addFileToVFS("NotoSansJP-Bold.ttf", japaneseFont1);
        document.addFont("NotoSansJP-Bold.ttf", "NotoSansJP", "bold");
        document.addFileToVFS("NotoSansJP-Regular.ttf", japaneseFont2);
        document.addFont("NotoSansJP-Regular.ttf", "NotoSansJP", "regular");
        document.setFont("NotoSansJP", "regular");

        if (lgKey === 'ja') {
            document.setFont("NotoSansJP", "bold")
                .setFontSize(25)
                .text(`展示会ごとに来場者レポートを作成しました`, leftMargin, 65)

                .addImage(logo, 565, 30, 47, 48)
                .setLineWidth(1)
                .line(leftMargin, 80, 608, 80);

            document.setFont("NotoSansJP", "bold")
                .setFontSize(13)
                .text("展示会名: ", leftMargin, 100);
            document.setFont("NotoSansJP", "regular")
                .setFontSize(13)
                .text(exhibitionData.exhibitions_title, 76, 100);

            document.setFont("NotoSansJP", "bold")
                .setFontSize(13)
                .text("展示会場: ", leftMargin, 116);
            document.setFont("NotoSansJP", "regular")
                .setFontSize(13)
                .text(exhibitionData.exhibition_venue, 76, 116);

            document.setFont("NotoSansJP", "bold")
                .setFontSize(13)
                .text("日付: ", leftMargin, 131);
            document.setFont("NotoSansJP", "regular")
                .setFontSize(13)
                .text(`${exhibitionData.firstDate} に ${exhibitionData.lastDate}`, 57, 131);

            document.setFont("NotoSansJP", "bold")
                .setFontSize(13)
                .text('免責事項: ', 180, 155);
            document.setFont("NotoSansJP", "regular")
                .setFontSize(13)
                .text('ここに記載されている時間はすべて現地時間です', 226, 155);
        } else {
            document.setFont("NotoSansJP", "bold")
                .setFontSize(25)
                .text(`Generated Exhibition wise Attendance Report`, leftMargin, 65)

                .addImage(logo, 565, 30, 47, 48)
                .setLineWidth(1)
                .line(leftMargin, 80, 608, 80);

            document.setFont("NotoSansJP", "bold")
                .setFontSize(13)
                .text("Exhibition Name: ", leftMargin, 100);
            document.setFont("NotoSansJP", "regular")
                .setFontSize(13)
                .text(exhibitionData.exhibitions_title, 120, 100);

            document.setFont("NotoSansJP", "bold")
                .setFontSize(13)
                .text("Exhibition Venue: ", leftMargin, 116);
            document.setFont("NotoSansJP", "regular")
                .setFontSize(13)
                .text(exhibitionData.exhibition_venue, 120, 116);

            document.setFont("NotoSansJP", "bold")
                .setFontSize(13)
                .text("Date: ", leftMargin, 131);
            document.setFont("NotoSansJP", "regular")
                .setFontSize(13)
                .text(`${exhibitionData.firstDate} to ${exhibitionData.lastDate}`, 60, 131);

            document.setFont("NotoSansJP", "bold")
                .setFontSize(13)
                .text('Disclaimer: ', 180, 155);
            document.setFont("NotoSansJP", "regular")
                .setFontSize(13)
                .text('All the times listed here are in Local Time.', 240, 155);
        }

        document.autoTable({
            font: "NotoSansJP",
            fontStyle: "bold",
            startY: 165,
            // margin: { top: 100 },
            theme: 'striped',
            headStyles: {
                fillColor: '#002658',
                halign: 'center',
                valign: 'middle',
                font: "NotoSansJP",
                fontStyle: "bold"
            },
            bodyStyles: {
                halign: 'center',
                valign: 'middle',
                font: "NotoSansJP",
                fontStyle: "regular"
            },
            head: [tableData.tableHeader], // Table headers
            body: tableData.tableRows,     // Table rows
        });


        const pdfOutput = document.output("arraybuffer");
        const buffer = Buffer.from(pdfOutput);
        const filePath = path.join(fileSavePath, "user-attendance-report.pdf");
        fs.writeFileSync(filePath, buffer);

        return Promise.resolve(filePath);

    } catch (error) {
        // console.log('Error generating report:', error);
        return Promise.reject(
            setServerResponse(
                API_STATUS_CODE.INTERNAL_SERVER_ERROR,
                error.message,
                lgKey,
            )
        )
    }
};


module.exports = {
    generateEnrolledUserAttendanceReport
}