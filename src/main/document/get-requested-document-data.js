/**
 * @author Md. Majedul Islam <https://github.com/majedul-uxbd> 
 * Software Engineer,
 * Ultra-X BD Ltd.
 *
 * @copyright All right reserved Majedul
 * 
 * @description 
 * 
 */

const { pool } = require("../../../database/db");
const { setRejectMessage } = require("../../common/set-reject-message");
const { API_STATUS_CODE } = require("../../consts/error-status");


const getNumberOfRowsQuery = async (authData, bodyData) => {
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
        a_document.visitor_id = ? AND
        a_document.is_approved = ?;
    `;

    const _values = [
        authData.id,
        bodyData.status
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

const getDisApprovedProjectDataQuery = async (authData, bodyData, paginationData) => {
    const _query = `
    SELECT
        company.name AS company_name,
        company.website_link,
        company.address,
        company.email,
        project.project_name,
        project.project_platform,
        a_document.is_approved
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
        a_document.visitor_id = ? AND
        a_document.is_approved = ?
    LIMIT ?
    OFFSET ?;
    `;

    const _values = [
        authData.id,
        bodyData.status,
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

const getApprovedProjectDataQuery = async (authData, bodyData, paginationData) => {
    const _query = `
    SELECT
        company.name AS company_name,
        company.website_link,
        company.address,
        company.email,
        project.project_name,
        project.project_platform,
        document.title,
        document.file_path,
        a_document.is_approved
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
        a_document.visitor_id = ? AND
        a_document.is_approved = ?
    LIMIT ?
    OFFSET ?;
    `;

    const _values = [
        authData.id,
        bodyData.status,
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


const getRequestedDocumentData = async (authData, bodyData, paginationData) => {
    try {
        const totalRows = await getNumberOfRowsQuery(authData, bodyData);

        if (bodyData.status === '1') {
            const getData = await getApprovedProjectDataQuery(authData, bodyData, paginationData);
            return Promise.resolve({
                metadata: {
                    totalRows: totalRows,
                },
                data: getData
            });
        } else {
            const getData = await getDisApprovedProjectDataQuery(authData, bodyData, paginationData);
            return Promise.resolve({
                metadata: {
                    totalRows: totalRows,
                },
                data: getData
            });
        }

    } catch (error) {
        // console.log("🚀 ~ getRequestedDocumentData ~ error:", error)
        return Promise.reject(
            setRejectMessage(API_STATUS_CODE.INTERNAL_SERVER_ERROR, 'Internal Server Error')
        );
    }
}
module.exports = {
    getRequestedDocumentData
}