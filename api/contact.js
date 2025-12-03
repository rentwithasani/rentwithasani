// api/contact.js
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

// Test mode: always send to your Gmail
const TO_EMAIL = "rentwithasani@gmail.com";

export default async function handler(req, res) {
  console.log("➡️ /api/contact called:", req.method, new Date().toISOString());

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "Method Not Allowed" });
  }

  let body = req.body;
  if (typeof body === "string") {
    try {
      body = JSON.parse(body);
    } catch {
      body = {};
    }
  }
  body = body || {};

  const { name, email, message } = body;

  const subject = `New contact message from ${name || "Website visitor"}`;

  const html = `
    <h2>New Contact Message</h2>
    <p><strong>Name:</strong> ${name || ""}</p>
    <p><strong>Email:</strong> ${email || ""}</p>
    <p><strong>Message:</strong></p>
    <p>${(message || "").replace(/\n/g, "<br />")}</p>
  `;

  const from =
    process.env.RESEND_FROM_EMAIL || "Asani Rentals <onboarding@resend.dev>";

  try {
    const result = await resend.emails.send({
      from,
      to: TO_EMAIL, // 🔒 locked to your Gmail
      subject,
      html,
    });

    console.log("✅ Contact email sent via Resend:", result?.id || result);
    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error("❌ Contact API / Resend error:", error);
    return res.status(500).json({
      ok: false,
      error:
        error?.message ||
        error?.name ||
        "Failed to send contact form email.",
    });
  }
}
