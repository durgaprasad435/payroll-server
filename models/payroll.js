const { model, Schema } = require("mongoose");
const PayRollObj = new Schema({
  id: String,
  employeeId: {
    type: String,
    require: true,
  },
  payMonth: String,
  basic: Number,
  HRA: Number,
  medical: Number,
  bonus: Number,
  convinenceAllowance: Number,
  communicationAllowance: Number,
  EPF: Number,
  employerPF: Number,
  grossTax: Number,
  cess: Number,
  netTax: Number,
  professionalTax: Number,
  payDate: Date,
});
const PayRoll = model("PayRoll", PayRollObj);
module.exports = PayRoll;
