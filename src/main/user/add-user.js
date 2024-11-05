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

const bcrypt = require("bcrypt");
const { API_STATUS_CODE } = require("../../consts/error-status");
const { pool } = require("../../../database/db");
const { format } = require('date-fns');

const { setRejectMessage } = require("../../common/set-reject-message");
const { generateRandomString } = require("../../common/utilities/generate-random-string");
const { sendMail } = require("../../helpers/send-mail");
const { FRONTEND_URL, USER_LOGIN } = require("../../config");


const checkDuplicateEmail = async (email) => {
    const _query = `
    SELECT 
        email
    FROM
        user
    WHERE
        email = ?;
`;

    const values = [
        email
    ];

    try {
        const [result] = await pool.query(_query, values);
        if (result.length > 0) {
            return true;
        }
        return false;
    } catch (error) {
        // console.log("🚀 ~ userLoginQuery ~ error:", error)
        return Promise.reject(
            setRejectMessage(
                API_STATUS_CODE.INTERNAL_SERVER_ERROR,
                'operation_failed'
            )
        );
    }
};

const insertUserQuery = async (user) => {
    const query = `
	INSERT INTO
        user
        (
            companies_id,
            f_name,
            l_name,
            email,
            password,
            contact_no,
            position,
            role,
            profile_img,
            created_at
        )
	VALUES (?,?,?,?,?,?,?,?,?,?);
	`;

    const values = [
        user.companyId,
        user.firstName,
        user.lastName,
        user.email,
        user.password,
        user.contact,
        user.position,
        user.role,
        user.profileImg,
        user.createdAt
    ];

    try {
        const [result] = await pool.query(query, values);
        if (result.affectedRows > 0) {
            return true;
        }
        return false;
    } catch (error) {
        // console.log("🚀 ~ userLoginQuery ~ error:", error)
        return Promise.reject(
            setRejectMessage(
                API_STATUS_CODE.INTERNAL_SERVER_ERROR,
                'operation_failed'
            )
        );
    }
};

/**
 * @description This function is used to create user accounts
 */
const addUser = async (user) => {
    const createdAt = new Date();

    const password = await generateRandomString();

    try {
        const isDuplicateEmail = await checkDuplicateEmail(user.email);
        if (isDuplicateEmail) {
            return Promise.reject(
                setRejectMessage(API_STATUS_CODE.BAD_REQUEST, 'Email has already exist')
            );
        }
        let _password = await bcrypt.hash(password, 10);
        const userData = { ...user, password: _password, createdAt: createdAt };
        const loginUrl = `${FRONTEND_URL}/${USER_LOGIN}`;
        const insertedData = await insertUserQuery(userData);
        if (insertedData) {
            sendMail(
                userData.email,
                `EMS support@eventmanagement.com`,
                `<div style="background-color: #f4f4f4; padding: 30px; font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                    <div style="max-width: 600px; margin: auto; background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
                        <h2 style="color: #1e3a8a; text-align: center; margin-bottom: 20px;">Welcome to Event Management System</h2>
                        <p>Hello,</p>
                        <p style="font-size: 15px;">Your account has been successfully created! Below are your login details. Please keep them secure and do not share them with anyone:</p>
                        <div style="text-align: center; margin: 20px 0;">
                        <p style="font-size: 15px;"><strong>Email:</strong> ${userData.email}</p>
                        <p style="font-size: 15px;"><strong>Password:</strong> ${password}</p>
                        </div>
                        <p style="font-size: 15px; color: #d9534f; text-align: center; font-weight: bold;">Please change your password after logging in to protect your account.</p>
                        <p style="font-size: 15px; text-align: center;">You can log in to your account by clicking the button below:</p>
                        <div style="text-align: center; margin: 20px 0;">
                        <a href="${loginUrl}" style="display: inline-block; padding: 12px 25px; background-color: #1e3a8a; color: #ffffff; text-decoration: none; border-radius: 5px; font-weight: bold;">Login to Your Account</a>
                        </div>
                        <p style="font-size: 14px;">If you have any questions or did not request this account, please contact our support team for assistance.</p>
                        <p style="font-size: 14px;">Best Regards,<br>The Event Management Team</p>
                        <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;" />
                        <p style="font-size: 12px; color: #777; text-align: center;">For further assistance, contact us at <a href="mailto:support@eventmanagement.com" style="color: #1e3a8a; text-decoration: none;">support@eventmanagement.com</a>.</p>
                    </div>
                </div>`
            );
            return Promise.resolve({
                status: 'success',
                message: 'User created successfully'
            })
        }
    } catch (error) {
        console.log("🚀 ~ addUser ~ error:", error)
        return Promise.reject(
            setRejectMessage(API_STATUS_CODE.INTERNAL_SERVER_ERROR, 'Internal Server Error'))
    }
}

module.exports = {
    addUser
}