const app = require("express")();
require("dotenv").config();

// routes
const home = require("./routes/home");

// router middleware
app.use("/api/v1", home);

// export app js

module.exports = app;
