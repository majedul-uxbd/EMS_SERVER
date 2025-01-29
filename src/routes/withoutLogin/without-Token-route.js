const express = require("express");
const withoutLoginRouter = express.Router();

const { addCompanyWithExhibitor } = require('../../main/company/add-company-and-exhibitor');
const { API_STATUS_CODE } = require("../../consts/error-status");
const { setServerResponse } = require("../../common/set-server-response");


withoutLoginRouter.post(
    '/add-company-with-exhibitor',
    async (req, res) => {
        try {
            const { lg, companyData, exhibitor } = req.body;

            // Basic validation
            if (!companyData || !exhibitor) {
                return res.status(API_STATUS_CODE.BAD_REQUEST).send(
                    setServerResponse(
                        API_STATUS_CODE.BAD_REQUEST,
                        'company_data_and_exhibitor_data_are_required',
                        lg
                    )
                );
            }

            const result = await addCompanyWithExhibitor(lg, companyData, exhibitor);
            const data = {
                companyId: result.companyId,
                exhibitorId: result.exhibitorId
            }
            return res.status(API_STATUS_CODE.OK).send(
                setServerResponse(
                    API_STATUS_CODE.OK,
                    'company_and_exhibitor_created_request_send_successfully',
                    lg,
                    data
                ));
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
