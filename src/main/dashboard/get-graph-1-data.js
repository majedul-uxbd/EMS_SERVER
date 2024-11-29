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

const getExhibitionsId = async () => {
    const _query = `
    SELECT
            id,
            exhibitions_title,
            exhibition_dates,
            exhibition_venue
        FROM
            exhibitions;
    `;
    try {
        const [result] = await pool.query(_query);
        return Promise.resolve(result);
    } catch (error) {
        return Promise.reject(error);
    }
}



const getAttendanceData = async (exhibitionId) => {
    const _query = `
	SELECT
        COUNT(DISTINCT a.visitors_id) AS visitor_count,
        COUNT(DISTINCT a.exhibitor_id) AS exhibitor_count,
        e.exhibitions_title
    FROM
        exhibitions AS e
    LEFT JOIN exhibition_days AS ed
    ON
        e.id = ed.exhibitions_id
    LEFT JOIN attendances AS a
    ON
        ed.id = a.exhibition_days_id
    WHERE
        e.id = ?;

  `;

    try {
        const [result] = await pool.query(_query, exhibitionId);
        return Promise.resolve(result);
    } catch (error) {
        // console.log('🚀 ~ file: get-graph-1-data.js:59 ~ getAttendanceData ~ error:', error);
        return Promise.reject(error);
    }
}


const getCompanyData = async (exhibitionId) => {
    const _query = `
	SELECT
        COUNT(ehc.id) AS company_count,
        ex.exhibitions_title
    FROM
        exhibitions ex
    LEFT JOIN  
        exhibitions_has_companies AS ehc
    ON
        ehc.exhibition_id = ex.id
    WHERE
        ex.id = ?;
  `;

    try {
        const [result] = await pool.query(_query, exhibitionId);
        return Promise.resolve(result);
    } catch (error) {
        // console.log('🚀 ~ file: get-graph-1-data.js:82 ~ getCompanyData ~ error:', error);
        return Promise.reject(error);
    }
}


const getProjectData = async (exhibitionId) => {
    const _query = `
	SELECT
        COUNT(projects.id) AS project_count,
        ex.exhibitions_title
    FROM
        exhibitions AS ex
    LEFT JOIN 
        exhibitions_has_companies AS ehc
    ON
        ex.id=ehc.exhibition_id  
    LEFT JOIN 
        projects 
    ON 
        projects.companies_id = ehc.company_id
    WHERE
        ex.id = ?;
  `;

    try {
        const [result] = await pool.query(_query, exhibitionId);
        return Promise.resolve(result);
    } catch (error) {
        // console.log('🚀 ~ file: get-graph-1-data.js:111 ~ getProjectData ~ error:', error);
        return Promise.reject(error);
    }
}


const getGraph1Data = async () => {
    const today = new Date();

    let attendedUserCount = [];
    let companyCount = [];
    let projectCount = [];
    try {
        const exhibitionId = await getExhibitionsId();

        if (exhibitionId.length <= 0) {
            return Promise.resolve({
                status: 'success',
                message: 'Exhibitions not found'
            })
        }

        const previousExhibitions = exhibitionId.filter(exhibition => {
            const dates = JSON.parse(exhibition.exhibition_dates);
            // Check if 1st date is after today
            const hasUpcomingDate = new Date(dates[0]) <= today;

            return hasUpcomingDate;
        });

        if (previousExhibitions.length > 0) {
            for (let i = 0; i < previousExhibitions.length; i++) {
                const attendedData = await getAttendanceData(previousExhibitions[i].id);
                const companyData = await getCompanyData(previousExhibitions[i].id);
                const projectData = await getProjectData(previousExhibitions[i].id);
                attendedUserCount.push({
                    exhibitionId: previousExhibitions[i].id,
                    exhibitionName: attendedData[0].exhibitions_title,
                    visitorCount: attendedData[0].visitor_count,
                    exhibitorCount: attendedData[0].exhibitor_count
                });
                companyCount.push({
                    exhibitionId: previousExhibitions[i].id,
                    exhibitionName: companyData[0].exhibitions_title,
                    companyCount: companyData[0].company_count
                });
                projectCount.push({
                    exhibitionId: previousExhibitions[i].id,
                    exhibitionName: projectData[0].exhibitions_title,
                    projectCount: projectData[0].project_count
                });
            }

            const totalCount = {
                attendedUserCount,
                companyCount,
                projectCount,
            }
            return Promise.resolve({
                status: 'success',
                message: 'Get data successfully',
                totalCount: totalCount
            })
        } else {
            return Promise.resolve({
                status: 'success',
                message: 'No exhibitions found'
            })

        }
    } catch (error) {
        // console.log('🚀 ~ file: get-graph-1-data.js:33 ~ getGraph1Data ~ error:', error);
        return Promise.reject(
            setRejectMessage(API_STATUS_CODE.INTERNAL_SERVER_ERROR, 'Internal Server Error')
        );
    }

}

module.exports = {
    getGraph1Data
}