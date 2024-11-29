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

const getCompanyId = async (exhibitionId) => {
    const _query = `
    SELECT 
        company_id
    FROM 
        exhibitions_has_companies
    WHERE
        exhibition_id = ?;
    `;
    try {
        const [result] = await pool.query(_query, exhibitionId);
        if (result.length > 0) {
            return Promise.resolve(result);
        } return Promise.resolve(false);
    } catch (error) {
        // console.log('🚀 ~ file: get-graph-2-data.js:27 ~ getCompanyId ~ error:', error);
        return Promise.reject(error);
    }
}


const getExhibitionDaysId = async (exhibitionId) => {
    const _query = `
    SELECT 
        id
    FROM 
        exhibition_days
    WHERE
        exhibitions_id = ?;
    `;
    try {
        const [result] = await pool.query(_query, exhibitionId);
        if (result.length > 0) {
            return Promise.resolve(result);
        } return Promise.resolve(false);
    } catch (error) {
        // console.log('🚀 ~ file: get-graph-2-data.js:45 ~ getExhibitionDaysId ~ error:', error);
        return Promise.reject(error);
    }
}



const getAttendanceData = async (companyId) => {
    const _query = `
	SELECT
        COUNT(DISTINCT a.exhibitor_id) AS exhibitor_count,
        c.name
    FROM
        companies AS c
    LEFT JOIN exhibitions_has_companies AS exc
    ON
        c.id = exc.company_id
    LEFT JOIN exhibitions AS ex
    ON
        exc.exhibition_id = ex.id
    LEFT JOIN exhibition_days AS ed
    ON
        ex.id = ed.exhibitions_id
    LEFT JOIN attendances AS a
    ON
        ed.id = a.exhibition_days_id
    WHERE
        c.id = ?;

  `;

    try {
        const [result] = await pool.query(_query, companyId);
        return Promise.resolve(result);
    } catch (error) {
        // console.log('🚀 ~ file: get-graph-2-data.js:80 ~ getAttendanceData ~ error:', error);
        return Promise.reject(error);
    }
}


const getDayWiseAttendanceData = async (exhibitionDayId) => {
    const _query = `
	SELECT
        COUNT(visitors_id) AS visitor_count,
        COUNT(exhibitor_id) AS exhibitor_count,
        ex.exhibitions_title,
        ed.day_title
    FROM
        exhibitions AS ex
    LEFT JOIN exhibition_days ed
    ON
        ex.id = ed.exhibitions_id
    LEFT JOIN attendances AS a 
    ON ed.id = a.exhibition_days_id
    WHERE
        ed.id = ?;
  `;

    try {
        const [result] = await pool.query(_query, exhibitionDayId);
        return Promise.resolve(result[0]);
    } catch (error) {
        // console.log('🚀 ~ file: get-graph-2-data.js:107 ~ getDayWiseAttendanceData ~ error:', error);
        return Promise.reject(error);
    }
}


const getProjectData = async (companyId) => {
    const _query = `
	SELECT
        COUNT(p.id) AS project_count,
        c.name
    FROM
        companies AS c
    LEFT JOIN projects AS p
    ON
        c.id = p.companies_id
    WHERE
        c.id = ?;
  `;

    try {
        const [result] = await pool.query(_query, companyId);
        return Promise.resolve(result);
    } catch (error) {
        // console.log('🚀 ~ file: get-graph-2-data.js:134 ~ getProjectData ~ error:', error);
        return Promise.reject(error);
    }
}


const getGraph2Data = async (bodyData) => {
    let attendedUserCount = [];
    let projectCount = [];
    let dayWiseUserCount = [];
    try {
        const companyId = await getCompanyId(bodyData.exhibitionId);
        const exhibitionDaysId = await getExhibitionDaysId(bodyData.exhibitionId);
        if (companyId === false) {
            return Promise.resolve({
                status: 'success',
                message: 'No data found'
            })
        }
        if (exhibitionDaysId === false) {
            return Promise.resolve({
                status: 'success',
                message: 'No data found'
            })
        }
        for (let i = 0; i < exhibitionDaysId.length; i++) {
            const dayWiseAttendance = await getDayWiseAttendanceData(exhibitionDaysId[i].id);

            dayWiseUserCount.push({
                exhibition: dayWiseAttendance.exhibitions_title,
                day: dayWiseAttendance.day_title,
                visitorCount: dayWiseAttendance.visitor_count,
                exhibitorCount: dayWiseAttendance.exhibitor_count,
            })
        }
        for (let i = 0; i < companyId.length; i++) {
            const attendedData = await getAttendanceData(companyId[i].company_id);
            const projectData = await getProjectData(companyId[i].company_id);
            attendedUserCount.push({
                companyId: companyId[i].company_id,
                companyName: attendedData[0].name,
                attendedData: attendedData[0].exhibitor_count
            });

            projectCount.push({
                companyId: companyId[i].company_id,
                companyName: projectData[0].name,
                projectCount: projectData[0].project_count
            });
        }

        const totalCount = {
            attendedUserCount,
            projectCount,
            dayWiseUserCount
        }
        return Promise.resolve({
            status: 'success',
            message: 'Get data successfully',
            totalCount: totalCount
        })
    } catch (error) {
        // console.log('🚀 ~ file: get-graph-2-data.js:167 ~ getGraph2Data ~ error:', error);
        return Promise.reject(
            setRejectMessage(API_STATUS_CODE.INTERNAL_SERVER_ERROR, 'Internal Server Error')
        );
    }

}

module.exports = {
    getGraph2Data
}