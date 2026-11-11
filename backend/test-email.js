// test-email.js - send one test email to your own Gmail
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
});

async function main() {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      subject: "Test email from waste-pickup",
      text: "If you see this, email sending works.",
    });
    console.log("Test email sent to " + process.env.EMAIL_USER);
  } catch (err) {
    console.log(err.message);
    console.log("Fix: run bun setup-email.js and check your App Password.");
  }
}

main();
