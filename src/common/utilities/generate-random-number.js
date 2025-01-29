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

/**
 * @description This function is used to generate random numbers
 */
const generateRandomNumber = () => {
    return Math.floor(100000 + Math.random() * 900000);
};

module.exports = {
    generateRandomNumber
}