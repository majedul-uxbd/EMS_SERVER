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

const express = require('express');
const commonRouter = express.Router();

const authenticateToken = require('../../middlewares/jwt');
const path = require("path");
const fs = require("fs");
const PDFDocument = require('pdfkit');
const qr = require('qr-image');
const { getUserInformationForIdCard } = require('../../main/common/get-user-information-for-id-card');
const { checkEmailAndSendOtp } = require('../../main/common/check-email-and-send-otp');
const { API_STATUS_CODE } = require('../../consts/error-status');
const { verifyUserOtp } = require('../../main/common/verify-user-otp');
const { resetUserPassword } = require('../../main/common/reset-user-password');
const { checkIfFileSavePathExist } = require('../../common/utilities/file-upload/check-file-path-exist');
const { idCardDir } = require('../../common/utilities/file-upload/upload-file-const-value');
const { getUpcomingExhibitions } = require('../../main/common/get-upcoming-exhibitions');
const { isUserRoleExhibitorOrVisitor } = require('../../common/utilities/check-user-role');
const { getExhibitionData } = require('../../main/common/get-exhibition-data');

// commonRouter.use(authenticateToken);


/**
 * @description This API is used for send OTP to the user Email Address
 */
commonRouter.post('/send-otp', async (req, res) => {
    checkEmailAndSendOtp(req.body.email)
        .then(data => {
            return res.status(API_STATUS_CODE.OK).send({
                status: data.status,
                message: data.message,
            })
        })
        .catch(error => {
            const { statusCode, message } = error;
            return res.status(statusCode).send({
                status: 'failed',
                message: message,
            })
        })
})



/**
 * @description This API is used for verify OTP
 */
commonRouter.post('/verify-otp', async (req, res) => {
    verifyUserOtp(req.body)
        .then(data => {
            return res.status(API_STATUS_CODE.OK).send({
                status: data.status,
                message: data.message,
            })
        })
        .catch(error => {
            const { statusCode, message } = error;
            return res.status(statusCode).send({
                status: 'failed',
                message: message,
            })
        })
})


/**
 * @description This API is used for reset user password
 */
commonRouter.post('/reset-password', async (req, res) => {
    resetUserPassword(req.body)
        .then(data => {
            return res.status(API_STATUS_CODE.OK).send({
                status: data.status,
                message: data.message,
            })
        })
        .catch(error => {
            const { statusCode, message } = error;
            return res.status(statusCode).send({
                status: 'failed',
                message: message,
            })
        })
});


/**
* Through this API visitor and exhibitor can see all exhibitions data
*/
commonRouter.post('/get-exhibition-data',
    authenticateToken,
    isUserRoleExhibitorOrVisitor,
    async (req, res) => {

        getExhibitionData(req.body)
            .then(data => {
                return res.status(API_STATUS_CODE.OK).send({
                    status: 'success',
                    message: 'Get exhibitions data successfully',
                    ...data
                })
            })
            .catch(error => {
                const { statusCode, message } = error;
                return res.status(statusCode).send({
                    status: 'failed',
                    message: message,
                })
            });
    });



/**
 * @description This API is used to see upcoming events information
 */
commonRouter.get('/upcoming-exhibitions',
    authenticateToken,
    async (req, res) => {
        getUpcomingExhibitions()
            .then(data => {
                return res.status(API_STATUS_CODE.OK).send({
                    status: 'success',
                    message: 'Get Upcoming Exhibitions Successfully',
                    ...data
                })
            })
            .catch(error => {
                const { statusCode, message } = error;
                return res.status(statusCode).send({
                    status: 'failed',
                    message: message,
                })
            })
    })

/**
 * @description This API is used for generate user ID Card
 */
commonRouter.post('/generate-id-card',
    authenticateToken,
    checkIfFileSavePathExist,
    getUserInformationForIdCard,
    async (req, res) => {
        const user = req.body.user;
        const exhibitionData = req.body.exhibitionData;
        const filePath = idCardDir;
        const visitorBgColor = '#1e3a8a';
        const organizerBgColor = '#164e63';
        const exhibitorBgColor = '#064e3b';
        let color = "";
        let userRole = "";
        let position = "";
        let companyName = "";
        let x_axis_1 = 108;
        let y_axis_1 = 560;
        let x_axis_2 = 404;
        let y_axis_2 = 560;
        const currentPathName = path.join(process.cwd());
        let ppImagePath = path.join(currentPathName, '/src/common/utilities/images/pp.jpeg');
        let bgImagePath = path.join(currentPathName, '/src/common/utilities/images/2nd-bg.jpeg');
        const fullName = user.f_name + ' ' + user.l_name;

        const doc = new PDFDocument({
            size: 'A4',
            layout: 'portrait'
        });
        doc.pipe(fs.createWriteStream(path.join(filePath, `${fullName}.pdf`)));

        const scaleFactor = 1;
        const scaledFontSize = 10 * scaleFactor;

        doc.font(path.join(currentPathName, '/src/common/utilities/font/NotoSansJP-Bold.ttf'))
            .fontSize(scaledFontSize)
            .fillColor('black');

        const textHeight = doc.heightOfString(fullName, {
            width: 171,
            align: 'center'
        });

        switch (user.role) {
            case 'visitor':
                color = visitorBgColor;
                userRole = 'Visitor';
                position = user.position;
                companyName = user.company_name;
                if (textHeight > 15) {
                    y_axis = 235;
                }
                break;
            case 'exhibitor':
                color = exhibitorBgColor;
                userRole = 'Exhibitor';
                position = user.position;
                companyName = user.company_name;
                if (textHeight > 15) {
                    y_axis = 235;
                }
                break;
            case 'exhibitor_admin':
                color = exhibitorBgColor;
                userRole = 'Exhibitor';
                position = user.position;
                companyName = user.company_name;
                if (textHeight > 15) {
                    y_axis = 235;
                }
                break;
            case 'organizer':
                color = organizerBgColor;
                userRole = 'Organizer';
                position = user.position;
                companyName = user.company_name;
                if (textHeight > 15) {
                    y_axis = 235;
                }
                break;
            default:
                return res.status(400).send({
                    status: 'failed',
                    message: 'Invalid user role'
                })
        }

        try {
            // 1st shape
            doc.rect(4, 4, 290, 413);
            doc.fill(color);

            // 2nd shape
            // doc.rect(300, 4, 290, 413);
            // doc.fill(color);

            // 3rd shape
            doc.rect(4, 422, 290, 413);
            doc.fill(color);

            // 4th shape
            doc.rect(300, 422, 290, 413);
            doc.fill(color);

            // 1st logo
            doc.image(path.join(currentPathName, '/src/common/utilities/images/left_side_pic.png'),
                4, 4, { width: 291, height: 414 });

            // 1st logo
            doc.image(path.join(currentPathName, '/src/common/utilities/images/UXBD_logo.jpg'),
                96, 435, { width: 100, height: 100 });
            // 2nd logo
            doc.image(path.join(currentPathName, '/src/common/utilities/images/UXBD_logo.jpg'),
                396, 435, { width: 100, height: 100 });

            // User Information Body1
            doc.roundedRect(17, 547, 264, 115, 2)
                .lineWidth(5)
                .fillAndStroke("white");

            // User Information Body2
            doc.roundedRect(313, 547, 264, 115, 2)
                .lineWidth(5)
                .fillAndStroke("white");

            // Vertical line1
            doc.moveTo(100, 570);
            doc.lineTo(100, 570 + 75);
            doc.lineWidth(1.5)
                .strokeOpacity(0.5)
                .stroke('black');
            doc.stroke();
            // Vertical line2
            doc.moveTo(400, 570);
            doc.lineTo(400, 570 + 75);
            doc.lineWidth(1.5)
                .strokeOpacity(0.5)
                .stroke('black');
            doc.stroke();

            // User Name1
            doc.font(path.join(currentPathName, '/src/common/utilities/font/NotoSansJP-Bold.ttf'))
                .fontSize(10)
                .fillColor('black')
                .text(fullName, x_axis_1, y_axis_1, {
                    width: 171,
                    align: 'center',
                });

            // User Name2
            doc.font(path.join(currentPathName, '/src/common/utilities/font/NotoSansJP-Bold.ttf'))
                .fontSize(10)
                .fillColor('black')
                .text(fullName, x_axis_2, y_axis_2, {
                    width: 171,
                    align: 'center',
                });

            // User Role1
            doc.font(path.join(currentPathName, '/src/common/utilities/font/NotoSansJP-Bold.ttf'))
                .fontSize(9)
                .fillColor('#0370cb')
                .text(userRole, x_axis_1, y_axis_1 + 20, {
                    width: 171,
                    align: 'center',
                });

            // User Role2
            doc.font(path.join(currentPathName, '/src/common/utilities/font/NotoSansJP-Bold.ttf'))
                .fontSize(9)
                .fillColor('#0370cb')
                .text(userRole, x_axis_2, y_axis_2 + 20, {
                    width: 171,
                    align: 'center',
                });

            // Position1
            doc.font(path.join(currentPathName, '/src/common/utilities/font/NotoSansJP-Regular.ttf'))
                .fontSize(9)
                .fillColor('black')
                .text(position, x_axis_1, y_axis_1 + 43, {
                    width: 171,
                    align: 'center'
                });

            // Position2
            doc.font(path.join(currentPathName, '/src/common/utilities/font/NotoSansJP-Regular.ttf'))
                .fontSize(9)
                .fillColor('black')
                .text(position, x_axis_2, y_axis_2 + 43, {
                    width: 171,
                    align: 'center'
                });

            // Company Name1
            doc.font(path.join(currentPathName, '/src/common/utilities/font/NotoSansJP-Regular.ttf'))
                .fontSize(9)
                .fillColor('black')
                .text(companyName, x_axis_1, y_axis_1 + 70, {
                    width: 171,
                    align: 'center',
                });

            // Company Name2
            doc.font(path.join(currentPathName, '/src/common/utilities/font/NotoSansJP-Regular.ttf'))
                .fontSize(9)
                .fillColor('black')
                .text(companyName, x_axis_2, y_axis_1 + 70, {
                    width: 171,
                    align: 'center',
                });

            //user Profile picture
            const centerX_1 = 58;
            const centerY_1 = 606;
            const centerX_2 = 358;
            const centerY_2 = 606;
            const radius = 35;
            doc.image(bgImagePath, 300, 4, { width: 290, height: 150 });
            // Define the path for the circular clipping
            // doc.circle(centerX_1, centerY_1, radius).clip();
            // Add the image inside the circular clipping path
            doc.image(ppImagePath, centerX_1 - radius, centerY_1 - radius, { width: radius * 2, height: radius * 2 });
            // Define the path for the circular clipping
            // doc.circle(centerX_2, centerY_2, radius).clip();
            // Add the image inside the circular clipping path
            doc.image(ppImagePath, centerX_2 - radius, centerY_2 - radius, { width: radius * 2, height: radius * 2 });

            // Exhibition Title
            doc.font(path.join(currentPathName, '/src/common/utilities/font/NotoSansJP-Bold.ttf'))
                .fontSize(15)
                .fillColor('white')
                .text(exhibitionData.exhibitions_title, 300, 30, {
                    width: 300,
                    align: 'center',
                });

            const exhibitionDate = JSON.parse(exhibitionData.exhibition_dates);
            const firstDate = exhibitionDate[0]; // First value

            const lastDate = exhibitionDate[exhibitionDate.length - 1];// last value

            // Create a date range string
            const dateRangeText = `${firstDate} - ${lastDate}`;

            // Exhibition venue
            doc.font(path.join(currentPathName, '/src/common/utilities/font/NotoSansJP-Bold.ttf'))
                .fontSize(7)
                .fillColor('white')
                .text(`Venue : ${exhibitionData.exhibition_venue}`, 300, 125, {
                    width: 141,
                    align: 'center',
                });

            // Exhibition date range
            doc.font(path.join(currentPathName, '/src/common/utilities/font/NotoSansJP-Bold.ttf'))
                .fontSize(7)
                .fillColor('white')
                .text(`Date : ${dateRangeText}`, 441, 125, {
                    width: 141,
                    align: 'center',
                });

            // Exhibition Information Body1
            doc.rect(305, 165, 285, 120)
            doc.fill('#e0f2fe')
            doc.lineWidth(1)
                // .strokeOpacity(1)
                .stroke('black')
                .fill('black');

            // Exhibition Information Body2
            doc.rect(305, 290, 285, 120)
            doc.fill('#e5e5e5')
            doc.lineWidth(1)
                // .strokeOpacity(1)
                .stroke('black')
                .fill('black');

            const codeText = `
           {
               id:${user.id},
               role: ${user.role}
           }`;
            const qrImage = qr.imageSync(codeText, { type: 'png', ec_level: 'H', margin: 3 });
            //QR code image1
            doc.image(qrImage, 80, 675, { width: 140, height: 140 });
            //QR code image2
            doc.image(qrImage, 380, 675, { width: 140, height: 140 });
            // Vertical dotted line
            doc.moveTo(298, 5);
            doc.lineTo(297, 838);
            doc.lineWidth(1.5)
                .dash(5, { space: 5 })
                .strokeOpacity(1)
                .stroke('black');

            // Horizontal dotted line
            doc.moveTo(600, 420);
            doc.lineTo(0, 420);
            doc.lineWidth(1.5)
                .dash(5, { space: 5 })
                .strokeOpacity(1)
                .stroke('black');

            doc.restore();

            // Save the PDF
            doc.end();
            const fileFullPath = path.join(filePath, `/${fullName}.pdf`);
            // console.log("🚀 ~ fileFullPath:", fileFullPath)
            setTimeout(() => {
                res.download(fileFullPath, (downloadErr) => {
                    if (downloadErr) {
                        console.log('🚀 ~ file: common-route.js:464 ~ res.download ~ downloadErr:', downloadErr);
                        console.error("Failed to download user ID card");
                        return res.status(500).send("Error downloading file");
                    } else {
                        console.log("ID Card generated and downloaded successfully");
                    }
                });
            }, 2000); // 2000 ms = 2 seconds
        } catch (error) {
            console.log(error)
            return res.status(400).send({
                status: "failed",
                message: "Failed to generate user ID card"
            })
        }
    }
)

module.exports = {
    commonRouter
}