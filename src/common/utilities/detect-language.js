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

const path = require("path");

/**
 * Determines the font type to use based on the characters present in the given text.
 *
 * The function evaluates the text to identify if it contains Bengali or Japanese characters.
 * If it does, it assigns the corresponding font file path. For non-ASCII characters that are
 * neither Bengali nor Japanese, it defaults to the Japanese font path.
 *
 * @param {string} text - The input text for which the font type is to be determined.
 * @param {boolean} bold - Specifies whether the font should be bold or not.
 * @returns {string} fontType - The file path of the font that matches the text's character set.
 *
 * - If the text contains Bengali characters (Unicode range: U+0980 to U+09FF), the Bengali bold font is used.
 * - If the text contains Japanese characters (Hiragana, Katakana, or Kanji), the corresponding Japanese font (bold or regular) is used.
 * - If the text contains only ASCII or other characters, it defaults to the Japanese font (bold or regular).
 */
const determineFont = (text, bold = false) => {
    const currentPathName = path.join(process.cwd());
    const bengaliFontPath = path.join(currentPathName, '/src/common/utilities/font/NotoSerifBengali-Bold.ttf');
    const japaneseFontPathBold = path.join(currentPathName, '/src/common/utilities/font/NotoSansJP-Bold.ttf');
    const japaneseFontPathRegular = path.join(currentPathName, '/src/common/utilities/font/NotoSansJP-Regular.ttf');

    let fontType;

    if (/[^\u0000-\u007F]/.test(text)) {
        if (/[\u0980-\u09FF]/.test(text)) {
            fontType = bengaliFontPath; // Bengali characters always use bold
        } else if (/[\u3040-\u30FF\u4E00-\u9FAF]/.test(text)) {
            fontType = bold ? japaneseFontPathBold : japaneseFontPathRegular; // Japanese characters
        }
    } else {
        fontType = bold ? japaneseFontPathBold : japaneseFontPathRegular; // Default to Japanese font
    }

    // console.log({ fontType, bold });
    return fontType;
};



module.exports = {
    determineFont
}