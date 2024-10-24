const { model, Schema } = require("mongoose");

const AddressObj = new Schema({
  id: String,
  addressId: String,
  employeeId: {
    type: Schema.Types.Mixed, // This allows both string and number types
    required: true,
  },
  addressType: String,
  addressLine1: String,
  addressLine2: String,
  addressLine3: String,
  city: String,
  state: String,
  country: String,
  zipCode: Number,
});
const Address = model("Address", AddressObj);
module.exports = Address;
