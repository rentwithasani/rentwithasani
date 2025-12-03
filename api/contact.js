// api/contact.js
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  try {
    const { name, email, message } = req.body || {};

    if (!name || !email || !message) {
      return res
        .status(400)
        .json({ ok: false, error: "Missing required fields." });
    }

    const fromEmail = process.env.RESEND_FROM_EMAIL;
    const toEmail = process.env.BOOKING_NOTIFY_EMAIL || fromEmail;

    const result = await resend.emails.send({
      from: `Asani Rentals <${fromEmail}>`,
      to: [toEmail],
      reply_to: email, // so you can just hit "Reply" in your inbox
      subject: `New contact message from ${name}`,
      text: `Name: ${name}
Email: ${email}

Message:
${message}`,
    });

    if (result.error) {
      console.error("Resend contact error:", result.error);
      return res
        .status(500)
        .json({ ok: false, error: "Email send failed", detail: result.error });
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("Contact API error:", err);
    return res
      .status(500)
      .json({ ok: false, error: "Unexpected error sending email" });
  }
}
