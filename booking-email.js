const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

// Simple HTML layout
function buildHtml({ title, lines }) {
  return `
    <div style="font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.5; color: #111827;">
      <h1 style="font-size: 20px; font-weight: 700; margin-bottom: 12px;">${title}</h1>
      ${lines
        .map(
          (l) =>
            `<p style="margin: 4px 0; font-size: 14px;">${l
              .replace(/\n/g, "<br />")
              .trim()}</p>`
        )
        .join("")}
      <p style="margin-top: 16px; font-size: 12px; color: #6B7280;">
        If you have any questions, reply to this email or contact us at reserve@rentwithasani.com.
      </p>
      <p style="margin-top: 12px; font-size: 12px; color: #9CA3AF;">
        Asani Rentals
      </p>
    </div>
  `;
}

/**
 * POST /api/booking-email
 * Body: {
 *   customerEmail,
 *   customerName,
 *   vehicleName,
 *   startDate,
 *   endDate,
 *   total,
 *   deposit
 * }
 */
module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const {
      customerEmail,
      customerName,
      vehicleName,
      startDate,
      endDate,
      total,
      deposit,
    } = req.body || {};

    if (!customerEmail || !vehicleName || !startDate || !endDate) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const formattedTotal =
      typeof total === "number" ? `$${total.toFixed(2)}` : "";
    const formattedDeposit =
      typeof deposit === "number" ? `$${deposit.toFixed(2)}` : "";

    // 1) Customer email
    await resend.emails.send({
      from: "reserve@rentwithasani.com", // must match your verified domain
      to: customerEmail,
      subject: `Your Asani Rentals booking - ${vehicleName}`,
      html: buildHtml({
        title: "Thank you for reserving with Asani Rentals.",
        lines: [
          `Hi ${customerName || "there"},`,
          "",
          `We’ve received your reservation request for: <strong>${vehicleName}</strong>.`,
          "",
          `Dates: <strong>${startDate}</strong> to <strong>${endDate}</strong>`,
          formattedTotal
            ? `Estimated trip total (before taxes/fees): <strong>${formattedTotal}</strong>`
            : "",
          formattedDeposit
            ? `Deposit due at booking: <strong>${formattedDeposit}</strong>`
            : "",
          "",
          "Your reservation is held once your payment is successfully completed. You’ll receive a separate receipt from our payment processor.",
        ],
      }),
    });

    // 2) Admin email
    await resend.emails.send({
      from: "notifications@rentwithasani.com",
      to: "reserve@rentwithasani.com",
      subject: `New booking request - ${vehicleName}`,
      html: buildHtml({
        title: "New reservation received.",
        lines: [
          `Customer: ${customerName || "N/A"} (${customerEmail})`,
          `Vehicle: ${vehicleName}`,
          `Dates: ${startDate} → ${endDate}`,
          formattedTotal ? `Estimated total: ${formattedTotal}` : "",
          formattedDeposit ? `Deposit: ${formattedDeposit}` : "",
        ],
      }),
    });

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("Booking email error", err);
    // Don’t break front-end flow on email failure
    return res.status(500).json({ error: "Failed to send email" });
  }
};
