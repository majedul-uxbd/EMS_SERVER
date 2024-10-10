//================================================================
const app = require("./src/app");
require("dotenv").config({
  path: `${__dirname}/.env`
});
//================================================================
const port = process.env.APP_PORT;
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
