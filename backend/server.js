import express from "express";
import cors from "cors";
import fs from "fs";
import nodemailer from "nodemailer";

const app = express();
app.use(cors());
app.use(express.json());

const FILE = "bookings.json";

// The email sender (uses the secrets from .env)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

function readBookings() {
  if (!fs.existsSync(FILE)) return [];
  return JSON.parse(fs.readFileSync(FILE, "utf8"));
}

function writeBookings(list) {
  fs.writeFileSync(FILE, JSON.stringify(list, null, 2));
}

// 2026-11-20 becomes 20/11/2026
function formatDate(text) {
  const p = text.split("-");
  return p[2] + "/" + p[1] + "/" + p[0];
}

// Makes text safe to put inside an email
function escapeHtml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// Sends the confirmation email
async function sendConfirmationEmail(b) {
  const when = formatDate(b.date) + ", " + b.slot;

  await transporter.sendMail({
    from: '"Clean District" <' + process.env.EMAIL_USER + ">",
    to: b.email,
    subject: "Pickup booked - ID " + b.id,
    text:
      "Hello " +
      b.name +
      ",\n\n" +
      "Your waste pickup is booked.\n\n" +
      "Booking ID: " +
      b.id +
      "\n" +
      "Service: " +
      b.service +
      " (Rs. " +
      b.price +
      ")\n" +
      "Pickup: " +
      when +
      "\n" +
      "Address: " +
      b.address +
      ", " +
      b.area +
      "\n\n" +
      "Keep your booking ID. You can track the pickup on our website with your ID and phone number.\n\n" +
      "Clean District",
    html:
      "<div style='font-family:Arial,sans-serif;max-width:480px'>" +
      "<h2 style='color:#1f3a1a'>Your pickup is booked</h2>" +
      "<p>Hello " +
      escapeHtml(b.name) +
      ",</p>" +
      "<p style='font-size:22px;font-weight:bold;letter-spacing:2px;background:#eef3e8;padding:10px 16px;display:inline-block;border-radius:8px'>" +
      escapeHtml(b.id) +
      "</p>" +
      "<p><b>Service:</b> " +
      escapeHtml(b.service) +
      " (₹" +
      escapeHtml(b.price) +
      ")<br>" +
      "<b>Pickup:</b> " +
      escapeHtml(when) +
      "<br>" +
      "<b>Address:</b> " +
      escapeHtml(b.address) +
      ", " +
      escapeHtml(b.area) +
      "</p>" +
      "<p>Keep your booking ID. You can track the pickup on our website with your ID and phone number.</p>" +
      "<p>Clean District</p></div>",
  });
}

// See all bookings
app.get("/api/bookings", function (req, res) {
  res.json(readBookings());
});

// Create a new booking
app.post("/api/bookings", async function (req, res) {
  const b = req.body;

  // Basic checks
  if (!b.name || !b.phone || !b.address || !b.date) {
    return res.status(400).json({ error: "Missing details" });
  }
  if (!/^[0-9]{10}$/.test(b.phone)) {
    return res.status(400).json({ error: "Phone must be 10 digits" });
  }
  if (b.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(b.email)) {
    return res.status(400).json({ error: "Email is not valid" });
  }

  const booking = {
    id: "CD" + Date.now().toString().slice(-6),
    service: b.service,
    price: b.price,
    name: b.name,
    phone: b.phone,
    email: b.email ? b.email.trim() : "",
    address: b.address,
    area: b.area,
    date: b.date,
    slot: b.slot,
    notes: b.notes || "",
    status: "pending",
  };

  const bookings = readBookings();
  bookings.push(booking);
  writeBookings(bookings);

  // Send the email (only if the customer gave one)
  let emailSent = false;
  let emailError = "";
  if (booking.email) {
    try {
      await sendConfirmationEmail(booking);
      emailSent = true;
      console.log("Email sent to " + booking.email);
    } catch (error) {
      emailError = error.message;
      console.log("Email failed:", error.message);
    }
  }

  res.json({ booking: booking, emailSent: emailSent, emailError: emailError });
});

app.listen(3000, function () {
  console.log("Server running at http://localhost:3000");
  console.log(
    "Email account:",
    process.env.EMAIL_USER
      ? process.env.EMAIL_USER
      : "NOT FOUND - check your .env file",
  );

  transporter.verify(function (error) {
    if (error) {
      console.log(error.message);
    } else {
      console.log("Email login OK");
    }
  });
});
