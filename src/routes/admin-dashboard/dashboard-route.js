const express = require("express");
const dashboardRouter = express.Router();


const { isUserRoleAdmin } = require("../../common/utilities/check-user-role");
const authenticateToken = require("../../middlewares/jwt");
const { allCountForDashboardTab1 } = require("../../main/dashboard/all-count-for-dashboard-tab-1");
const { allCountForDashboardTab2 } = require("../../main/dashboard/all-count-for-dashboard-tab-2");
const { getGraph1Data } = require("../../main/dashboard/get-graph-1-data");
const { getGraph2Data } = require("../../main/dashboard/get-graph-2-data");

dashboardRouter.use(authenticateToken);

/**
 * This API will return all count for the dashboard tab 1
 */
dashboardRouter.post(
    "/all-count-tab1",
    isUserRoleAdmin,
    async (req, res) => {
        allCountForDashboardTab1(req.body)
            .then((data) => {
                const { statusCode, status, message, result } = data;
                return res.status(statusCode).send({
                    status: status,
                    message: message,
                    totalCount: result
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
 * This API will return all count for the dashboard tab 2 based on exhibition
 */
dashboardRouter.post(
    "/all-count-tab2",
    isUserRoleAdmin,
    async (req, res) => {
        allCountForDashboardTab2(req.body)
            .then((data) => {
                const { statusCode, status, message, result } = data;
                return res.status(statusCode).send({
                    status: status,
                    message: message,
                    totalCount: result
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
 * This API will return all graph count for the dashboard tab 1 based on exhibition
 */
dashboardRouter.post(
    "/graph-1",
    isUserRoleAdmin,
    async (req, res) => {
        getGraph1Data(req.body)
            .then((data) => {
                const { statusCode, status, message, result } = data;
                return res.status(statusCode).send({
                    status: status,
                    message: message,
                    totalCount: result
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
 * This API will return all graph count for the dashboard tab 2 based on exhibition
 */
dashboardRouter.post(
    "/graph-2",
    isUserRoleAdmin,
    async (req, res) => {
        getGraph2Data(req.body)
            .then((data) => {
                const { statusCode, status, message, result } = data;
                return res.status(statusCode).send({
                    status: status,
                    message: message,
                    totalCount: result
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
    dashboardRouter
}