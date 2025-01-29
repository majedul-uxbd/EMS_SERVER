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

const totalVisitorCount = async () => {
    const _query = `
    SELECT 
        COUNT(*) AS total_visitors
    FROM 
        visitors
    WHERE
        is_user_active = ${1};
    `;
    try {
        const [result] = await pool.query(_query);
        return Promise.resolve(result[0].total_visitors);
    } catch (error) {
        return Promise.reject(error);
    }
}

const totalExhibitorCount = async () => {
    const _query = `
    SELECT
        COUNT(*) AS total_exhibitors
    FROM
        user
    LEFT JOIN
        companies AS company
    ON
        user.companies_id = company.id
    WHERE
        user.role IN('exhibitor', 'exhibitor_admin') AND 
        user.current_status IS NULL;
    `;
    try {
        const [result] = await pool.query(_query);
        return Promise.resolve(result[0].total_exhibitors);
    } catch (error) {
        return Promise.reject(error);
    }
}

const totalOrganizerCount = async () => {
    const _query = `
    SELECT 
        COUNT(*) AS total_organizers
    FROM 
        user
    WHERE
        role = 'organizer';
    `;
    try {
        const [result] = await pool.query(_query);
        return Promise.resolve(result[0].total_organizers);
    } catch (error) {
        return Promise.reject(error);
    }
}

const totalCompanyCount = async () => {
    const _query = `
    SELECT 
        COUNT(*) AS total_companies
    FROM 
        companies
    WHERE
        current_status IS NULL;
    `;
    try {
        const [result] = await pool.query(_query);
        return Promise.resolve(result[0].total_companies);
    } catch (error) {
        return Promise.reject(error);
    }
}

const totalProjectCount = async () => {
    const _query = `
    SELECT 
        COUNT(*) AS total_projects
    FROM 
        projects;
    `;
    try {
        const [result] = await pool.query(_query);
        return Promise.resolve(result[0].total_projects);
    } catch (error) {
        return Promise.reject(error);
    }
}


/**
 * @description This function is used to retrieve count of all users 
 */
const allCountForDashboardTab1 = async (bodyData) => {
    const lgKey = bodyData.lg;
    try {
        const visitorCount = await totalVisitorCount();
        const exhibitorCount = await totalExhibitorCount();
        const organizerCount = await totalOrganizerCount();
        const companyCount = await totalCompanyCount();
        const projectCount = await totalProjectCount();

        const totalCount = {
            visitorCount,
            exhibitorCount,
            organizerCount,
            companyCount,
            projectCount
        }
        return Promise.resolve(
            setServerResponse(
                API_STATUS_CODE.OK,
                'get_data_successfully',
                lgKey,
                totalCount
            )
        )
    } catch (error) {
        // console.log('🚀 ~ file: all-count-for-dashboard-tab-1.js:118 ~ allCountForDashboardTab1 ~ error:', error);
        return Promise.reject(
            setServerResponse(
                API_STATUS_CODE.INTERNAL_SERVER_ERROR,
                'internal_server_error',
                lgKey,
            )
        )
    }
}

module.exports = {
    allCountForDashboardTab1
}