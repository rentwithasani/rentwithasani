// api/booking.js

import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const booking = req.body || {};

    // We expect the frontend to send: { vehicle, customer, startDate, endDate, total, deposit, extras, ... }
    const customer = booking.customer || {};
    const customerEmail = (customer.email || "").trim();

    // Primary business notification address from env
    const businessEmail = (process.env.EMAIL_TO || "").trim();

    // Build recipient list: always send to business, and also to customer if email present
    const recipients = [];
    if (businessEmail) recipients.push(businessEmail);
    if (customerEmail) recipients.push(customerEmail);

    if (recipients.length === 0) {
      console.error("No valid recipients configured for booking email");
      return res
        .status(500)
        .json({ error: "No valid recipients configured for booking email" });
    }

    // Nice, readable summary in HTML
    const vehicleName = booking.vehicleName || booking.vehicle?.name || "Vehicle";
    const startDate = booking.startDate || "";
    const endDate = booking.endDate || "";
    const days = booking.days || "";
    const subtotal = booking.subtotal || 0;
    const deposit = booking.deposit || 0;
    const total = booking.total || 0;
    const extras = booking.extras || {};

    const extrasSummary = `
      <ul>
        <li><strong>Protection plan:</strong> ${
          extras.insurance === "asani"
            ? `Yes (+$${(extras.insuranceDailyRate || 0).toFixed?.(2) || extras.insuranceDailyRate || 0}/day)`
            : "Declined"
        }</li>
        <li><strong>EZ-Pass:</strong> ${extras.ezPass ? "Yes" : "No"}</li>
        <li><strong>Prepaid fuel:</strong> ${extras.prepayFuel ? "Yes" : "No"}</li>
        <li><strong>Child seats:</strong> ${
          extras.amenityCount && extras.amenityCount > 0
            ? `${extras.amenityCount} x (+$${(extras.amenityDailyRate || 0).toFixed?.(2) || extras.amenityDailyRate || 0}/day each)`
            : "None"
        }</li>
      </ul>
    `;

    const html = `
      <div style="font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color:#111827;">
        <h2 style="margin-bottom:8px;">New reservation — ${vehicleName}</h2>
        <p style="margin-top:0;margin-bottom:16px; font-size:14px; color:#4B5563;">
          Thank you for choosing Asani Rentals.
        </p>

        <h3 style="font-size:16px; margin-bottom:4px;">Trip details</h3>
        <ul style="font-size:14px; color:#374151; padding-left:20px;">
          <li><strong>Vehicle:</strong> ${vehicleName}</li>
          <li><strong>Dates:</strong> ${startDate || "TBD"} → ${endDate || "TBD"}</li>
          <li><strong>Rental days (billable):</strong> ${days || "N/A"}</li>
        </ul>

        <h3 style="font-size:16px; margin-top:16px; margin-bottom:4px;">Driver / renter</h3>
        <ul style="font-size:14px; color:#374151; padding-left:20px;">
          <li><strong>Name:</strong> ${customer.fullName || "N/A"}</li>
          <li><strong>Email:</strong> ${customerEmail || "N/A"}</li>
          <li><strong>Phone:</strong> ${customer.phone || "N/A"}</li>
        </ul>

        <h3 style="font-size:16px; margin-top:16px; margin-bottom:4px;">Price summary (estimate)</h3>
        <ul style="font-size:14px; color:#374151; padding-left:20px;">
          <li><strong>Rental subtotal:</strong> $${Number(subtotal || 0).toFixed(2)}</li>
          <li><strong>Estimated extras:</strong> $${Number(
            extras.insuranceCost ||
              0 +
                extras.ezPassCost ||
              0 +
                extras.fuelPrepayCost ||
              0 +
                extras.amenitiesCost ||
              0
          ).toFixed(2)}</li>
          <li><strong>Estimated trip total:</strong> $${Number(total || 0).toFixed(2)}</li>
          <li><strong>Deposit due now:</strong> $${Number(deposit || 0).toFixed(2)}</li>
        </ul>

        <h4 style="font-size:14px; margin-top:16px; margin-bottom:4px;">Extras breakdown</h4>
        ${extrasSummary}

        <p style="margin-top:16px; font-size:12px; color:#6B7280;">
          This is an estimate only. Final charges, taxes, tolls, violations, and fees will be
          confirmed in your rental agreement at pickup.
        </p>

        <hr style="margin:20px 0; border:none; border-top:1px solid #E5E7EB;" />

        <p style="font-size:12px; color:#6B7280;">
          ${COMPANY && COMPANY.name ? COMPANY.name : "Asani Rentals"} • ${
      COMPANY && COMPANY.phone ? COMPANY.phone : ""
    } • ${
      COMPANY && COMPANY.email ? COMPANY.email : "reserve@rentwithasani.com"
    }
        </p>
      </div>
    `;

    const subject = `New reservation — ${vehicleName} (${startDate || "TBD"})`;

    const emailResponse = await resend.emails.send({
      from: process.env.EMAIL_FROM, // e.g. notifications@rentwithasani.com
      to: recipients,
      subject,
      html,
    });

    console.log("Booking email sent", emailResponse);

    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error("Error in /api/booking:", error);
    return res
      .status(500)
      .json({ error: "Failed to send booking email", details: String(error) });
  }
}

// A small COMPANY fallback in case it's not globally defined here
const COMPANY = {
  name: "Asani Rentals",
  phone: "732-470-8233",
  email: "reserve@rentwithasani.com",
};
