// magnus-backend/server.js
require("dotenv").config();
const express = require("express");
const nodemailer = require("nodemailer");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// // Configure the Mail Transporter
// const transporter = nodemailer.createTransport({
//   service: "gmail",
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_PASS, // Your 16-digit Google App Password
//   },
// });

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // Must be false for port 587
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    // This allows the connection to proceed even if 
    // Render's network certificate is slightly different
    rejectUnauthorized: false,
    minVersion: "TLSv1.2"
  },
  connectionTimeout: 10000, // Wait 10 seconds before giving up
  greetingTimeout: 5000,    // Wait 5 seconds for Google to say hello
});

app.post("/api/contact", async (req, res) => {
  const { name, email, subject, message } = req.body;

  const mailOptions = {
    from: `"${name}" <${process.env.EMAIL_USER}>`,
    replyTo: email,
    to: process.env.RECEIVER_EMAIL,
    subject: `Magnus Website Inquiry: ${subject}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; border: 1px solid #eee; padding: 20px;">
        <h2 style="color: #8b735b;">New Lead Captured</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <div style="background: #f9f9f9; padding: 15px; border-left: 4px solid #8b735b; margin-top: 20px;">
          <strong>Message:</strong><br/>${message}
        </div>
        <p style="font-size: 10px; color: #aaa; margin-top: 30px;">Sent via Magnus Corp Web API</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({ success: true, message: "Message sent!" });
  } catch (error) {
    console.error("DETAILED SMTP ERROR:", error); // This will show in Render "Logs"
    res.status(500).json({
      success: false,
      message: "Failed to send message.",
      error: error.message, // Helps identify if it's a login issue or network issue
    });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
