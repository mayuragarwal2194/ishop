import nodemailer from "nodemailer";

export const sendEmail = async ({to, subject, html}) => {
  // Create transporter
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false,
    
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  // Send email
  await transporter.sendMail({
    from: `"Ishop" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  });
}