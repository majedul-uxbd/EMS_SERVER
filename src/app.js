// app.js
const express = require("express");
const path = require("path");
const app = express();
const cors = require("cors");
const morgan = require("morgan");
const bodyParser = require("body-parser");

require("dotenv").config();

//================================================================

app.use(bodyParser.json());
app.use(morgan("combined"));
app.use(cors());

// Middleware to parse JSON bodies
app.use(
  express.urlencoded({
    extended: true,
    limit: "50mb",
    parameterLimit: 10000,
  })
);
app.use(express.json({ limit: "50mb" }));

// Routes
const { usersRouter } = require("./routes/users/users-route");
const { exhibitionsRouter } = require("./routes/exhibitions/exhibitions-route");
const { systemAdminRouter } = require("./routes/system-admin/system-admin-route");
const { visitorsRouter } = require("./routes/visitors/visitors-route");
const { exhibitorsRouter } = require("./routes/exhibitors/exhibitors-route");
const { companiesRouter } = require("./routes/companies/companies-route");
const { organizerRouter } = require("./routes/organizer/organizer-route");
const { fileUploadRouter } = require("./routes/file-upload/file-upload-route");
const { projectRouter } = require("./routes/project/project-route");
const { attendanceRouter } = require("./routes/attendances/attendance-route");
const { commonRouter } = require("./routes/common/common-route");
const { dashboardRouter } = require("./routes/admin-dashboard/dashboard-route");
const { withoutLoginRouter } = require('./routes/withoutLogin/without-Token-route');
const { testRouter } = require("./routes/test-route");
const { reportGenerateRouter } = require("./routes/report-generate/report-generate-route");

// Middleware
app.use("/users", usersRouter);
app.use("/visitors", visitorsRouter);
app.use("/exhibitions", exhibitionsRouter);
app.use("/system-admin", systemAdminRouter);
app.use("/exhibitors", exhibitorsRouter);
app.use("/companies", companiesRouter);
app.use("/organizer", organizerRouter);
app.use("/uploader", fileUploadRouter);
app.use("/project", projectRouter);
app.use("/attendances", attendanceRouter);
app.use("/common", commonRouter);
app.use("/dashboard", dashboardRouter);
app.use("/withoutLogin", withoutLoginRouter);
app.use("/test", testRouter);
app.use("/report-generate", reportGenerateRouter);

// app.get("/status", (req, res) => {
//   res.json({
//     success: true,
//     time: new Date().getTime(),
//   });
// });

// Define your static file paths
const staticFilePath = path.join(__dirname, "/../uploads");
// Serve the static files
app.use("/uploads", express.static(staticFilePath));

module.exports = app;
