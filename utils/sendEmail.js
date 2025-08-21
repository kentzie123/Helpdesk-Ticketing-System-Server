const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const sendEmail = async (to, code) => {
  const mailOptions = {
    from: `Sample Company Name ${process.env.EMAIL_USER}`,
    to,
    subject: 'Your Confirmation Code',
    html: `
      <h2>Verification Code</h2>
      <p>Your confirmation code is: <strong>${code}</strong></p>
      <p>This code will expire in 10 minutes.</p>
    `
  };

  return await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
