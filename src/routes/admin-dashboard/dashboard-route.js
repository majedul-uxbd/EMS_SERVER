const express = require("express");
const dashboardRouter = express.Router();


const { isUserRoleAdmin } = require("../../common/utilities/check-user-role");
const authenticateToken = require("../../middlewares/jwt");
const { API_STATUS_CODE } = require("../../consts/error-status");
const { allCountForDashboardTab1 } = require("../../main/dashboard/all-count-for-dashboard-tab-1");
const { allCountForDashboardTab2 } = require("../../main/dashboard/all-count-for-dashboard-tab-2");
const { getGraph1Data } = require("../../main/dashboard/get-graph-1-data");
const { getGraph2Data } = require("../../main/dashboard/get-graph-2-data");

dashboardRouter.use(authenticateToken);

/**
 * This API will return all count for the dashboard tab 1
 */
dashboardRouter.get(
    "/all-count-tab1",
    isUserRoleAdmin,
    async (req, res) => {
        allCountForDashboardTab1()
            .then((data) => {
                return res.status(API_STATUS_CODE.OK).send({
                    status: data.status,
                    message: data.message,
                    totalCount: data.totalCount
                });
            })
            .catch((error) => {
                const { statusCode, message } = error;
                return res.status(statusCode).send({
                    status: "failed",
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
                return res.status(API_STATUS_CODE.OK).send({
                    status: data.status,
                    message: data.message,
                    totalCount: data.totalCount
                });
            })
            .catch((error) => {
                const { statusCode, message } = error;
                return res.status(statusCode).send({
                    status: "failed",
                    message: message,
                });
            });
    }
);


/**
 * This API will return all graph count for the dashboard tab 1 based on exhibition
 */
dashboardRouter.get(
    "/graph-1",
    isUserRoleAdmin,
    async (req, res) => {
        getGraph1Data(req.body)
            .then((data) => {
                return res.status(API_STATUS_CODE.OK).send({
                    status: data.status,
                    message: data.message,
                    totalCount: data.totalCount
                });
            })
            .catch((error) => {
                const { statusCode, message } = error;
                return res.status(statusCode).send({
                    status: "failed",
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
                return res.status(API_STATUS_CODE.OK).send({
                    status: data.status,
                    message: data.message,
                    totalCount: data.totalCount
                });
            })
            .catch((error) => {
                const { statusCode, message } = error;
                return res.status(statusCode).send({
                    status: "failed",
                    message: message,
                });
            });
    }
);

module.exports = {
    dashboardRouter
}