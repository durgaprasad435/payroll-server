const { model, Schema } = require("mongoose");
const EmployerDetails = new Schema({
  id: String,
  employerName: {
    type: String,
    require: true,
  },
  employerEmail: String,
  companyName: String,
  address: String,
  employeeCount: Number,
  url: String,
  logo: String,
});

const Employer = model("Employer", EmployerDetails);

module.exports = Employer;
