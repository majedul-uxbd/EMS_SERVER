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

const authenticateToken = require('../../middlewares/jwt');
const { deleteUserInfo } = require('../../middlewares/common/delete-user-info');
const { updateUserInfo } = require('../../middlewares/common/update-user-info');
const { updateUserDataValidator } = require('../../middlewares/user/update-user-data-validator');
const {
    isUserRoleAdmin,
    isUserRoleAdminOrExhibitorAdminOrExhibitor,
    isUserRoleAdminOrExhibitorAdmin,
} = require('../../common/utilities/check-user-role');
const { getAllUserTableData } = require('../../main/user/get-all-user-data');
const { paginationData } = require('../../middlewares/common/pagination-data');
const { getAllVisitorTableData } = require('../../main/user/get-all-visitor-data');
const { companyDataValidator } = require('../../main/user/company-data-validator');
const { addCompanyData } = require('../../main/company/add-company-data');
const { deleteCompanyInfo } = require('../../main/company/delete-company-info');
const { getCompanyTableData } = require('../../main/company/get-company-data');
const { activeCompanyInfo } = require('../../main/company/active-company-data');
const { updateCompanyInfo } = require('../../main/company/update-company-data');
const { getActiveCompanyData } = require('../../main/company/get-active-company-data');
const { validateUserData } = require('../../middlewares/user/user-data-validator');
const { addCompanyWithExhibitor } = require('../../main/company/add-company-and-exhibitor');
const { getPendingCompanyExhibitorData } = require('../../main/company/show_pending _requestOfCompany_ExhibitorCreation');
const { approvePendingRequest } = require('../../main/company/approve_company_and_exhibitor');
const { disapprovePendingRequest } = require('../../main/company/disapprove-company');
const { addUser } = require('../../main/user/add-user');
const { getExhibition } = require('../../main/exhibitions/get-exhibitions');
const { getExhibitionData } = require('../../main/exhibitions/get-exhibitions-data');
const { getEventDate } = require('../../main/exhibitions/get-event-date');
const { addEventDetails } = require('../../main/exhibitions/add-event-details');
const { getPendingRequestsCount } = require('../../main/company/total-pending-company');
const { validateEventBodyData } = require('../../middlewares/exhibitions/validate-event-data');
const { activeUser } = require('../../main/user/active-user');
const { getPastExhibitionsData } = require('../../main/exhibitions/get-past-exhibitions-data');
const { getEnrolledUserData } = require('../../main/visitor/get-enrolled-user-data');
const { getEnrolledUserCountData } = require('../../main/visitor/get-enrolled-user-count-data');
const { getCompanyWiseExhibitorData } = require('../../main/exhibitors/get-company-wise-exhibitor-data');
const { getEnrolledExhibitionData } = require('../../main/exhibitions/get-enrolled-exhibition-data');
const { unassignOrganizer } = require('../../main/exhibitions/unassign-organizer');

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
                const { statusCode, status, message } = data;
                return res.status(statusCode).send({
                    status: status,
                    message: message,
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

/**
 * Through this API, Admin can see user data
 */
systemAdminRouter.post(
    '/get-user-data',
    isUserRoleAdmin,
    paginationData,
    async (req, res) => {
        getAllUserTableData(req.body, req.body.paginationData)
            .then((data) => {
                const { statusCode, status, message, result } = data;
                return res.status(statusCode).send({
                    status: status,
                    message: message,
                    ...result,
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

/**
 * Through this API, Admin can see visitor data
 */
systemAdminRouter.post(
    '/get-visitor-data',
    isUserRoleAdmin,
    paginationData,
    async (req, res) => {
        getAllVisitorTableData(req.body, req.body.paginationData)
            .then((data) => {
                const { statusCode, status, message, result } = data;
                return res.status(statusCode).send({
                    status: status,
                    message: message,
                    ...result,
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

/**
 * Through this API, admin can delete user and visitors data
 */
systemAdminRouter.post(
    '/delete',
    isUserRoleAdmin,
    async (req, res) => {
        deleteUserInfo(req.body)
            .then((data) => {
                const { statusCode, status, message } = data;
                return res.status(statusCode).send({
                    status: status,
                    message: message,
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

/**
 * Through this API, admin can update user and visitors data
 */
systemAdminRouter.post(
    '/update',
    isUserRoleAdmin,
    updateUserDataValidator,
    async (req, res) => {
        updateUserInfo(req.body.user, req.auth)
            .then((data) => {
                const { statusCode, status, message } = data;
                return res.status(statusCode).send({
                    status: status,
                    message: message,
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

/**
 * Through this API, system admin can add company
 */
systemAdminRouter.post(
    '/add-company',
    isUserRoleAdmin,
    companyDataValidator,
    async (req, res) => {
        addCompanyData(req.body.companyData)
            .then((data) => {
                const { statusCode, status, message } = data;
                return res.status(statusCode).send({
                    status: status,
                    message: message,
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

/**
 * Through this API, admin can delete company accounts
 */
systemAdminRouter.post(
    '/delete-company',
    isUserRoleAdmin,
    async (req, res) => {
        deleteCompanyInfo(req.body, req.auth)
            .then((data) => {
                const { statusCode, status, message } = data;
                return res.status(statusCode).send({
                    status: status,
                    message: message,
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

/**
 * Through this API, admin can active company accounts
 */
systemAdminRouter.post(
    '/active-company',
    isUserRoleAdmin,
    async (req, res) => {
        activeCompanyInfo(req.body)
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

/**
 * Through this API, admin can get company accounts data
 */
systemAdminRouter.post(
    '/get-company-data',
    isUserRoleAdmin,
    paginationData,
    async (req, res) => {
        getCompanyTableData(req.body, req.body.paginationData)
            .then((data) => {
                const { statusCode, status, message, result } = data;
                return res.status(statusCode).send({
                    status: status,
                    message: message,
                    ...result,
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

/**
 * Through this API, admin can get company and exhibitor creation request
 */
systemAdminRouter.post(
    '/get-pending-company-and-exhibitor-creation',
    isUserRoleAdmin,
    paginationData,
    async (req, res) => {
        getPendingCompanyExhibitorData(req.body, req.body.paginationData)
            .then((data) => {
                const { statusCode, status, message, result } = data;
                return res.status(statusCode).send({
                    status: status,
                    message: message,
                    ...result,
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
systemAdminRouter.post(
    '/approve-pending-request-company_and_exhibitor',
    isUserRoleAdmin,
    async (req, res) => {
        approvePendingRequest(req.body)
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

systemAdminRouter.post(
    '/disapprove-pending-request',
    isUserRoleAdmin,
    async (req, res) => {
        disapprovePendingRequest(req.body)
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

/**
 * Through this API, admin can update company data
 */
systemAdminRouter.post(
    '/update-company',
    isUserRoleAdmin,
    companyDataValidator,
    async (req, res) => {
        updateCompanyInfo(req.body.companyData)
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

/**
 * Through this API, admin can get active company data
 */
systemAdminRouter.post(
    '/active-company-data',
    isUserRoleAdminOrExhibitorAdminOrExhibitor,
    async (req, res) => {
        getActiveCompanyData(req.body)
            .then((data) => {
                const { statusCode, status, message, result } = data;
                return res.status(statusCode).send({
                    status: status,
                    message: message,
                    data: result
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
systemAdminRouter.post(
    '/get-exhibition',
    // isUserRoleAdmin,
    async (req, res) => {
        getExhibition(req.auth, req.body)
            .then((data) => {
                const { statusCode, status, message, result } = data;
                return res.status(statusCode).send({
                    status: status,
                    message: message,
                    ...result
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

/**
 * Through this API admin can see all exhibitions data
 */
systemAdminRouter.post(
    '/get-exhibition-data',
    // isUserRoleAdmin,
    async (req, res) => {
        getExhibitionData(req.body)
            .then((data) => {
                const { statusCode, status, message, result } = data;
                return res.status(statusCode).send({
                    status: status,
                    message: message,
                    data: result
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

/**
 * Through this API admin can see exhibitions date and days
 */
systemAdminRouter.post(
    '/get-event-date',
    // isUserRoleAdminO,
    async (req, res) => {
        getEventDate(req.body)
            .then((data) => {
                const { statusCode, status, message, result } = data;
                return res.status(statusCode).send({
                    status: status,
                    message: message,
                    data: result
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

/**
 * Through this API admin can add event details
 */
systemAdminRouter.post(
    '/add-event-details',
    isUserRoleAdmin,
    validateEventBodyData,
    async (req, res) => {
        addEventDetails(req.body.bodyData)
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

systemAdminRouter.post(
    '/total-pending-requests',
    isUserRoleAdmin,
    async (req, res) => {
        getPendingRequestsCount(req.body)
            .then((data) => {
                const { statusCode, status, message, result } = data;
                return res.status(statusCode).send({
                    status: status,
                    message: message,
                    totalPendingRequests: result
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

/**
 * @description This API is used to active an inactive user
 */
systemAdminRouter.post(
    '/active-user',
    isUserRoleAdmin,
    async (req, res) => {
        activeUser(req.body)
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

/**
 * @description This API is used to get past exhibitions
 */
systemAdminRouter.post(
    '/get-past-exhibitions',
    // isUserRoleAdmin,
    async (req, res) => {
        getPastExhibitionsData(req.auth, req.body)
            .then((data) => {
                const { statusCode, status, message, result } = data;
                return res.status(statusCode).send({
                    status: status,
                    message: message,
                    exhibitionData: result
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

/**
 * @description This API is used to get user data based on exhibition
 */
systemAdminRouter.post(
    '/get-enrolled-user-data',
    isUserRoleAdmin,
    async (req, res) => {
        getEnrolledUserData(req.body)
            .then((data) => {
                const { statusCode, status, message, result } = data;
                return res.status(statusCode).send({
                    status: status,
                    message: message,
                    exhibitionData: result
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

/**
 * @description This API is used to get user count based on exhibition
 */
systemAdminRouter.post(
    '/get-enrolled-user-count-data',
    isUserRoleAdmin,
    async (req, res) => {
        getEnrolledUserCountData(req.body)
            .then((data) => {
                const { statusCode, status, message, result } = data;
                return res.status(statusCode).send({
                    status: status,
                    message: message,
                    allCounts: result
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

/**
 * @description This API is used to get company wise exhibitor
 */
systemAdminRouter.post(
    '/get-company-wise-exhibitor',
    isUserRoleAdmin,
    async (req, res) => {
        getCompanyWiseExhibitorData(req.body)
            .then((data) => {
                const { statusCode, status, message, result } = data;
                return res.status(statusCode).send({
                    status: status,
                    message: message,
                    exhibitorData: result
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


/**
 * @description This API is used to get enrolled exhibition data
 */
systemAdminRouter.post(
    '/get-enrolled-exhibition',
    isUserRoleAdmin,
    async (req, res) => {
        getEnrolledExhibitionData(req.body)
            .then((data) => {
                const { statusCode, status, message, result } = data;
                return res.status(statusCode).send({
                    status: status,
                    message: message,
                    exhibitionData: result
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

/**
 * @description This API is used to unassign organizer 
 */
systemAdminRouter.post(
    '/unassign',
    isUserRoleAdmin,
    async (req, res) => {
        unassignOrganizer(req.body)
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
    systemAdminRouter,
};
