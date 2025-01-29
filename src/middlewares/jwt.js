const jwt = require('jsonwebtoken');
const { pool } = require('../../database/db');

const checkUserId = async (email, role) => {
	let tableName;
	if (role === 'visitor') {
		tableName = 'visitors';
	} else {
		tableName = 'user';
	}
	const query = `
  	SELECT
		*
	FROM
		${tableName}
	WHERE
		email = ? AND
		role = ? AND
		is_user_active = ${1};
  	`;

	const values = [
		email,
		role
	]

	try {
		const [result] = await pool.query(query, values);
		if (result.length > 0) {
			return true;
		}
		return false;
	} catch (error) {
		return error
	}

};


/**
 * @description This function is used to to verify user jwt token
 */
const authenticateToken = async (req, res, next) => {
	const token = req.header('Authorization');

	if (!token) return res.status(400).send('Access denied');
	let authToken = token.split(' ');

	if (authToken[1] === 'undefined' || authToken[1] === 'null') {
		return res.status(400).send('Invalid token');
	}

	jwt.verify(authToken[1], process.env.SECRET_KEY, async (err, user) => {
		if (err) {
			console.error('JWT Verification Error:', err);
			return res.status(400).send('Invalid token');
		}
		const { id, email, role } = user;
		try {
			const isUserExist = await checkUserId(email, role);
			if (isUserExist) {
				req.auth = {
					id,
					email,
					role,
				};
				next();
			} else {
				return res.status(400).send('Invalid user');
			}
		} catch (error) {
			return res.status(400).send('Invalid user');
		}
	});
};

module.exports = authenticateToken;
