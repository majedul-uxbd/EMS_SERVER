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
const { setRejectMessage } = require("../../common/set-reject-message");
const { sendMail } = require("../../helpers/send-mail");
const { FRONTEND_URL, USER_LOGIN } = require("../../config");


const checkDuplicateEmail = async (email) => {
    const _query = `
    SELECT 
        email
    FROM
        visitors
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

const insertUserQuery = async (visitor) => {
    const query = `
	INSERT INTO
        visitors
        (
            f_name,
            l_name,
            email,
            password,
            contact_no,
            company,
            position,
            role,
            profile_img,
            created_at
        )
	VALUES (?,?,?,?,?,?,?,?,?,?);
	`;

    const values = [
        visitor.firstName,
        visitor.lastName,
        visitor.email,
        visitor.password,
        visitor.contact,
        visitor.company,
        visitor.position,
        visitor.role,
        visitor.profileImg,
        visitor.createdAt
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

const addVisitor = async (visitor) => {
    const createdAt = new Date();

    let _password;
    try {
        const isDuplicateEmail = await checkDuplicateEmail(visitor.email);
        if (isDuplicateEmail) {
            return Promise.reject(
                setRejectMessage(API_STATUS_CODE.BAD_REQUEST, 'Email has already exist')
            );
        }
        _password = await bcrypt.hash(visitor.password, 10);
        const visitorData = { ...visitor, password: _password, createdAt: createdAt };

        const loginUrl = `${FRONTEND_URL}/${USER_LOGIN}`;

        const insertedData = await insertUserQuery(visitorData);
        if (insertedData) {

            sendMail(
                visitorData.email,
                `EMS support@eventmanagement.com`,
                `<div style="background-color: #f4f4f4; padding: 30px; font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                    <div style="max-width: 600px; margin: auto; background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
                        <h2 style="color: #1e3a8a; text-align: center; margin-bottom: 20px;">Welcome to Event Management System</h2>
                        <p>Hello,</p>
                        <p style="font-size: 15px;">We’re excited to welcome you to the Event Management System! Your account has been successfully created, and you’re all set to begin managing and participating in events with ease.</p>
                        <p style="font-size: 15px; text-align: center;">To get started, log in to your account using the button below:</p>
                        <div style="text-align: center; margin: 20px 0;">
                        <a href="${loginUrl}" style="display: inline-block; padding: 12px 25px; background-color: #1e3a8a; color: #ffffff; text-decoration: none; border-radius: 5px; font-weight: bold;">Login to Your Account</a>
                        </div>
                        <p style="font-size: 14px;">If you have any questions, our support team is here to help.</p>
                        <p style="font-size: 14px;">Best Regards,<br>The Event Management Team</p>
                        <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;" />
                        <p style="font-size: 12px; color: #777; text-align: center;">For further assistance, contact us at <a href="mailto:support@eventmanagement.com" style="color: #1e3a8a; text-decoration: none;">support@eventmanagement.com</a>.</p>
                    </div>
                </div>
                    `
            );
            return Promise.resolve({
                status: 'success',
                message: 'User created successfully'
            })
        }
    } catch (error) {
        // console.log("🚀 ~ addUser ~ error:", error)
        return Promise.reject(
            setRejectMessage(API_STATUS_CODE.INTERNAL_SERVER_ERROR, 'Internal Server Error'))
    }
}

module.exports = {
    addVisitor
}