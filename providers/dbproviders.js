const mongoose = require("mongoose");

const Database = {
  Connect: () => {
    mongoose
      .connect(process.env.LINK_DB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      })
      .then(() => {
        console.log(`Connected to DB at ${process.env.LINK_DB_URI}`);
      })
      .catch((err) => {
        console.error("Error connecting to DB:", err);
      });
  },
  Close: () => {
    mongoose.disconnect();
  },
  Mongoos: mongoose,
};

module.exports = Database;
