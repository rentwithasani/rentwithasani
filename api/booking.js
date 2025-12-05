// api/booking.js
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

// From: should be a verified sender/domain in Resend
const FROM_EMAIL =
  process.env.BOOKING_FROM_EMAIL || "notifications@rentwithasani.com";

// Where you receive notifications
const OWNER_EMAIL =
  process.env.BOOKING_OWNER_EMAIL || "reserve@rentwithasani.com";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const booking = req.body || {};
    const {
      vehicleName,
      startDate,
      endDate,
      days,
      total,
      deposit,
      customer,
      extras,
    } = booking;

    if (!customer?.email || !vehicleName || !startDate || !endDate) {
      return res.status(400).json({
        error: "Missing required booking fields.",
      });
    }

    const customerName = customer.fullName || "Valued Guest";

    // 1) Email to customer
    await resend.emails.send({
      from: FROM_EMAIL,
      to: customer.email,
      subject: `Your ${vehicleName} reservation — Asani Rentals`,
      html: `
        <div style="font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color:#111827;">
          <h2>Reservation received</h2>
          <p>Hi ${customerName},</p>
          <p>Thank you for choosing Asani Rentals. We have received your reservation request.</p>
          <p><strong>Vehicle:</strong> ${vehicleName}</p>
          <p><strong>Dates:</strong> ${startDate} → ${endDate} (${days} day${
        days > 1 ? "s" : ""
      })</p>
          <p><strong>Estimated total:</strong> $${Number(total).toFixed(
            2
          )} (deposit $${Number(deposit).toFixed(2)})</p>
          <p>We will confirm availability and send you any additional details shortly.</p>
          <p style="margin-top:24px;">Regards,<br/>Asani Rentals</p>
        </div>
      `,
    });

    // 2) Email to you / back office
    await resend.emails.send({
      from: FROM_EMAIL,
      to: OWNER_EMAIL,
      subject: `New booking — ${vehicleName} (${customerName})`,
      html: `
        <div style="font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color:#111827;">
          <h2>New booking</h2>
          <p><strong>Customer:</strong> ${
            customerName
          } (${customer.email}, ${customer.phone || "no phone provided"})</p>
          <p><strong>Vehicle:</strong> ${vehicleName}</p>
          <p><strong>Dates:</strong> ${startDate} → ${endDate} (${days} day${
        days > 1 ? "s" : ""
      })</p>
          <p><strong>Estimated total:</strong> $${Number(total).toFixed(
            2
          )}</p>
          <p><strong>Deposit:</strong> $${Number(deposit).toFixed(2)}</p>
          <p><strong>Extras:</strong></p>
          <pre style="background:#F9FAFB; padding:12px; border-radius:6px; font-size:12px;">${JSON.stringify(
            extras || {},
            null,
            2
          )}</pre>
        </div>
      `,
    });

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("Booking email error:", err);
    return res.status(500).json({
      error: "Unable to send booking emails.",
    });
  }
}
