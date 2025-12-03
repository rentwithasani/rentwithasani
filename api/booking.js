// api/booking.js
// Serverless function for booking emails (business + customer)

const { Resend } = require("resend");

// Fallbacks so it still works if env vars are missing
const COMPANY = {
  name: "Asani Rentals",
  phone: "732-470-8233",
  email: "reserve@rentwithasani.com",
};

const resend = new Resend(process.env.RESEND_API_KEY);

// Small helper to format money safely
function toMoney(value) {
  const n = Number(value || 0);
  return n.toFixed(2);
}

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const booking = req.body || {};

    const customer = booking.customer || {};
    const customerEmail = (customer.email || "").trim();

    // Main inbox where you want notifications
    const businessEmail = (process.env.EMAIL_TO || COMPANY.email).trim();

    // Build recipient list: always you, plus customer if present
    const recipients = [];
    if (businessEmail) recipients.push(businessEmail);
    if (customerEmail) recipients.push(customerEmail);

    if (recipients.length === 0) {
      console.error("api/booking: No valid recipients (EMAIL_TO / customerEmail missing)");
      return res
        .status(500)
        .json({ error: "No valid recipients configured for booking email" });
    }

    const vehicleName =
      booking.vehicleName ||
      (booking.vehicle && booking.vehicle.name) ||
      "Vehicle";

    const startDate = booking.startDate || "";
    const endDate = booking.endDate || "";
    const days = booking.days || "";

    const subtotal = toMoney(booking.subtotal);
    const deposit = toMoney(booking.deposit);
    const total = toMoney(booking.total);

    const extras = booking.extras || {};
    const insuranceDailyRate = extras.insuranceDailyRate || 0;
    const insuranceCost = extras.insuranceCost || 0;
    const ezPassCost = extras.ezPassCost || 0;
    const fuelPrepayCost = extras.fuelPrepayCost || 0;
    const amenitiesCost = extras.amenitiesCost || 0;

    const estimatedExtrasTotal =
      Number(insuranceCost || 0) +
      Number(ezPassCost || 0) +
      Number(fuelPrepayCost || 0) +
      Number(amenitiesCost || 0);

    const extrasSummaryHtml = `
      <ul>
        <li><strong>Protection plan:</strong> ${
          extras.insurance === "asani"
            ? `Yes (+$${toMoney(insuranceDailyRate)}/day)`
            : "Declined"
        }</li>
        <li><strong>EZ-Pass:</strong> ${extras.ezPass ? "Yes" : "No"}</li>
        <li><strong>Prepaid fuel:</strong> ${
          extras.prepayFuel ? "Yes" : "No"
        }</li>
        <li><strong>Child seats:</strong> ${
          extras.amenityCount && extras.amenityCount > 0
            ? `${extras.amenityCount} × (+$${toMoney(
                extras.amenityDailyRate || 0
              )}/day each)`
            : "None"
        }</li>
      </ul>
    `;

    const html = `
      <div style="font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color:#111827;">
        <h2 style="margin-bottom:8px;">New reservation — ${vehicleName}</h2>
        <p style="margin-top:0;margin-bottom:16px; font-size:14px; color:#4B5563;">
          Thank you for choosing ${COMPANY.name}.
        </p>

        <h3 style="font-size:16px; margin-bottom:4px;">Trip details</h3>
        <ul style="font-size:14px; color:#374151; padding-left:20px;">
          <li><strong>Vehicle:</strong> ${vehicleName}</li>
          <li><strong>Dates:</strong> ${startDate || "TBD"} → ${
      endDate || "TBD"
    }</li>
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
          <li><strong>Rental subtotal:</strong> $${subtotal}</li>
          <li><strong>Estimated extras:</strong> $${toMoney(
            estimatedExtrasTotal
          )}</li>
          <li><strong>Estimated trip total:</strong> $${total}</li>
          <li><strong>Deposit due now:</strong> $${deposit}</li>
        </ul>

        <h4 style="font-size:14px; margin-top:16px; margin-bottom:4px;">Extras breakdown</h4>
        ${extrasSummaryHtml}

        <p style="margin-top:16px; font-size:12px; color:#6B7280;">
          This is an estimate only. Final charges, taxes, tolls, violations, and fees will be
          confirmed in your rental agreement at pickup.
        </p>

        <hr style="margin:20px 0; border:none; border-top:1px solid #E5E7EB;" />

        <p style="font-size:12px; color:#6B7280;">
          ${COMPANY.name} • ${COMPANY.phone} • ${COMPANY.email}
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

    console.log("api/booking: email sent", emailResponse);

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("api/booking: error sending booking email", err);
    return res
      .status(500)
      .json({ error: "Failed to send booking email", details: String(err) });
  }
};
