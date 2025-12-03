// api/chauffeur.js
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

// While your Resend account is in test mode,
// ALL emails must go to your own address:
const TO_EMAIL = "rentwithasani@gmail.com";

export default async function handler(req, res) {
  console.log("➡️ /api/chauffeur called:", req.method, new Date().toISOString());

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "Method Not Allowed" });
  }

  // Make sure body is a JS object even if Vercel gives a string
  let body = req.body;
  if (typeof body === "string") {
    try {
      body = JSON.parse(body);
    } catch {
      body = {};
    }
  }
  body = body || {};

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
  } = body;

  const subject = `New chauffeur request from ${name || "Unknown guest"}`;

  const html = `
    <h2>New Chauffeur Request</h2>
    <p><strong>Name:</strong> ${name || ""}</p>
    <p><strong>Email:</strong> ${email || ""}</p>
    <p><strong>Phone:</strong> ${phone || ""}</p>
    <p><strong>Service type:</strong> ${serviceType || ""}</p>
    <p><strong>Date:</strong> ${date || ""}</p>
    <p><strong>Time:</strong> ${time || ""}</p>
    <p><strong>Passengers:</strong> ${passengers || ""}</p>
    <p><strong>Estimated hours:</strong> ${hours || ""}</p>
    <p><strong>Pickup:</strong> ${pickup || ""}</p>
    <p><strong>Drop-off / itinerary:</strong> ${dropoff || ""}</p>
    <p><strong>Notes:</strong></p>
    <p>${(notes || "").replace(/\n/g, "<br />")}</p>
  `;

  const from =
    process.env.RESEND_FROM_EMAIL || "Asani Rentals <onboarding@resend.dev>";

  try {
    const result = await resend.emails.send({
      from,
      to: TO_EMAIL, // 🔒 locked to your Gmail in test mode
      subject,
      html,
    });

    console.log("✅ Chauffeur email sent via Resend:", result?.id || result);
    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error("❌ Chauffeur API / Resend error:", error);
    return res.status(500).json({
      ok: false,
      error:
        error?.message ||
        error?.name ||
        "Failed to send chauffeur request email.",
    });
  }
}
