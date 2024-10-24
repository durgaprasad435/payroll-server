const express = require("express");
const mongoose = require("mongoose");
var cookieParser = require("cookie-parser");
const cors = require("cors");
const app = express();
const authmiddleware = require("../payroll-server/middleware/authmiddleware");
app.use(cookieParser());
app.use(
  cors({
    origin: "https://payroll-client-rose.vercel.app/login",
    methods: "GET,POST",
    credentials: true,
  })
);
app.use(express.json());
require("dotenv").config();
const Database = require("../payroll-server/providers/dbproviders");
const payrollController = require("./modules/PayrollController");

function initilize() {
  Database.Connect();
}
initilize();
app.use(authmiddleware.myLogger);
app.use("/api/payroll", payrollController);

var port = process.env.API_PORT || 9000;

app.listen(port, null, () => {
  const message = `API listening to port ${port}`;
});
