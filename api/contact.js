// api/contact.js
const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

// Helper to read JSON body in a Vercel serverless function
async function readJsonBody(req) {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }
  const bodyString = Buffer.concat(chunks).toString();
  if (!bodyString) return {};
  return JSON.parse(bodyString);
}

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.statusCode = 405;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ error: "Method not allowed" }));
    return;
  }

  try {
    const data = await readJsonBody(req);
    const { name, email, message } = data;

    await resend.emails.send({
      from: "Asani Rentals <no-reply@rentwithasani.com>", // use a verified sender
      to: "reserve@rentwithasani.com",
      reply_to: email || undefined,
      subject: "New contact message — Asani Rentals",
      text:
        `New contact message from Asani Rentals website:\n\n` +
        `Name: ${name || "Unknown"}\n` +
        `Email: ${email || "Not provided"}\n\n` +
        `${message || ""}`,
    });

    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ ok: true }));
  } catch (err) {
    console.error("Contact email error", err);
    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ error: "Failed to send email" }));
  }
};
