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

const enrolledVisitorCountQuery = async (bodyData) => {
    const _query = `
    SELECT 
        COUNT(*) AS enrolled_visitors
    FROM 
        exhibitions_has_visitor
    WHERE 
        exhibition_id = ?;
    `;
    try {
        const [result] = await pool.query(_query, bodyData.exhibitionId);
        return Promise.resolve(result[0].enrolled_visitors);
    } catch (error) {
        return Promise.reject(error);
    }
}

const attendedVisitorCountQuery = async (bodyData) => {
    const _query = `
    SELECT 
        COUNT(DISTINCT visitors_id) AS attended_visitors
    FROM 
        attendances AS a
    LEFT JOIN
        exhibition_days AS ed
    ON a.exhibition_days_id = ed.id
    LEFT JOIN
        exhibitions AS e
    ON ed.exhibitions_id = e.id
    WHERE
        e.id = ?;
    `;
    try {
        const [result] = await pool.query(_query, bodyData.exhibitionId);
        return Promise.resolve(result[0].attended_visitors);
    } catch (error) {
        return Promise.reject(error);
    }
}

const attendedExhibitorCountQuery = async (bodyData) => {
    const _query = `
    SELECT 
        COUNT(DISTINCT exhibitor_id) AS attended_exhibitors
    FROM 
        attendances AS a
    LEFT JOIN
        exhibition_days AS ed
    ON a.exhibition_days_id = ed.id
    LEFT JOIN
        exhibitions AS e
    ON ed.exhibitions_id = e.id
    WHERE
        e.id = ?;
    `;
    try {
        const [result] = await pool.query(_query, bodyData.exhibitionId);
        return Promise.resolve(result[0].attended_exhibitors);
    } catch (error) {
        return Promise.reject(error);
    }
}

const enrolledCompanyCountQuery = async (bodyData) => {
    const _query = `
    SELECT 
        COUNT(*) AS enrolled_company
    FROM 
        exhibitions_has_companies
    WHERE
        exhibition_id = ?;
    `;
    try {
        const [result] = await pool.query(_query, bodyData.exhibitionId);
        return Promise.resolve(result[0].enrolled_company);
    } catch (error) {
        return Promise.reject(error);
    }
}

const totalEnrolledCompanyId = async (bodyData) => {
    const _query = `
    SELECT 
        company_id
    FROM 
        exhibitions_has_companies
        WHERE
            exhibition_id = ?;
    `;
    try {
        const [result] = await pool.query(_query, bodyData.exhibitionId);
        return Promise.resolve(result);
    } catch (error) {
        return Promise.reject(error);
    }
}

const checkCompanyHasProjects = async (companyId) => {
    const _query = `
    SELECT 
        id
    FROM 
        projects
    WHERE
        companies_id = ?;
    `;
    try {
        const [result] = await pool.query(_query, companyId);
        if (result.length > 0) {
            return true;
        } return false;
    } catch (error) {
        return Promise.reject(error);
    }
}

// const totalProjectCount = async () => {
//     const _query = `
//     SELECT 
//         COUNT(*) AS total_projects
//     FROM 
//         projects;
//     `;
//     try {
//         const [result] = await pool.query(_query);
//         return Promise.resolve(result[0].total_projects);
//     } catch (error) {
//         return Promise.reject(error);
//     }
// }


/**
 * @description This function is used to retrieve count of all users 
 */
const allCountForDashboardTab2 = async (bodyData) => {
    let attendedCompanyCount = 0;
    try {
        const attendedVisitorCount = await attendedVisitorCountQuery(bodyData);
        const enrolledVisitorCount = await enrolledVisitorCountQuery(bodyData);
        const attendedExhibitorCount = await attendedExhibitorCountQuery(bodyData);
        const enrolledCompanyCount = await enrolledCompanyCountQuery(bodyData);
        const enrolledCompanyId = await totalEnrolledCompanyId(bodyData);
        // const projectCount = await totalProjectCount(bodyData);

        for (const company of enrolledCompanyId) {
            const hasCompany = await checkCompanyHasProjects(company.company_id);
            if (hasCompany) {
                attendedCompanyCount = attendedCompanyCount + 1;
            }
        }


        const totalCount = {
            attendedVisitorCount,
            enrolledVisitorCount,
            attendedExhibitorCount,
            enrolledCompanyCount,
            attendedCompanyCount,
        }
        return Promise.resolve({
            totalCount: totalCount
        })
    } catch (error) {
        return Promise.reject(
            setRejectMessage(API_STATUS_CODE.INTERNAL_SERVER_ERROR, 'Internal Server Error')
        )
    }
}

module.exports = {
    allCountForDashboardTab2
}