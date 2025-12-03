// api/booking.js
const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

// Helper to format dollars
function money(n) {
  if (typeof n !== "number") return "";
  return `$${n.toFixed(2)}`;
}

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const { booking } = req.body || {};

    if (
      !booking ||
      !booking.customer ||
      !booking.customer.email ||
      !booking.vehicleName
    ) {
      res.status(400).json({ error: "Missing booking or customer details" });
      return;
    }

    const customer = booking.customer;
    const vehicleName = booking.vehicleName;
    const start = booking.startDate;
    const end = booking.endDate;
    const days = booking.days;
    const subtotal = booking.subtotal;
    const deposit = booking.deposit;
    const total = booking.total;

    const adminRecipients = [
      "reserve@rentwithasani.com",
      "notifications@rentwithasani.com",
    ];

    // 1) Email to customer
    await resend.emails.send({
      from: "Asani Rentals <reserve@rentwithasani.com>",
      to: customer.email,
      subject: `Your Asani Rentals booking — ${vehicleName}`,
      html: `
        <div style="font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #0b0b0b">
          <h2>Thank you for booking with Asani Rentals</h2>
          <p>Hi ${customer.fullName || ""},</p>
          <p>We’ve received your reservation request for:</p>
          <ul>
            <li><strong>Vehicle:</strong> ${vehicleName}</li>
            <li><strong>Dates:</strong> ${start} → ${end}</li>
            <li><strong>Days billed:</strong> ${days}</li>
            <li><strong>Rental subtotal:</strong> ${money(subtotal)}</li>
            <li><strong>Estimated extras:</strong> ${money(
              booking.extrasTotal || 0
            )}</li>
            <li><strong>Estimated trip total:</strong> ${money(total)}</li>
            <li><strong>Deposit due:</strong> ${money(deposit)}</li>
          </ul>
          <p>Our team will review your reservation and send final confirmation and next steps.</p>
          <p style="margin-top: 16px">— Asani Rentals</p>
        </div>
      `,
    });

    // 2) Email to you (admin notification)
    await resend.emails.send({
      from: "Asani Rentals <notifications@rentwithasani.com>",
      to: adminRecipients,
      subject: `New booking — ${vehicleName} (${customer.fullName || ""})`,
      html: `
        <div style="font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #0b0b0b">
          <h2>New booking received</h2>
          <p><strong>Vehicle:</strong> ${vehicleName}</p>
          <p><strong>Dates:</strong> ${start} → ${end} (${days} day${
        days > 1 ? "s" : ""
      })</p>
          <p><strong>Customer:</strong> ${customer.fullName || ""}</p>
          <p><strong>Email:</strong> ${customer.email}</p>
          <p><strong>Phone:</strong> ${customer.phone || ""}</p>
          <p><strong>Subtotal:</strong> ${money(subtotal)}</p>
          <p><strong>Estimated total:</strong> ${money(total)}</p>
          <p><strong>Deposit:</strong> ${money(deposit)}</p>
          <h3 style="margin-top: 16px">Extras</h3>
          <pre style="font-size: 12px; background:#f4f4f5; padding:12px; border-radius:8px; white-space:pre-wrap">
${JSON.stringify(booking.extras || {}, null, 2)}
          </pre>
        </div>
      `,
    });

    res.status(200).json({ ok: true });
  } catch (err) {
    console.error("Booking email error", err);
    res.status(500).json({ error: "Booking email failed" });
  }
};
