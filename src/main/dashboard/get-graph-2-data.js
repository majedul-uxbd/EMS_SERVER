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

const getCompanyId = async () => {
    const _query = `
    SELECT 
        company_id
    FROM 
        exhibitions_has_companies;
    `;
    try {
        const [result] = await pool.query(_query);
        return Promise.resolve(result);
    } catch (error) {
        return Promise.reject(error);
    }
}



const getAttendanceData = async (companyId) => {
    const _query = `
	SELECT
        COUNT(DISTINCT a.exhibitor_id) AS exhibitor_count,
        ex.exhibitions_title
    FROM
        attendances AS a
    LEFT JOIN exhibition_days AS ed
    ON
        a.exhibition_days_id = ed.id
    LEFT JOIN exhibitions_has_companies AS exc
    ON
        ed.exhibitions_id = exc.exhibition_id
    LEFT JOIN exhibitions AS ex
    ON
        exc.exhibition_id = ex.id
    WHERE
        exc.company_id = ?;

  `;

    try {
        const [result] = await pool.query(_query, companyId);
        return Promise.resolve(result);
    } catch (error) {
        // console.log("🚀 ~ getAttendenceData ~ error:", error)
        return Promise.reject(error);
    }
}


const getDayWiseAttendanceData = async (exhibitionId) => {
    const _query = `
	SELECT
        COUNT(DISTINCT a.visitors_id) AS visitor_count,
        COUNT(DISTINCT a.exhibitor_id) AS exhibitor_count,
        e.exhibitions_title
    FROM
        attendances AS a
    LEFT JOIN exhibition_days AS ed
    ON
        a.exhibition_days_id = ed.id
    LEFT JOIN exhibitions AS e
    ON
        ed.exhibitions_id = e.id
    WHERE
        e.id = ?;
  `;

    try {
        const [result] = await pool.query(_query, exhibitionId);
        return Promise.resolve(result[0]);
    } catch (error) {
        return Promise.reject(error);
    }
}


const getProjectData = async (companyId) => {
    const _query = `
	SELECT
        COUNT(projects.id) AS project_count,
        ex.exhibitions_title
    FROM
        projects
    LEFT JOIN exhibitions_has_companies AS ehc
    ON
        projects.companies_id = ehc.company_id
    LEFT JOIN
        exhibitions as ex
    ON 
        ehc.exhibition_id = ex.id
    WHERE
        ehc.company_id = ?;
  `;

    try {
        const [result] = await pool.query(_query, companyId);
        return Promise.resolve(result);
    } catch (error) {
        // console.log("🚀 ~ getAttendenceData ~ error:", error)
        return Promise.reject(error);
    }
}


const getGraph2Data = async (bodyData) => {
    let attendedUserCount = [];
    let projectCount = [];
    try {
        const companyId = await getCompanyId();
        const attendancesData = await getDayWiseAttendanceData(bodyData.exhibitionId);
        for (let i = 0; i < companyId.length; i++) {
            const attendedData = await getAttendanceData(companyId[i].company_id);
            const projectData = await getProjectData(companyId[i].company_id);
            attendedUserCount.push({
                exhibitionId: companyId[i].company_id,
                exhibitions_title: attendedData[0].exhibitions_title,
                exhibitorCount: attendedData[0].exhibitor_count
            });

            projectCount.push({
                exhibitionId: companyId[i].company_id,
                exhibitions_title: projectData[0].exhibitions_title,
                projectCount: projectData[0].project_count
            });
        }

        const totalCount = {
            attendedUserCount,
            projectCount,
            attendancesData
        }
        return Promise.resolve({
            totalCount: totalCount
        })
    } catch (error) {
        // console.log('🚀 ~ file: get-graph-1-data.js:33 ~ getGraph1Data ~ error:', error);
        return Promise.reject(
            setRejectMessage(API_STATUS_CODE.INTERNAL_SERVER_ERROR, 'Internal Server Error')
        );
    }

}

module.exports = {
    getGraph2Data
}