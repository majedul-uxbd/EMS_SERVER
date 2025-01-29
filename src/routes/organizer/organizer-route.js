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

const express = require('express');
const organizerRouter = express.Router();


const authenticateToken = require('../../middlewares/jwt');
const { isUserRoleAdmin } = require('../../common/utilities/check-user-role');
const { validateOrganizerData } = require('../../middlewares/organizer/validate-organizer-data');
const { addOrganizerData } = require('../../main/organizer/add-organizer-data');
const { API_STATUS_CODE } = require('../../consts/error-status');
const { enrollOrganizer } = require('../../main/organizer/enroll-organizer');


organizerRouter.use(authenticateToken);


// organizerRouter.post(
//     '/add',
//     authenticateToken,
//     isUserRoleAdmin,
//     validateOrganizerData,
//     async (req, res) => {
//         addOrganizerData(req.body.organizerData)
//             .then((data) => {
//                 const { statusCode, status, message } = data;
//                 return res.status(statusCode).send({
//                     status: status,
//                     message: message
//                 });
//             })
//             .catch((error) => {
//                 const { statusCode, status, message } = error;
//                 return res.status(statusCode).send({
//                     status: status,
//                     message: message,
//                 });
//             });
//     }
// );


/**
 * This API is used to enroll a organizer in a exhibition
 */
organizerRouter.post(
    '/enroll',
    authenticateToken,
    isUserRoleAdmin,
    async (req, res) => {
        enrollOrganizer(req.body)
            .then((data) => {
                const { statusCode, status, message } = data;
                return res.status(statusCode).send({
                    status: status,
                    message: message
                });
            })
            .catch((error) => {
                const { statusCode, status, message } = error;
                return res.status(statusCode).send({
                    status: status,
                    message: message,
                });
            });
    }
);

module.exports = {
    organizerRouter
}