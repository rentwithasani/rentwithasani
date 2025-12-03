// api/chauffeur.js
const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

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

    const {
      name,
      email,
      phone,
      serviceType,
      date,
      time,
      passengers,
      hours,
      pickup,
      dropoff,
      notes,
    } = data;

    const lines = [
      "New chauffeur request from Asani Rentals website:",
      "",
      `Name: ${name || ""}`,
      `Email: ${email || ""}`,
      `Phone: ${phone || ""}`,
      `Service type: ${serviceType || ""}`,
      `Date: ${date || ""}`,
      `Time: ${time || ""}`,
      `Passengers: ${passengers || ""}`,
      `Estimated hours: ${hours || ""}`,
      `Pickup: ${pickup || ""}`,
      `Dropoff / itinerary: ${dropoff || ""}`,
      "",
      "Notes:",
      notes || "(none)",
    ];

    await resend.emails.send({
      from: "Asani Rentals <no-reply@rentwithasani.com>",
      to: "reserve@rentwithasani.com",
      reply_to: email || undefined,
      subject: "New chauffeur request — Asani Rentals",
      text: lines.join("\n"),
    });

    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ ok: true }));
  } catch (err) {
    console.error("Chauffeur email error", err);
    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ error: "Failed to send email" }));
  }
};
