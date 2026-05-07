const express = require("express");
const { sendContactMail } = require("../services/sendMail");

const router = express.Router();

router.post("/contact", async (req, res) => {
  try {
    const { fullName, companyName, email, phone, service, location, message } = req.body;

    if (!fullName || !email || !phone || !message) {
      return res.status(400).json({
        success: false,
        message: "Please fill all required fields.",
      });
    }

    await sendContactMail({ fullName, companyName, email, phone, service, location, message });

    res.status(200).json({
      success: true,
      message: "Your inquiry has been sent successfully.",
    });
  } catch (error) {
    console.error("Email send error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send inquiry.",
    });
  }
});

module.exports = router;
