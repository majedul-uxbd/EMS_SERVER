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
const { setServerResponse } = require('../common/set-server-response');
const { API_STATUS_CODE } = require('../consts/error-status');
const testRouter = express.Router();

testRouter.post('/', async (req, res) => {
    const lgKey = req.body.lg;
    console.log('🚀 ~ file: test-route.js:18 ~ testRouter.post ~ lgKey:', lgKey);
    setServerResponse(API_STATUS_CODE.OK, 'you_have_already_enrolled', lgKey);
})

module.exports = {
    testRouter
}