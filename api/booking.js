// /api/booking.js
// Creates Stripe checkout session + sends confirmation email (customer + internal) with paper trail details.

const { Resend } = require("resend");
const resend = new Resend(process.env.RESEND_API_KEY);

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const COMPANY = {
  name: "Asani Rentals",
  email: "reserve@rentwithasani.com",
  phone: "732-470-8233",
  serviceArea: "United States Tri State Area NY NJ CT",
};

function money(n) {
  const num = typeof n === "number" ? n : Number(n || 0);
  return `$${num.toFixed(2)}`;
}

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


module.exports = async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).send("Method not allowed");

  try {
    const {
      reservationId,
      vehicleName,
      startDate,
      endDate,
      customer,
      total,
      deposit,
      policyLink,
    } = req.body || {};

    const customerEmail = customer?.email;

    if (!reservationId || !vehicleName || !startDate || !endDate || !customerEmail) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const publicPolicyLink = policyLink
      ? `https://rentwithasani.com${policyLink}`
      : "https://rentwithasani.com/#/policies";

    // 1) Create Stripe Checkout Session (deposit/hold is informational; charge uses total)
    // NOTE: Adjust line items as needed — currently one line item for booking total.
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: customerEmail,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: { name: `Asani Rentals - ${vehicleName}` },
            unit_amount: Math.round(Number(total || 0) * 100),
          },
          quantity: 1,
        },
      ],
      success_url: `https://rentwithasani.com/#/confirmation`,
      cancel_url: `https://rentwithasani.com/#/profile`,
      metadata: {
        reservationId,
        vehicleName,
        startDate,
        endDate,
        deposit: String(deposit || ""),
      },
    });

    // 2) Send confirmation email (customer)
    const subject = `Reservation ${reservationId} • ${vehicleName}`;

    const emailLines = [
      `Reservation ID: <b>${reservationId}</b>`,
      `Vehicle: <b>${vehicleName}</b>`,
      `Dates: <b>${startDate}</b> → <b>${endDate}</b>`,
      `Estimated total: <b>${money(total)}</b>`,
      `Deposit / authorization hold: <b>${money(deposit)}</b> (where applicable)`,
      `Rental Policies: <a href="${publicPolicyLink}">${publicPolicyLink}</a>`,
      `Contact: ${COMPANY.email} • ${COMPANY.phone}`,
    ];

    const incidentFooter = `
      <b>Incident / claims:</b> If there is an accident, damage, theft, or vandalism, notify us immediately (no later than 2 hours when safe),
      take photos, and obtain a police report where applicable. Failure to report promptly may result in full renter responsibility.
    `;

    await resend.emails.send({
      from: COMPANY.email,
      to: customerEmail,
      subject,
      html: buildHtml({
        title: "Your reservation is recorded",
        lines: emailLines,
        footer: incidentFooter,
      }),
    });

    // 3) Internal email
    if (process.env.INTERNAL_NOTIFY_EMAIL) {
      await resend.emails.send({
        from: COMPANY.email,
        to: process.env.INTERNAL_NOTIFY_EMAIL,
        subject: `[New Booking] ${reservationId} - ${vehicleName}`,
        html: buildHtml({
          title: "New booking (paper trail)",
          lines: emailLines,
          footer: incidentFooter,
        }),
      });
    }

    // 4) Return session
    return res.status(200).json({ id: session.id, url: session.url });
  } catch (e) {
    console.error("Booking API error:", e);
    return res.status(500).json({ error: "Server error" });
  }
};
