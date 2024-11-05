// const { pool } = require("../../../database/db"); // Database connection pool
// const { setRejectMessage } = require("../../common/set-reject-message");
// const { API_STATUS_CODE } = require("../../consts/error-status");
// const PDFDocument = require("pdfkit"); // Import pdfkit

// // Helper function to validate email format using regex
// const isValidEmail = (email) => {
//   const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//   return emailRegex.test(email);
// };

// // Main API function to create ID card and generate PDF
// const createIDCard = async (req, res) => {
//   const { email } = req.body; // Destructure email from request body

//   // Validate email
//   if (!email || !isValidEmail(email)) {
//     return res.status(API_STATUS_CODE.BAD_REQUEST).json({
//       status: "error",
//       message: "Please provide a valid email address",
//     });
//   }

//   try {
//     // Prepare the SQL statement to prevent injection
//     const query = `SELECT id, email, role FROM visitors WHERE email = ?`;
//     const [result] = await pool.query(query, [email]); // Use prepared statement

//     // If no visitor found with that email
//     if (result.length === 0) {
//       return res.status(API_STATUS_CODE.NOT_FOUND).json({
//         status: "error",
//         message: "No visitor found with that email address",
//       });
//     }

//     const visitorData = result[0]; // Extract visitor data

//     // Create a PDF document
//     const doc = new PDFDocument({
//       size: "A6", // Size of ID card
//       layout: "landscape",
//     });

//     // Set the headers to return PDF
//     res.setHeader("Content-Type", "application/pdf");
//     res.setHeader(
//       "Content-Disposition",
//       `attachment; filename=id_card_${visitorData.id}.pdf`
//     );

//     // Pipe the PDF into the response
//     doc.pipe(res);

//     // Add the logo (replace with your actual image file or URL)
//     doc
//       .image("path/to/your/company_logo.png", 30, 30, { width: 80, height: 80 })
//       .moveDown();

//     // Add text content for the ID card
//     doc.fontSize(20).text(`${visitorData.email}`, 120, 40);

//     doc
//       .fontSize(14)
//       .text(`ID: ${visitorData.id}`, 120, 70)
//       .text(`Role: ${visitorData.role}`, 120, 90);

//     // Finalize the PDF and end the stream
//     doc.end();
//   } catch (error) {
//     //console.error(" ~ createIDCard ~ error:", error);

//     let errorMessage = "Internal server error";
//     if (error.code === "ER_BAD_DB_ERROR") {
//       errorMessage = "Database connection failed";
//     }

//     res.status(API_STATUS_CODE.INTERNAL_SERVER_ERROR).json({
//       status: "error",
//       message: errorMessage,
//     });
//   }
// };

// module.exports = { createIDCard };
