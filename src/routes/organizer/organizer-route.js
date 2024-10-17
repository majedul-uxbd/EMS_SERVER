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

const express = require('express');
const organizerRouter = express.Router();


const authenticateToken = require('../../middelwares/jwt');
const { isUserRoleAdmin } = require('../../common/utilities/check-user-role');
const { validateOrganizerData } = require('../../middelwares/organizer/validate-organizer-data');
const { addOrganizerData } = require('../../main/organizer/add-organizer-data');
const { API_STATUS_CODE } = require('../../consts/error-status');


organizerRouter.use(authenticateToken);


organizerRouter.post(
    '/add',
    authenticateToken,
    isUserRoleAdmin,
    validateOrganizerData,
    async (req, res) => {
        addOrganizerData(req.body.organizerData)
            .then((data) => {
                return res.status(API_STATUS_CODE.ACCEPTED).send({
                    status: data.status,
                    message: data.message,
                });
            })
            .catch((error) => {
                const { statusCode, message } = error;
                return res.status(statusCode).send({
                    status: 'failed',
                    message: message,
                });
            });
    }
);


module.exports = {
    organizerRouter
}