const { API_STATUS_CODE } = require("../../consts/error-status");
const { pool } = require("../../../database/db");
const { generateRandomString } = require("../../common/utilities/generate-random-string");
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

        // Step 2: Generate Password and Create Exhibitor (without hashing)
        const exhibitorPassword = await generateRandomString();
        exhibitor.password = exhibitorPassword; // Removed password hashing
        exhibitor.companyId = companyResult.companyId;

        const exhibitorResult = await addExhibitor(exhibitor, connection);
        if (exhibitorResult.status !== 'success') {
            throw setRejectMessage(API_STATUS_CODE.BAD_REQUEST, 'Failed to create exhibitor');
        }

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
        ) VALUES (?, ?, ?, ?, ?, 0);
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
            exhibitor.password, // Now using unhashed password
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