import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Handle chauffeur service requests.
 * Frontend: ChauffeurRequest() -> fetch("/api/chauffeur", { ... })
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
      to,
    } = req.body || {};

    if (!name || !email || !phone || !serviceType || !date || !time || !pickup) {
      return res.status(400).json({
        error:
          "Missing required fields (name, email, phone, service type, date, time, pickup).",
      });
    }

    const notifyTo = process.env.NOTIFY_TO || to || "reserve@rentwithasani.com";

    const serviceLabels = {
      "sprinter": "Sprinter",
      "black-suv": "Black truck / black SUV",
      "elite-luxury": "Elite luxury sedan",
      "armed-chauffeur": "Armed chauffeur (licensed protection)",
    };

    // Email to you
    await resend.emails.send({
      from: "Asani Rentals <notifications@rentwithasani.com>",
      to: notifyTo,
      subject: "New chauffeur request – Asani Rentals",
      text: `
New chauffeur request from Asani Rentals website

Client:
- Name: ${name}
- Email: ${email}
- Phone: ${phone}

Service details:
- Service type: ${serviceLabels[serviceType] || serviceType}
- Date: ${date}
- Time: ${time}
- Estimated hours: ${hours || "Not specified"}
- Passengers: ${passengers || "Not specified"}

Itinerary:
- Pick-up: ${pickup}
- Drop-off / itinerary: ${dropoff || "Not specified"}

Notes:
${notes || "None provided"}
      `.trim(),
    });

    // Confirmation email to customer
    if (email) {
      await resend.emails.send({
        from: "Asani Rentals <notifications@rentwithasani.com>",
        to: email,
        subject: "We’ve received your chauffeur request – Asani Rentals",
        text: `
Hi ${name || ""},

Thank you for your chauffeur request with Asani Rentals.
Our team will review availability and respond with pricing and confirmation.

Summary:
- Service: ${serviceLabels[serviceType] || serviceType}
- Date: ${date}, Time: ${time}
- Pickup: ${pickup}
- Passengers: ${passengers || "Not specified"}

If you need to update anything, reply to this email or contact us at 732-470-8233.

— Asani Rentals
      `.trim(),
      });
    }

    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error("Chauffeur API error:", error);
    return res
      .status(500)
      .json({ error: "Failed to submit request. Please try again later." });
  }
}
