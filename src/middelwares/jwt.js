const jwt = require('jsonwebtoken');

// Middleware to verify JWT
const authenticateToken = (req, res, next) => {
  const token = req.header('Authorization');
  if (!token) return res.status(400).send('Access denied');
  let authToken = token.split(' ');

  if (authToken[1] === 'undefined' || authToken[1] === 'null') {
    return res.status(400).send('Invalid token');
  }

  jwt.verify(authToken[1], process.env.SECRET_KEY, (err, user) => {
    if (err) {
      console.error('JWT Verification Error:', err);
      return res.status(400).send('Invalid token');
    }
    const { id, email, role } = user;
    req.auth = {
      id,
      email,
      role,
    };
    next();
  });
};

module.exports = authenticateToken;

// const jwt = require("jsonwebtoken");
// // Middleware to verify JWT
// const authenticateToken1 = (req, res, next) => {
//   const token = req.header("Authorization");
//   if (!token) return res.status(400).send("Access denied");
//   let authToken = token.split(" ");
//   jwt.verify(authToken[1], process.env.SECRET_KEY, (err, user) => {
//     if (err) {
//       console.error("JWT Verification Error:", err);
//       return res.status(400).send("Invalid token");
//     }
//     req.user = user;
//     next();
//   });
// };

// module.exports = authenticateToken;
