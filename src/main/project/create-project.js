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
const {
	isValidProjectName,
	isValidProjectPlatform,
} = require("../../common/user-data-validator");
const { API_STATUS_CODE } = require("../../consts/error-status");


const getCompanyId = async (authData) => {
	const _query = `
    SELECT
        companies_id
    FROM
        user
    WHERE
        id = ?;
    `;

	try {
		const [result] = await pool.query(_query, authData.id);
		if (result.length > 0) {
			return result[0].companies_id;
		}
	} catch (error) {
		// console.log("🚀 ~ getCompanyId ~ error:", error);
		return Promise.reject(error);
	}
};


const checkDuplicateProjectName = async (companyId) => {
	const _query = `
    SELECT
        project_name
    FROM
        projects
	WHERE
		companies_id = ?;
    `;

	try {
		const [result] = await pool.query(_query, companyId);
		if (result.length > 0) {
			return result
		} return 0;
	} catch (error) {
		// console.log("🚀 ~ getCompanyId ~ error:", error);
		return Promise.reject(error);
	}
};

const insertProjectDataQuery = async (authData, projectData) => {
	const _query = `
    INSERT INTO
        projects
        (
            companies_id,
            project_name,
            project_platform,
            created_by,
            created_at
        )
    VALUES (?, ?, ?, ?, ?);
    `;
	const _values = [
		projectData.companyId,
		projectData.projectName,
		projectData.platform,
		authData.id,
		projectData.createdAt,
	];

	try {
		const [result] = await pool.query(_query, _values);
		if (result.affectedRows > 0) {
			return true;
		}
		return false;
	} catch (error) {
		// console.log("🚀 ~ getCompanyId ~ error:", error);
		return Promise.reject(error);
	}
};

/**
 * @param {string} str1 
 * @param {string} str2 
 * @param {boolean} caseInsensitive 
 * @description This function will check if the str1 and str2 are the same string or not.
 */
const compareStrings = (str1, str2, caseInsensitive = true) => {
	const splitStr1 = str1.trim().split(/\s+/);
	const splitStr2 = str2.trim().split(/\s+/);

	if (splitStr1.length === splitStr2.length) {
		for (let i = 0; i < splitStr1.length; i++) {
			if (caseInsensitive) {
				if (splitStr1[i].toLowerCase() !== splitStr2[i].toLowerCase()) {
					return false;
				}
			} else {
				if (splitStr1[i] !== splitStr2[i]) {
					return false;
				}
			}
		}
		return true;
	}
	return false;
}

/**
 * @description This function is used to create new project
 */
const createProjectData = async (authData, projectData) => {
	const lgKey = projectData.lg;

	if (!isValidProjectName(projectData.projectName)) {
		return Promise.reject(
			setServerResponse(
				API_STATUS_CODE.BAD_REQUEST,
				'project_name_is_not_valid',
				lgKey,
			)
		);
	}
	if (!isValidProjectPlatform(projectData.platform)) {
		return Promise.reject(
			setServerResponse(
				API_STATUS_CODE.BAD_REQUEST,
				'project_platform_is_not_valid',
				lgKey,
			)
		);
	}
	const createdAt = new Date();
	let isMatched = false;

	try {
		const companyId = await getCompanyId(authData);
		const projectName = await checkDuplicateProjectName(companyId);
		if (projectName !== 0) {
			for (const project of projectName) {
				const result = compareStrings(projectData.projectName, project.project_name);
				if (result) {
					// console.log(`Match found: ${projectData.projectName} matches with ${project.project_name}`);
					isMatched = true;
					break;
				}
			}
			if (isMatched === true) {
				return Promise.reject(
					setServerResponse(
						API_STATUS_CODE.BAD_REQUEST,
						'project_name_has_already_exists',
						lgKey,
					)
				);
			}
		}
		projectData = { ...projectData, companyId, createdAt: createdAt };
		const isInsertData = await insertProjectDataQuery(authData, projectData);
		if (isInsertData) {
			return Promise.resolve(
				setServerResponse(
					API_STATUS_CODE.OK,
					'project_data_successfully_inserted',
					lgKey,
				)
			);
		}
	} catch (error) {
		// console.log("🚀 ~ createProjectData ~ error:", error)
		return Promise.reject(
			setServerResponse(
				API_STATUS_CODE.INTERNAL_SERVER_ERROR,
				'internal_server_error',
				lgKey,
			)
		);
	}
};

module.exports = {
	createProjectData,
};
