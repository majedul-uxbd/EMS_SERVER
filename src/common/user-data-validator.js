/**
 * @author Md. Majedul Islam <https://github.com/majedul-uxbd>
 * Software Engineer,
 * Ultra-X BD Ltd.
 *
 * @copyright All right reserved Ultra-X Asia Pacific
 *
 * @description This file is used for username, email and password validation.
 *
 */

const _ = require("lodash");
const VALID_USER_ROLE_TYPE = Object.freeze({
	Exhibitor_Admin: "exhibitor_admin",
	Exhibitor: "exhibitor",
	Organizer: "organizer",
	Visitor: "visitor"
});

// validate user first name
const isValidUserFirstName = (fName) => {
	const USERNAME_MAX_LENGTH = 60;
	const USERNAME_MIN_LENGTH = 3;
	if (_.isEmpty(fName)) {
		return false;
	} else {
		if (!_.isString(fName)) {
			return false;
		} else {
			// check length
			if (
				fName.length > USERNAME_MAX_LENGTH ||
				fName.length < USERNAME_MIN_LENGTH
			) {
				return false;
			}
		}
	}
	return true;
};

// validate user last name
const isValidUserLastName = (lName) => {
	const USERNAME_MAX_LENGTH = 60;
	const USERNAME_MIN_LENGTH = 3;
	if (_.isEmpty(lName)) {
		return false;
	} else {
		if (!_.isString(lName)) {
			return false;
		} else {
			// check length
			if (
				lName.length > USERNAME_MAX_LENGTH ||
				lName.length < USERNAME_MIN_LENGTH
			) {
				return false;
			}
		}
	}
	return true;
};

// validate user role
const isValidUserRole = (role) => {
	if (_.isEmpty(role)) {
		return false;
	} else {
		if (!Object.values(VALID_USER_ROLE_TYPE).includes(role)) {
			return false;
		}
	}
	return true;
};

// validate user email
const isValidEmail = (email) => {
	if (_.isEmpty(email)) {
		return false;
	} else {
		if (
			!email.match(
				/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
			)
		) {
			return false;
		}
	}
	return true;
};

// validate user password
const isValidPassword = (password) => {
	const USERNAME_MAX_LENGTH = 50;
	const USERNAME_MIN_LENGTH = 4;
	// Regex to enforce the following rules:
	// - At least one lowercase letter
	// - At least one uppercase letter
	// - At least one digit
	// - At least one special character among @$!%*?&
	// - Minimum length of 8 characters
	// - Maximum length of 60 characters
	// const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,60}$/;
	if (_.isEmpty(password)) {
		return false;
	} else {
		if (
			password.length > USERNAME_MAX_LENGTH ||
			password.length < USERNAME_MIN_LENGTH
		) {
			return false;
		}
	}
	return true;
};

// validate user Contact No
const isValidUserContact = (contact) => {
	const USERNAME_MIN_LENGTH = 7;
	const USERNAME_MAX_LENGTH = 15;
	if (_.isEmpty(contact)) {
		return false;
	} else {
		if (!_.isString(contact)) {
			return false;
		} else {
			if (
				contact.length > USERNAME_MAX_LENGTH ||
				contact.length < USERNAME_MIN_LENGTH
			) {
				return false;
			}
		}
	}
	return true;
};

// validate user Company Name
const isValidUserCompany = (company) => {
	const USERNAME_MIN_LENGTH = 4;
	const USERNAME_MAX_LENGTH = 100;
	if (_.isEmpty(company)) {
		return false;
	} else {
		if (!_.isString(company)) {
			return false;
		} else {
			if (
				company.length > USERNAME_MAX_LENGTH ||
				company.length < USERNAME_MIN_LENGTH
			) {
				return false;
			}
		}
	}
	return true;
};

// validate user Position Name
const isValidUserPosition = (position) => {
	if (_.isEmpty(position)) {
		return false;
	} else {
		if (!_.isString(position)) {
			return false;
		}
	}
	return true;
};

// validate website URL
const isValidWebsiteURL = (url) => {
	// const urlPattern = /^(https?:\/\/)?(www\.)?([a-zA-Z0-9-]+)\.([a-zA-Z]{2,})(\/[^\s]*)?$/;
	// if (_.isEmpty(url)) {
	// 	const isValid = urlPattern.test(url);
	// 	if (!isValid) {
	// 		return false;
	// 	}
	// 	return true;
	// }
	if (_.isEmpty(url)) {
		return false;
	} else {
		if (!_.isString(url)) {
			return false;
		}
	}
	return true;
}

// validate company address
const isValidCompanyAddress = (address) => {
	if (_.isEmpty(address)) {
		return false;
	} else {
		if (!_.isString(address)) {
			return false;
		}
	}
	return true;
}

// validate project name
const isValidProjectName = (projectName) => {
	const USERNAME_MAX_LENGTH = 100;
	const USERNAME_MIN_LENGTH = 3;
	if (_.isEmpty(projectName)) {
		return false;
	} else {
		if (!_.isString(projectName)) {
			return false;
		} else {
			// check length
			if (
				projectName.length > USERNAME_MAX_LENGTH ||
				projectName.length < USERNAME_MIN_LENGTH
			) {
				return false;
			}
		}
	}
	return true;
};


// validate project platform
const isValidProjectPlatform = (platform) => {
	if (_.isEmpty(platform)) {
		return false;
	} else {
		if (!_.isString(platform)) {
			return false;
		}
	}
	return true;
}

// validate project platform
const isValidDocumentTitle = (title) => {
	if (_.isEmpty(title)) {
		return false;
	} else {
		if (!_.isString(title)) {
			return false;
		}
	}
	return true;
}

module.exports = {
	isValidUserFirstName,
	isValidUserLastName,
	isValidUserRole,
	isValidEmail,
	isValidPassword,
	isValidUserContact,
	isValidUserCompany,
	isValidUserPosition,
	isValidWebsiteURL,
	isValidCompanyAddress,
	isValidProjectName,
	isValidProjectPlatform,
	isValidDocumentTitle
};
