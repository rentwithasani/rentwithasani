import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Vercel serverless function for POST /api/chauffeur
 */
export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
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
    } = req.body || {};

    if (!name || !email || !phone || !serviceType || !date || !time || !pickup || !dropoff) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const subject = `New chauffeur request from ${name}`;
    const html = `
      <h2>New Chauffeur Request</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Phone:</strong> ${phone}</p>
      <p><strong>Service type:</strong> ${serviceType}</p>
      <p><strong>Date:</strong> ${date}</p>
      <p><strong>Time:</strong> ${time}</p>
      <p><strong>Passengers:</strong> ${passengers || "-"} </p>
      <p><strong>Estimated hours:</strong> ${hours || "-"} </p>
      <p><strong>Pickup:</strong> ${pickup}</p>
      <p><strong>Dropoff / itinerary:</strong> ${dropoff}</p>
      <p><strong>Notes:</strong><br/>${notes || "(none)"}</p>
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
    console.error("Chauffeur API error", err);
    return res.status(500).json({ error: "Failed to send email" });
  }
}
