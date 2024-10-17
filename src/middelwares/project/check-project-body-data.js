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

const _ = require('lodash');
const { API_STATUS_CODE } = require('../../consts/error-status');
const { isValidProjectName } = require('../../common/user-data-validator');


const checkProjectBodyData = (req, res, next) => {
    const errors = [];
    const projectData = {
        exhibitorId: req.body.exhibitorId,
        companiesId: req.body.companiesId,
        projectName: req.body.projectName,
    }
    console.log("🚀 ~ checkProjectBodyData ~ projectData:", projectData)

    if (_.isNil(projectData.exhibitorId)) {
        errors.push('Exhibitor ID is required');
    }
    if (_.isNil(projectData.companiesId)) {
        errors.push('Company ID is required');
    }
    if (!isValidProjectName(projectData.projectName)) {
        errors.push('Project name is invalid');
    }

    console.log("🚀 ~ checkProjectBodyData ~ errors:", errors)
    if (errors.length > 0) {
        return res.status(API_STATUS_CODE.BAD_REQUEST).send({
            status: "failed",
            message: errors,
        });
    }

    req.body.projectData = projectData;
    next();
}

module.exports = {
    checkProjectBodyData
}