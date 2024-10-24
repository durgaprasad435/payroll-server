const { model, Schema } = require("mongoose");

const EmployeeDetails = new Schema({
  id: String,
  firstName: {
    type: String,
    require: true,
  },
  lastName: {
    type: String,
    require: true,
  },
  gender: String,
  dateOfBirth: Date || String,
  mobileNumber: String,
  email: String,
  employeeId: String,
  designation: String,
  employeeCode: String,
  joinDate: Date || String,
  pan: String,
  aadhar: String,
  accountNumber: String,
  bankName: String,
  ifscCode: String,
  uan: String,
  pfNo: String,
  createdDate: Date,
  modifiedDate: Date,
});
const Employee = model("Employee", EmployeeDetails);
module.exports = Employee;
