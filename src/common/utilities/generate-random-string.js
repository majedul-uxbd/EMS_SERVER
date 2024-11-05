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


const generateRandomString = () => {
    const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const lowercase = "abcdefghijklmnopqrstuvwxyz";
    const numbers = "0123456789";
    const specialChars = "!@#$&()=";
    const allChars = uppercase + lowercase + numbers + specialChars;

    // Ensure at least one of each required character
    let result = [
        uppercase[Math.floor(Math.random() * uppercase.length)],
        numbers[Math.floor(Math.random() * numbers.length)],
        specialChars[Math.floor(Math.random() * specialChars.length)],
    ];

    // Fill the remaining characters randomly
    for (let i = 3; i < 12; i++) {
        result.push(allChars[Math.floor(Math.random() * allChars.length)]);
    }

    // Shuffle the result array to make the characters random
    return result.sort(() => Math.random() - 0.5).join("");
}

module.exports = {
    generateRandomString
}