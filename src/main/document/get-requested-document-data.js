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
const { setRejectMessage } = require("../../common/set-reject-message");
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
        return Promise.reject(
            setRejectMessage(
                API_STATUS_CODE.INTERNAL_SERVER_ERROR,
                'operation_failed'
            )
        );
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
        company.name AS company_name,
        company.website_link,
        company.address,
        company.email,
        project.project_name,
        project.project_platform,
        document.title,
        document.file_name,
        document.file_path,
        a_document.is_approved,
        a_document.created_at
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
        setRejectMessage(
            API_STATUS_CODE.INTERNAL_SERVER_ERROR,
            'operation_failed'
        )
    }
}

/**
 * @description This function is used to see the visitors of their approved, rejected and pending requests
 */
const getRequestedDocumentData = async (authData, paginationData) => {
    try {
        const totalRows = await getNumberOfRowsQuery(authData);

        // if (bodyData.status === '1') {
        const getData = await getApprovedProjectDataQuery(authData, paginationData);
        return Promise.resolve({
            metadata: {
                totalRows: totalRows,
            },
            data: getData
        });
        // } else {
        //     const getData = await getDisApprovedProjectDataQuery(authData, bodyData, paginationData);
        //     return Promise.resolve({
        //         metadata: {
        //             totalRows: totalRows,
        //         },
        //         data: getData
        //     });
        // }

    } catch (error) {
        console.log("🚀 ~ getRequestedDocumentData ~ error:", error)
        return Promise.reject(
            setRejectMessage(API_STATUS_CODE.INTERNAL_SERVER_ERROR, 'Internal Server Error')
        );
    }
}
module.exports = {
    getRequestedDocumentData
}