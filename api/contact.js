import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Vercel serverless function for POST /api/contact
 */
export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { name, email, message } = req.body || {};

    if (!name || !email || !message) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const subject = `New contact message from ${name}`;
    const html = `
      <h2>New Contact Message</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Message:</strong></p>
      <p>${message}</p>
    `;

    const from = process.env.RESEND_FROM_EMAIL || "no-reply@example.com";
    const to = "reserve@rentwithasani.com";

    await resend.emails.send({
      from,
      to,
      subject,
      html,
    });

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("Contact API error", err);
    return res.status(500).json({ error: "Failed to send email" });
  }
}
