// api/chauffeur.js
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Method not allowed" });
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
      return res
        .status(400)
        .json({ ok: false, error: "Missing required fields." });
    }

    const fromEmail = process.env.RESEND_FROM_EMAIL;
    const toEmail = process.env.BOOKING_NOTIFY_EMAIL || fromEmail;

    const serviceLabelMap = {
      "sprinter": "Sprinter",
      "black-suv": "Black truck / Black SUV",
      "elite-luxury": "Elite luxury sedan",
      "armed-chauffeur": "Armed chauffeur",
    };

    const serviceLabel = serviceLabelMap[serviceType] || serviceType;

    const result = await resend.emails.send({
      from: `Asani Rentals <${fromEmail}>`,
      to: [toEmail],
      reply_to: email,
      subject: `New chauffeur request — ${serviceLabel}`,
      text: `New chauffeur service request:

Name: ${name}
Email: ${email}
Phone: ${phone}

Service type: ${serviceLabel}
Date: ${date}
Time: ${time}
Passengers: ${passengers || "N/A"}
Estimated hours: ${hours || "N/A"}

Pickup: ${pickup}
Drop-off / Itinerary: ${dropoff}

Notes:
${notes || "None provided"}
`,
    });

    if (result.error) {
      console.error("Resend chauffeur error:", result.error);
      return res
        .status(500)
        .json({ ok: false, error: "Email send failed", detail: result.error });
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("Chauffeur API error:", err);
    return res
      .status(500)
      .json({ ok: false, error: "Unexpected error sending email" });
  }
}
