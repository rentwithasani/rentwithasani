// api/booking.js
const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);
const COMPANY_EMAIL = "reserve@rentwithasani.com";

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const {
    customerEmail,
    customerName,
    phone,
    vehicleName,
    startDate,
    endDate,
    total,
    deposit,
  } = req.body || {};

  if (!customerEmail || !vehicleName || !startDate || !endDate) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    // 1) Email to YOU (Asani)
    await resend.emails.send({
      from: "notifications@rentwithasani.com", // domain verified in Resend
      to: [COMPANY_EMAIL],
      subject: `New booking — ${vehicleName}`,
      html: `
        <h2>New Booking</h2>
        <p><strong>Name:</strong> ${customerName || "N/A"}</p>
        <p><strong>Email:</strong> ${customerEmail}</p>
        <p><strong>Phone:</strong> ${phone || "N/A"}</p>
        <p><strong>Vehicle:</strong> ${vehicleName}</p>
        <p><strong>Dates:</strong> ${startDate} → ${endDate}</p>
        <p><strong>Deposit:</strong> $${Number(deposit || 0).toFixed(2)}</p>
        <p><strong>Estimated total:</strong> $${Number(total || 0).toFixed(2)}</p>
      `,
    });

    // 2) Confirmation email to CUSTOMER
    await resend.emails.send({
      from: "reserve@rentwithasani.com", // same verified domain
      to: [customerEmail],
      subject: `Your Asani Rentals reservation — ${vehicleName}`,
      html: `
        <p>Hi ${customerName || ""},</p>
        <p>Thank you for choosing <strong>Asani Rentals</strong>.</p>
        <p>Your reservation details:</p>
        <ul>
          <li><strong>Vehicle:</strong> ${vehicleName}</li>
          <li><strong>Dates:</strong> ${startDate} → ${endDate}</li>
          <li><strong>Deposit paid / due:</strong> $${Number(
            deposit || 0
          ).toFixed(2)}</li>
          <li><strong>Estimated total:</strong> $${Number(
            total || 0
          ).toFixed(2)}</li>
        </ul>
        <p>Our team may contact you to finalize your rental agreement, verify your driver’s license, and confirm pickup details.</p>
        <p>If you have any questions, reply to this email or contact us at ${COMPANY_EMAIL}.</p>
        <p>— Asani Rentals</p>
      `,
    });

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("Resend booking email error", err);
    return res.status(500).json({ error: "Email send failed" });
  }
};
