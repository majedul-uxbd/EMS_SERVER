const express = require("express");
const withoutLoginRouter = express.Router();

const { addCompanyWithExhibitor } = require('../../main/company/add-company-and-exhibitor');
const { API_STATUS_CODE } = require("../../consts/error-status");


withoutLoginRouter.post(
    '/add-company-with-exhibitor',
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

module.exports = {
    withoutLoginRouter,
};
