const nodemailer = require("nodemailer");

const requiredEmailVars = ["EMAIL_USER", "EMAIL_PASS"];
const missingEmailVars = requiredEmailVars.filter((key) => !process.env[key]);

if (missingEmailVars.length > 0) {
  console.error(`Missing email environment variables: ${missingEmailVars.join(", ")}`);
}

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

if (process.env.NODE_ENV !== "test") {
  transporter.verify((error) => {
    if (error) {
      console.error("Nodemailer config error:", error.message);
    } else {
      console.log("Nodemailer ready to send emails");
    }
  });
}

module.exports = transporter;
