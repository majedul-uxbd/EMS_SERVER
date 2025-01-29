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


const getCompanyDataQuery = async (companyId) => {
    const _query = `
    SELECT
        id,
        name
    FROM 
        companies
    WHERE
        id = ?;
    `;
    try {
        const [results] = await pool.query(_query, companyId);
        if (results.length > 0) {
            return results[0].name;
        }
        return false;
    } catch (error) {

    }
}

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
        tableHeader = ["プロジェクト", "プラットフォーム", "作成者", "更新者", "作成時間", "更新時間"];
        for (let i = 0; i < bodyData.length; i++) {
            const record = bodyData[i];
            const createdBy = record.created_by_user_f_name || record.created_by_user_l_name
                ? `${record.created_by_user_f_name || ''} ${record.created_by_user_l_name || ''}`.trim()
                : null;
            const updatedBy = record.updated_by_user_f_name || record.updated_by_user_l_name
                ? `${record.updated_by_user_f_name || ''} ${record.updated_by_user_l_name || ''}`.trim()
                : null;
            const row = [
                record.project_name,
                record.project_platform,
                createdBy,
                updatedBy || "更新されていません",
                record.created_at,
                record.updated_at || "更新されていません"
            ];
            tableRows.push(row);
        }
    } else {
        tableHeader = ["Project", "Platform", "Created By", "Updated By", "Created Time", "Updated Time"];
        for (let i = 0; i < bodyData.length; i++) {
            const record = bodyData[i];
            const createdBy = record.created_by_user_f_name || record.created_by_user_l_name
                ? `${record.created_by_user_f_name || ''} ${record.created_by_user_l_name || ''}`.trim()
                : null;
            const updatedBy = record.updated_by_user_f_name || record.updated_by_user_l_name
                ? `${record.updated_by_user_f_name || ''} ${record.updated_by_user_l_name || ''}`.trim()
                : null;
            const row = [
                record.project_name,
                record.project_platform,
                createdBy,
                updatedBy || "Not Updated",
                record.created_at,
                record.updated_at || "Not Updated"
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
 * @description This function is used to generate Exhibition wise company project report 
 */
const generateEnrolledCompanyProjectReport = async (bodyData) => {
    const lgKey = bodyData.lg;
    if (_.isNil(bodyData.data)) {
        return Promise.reject(
            setServerResponse(
                API_STATUS_CODE.BAD_REQUEST,
                'exhibitor_data_is_required',
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
    const companyName = await getCompanyDataQuery(bodyData.companyId);
    if (!companyName) {
        return Promise.reject(
            setServerResponse(
                API_STATUS_CODE.BAD_REQUEST,
                'company_not_found',
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
                .text(`登録企業プロジェクトレポートを作成しました`, leftMargin, 65)

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
                .text("会社名: ", leftMargin, 152);
            document.setFont("NotoSansJP", "regular")
                .setFontSize(13)
                .text(companyName, 65, 152);

            document.setFont("NotoSansJP", "bold")
                .setFontSize(13)
                .text('免責事項: ', 180, 170);
            document.setFont("NotoSansJP", "regular")
                .setFontSize(13)
                .text('ここに記載されている時間はすべて現地時間です', 226, 170);
        } else {
            document.setFont("NotoSansJP", "bold")
                .setFontSize(25)
                .text(`Generated Enrolled Company Project Report`, leftMargin, 65)

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
                .text("Company Name: ", leftMargin, 152);
            document.setFont("NotoSansJP", "regular")
                .setFontSize(13)
                .text(companyName, 112, 152);

            document.setFont("NotoSansJP", "bold")
                .setFontSize(13)
                .text('Disclaimer: ', 180, 170);
            document.setFont("NotoSansJP", "regular")
                .setFontSize(13)
                .text('All the times listed here are in Local Time.', 240, 170);
        }

        document.autoTable({
            font: "NotoSansJP",
            fontStyle: "bold",
            startY: 180,
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
        const filePath = path.join(fileSavePath, "enrolled-company.project-report.pdf");
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
    generateEnrolledCompanyProjectReport
}