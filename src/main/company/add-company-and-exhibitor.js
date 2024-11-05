const bcrypt = require("bcrypt");
const { pool } = require("../../../database/db"); // Update the path as needed
const { API_STATUS_CODE } = require("../../consts/error-status"); // Update the path as needed

// Helper function to send standardized error messages
const setRejectMessage = (statusCode, message) => ({ statusCode, message });

// Add Company
const addCompanyData = async (companyData) => {
    const createdAt = new Date();

    const query = `
        INSERT INTO companies (name, website_link, address, email, created_at)
        VALUES (?, ?, ?, ?, ?);
    `;
    const values = [
        companyData.companyName,
        companyData.website_link,
        companyData.address,
        companyData.email,
        createdAt
    ];

    try {
        const [result] = await pool.query(query, values);
        if (result.affectedRows > 0) {
            return {
                status: 'success',
                message: 'Company created successfully',
                companyId: result.insertId // New company ID
            };
        }
        return { status: 'failed', message: 'Failed to create company' };
    } catch (error) {
        return Promise.reject(
            setRejectMessage(API_STATUS_CODE.INTERNAL_SERVER_ERROR, 'Internal Server Error')
        );
    }
};

// Add Exhibitor
const addExhibitor = async (exhibitor) => {
    const createdAt = new Date();

    try {
        const isDuplicateEmail = await checkDuplicateEmail(exhibitor.email);
        const isDuplicateExhibitorAdmin = await checkDuplicateExhibitorAdmin(exhibitor);
        const isCompanyActive = await checkIsCompanyActive(exhibitor.companyId);

        if (isDuplicateEmail) {
            return Promise.reject(
                setRejectMessage(API_STATUS_CODE.BAD_REQUEST, 'Email already exists')
            );
        }
        if (isDuplicateExhibitorAdmin) {
            return Promise.reject(
                setRejectMessage(API_STATUS_CODE.BAD_REQUEST, 'Exhibitor Admin already exists')
            );
        }

        exhibitor.password = await bcrypt.hash(exhibitor.password, 10);
        exhibitor.createdAt = createdAt;

        const query = `
            INSERT INTO user (companies_id, f_name, l_name, email, password, contact_no, position, role, profile_img, is_user_active, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
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
            exhibitor.profileImg,
            isCompanyActive ? 1 : 0,
            createdAt
        ];

        const [result] = await pool.query(query, values);
        if (result.affectedRows > 0) {
            return {
                status: 'success',
                message: 'Exhibitor created successfully',
                exhibitorId: result.insertId // New exhibitor ID
            };
        }
        return { status: 'failed', message: 'Failed to create exhibitor' };
    } catch (error) {
        return Promise.reject(
            setRejectMessage(API_STATUS_CODE.INTERNAL_SERVER_ERROR, 'Internal Server Error')
        );
    }
};

// Update Assigned Exhibitor in Company
const updateAssignedExhibitor = async (companyId, exhibitorId) => {
    const query = `
        UPDATE companies
        SET assigned_exhibitor = ?
        WHERE id = ?;
    `;

    try {
        const [result] = await pool.query(query, [exhibitorId, companyId]);
        return result.affectedRows > 0;
    } catch (error) {
        return Promise.reject(
            setRejectMessage(API_STATUS_CODE.INTERNAL_SERVER_ERROR, 'Failed to update assigned exhibitor')
        );
    }
};

// Check if Email Already Exists
const checkDuplicateEmail = async (email) => {
    const _query = `
        SELECT email FROM user WHERE email = ?;
    `;
    const values = [email];

    try {
        const [result] = await pool.query(_query, values);
        return result.length > 0;
    } catch (error) {
        return Promise.reject(
            setRejectMessage(API_STATUS_CODE.INTERNAL_SERVER_ERROR, 'operation_failed')
        );
    }
};

// Check if Exhibitor Admin Role Already Exists
const checkDuplicateExhibitorAdmin = async (exhibitor) => {
    const _query = `
        SELECT role FROM user WHERE companies_id = ? AND role = ?;
    `;
    const values = [exhibitor.companyId, 'exhibitor_admin'];

    try {
        const [result] = await pool.query(_query, values);
        return result.length > 0 && result[0].role === exhibitor.role;
    } catch (error) {
        return Promise.reject(
            setRejectMessage(API_STATUS_CODE.INTERNAL_SERVER_ERROR, 'operation_failed')
        );
    }
};

// Check if Company is Active
const checkIsCompanyActive = async (companyId) => {
    const _query = `
        SELECT is_active FROM companies WHERE id = ?;
    `;

    try {
        const [result] = await pool.query(_query, [companyId]);
        return result.length > 0 ? result[0].is_active === 1 : false;
    } catch (error) {
        return Promise.reject(
            setRejectMessage(API_STATUS_CODE.INTERNAL_SERVER_ERROR, 'operation_failed')
        );
    }
};


module.exports = {
    addCompanyData,
    addExhibitor,
    updateAssignedExhibitor,
    checkDuplicateEmail,
    checkDuplicateExhibitorAdmin,
    checkIsCompanyActive
};
