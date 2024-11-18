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

const totalVisitorCount = async () => {
    const _query = `
    SELECT 
        COUNT(*) AS total_visitors
    FROM 
        visitors;
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
    WHERE
        role = 'exhibitor';
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
        companies;
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
const allCountForDashboardTab1 = async () => {
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
        return Promise.resolve({
            totalCount: totalCount
        })
    } catch (error) {
        // console.log('🚀 ~ file: all-count-for-dashboard-tab-1.js:118 ~ allCountForDashboardTab1 ~ error:', error);
        return Promise.reject(
            setRejectMessage(API_STATUS_CODE.INTERNAL_SERVER_ERROR, 'Internal Server Error')
        )
    }
}

module.exports = {
    allCountForDashboardTab1
}