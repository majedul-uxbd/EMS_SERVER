// app.js
const express = require('express');
const path = require('path');
const app = express();
const cors = require('cors');
const morgan = require('morgan');
const bodyParser = require('body-parser');

require('dotenv').config();

//================================================================

app.use(bodyParser.json());
app.use(morgan('combined'));
app.use(cors());

// Middleware to parse JSON bodies
app.use(
  express.urlencoded({
    extended: true,
    limit: '50mb',
    parameterLimit: 10000,
  })
);
app.use(express.json({ limit: '50mb' }));

// Routes
const { usersRouter } = require('./routes/users/users-route');
const { exhibitionsRouter } = require('./routes/exhibitions/exhibitions-route');
const { systemAdminRouter } = require('./routes/system-admin/system-admin-route');
const { visitorsRouter } = require('./routes/visitors/visitors-route');
const { exhibitorsRouter } = require('./routes/exhibitors/exhibitors-route');
const { companiesRouter } = require('./routes/companies/companies-route');

app.get('/status', (req, res) => {
  res.json({
    success: true,
    time: new Date().getTime(),
  });
});

// Middleware
app.use('/users', usersRouter);
app.use('/visitors', visitorsRouter);
app.use('/exhibitions', exhibitionsRouter);
app.use('/system-admin', systemAdminRouter);
app.use('/exhibitors', exhibitorsRouter);
app.use('/companies', companiesRouter);

// Define your static file paths
const staticFilePath = path.join(__dirname, '/../uploads');
// Serve the static files
app.use('/uploads', express.static(staticFilePath));

module.exports = app;
