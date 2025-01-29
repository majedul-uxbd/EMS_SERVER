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

const fs = require('fs');
const path = require('path');


/**
 * @param {number} code 
 * @param {string} msgKey 
 * @param {string} language 
 * @param {number} [result] 
 * @description This function is used to send messages (success or error) with status code, based on language and a JSON file for translations. Optionally includes result.
 */
const setServerResponse = (code, msgKey, language, result = null) => {
    // Path to the JSON file containing translations
    const translationsPath = path.join(__dirname, '../consts/response-message.json');

    let translations;
    try {
        const fileContent = fs.readFileSync(translationsPath, 'utf-8');
        translations = JSON.parse(fileContent);
    } catch (error) {
        throw new Error('Unable to load translations file.');
    }

    const langMessages = translations[language] || translations['en'];

    // Get the message from the JSON using the key
    const message = langMessages[msgKey] || 'Japanese Message is not found';

    // Determine success or error status
    const statusType = code >= 200 && code < 300 ? 'success' : 'failed';
    // const statusType = code >= 200 && code < 300 ? langMessages.success : langMessages.failed;

    const response = {
        statusCode: code,
        status: statusType,
        message
    };

    if (result !== null) {
        response.result = result;
    }

    return response;
};

module.exports = {
    setServerResponse
};