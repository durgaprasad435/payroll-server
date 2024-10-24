const { model, Schema } = require("mongoose");

const SalaryObj = new Schema(
  {
    id: String,
    employeeId: {
      type: Schema.Types.Mixed, // This allows both string and number types
      required: true,
    },
    employeeName: String,
    basic: Number,
    hra: Number,
    medical: Number,
    bonus: Number,
    convinenceAllowance: Number,
    communicationAllowance: Number,
    epf: Number,
    pf: Number,
    incomeTax: Number,
    netSalary: Number,
    grossSalary: Number,
    ctc: Number,
    totalDeductions:Number,
    salaryStatus: String,
    createdDate: Date,
    modifiedDate: Date,
  },
  { strict: false } // Allows extra fields to be stored
);
const Salary = model("Salary", SalaryObj);
module.exports = Salary;
