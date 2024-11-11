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
const systemAdminRouter = express.Router();

const { checkUserIdValidity } = require('../../middlewares/check-user-id-validity');
const authenticateToken = require('../../middlewares/jwt');
const { deleteUserInfo } = require('../../middlewares/common/delete-user-info');
const { API_STATUS_CODE } = require('../../consts/error-status');
const { updateUserInfo } = require('../../middlewares/common/update-user-info');
const { updateUserDataValidator } = require('../../middlewares/user/update-user-data-validator');
const { isUserRoleAdmin, isUserRoleAdminOrExhibitorAdminOrExhibitor, isUserRoleAdminOrExhibitorAdmin } = require('../../common/utilities/check-user-role');
const { getAllUserTableData } = require('../../main/user/get-all-user-data');
const { paginationData } = require('../../middlewares/common/pagination-data');
const { getAllVisitorTableData } = require('../../main/user/get-all-visitor-data');
const { companyDataValidator } = require('../../main/user/company-data-validator');
const { addCompanyData } = require('../../main/user/add-company-data');
const { deleteCompanyInfo } = require('../../main/company/delete-company-info');
const { getCompanyTableData } = require('../../main/company/get-company-data');
const { activeCompanyInfo } = require('../../main/company/active-company-data');
const { updateCompanyInfo } = require('../../main/company/update-company-data');
const { getActiveCompanyData } = require('../../main/company/get-active-company-data');
const { validateUserData } = require('../../middlewares/user/user-data-validator');
const { getDocumentData } = require('../../main/document/get-document-data');
const {
    addCompanyWithExhibitor } = require('../../main/company/add-company-and-exhibitor');
const { addUser } = require('../../main/user/add-user');
const { getExhibition } = require('../../main/exhibitions/get-exhibitions');
const { getExhibitionData } = require('../../main/exhibitions/get-exhibitions-data');
const { getEventDate } = require('../../main/exhibitions/get-event-date');
systemAdminRouter.use(authenticateToken);



/**
 * This API will create a new exhibitor or organizer
 */
systemAdminRouter.post(
    '/add',
    isUserRoleAdminOrExhibitorAdmin,
    validateUserData,
    async (req, res) => {

        addUser(req.body.user)
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


/**
 * Through this API, Admin can see user data
 */
systemAdminRouter.post('/get-user-data',
    isUserRoleAdmin,
    checkUserIdValidity,
    paginationData,
    async (req, res) => {
        getAllUserTableData(req.body, req.body.paginationData)
            .then(data => {
                return res.status(API_STATUS_CODE.OK).send({
                    status: 'success',
                    message: "Get user data successfully",
                    ...data
                })
            })
            .catch(error => {
                const { statusCode, message } = error;
                return res.status(statusCode).send({
                    status: 'failed',
                    message: message,
                })
            })
    });


/**
 * Through this API, Admin can see visitor data
 */
systemAdminRouter.post('/get-visitor-data',
    isUserRoleAdmin,
    checkUserIdValidity,
    paginationData,
    async (req, res) => {
        getAllVisitorTableData(req.body.paginationData)
            .then(data => {
                return res.status(API_STATUS_CODE.OK).send({
                    status: 'success',
                    message: "Get visitors data successfully",
                    ...data
                })
            })
            .catch(error => {
                const { statusCode, message } = error;
                return res.status(statusCode).send({
                    status: 'failed',
                    message: message,
                })
            })
    });

/**
 * Through this API, admin can delete user and visitors data
 */
systemAdminRouter.post('/delete',
    isUserRoleAdmin,
    async (req, res) => {
        deleteUserInfo(req.body)
            .then(data => {
                return res.status(API_STATUS_CODE.OK).send({
                    status: data.status,
                    message: data.message
                })
            })
            .catch(error => {
                const { statusCode, message } = error;
                return res.status(statusCode).send({
                    status: 'failed',
                    message: message,
                })
            })
    });


/**
 * Through this API, admin can update user and visitors data
 */
systemAdminRouter.post('/update',
    isUserRoleAdmin,
    updateUserDataValidator,
    async (req, res) => {
        updateUserInfo(req.body.user, req.auth)
            .then(data => {
                return res.status(API_STATUS_CODE.OK).send({
                    status: 'success',
                    message: "User updated successfully"
                })
            })
            .catch(error => {
                const { statusCode, message } = error;
                return res.status(statusCode).send({
                    status: 'failed',
                    message: message,
                })
            })
    }
);

/**
 * Through this API, admin can create company accounts
 */
// Route to create company and exhibitor
systemAdminRouter.post(
    '/add-company-with-exhibitor',
    checkUserIdValidity,
    isUserRoleAdmin,
    async (req, res) => {
        try {
            const { companyData, exhibitor } = req.body;

            // Basic validation
            if (!companyData || !exhibitor) {
                return res.status(API_STATUS_CODE.BAD_REQUEST).json({
                    status: 'failed',
                    message: 'Company data and exhibitor data are required'
                });
            }

            const result = await addCompanyWithExhibitor(companyData, exhibitor);

            return res.status(API_STATUS_CODE.OK).json({
                status: 'success',
                message: 'Company and Exhibitor created successfully',
                data: {
                    companyId: result.companyId,
                    exhibitorId: result.exhibitorId
                }
            });
        } catch (error) {
            const statusCode = error.statusCode || API_STATUS_CODE.INTERNAL_SERVER_ERROR;
            return res.status(statusCode).json({
                status: 'failed',
                message: error.message || 'Internal Server Error'
            });
        }
    }
);

systemAdminRouter.post('/add-company',
    checkUserIdValidity,
    isUserRoleAdmin,
    companyDataValidator,
    async (req, res) => {

        addCompanyData(req.body.companyData)
            .then(data => {
                return res.status(API_STATUS_CODE.OK).send({
                    status: data.status,
                    message: data.message
                })
            })
            .catch(error => {
                const { statusCode, message } = error;
                return res.status(statusCode).send({
                    status: 'failed',
                    message: message,
                })
            })

    });


/**
* Through this API, admin can delete company accounts
*/
systemAdminRouter.post('/delete-company',
    isUserRoleAdmin,
    async (req, res) => {
        deleteCompanyInfo(req.body, req.auth)
            .then(data => {
                return res.status(API_STATUS_CODE.OK).send({
                    status: data.status,
                    message: data.message,
                    de_active_user: data.de_active_user,
                })
            })
            .catch(error => {
                const { statusCode, message } = error;
                return res.status(statusCode).send({
                    status: 'failed',
                    message: message,
                })
            })
    });

/**
* Through this API, admin can active company accounts
*/
systemAdminRouter.post('/active-company',
    isUserRoleAdmin,
    async (req, res) => {
        activeCompanyInfo(req.body)
            .then(data => {
                return res.status(API_STATUS_CODE.OK).send({
                    status: data.status,
                    message: data.message,
                    active_user: data.active_user,
                })
            })
            .catch(error => {
                const { statusCode, message } = error;
                return res.status(statusCode).send({
                    status: 'failed',
                    message: message,
                })
            })
    });

/**
* Through this API, admin can get company accounts data
*/
systemAdminRouter.post('/get-company-data',
    isUserRoleAdmin,
    paginationData,
    async (req, res) => {
        getCompanyTableData(req.body.paginationData)
            .then(data => {
                return res.status(API_STATUS_CODE.OK).send({
                    status: 'success',
                    message: "Get Company data successfully",
                    ...data
                })
            })
            .catch(error => {
                const { statusCode, message } = error;
                return res.status(statusCode).send({
                    status: 'failed',
                    message: message,
                })
            })
    });

/**
* Through this API, admin can update company data
*/
systemAdminRouter.post('/update-company',
    isUserRoleAdmin,
    companyDataValidator,
    async (req, res) => {
        updateCompanyInfo(req.body.companyData)
            .then(data => {
                return res.status(API_STATUS_CODE.OK).send({
                    status: data.status,
                    message: data.message
                })
            })
            .catch(error => {
                const { statusCode, message } = error;
                return res.status(statusCode).send({
                    status: 'failed',
                    message: message,
                })
            })
    });

/**
* Through this API, admin can get active company data
*/
systemAdminRouter.post('/active-company-data',
    isUserRoleAdminOrExhibitorAdminOrExhibitor,
    async (req, res) => {
        getActiveCompanyData()
            .then(data => {
                return res.status(API_STATUS_CODE.OK).send({
                    status: data.status,
                    message: data.message,
                    ...data
                })
            })
            .catch(error => {
                const { statusCode, message } = error;
                return res.status(statusCode).send({
                    status: 'failed',
                    message: message,
                })
            })
    });

/**
 * This API will return all document Data
 */
// systemAdminRouter.post('/get-document-data',
//     isUserRoleAdmin,
//     paginationData,
//     async (req, res) => {
//         getDocumentData(req.body.paginationData)
//             .then(data => {
//                 return res.status(API_STATUS_CODE.OK).send({
//                     status: 'success',
//                     message: 'Get document data successfully',
//                     ...data
//                 })
//             })
//             .catch(error => {
//                 const { statusCode, message } = error;
//                 return res.status(statusCode).send({
//                     status: 'failed',
//                     message: message,
//                 })
//             })
//     });


/**
* Through this API admin can see all exhibitions
*/
systemAdminRouter.get('/get-exhibition',
    isUserRoleAdmin,
    async (req, res) => {
        getExhibition()
            .then(data => {
                return res.status(API_STATUS_CODE.OK).send({
                    status: 'success',
                    message: 'Get exhibitions successfully',
                    ...data
                })
            })
            .catch(error => {
                const { statusCode, message } = error;
                return res.status(statusCode).send({
                    status: 'failed',
                    message: message,
                })
            });
    });


/**
* Through this API admin can see all exhibitions data
*/
systemAdminRouter.post('/get-exhibition-data',
    isUserRoleAdmin,
    async (req, res) => {

        getExhibitionData(req.body)
            .then(data => {
                return res.status(API_STATUS_CODE.OK).send({
                    status: 'success',
                    message: 'Get exhibitions data successfully',
                    ...data
                })
            })
            .catch(error => {
                const { statusCode, message } = error;
                return res.status(statusCode).send({
                    status: 'failed',
                    message: message,
                })
            });
    });


/**
* Through this API admin can see exhibitions date and days
*/
systemAdminRouter.post('/get-event-date',
    isUserRoleAdmin,
    async (req, res) => {

        getEventDate(req.body)
            .then(data => {
                return res.status(API_STATUS_CODE.OK).send({
                    status: 'success',
                    message: 'Get event data successfully',
                    ...data
                })
            })
            .catch(error => {
                const { statusCode, message } = error;
                return res.status(statusCode).send({
                    status: 'failed',
                    message: message,
                })
            });
    });


module.exports = {
    systemAdminRouter
}