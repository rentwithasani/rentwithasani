// api/booking.js
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { booking } = req.body;

    if (!booking) {
      return res.status(400).json({ error: "Missing booking in body" });
    }

    const {
      vehicleId,
      vehicleName,
      startDate,
      endDate,
      days,
      subtotal,
      total,
      deposit,
      customer,
      extras,
    } = booking;

    const subject = `New booking — ${vehicleName || vehicleId || "Unknown vehicle"}`;

    const customerName = customer?.fullName || "N/A";
    const customerEmail = customer?.email || "N/A";
    const customerPhone = customer?.phone || "N/A";

    const html = `
      <div>
        <h2>New Booking Received</h2>
        <p><strong>Vehicle:</strong> ${vehicleName || vehicleId}</p>
        <p><strong>Name:</strong> ${customerName}</p>
        <p><strong>Email:</strong> ${customerEmail}</p>
        <p><strong>Phone:</strong> ${customerPhone}</p>
        <p><strong>Dates:</strong> ${startDate || "?"} → ${endDate || "?"} (${days} day(s))</p>
        <p><strong>Subtotal:</strong> $${subtotal}</p>
        <p><strong>Estimated total:</strong> $${total}</p>
        <p><strong>Deposit:</strong> $${deposit}</p>
        <p><strong>Extras:</strong></p>
        <pre>${JSON.stringify(extras, null, 2)}</pre>
      </div>
    `;

    await resend.emails.send({
      from: "notifications@rentwithasani.com", // must be on your verified domain
      to: ["reserve@rentwithasani.com"],
      subject,
      html,
    });

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("Booking API error:", err);
    return res
      .status(500)
      .json({ error: "Failed to process booking on the server" });
  }
}
