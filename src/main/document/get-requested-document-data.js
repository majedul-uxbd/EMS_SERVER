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

const { pool } = require("../../../database/db");
const { setServerResponse } = require("../../common/set-server-response");
const { API_STATUS_CODE } = require("../../consts/error-status");


const getNumberOfRowsQuery = async (authData) => {
    const _query = `
    SELECT count(*) AS totalRows
    FROM
        approved_document AS a_document
    LEFT JOIN companies AS company
    ON
        a_document.company_id = company.id
    LEFT JOIN projects AS project
    ON
        a_document.project_id = project.id
    LEFT JOIN documents AS document
    ON
        document.project_id = project.id
    WHERE
        a_document.visitor_id = ?;
    `;

    const _values = [
        authData.id,
    ]

    try {
        const [result] = await pool.query(_query, _values);
        return Promise.resolve(result[0]);
    } catch (error) {
        // console.log('🚀 ~ userLoginQuery ~ error:', error);
        return Promise.reject(error);
    }
}

// const getDisApprovedProjectDataQuery = async (authData, paginationData) => {
//     const _query = `
//     SELECT
//         company.name AS company_name,
//         company.website_link,
//         company.address,
//         company.email,
//         project.project_name,
//         project.project_platform,
//         a_document.is_approved
//     FROM
//         approved_document AS a_document
//     LEFT JOIN companies AS company
//     ON
//         a_document.company_id = company.id
//     LEFT JOIN projects AS project
//     ON
//         a_document.project_id = project.id
//     LEFT JOIN documents AS document
//     ON
//         document.project_id = project.id
//     WHERE
//         a_document.visitor_id = ?
//     LIMIT ?
//     OFFSET ?;
//     `;

//     const _values = [
//         authData.id,
//         paginationData.itemsPerPage,
//         paginationData.offset
//     ]

//     try {
//         const [result] = await pool.query(_query, _values);
//         return Promise.resolve(result);

//     } catch (error) {
//         setRejectMessage(
//             API_STATUS_CODE.INTERNAL_SERVER_ERROR,
//             'operation_failed'
//         )
//     }
// }

const getApprovedProjectDataQuery = async (authData, paginationData) => {
    const _query = `
    SELECT
        company.id AS company_id,
        company.name AS company_name,
        company.website_link,
        company.address,
        company.email,
        project.id AS project_id,
        project.project_name,
        project.project_platform,
        document.id AS document_id,
        document.title,
        document.file_name,
        document.file_path,
        ex.id AS exhibition_id,
        ex.exhibitions_title,
        a_document.is_approved,
        a_document.created_at
    FROM
        approved_document AS a_document
    LEFT JOIN exhibitions AS ex
    ON
        ex.id = a_document.exhibition_id
    LEFT JOIN projects AS project
    ON
        a_document.project_id = project.id
    LEFT JOIN documents AS document
    ON
        project.id = document.project_id
    LEFT JOIN companies AS company
    ON
        project.companies_id = company.id
    WHERE
        a_document.visitor_id = ?
    LIMIT ?
    OFFSET ?;
    `;

    const _values = [
        authData.id,
        paginationData.itemsPerPage,
        paginationData.offset
    ]

    try {
        const [result] = await pool.query(_query, _values);
        return Promise.resolve(result);

    } catch (error) {
        return Promise.reject(error);
    }
}

/**
 * @description This function is used to see the visitors of their approved, rejected and pending requests
 */
const getRequestedDocumentData = async (authData, bodyData, paginationData) => {
    const lgKey = bodyData.lg;
    try {
        const totalRows = await getNumberOfRowsQuery(authData);

        // if (bodyData.status === '1') {
        const getData = await getApprovedProjectDataQuery(authData, paginationData);
        const result = {
            metadata: {
                totalRows: totalRows,
            },
            data: getData
        };
        // } else {
        //     const getData = await getDisApprovedProjectDataQuery(authData, bodyData, paginationData);
        //     return Promise.resolve({
        //         metadata: {
        //             totalRows: totalRows,
        //         },
        //         data: getData
        //     });
        // }
        return Promise.resolve(
            setServerResponse(
                API_STATUS_CODE.OK,
                'get_data_successfully',
                lgKey,
                result
            )
        );
    } catch (error) {
        // console.log("🚀 ~ getRequestedDocumentData ~ error:", error)
        return Promise.reject(
            setServerResponse(
                API_STATUS_CODE.INTERNAL_SERVER_ERROR,
                'internal_server_error',
                lgKey,
            )
        );
    }
}
module.exports = {
    getRequestedDocumentData
}