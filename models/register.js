const { model, Schema } = require("mongoose");

const UserData = new Schema({
  id: String,
  UserName: {
    type: String,
    require: true,
  },
  EMail: {
    type: String,
    require: true,
  },
  Password: {
    type: String,
    require: true,
  },
  role:String,
  date_created: Date,
});
const UserInfo = model("UserInfo", UserData);

module.exports = UserInfo;
