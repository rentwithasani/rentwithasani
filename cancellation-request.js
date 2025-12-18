// /api/cancellation-request.js
// Receives cancellation requests and notifies by email.

const { Resend } = require("resend");
const resend = new Resend(process.env.RESEND_API_KEY);

const COMPANY = { email: "reserve@rentwithasani.com", phone: "732-470-8233" };

module.exports = async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).send("Method not allowed");

  try {
    const { reservationId, email, vehicleName, startDate, endDate } = req.body || {};
    if (!reservationId || !email) return res.status(400).json({ error: "Missing fields" });

    const subject = `Cancellation request • ${reservationId}`;
    const html = `
      <div style="font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.55; color: #111827;">
        <h1 style="font-size: 18px; font-weight: 700;">Cancellation request received</h1>
        <p style="font-size: 14px;">Reservation ID: <b>${reservationId}</b></p>
        <p style="font-size: 14px;">Vehicle: <b>${vehicleName || ""}</b></p>
        <p style="font-size: 14px;">Dates: <b>${startDate || ""}</b> → <b>${endDate || ""}</b></p>
        <p style="font-size: 14px;">Status: <b>Pending review</b></p>
        <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6b7280;">
          Contact: ${COMPANY.email} • ${COMPANY.phone}
        </div>
      </div>
    `;

    // Customer acknowledgement
    await resend.emails.send({
      from: COMPANY.email,
      to: email,
      subject,
      html,
    });

    // Internal notify
    if (process.env.INTERNAL_NOTIFY_EMAIL) {
      await resend.emails.send({
        from: COMPANY.email,
        to: process.env.INTERNAL_NOTIFY_EMAIL,
        subject: `[Cancellation Request] ${reservationId}`,
        html,
      });
    }

    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error("Cancellation request error:", e);
    return res.status(500).json({ error: "Server error" });
  }
};
