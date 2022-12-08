const mongoose = require("mongoose");

const connectWithDB = async () => {
  await mongoose
    .connect(process.env.DB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => {
      console.log("DB connected successfully");
    })
    .catch((e) => {
      console.log(`DB failed to coonect`);
      console.log(e);
      process.exit(1);
    });
};

module.exports = connectWithDB;
