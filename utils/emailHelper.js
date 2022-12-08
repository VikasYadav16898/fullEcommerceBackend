const nodemailer = require("nodemailer");

const mailHelper = async (options) => {
  console.log("TWO");
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    auth: {
      user: process.env.SMTP_USER, // generated ethereal user
      pass: process.env.SMTP_PASS, // generated ethereal password
    },
  });
  const message = {
    from: "vikas@yaduveera.dev", // sender address
    to: options.email, // list of receivers
    subject: options.subject, // Subject line
    text: options.message, // plain text body
  };
  // send mail with defined transport object
  await transporter.sendMail(message);
  console.log("THREE");
};

module.exports = mailHelper;
