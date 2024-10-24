const { model, Schema } = require("mongoose");

const LeaveObj = new Schema({
  id: String,
  employeeId: {
    type: String,
    require: true,
  },
  appliedDate: Date,
  leaveDates: [String],
  noOfDays: Number,
  reason: String,
  status: String,
  approvedBy: {
    type: String,
    require: true,
  },
  createdDate: Date,
  modifiedDate: Date,
});
const Leave = model("Leave", LeaveObj);
module.exports = Leave;
