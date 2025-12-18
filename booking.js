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

function buildHtml({ title, lines, footer }) {
  return `
    <div style="font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.55; color: #111827;">
      <h1 style="font-size: 20px; font-weight: 700; margin-bottom: 12px;">${title}</h1>
      ${lines.map(l => `<p style="margin: 6px 0; font-size: 14px;">${String(l).replace(/\n/g, "<br/>")}</p>`).join("")}
      <div style="margin-top: 16px; padding-top: 12px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6b7280;">
        ${footer || ""}
      </div>
    </div>
  `;
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
