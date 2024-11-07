
const bcrypt = require("bcrypt");
const { API_STATUS_CODE } = require("../../consts/error-status");
const { pool } = require("../../../database/db");
const { generateRandomString } = require("../../common/utilities/generate-random-string");
const { sendMail } = require("../../helpers/send-mail");
const { FRONTEND_URL, USER_LOGIN } = require("../../config");
const setRejectMessage = (statusCode, message) => ({ statusCode, message });

const addCompanyWithExhibitor = async (companyData, exhibitor) => {
    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        // Step 1: Create Company
        const companyResult = await addCompanyData(companyData, connection);
        if (companyResult.status !== 'success') {
            throw setRejectMessage(API_STATUS_CODE.BAD_REQUEST, 'Failed to create company');
        }

        // Step 2: Generate Password and Create Exhibitor
        const exhibitorPassword = await generateRandomString();
        exhibitor.password = await bcrypt.hash(exhibitorPassword, 10);
        exhibitor.companyId = companyResult.companyId;

        const exhibitorResult = await addExhibitor(exhibitor, connection);
        if (exhibitorResult.status !== 'success') {
            throw setRejectMessage(API_STATUS_CODE.BAD_REQUEST, 'Failed to create exhibitor');
        }

        // Step 3: Send Email to Company with Exhibitor Info
        const loginUrl = `${FRONTEND_URL}/${USER_LOGIN}`;
        await sendMail(
            companyData.email,
            `EMS support@eventmanagement.com`,
            `<div style="background-color: #f4f4f4; padding: 30px; font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <div style="max-width: 600px; margin: auto; background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
                    <h2 style="color: #1e3a8a; text-align: center; margin-bottom: 20px;">New Exhibitor Admin Created</h2>
                    <p>Hello ${companyData.companyName},</p>
                    <p style="font-size: 15px;">An exhibitor admin has been successfully created for your company. Here are the details:</p>
                    <div style="text-align: center; margin: 20px 0;">
                        <p style="font-size: 15px;"><strong>Name:</strong> ${exhibitor.firstName} ${exhibitor.lastName}</p>
                        <p style="font-size: 15px;"><strong>Email:</strong> ${exhibitor.email}</p>
                        <p style="font-size: 15px;"><strong>Password:</strong> ${exhibitorPassword}</p>
                    </div>
                    <p style="font-size: 15px; color: #d9534f; text-align: center; font-weight: bold;">Please ask the exhibitor to change the password after logging in for security purposes.</p>
                    <p style="font-size: 15px; text-align: center;">The exhibitor can log in by clicking the button below:</p>
                    <div style="text-align: center; margin: 20px 0;">
                        <a href="${loginUrl}" style="display: inline-block; padding: 12px 25px; background-color: #1e3a8a; color: #ffffff; text-decoration: none; border-radius: 5px; font-weight: bold;">Login to Your Account</a>
                    </div>
                    <p style="font-size: 14px;">If you have any questions, please contact our support team.</p>
                    <p style="font-size: 14px;">Best Regards,<br>The Event Management Team</p>
                </div>
            </div>`
        );

        await connection.commit();
        return {
            status: 'success',
            companyId: companyResult.companyId,
            exhibitorId: exhibitorResult.exhibitorId
        };
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
};

// Add Company
const addCompanyData = async (companyData, connection) => {
    const createdAt = new Date();
    const query = `
        INSERT INTO companies (
            name, 
            website_link, 
            address, 
            email, 
            created_at,
            is_active
        ) VALUES (?, ?, ?, ?, ?, 1);
    `;
    const values = [
        companyData.companyName,
        companyData.website_link,
        companyData.address,
        companyData.email,
        createdAt
    ];

    try {
        const [result] = await (connection || pool).query(query, values);
        if (result.affectedRows > 0) {
            return {
                status: 'success',
                companyId: result.insertId
            };
        }
        throw setRejectMessage(API_STATUS_CODE.BAD_REQUEST, 'Failed to create company');
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            throw setRejectMessage(
                API_STATUS_CODE.BAD_REQUEST,
                'Company with this email already exists'
            );
        }
        throw setRejectMessage(
            API_STATUS_CODE.INTERNAL_SERVER_ERROR,
            'Internal Server Error'
        );
    }
};

// Add Exhibitor
const addExhibitor = async (exhibitor, connection) => {
    const createdAt = new Date();

    try {
        const isDuplicateEmail = await checkDuplicateEmail(exhibitor.email, connection);

        if (isDuplicateEmail) {
            throw setRejectMessage(API_STATUS_CODE.BAD_REQUEST, 'Email already exists');
        }

        const query = `
            INSERT INTO user (
                companies_id,  
                f_name, 
                l_name, 
                email, 
                password, 
                contact_no, 
                position, 
                role, 
                is_user_active, 
                created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, ?);
        `;

        const values = [
            exhibitor.companyId,
            exhibitor.firstName,
            exhibitor.lastName,
            exhibitor.email,
            exhibitor.password,
            exhibitor.contact,
            exhibitor.position,
            exhibitor.role,
            createdAt
        ];

        const [result] = await (connection || pool).query(query, values);
        if (result.affectedRows > 0) {
            return {
                status: 'success',
                exhibitorId: result.insertId
            };
        }
        throw setRejectMessage(API_STATUS_CODE.BAD_REQUEST, 'Failed to create exhibitor');
    } catch (error) {
        if (error.statusCode) throw error;
        throw setRejectMessage(
            API_STATUS_CODE.INTERNAL_SERVER_ERROR,
            'Internal Server Error'
        );
    }
};

// Helper function to check duplicate email
const checkDuplicateEmail = async (email, connection) => {
    const query = `SELECT email FROM user WHERE email = ?;`;
    try {
        const [result] = await (connection || pool).query(query, [email]);
        return result.length > 0;
    } catch (error) {
        throw setRejectMessage(
            API_STATUS_CODE.INTERNAL_SERVER_ERROR,
            'Operation failed while checking email'
        );
    }
};

module.exports = {
    addCompanyWithExhibitor,
    addCompanyData,
    addExhibitor,
    checkDuplicateEmail
};
