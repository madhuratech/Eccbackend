const transporter = require("../config/mailer");

const sendContactMail = async ({ fullName, companyName, email, phone, service, location, message }) => {
  const recipient = process.env.CONTACT_TO_EMAIL || process.env.EMAIL_USER;

  if (!recipient) {
    throw new Error("CONTACT_TO_EMAIL or EMAIL_USER must be configured.");
  }

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: recipient,
    replyTo: email,
    subject: `New Contact Inquiry from ${fullName}`,
    html: `
      <h2>New Contact Form Submission</h2>
      <p><strong>Full Name:</strong> ${fullName}</p>
      <p><strong>Company Name:</strong> ${companyName || "-"}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Phone:</strong> ${phone}</p>
      <p><strong>Service Required:</strong> ${service || "-"}</p>
      <p><strong>Location:</strong> ${location || "-"}</p>
      <p><strong>Message:</strong></p>
      <p>${message}</p>
    `,
  };

  return transporter.sendMail(mailOptions);
};

module.exports = { sendContactMail };
