// setup-email.js - helper to save Gmail login details safely
import fs from "fs";
import readline from "readline";
import nodemailer from "nodemailer";

// Ask a question and return the answer
function ask(question) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

// Ask for a password without showing what is typed
function askSecret(question) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: true });
  // Hide the typed characters
  rl._writeToOutput = function () {};
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      process.stdout.write("\n");
      resolve(answer);
    });
  });
}

async function main() {
  // 1. Get and check the Gmail address
  let email = "";
  while (true) {
    email = await ask("Your Gmail address: ");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      console.log("That does not look like an email. Try again.");
      continue;
    }
    if (!email.endsWith("@gmail.com")) {
      console.log("Please use a Gmail address ending in @gmail.com.");
      continue;
    }
    break;
  }

  // 2. Get and check the 16-character app password
  let password = "";
  while (true) {
    const raw = await askSecret("Your 16-char app password: ");
    password = raw.replace(/\s+/g, ""); // remove spaces
    if (password.length !== 16) {
      console.log("That password has " + password.length + " characters. It must be exactly 16. Try again.");
      continue;
    }
    if (!/^[a-zA-Z0-9]+$/.test(password)) {
      console.log("App passwords should only contain letters and numbers. Try again.");
      continue;
    }
    break;
  }

  // 3. Write .env (only these two lines)
  const content = "EMAIL_USER=" + email + "\nEMAIL_PASS=" + password + "\n";
  fs.writeFileSync(".env", content);
  console.log("Saved .env");

  // 4. Check the Gmail login
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user: email, pass: password },
  });

  try {
    await transporter.verify();
    console.log("Email login OK");
  } catch (err) {
    console.log(err.message);
    console.log("Fix: check your Google App Password and that 2-Step Verification is on.");
  }
}

main();
