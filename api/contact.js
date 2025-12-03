// api/contact.js
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

// TEMP: send all contact messages to your Gmail while in test mode
const TO_EMAIL = "rentwithasani@gmail.com";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const body = req.body || {};
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

    const result = await resend.emails.send({
      from,
      to: TO_EMAIL,
      subject,
      html,
    });

    console.log("Contact email sent:", result);

    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error("Contact API error:", error);
    return res.status(500).json({
      ok: false,
      error: error?.message || "Unknown error",
    });
  }
}
