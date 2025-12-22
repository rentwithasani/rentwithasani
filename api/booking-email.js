const COMPANY = { name:"Asani Rentals", email:"reserve@rentwithasani.com", phone:"732-470-8233" };
const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

// Luxury black-gradient email layout (Asani concierge style)
function buildHtml({ title, subtitle = "", lines = [], preheader = "" }) {
  const safe = (s) => String(s ?? "");
  const bodyLines = (lines || [])
    .filter((l) => l !== null && l !== undefined)
    .map((l) => safe(l).replace(/
/g, "<br />").trim())
    .map((html) => `<p style="margin:6px 0;font-size:14px;color:rgba(15,23,42,0.92);">${html}</p>`)
    .join("");

  return `<!DOCTYPE html>
<html lang="en">
  <body style="margin:0;padding:0;background:#000;font-family:-apple-system,BlinkMacSystemFont,'SF Pro Text',system-ui,sans-serif;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">${safe(preheader)}</div>

    <table width="100%" cellpadding="0" cellspacing="0" style="background:radial-gradient(circle at top,#020617,#020617 50%,#000 100%);padding:32px 12px;">
      <tr>
        <td align="center">
          <table width="100%" cellpadding="0" cellspacing="0" style="
            max-width:640px;
            border-radius:28px;
            overflow:hidden;
            background:linear-gradient(150deg,#050816,#020617,#050816);
            border:1px solid rgba(148,163,184,0.25);
            box-shadow:0 30px 70px rgba(0,0,0,0.75);
          ">

            <!-- HEADER -->
            <tr>
              <td style="padding:20px 24px 14px;border-bottom:1px solid rgba(148,163,184,0.18);">
                <div style="font-size:11px;letter-spacing:0.24em;text-transform:uppercase;color:#9ca3af;margin-bottom:6px;">
                  Premium economy to luxury rentals • Business • Events • Private travel
                </div>
                <div style="display:flex;justify-content:space-between;align-items:flex-end;gap:12px;">
                  <div>
                    <div style="font-size:22px;font-weight:800;letter-spacing:0.14em;text-transform:uppercase;color:#f9fafb;">
                      ASANI RENTALS
                    </div>
                    <div style="margin-top:6px;font-size:13px;color:rgba(226,232,240,0.80);">
                      ${safe(subtitle)}
                    </div>
                  </div>
                  <div style="
                    width:120px;height:12px;border-radius:999px;
                    background:linear-gradient(135deg,#e8d5a6 0%,#b08d3b 45%,#7a5a1a 100%);
                  "></div>
                </div>
              </td>
            </tr>

            <!-- BODY -->
            <tr>
              <td style="background:#ffffff;padding:22px 24px;">
                <h1 style="margin:0 0 10px;font-size:20px;line-height:1.25;font-weight:800;color:#0f172a;">
                  ${safe(title)}
                </h1>
                ${bodyLines}

                <div style="margin-top:18px;padding-top:14px;border-top:1px solid rgba(15,23,42,0.10);">
                  <div style="font-size:11px;color:#64748b;line-height:1.55;">
                    <strong>Security:</strong> We will never ask you for your password by email or text. Do not share verification links or codes.<br />
                    <strong>Operations & Charges:</strong> Late returns, tolls/tickets, fuel differences, smoking/cleaning, and damage/loss-of-use may result in additional charges per policy.
                  </div>
                  <div style="margin-top:10px;font-size:11px;color:#64748b;">
                    Concierge support: 732-470-8233 • reserve@rentwithasani.com
                  </div>
                </div>
              </td>
            </tr>

            <!-- FOOTER -->
            <tr>
              <td style="padding:14px 24px;border-top:1px solid rgba(148,163,184,0.18);">
                <div style="font-size:11px;color:rgba(226,232,240,0.70);">
                  © ${new Date().getFullYear()} Asani Rentals. All rights reserved.
                </div>
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
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
    const from = process.env.RESEND_FROM || "Asani Rentals <reserve@rentwithasani.com>";
const internalTo = process.env.NOTIFY_EMAIL || COMPANY.email;

await Promise.all([
  resend.emails.send({
    from,
    to: customerEmail,
    subject: `Asani Rentals — Reservation Received: ${vehicleName}`,
    html: buildHtml({
      preheader: `Reservation received for ${vehicleName}.`,
      title: "Reservation Received",
      subtitle: "Asani Rentals Concierge",
      lines: [
        `Hi ${customerName || "there"},`,
        "",
        `We’ve received your reservation request for: <strong>${vehicleName}</strong>.`,
        "",
        `Dates: <strong>${startDate}</strong> to <strong>${endDate}</strong>`,
        formattedTotal
          ? `Estimated trip total (before taxes/fees): <strong>${formattedTotal}</strong>`
          : "",
        formattedDeposit ? `Deposit: <strong>${formattedDeposit}</strong>` : "",
        "",
        `Reservation ID: <strong>${reservationId}</strong>`,
        policyLink ? `Policies: <a href="${policyLink}">${policyLink}</a>` : "",
        "",
        `Need help? ${COMPANY.phone} • ${COMPANY.email}`,
      ],
    }),
  }),
  resend.emails.send({
    from,
    to: internalTo,
    subject: `NEW RESERVATION — ${vehicleName} — ${customerName || customerEmail}`,
    html: buildHtml({
      preheader: `New reservation received: ${vehicleName}`,
      title: "New Reservation",
      subtitle: "Internal notification",
      lines: [
        `Customer: <strong>${customerName || "N/A"}</strong> (${customerEmail})`,
        customerPhone ? `Phone: ${customerPhone}` : "",
        `Vehicle: <strong>${vehicleName}</strong>`,
        `Dates: <strong>${startDate}</strong> → <strong>${endDate}</strong>`,
        formattedTotal ? `Estimated total: <strong>${formattedTotal}</strong>` : "",
        formattedDeposit ? `Deposit: <strong>${formattedDeposit}</strong>` : "",
        `Reservation ID: <strong>${reservationId}</strong>`,
        policyLink ? `Policies: <a href="${policyLink}">${policyLink}</a>` : "",
      ],
    }),
  }),
]);

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
