// /api/booking.js
// Sends a luxury-styled booking confirmation email via Resend

const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

// Basic company info (matches your site)
const COMPANY = {
  name: "Asani Rentals",
  email: "reserve@rentwithasani.com",
  phone: "732-470-8233",
  address: "Kalispell MT, 59901",
  tagline: "Premium economy to luxury rentals • Business • Events • Private travel",
  slogan: "Arrive like it’s already yours.",
};

function formatCurrency(n) {
  if (typeof n !== "number") return "$0.00";
  return `$${n.toFixed(2)}`;
}

// Build a luxury HTML email
function buildBookingEmailHTML(booking, isForCustomer) {
  const {
    vehicleName,
    startDate,
    endDate,
    days,
    subtotal,
    deposit,
    total,
    customer = {},
    extras = {},
  } = booking || {};

  const {
    fullName = "",
    email = "",
    phone = "",
  } = customer;

  const {
    insurance,
    insuranceCost = 0,
    ezPass,
    ezPassCost = 0,
    prepayFuel,
    fuelPrepayCost = 0,
    amenities = {},
    amenitiesCost = 0,
    promoCode,
    originalDailyRate,
    discountedDailyRate,
  } = extras;

  const amenitiesSelected = Object.entries(amenities || {})
    .filter(([, v]) => v)
    .map(([key]) => {
      if (key === "infantSeat") return "Infant seat";
      if (key === "childSeat") return "Child seat";
      if (key === "boosterSeat") return "Booster seat";
      return key;
    });

  const dailyRateLine =
    promoCode && originalDailyRate && discountedDailyRate
      ? `<span style="color:#a1a1aa;font-size:12px;text-decoration:line-through;margin-right:6px;">
           ${formatCurrency(originalDailyRate)}/day
         </span>
         <span style="color:#f9fafb;font-weight:600;">
           ${formatCurrency(discountedDailyRate)}/day
         </span>`
      : `<span style="color:#f9fafb;font-weight:600;">
           ${formatCurrency(originalDailyRate || discountedDailyRate || 0)}/day
         </span>`;

  const subjectLine = isForCustomer
    ? "Your Asani Rentals reservation request"
    : "New Asani Rentals reservation — internal copy";

  const headerTitle = isForCustomer
    ? "Reservation received"
    : "New reservation received";

  const introLine = isForCustomer
    ? `Thank you for choosing <strong>${COMPANY.name}</strong>. Your reservation request has been received. A member of our team will review, confirm availability, and send your final rental agreement.`
    : `A new reservation has been received from <strong>${fullName || "Guest"}</strong>. Review the details below and follow up to confirm availability, documents, and payment.`;

  const legalBlockCustomer = `
    By proceeding with this reservation, you acknowledge that:
    <ul style="margin:8px 0 0 0;padding-left:18px;">
      <li style="margin-bottom:4px;">Your booking is not fully confirmed until you receive a formal confirmation and rental agreement from ${COMPANY.name}.</li>
      <li style="margin-bottom:4px;">Deposits may be non-refundable in the event of a no-show, late cancellation, or breach of the rental agreement terms.</li>
      <li style="margin-bottom:4px;">Final charges (including taxes, tolls, fuel, violations, damages, and additional fees) will be determined according to the signed rental agreement.</li>
      <li style="margin-bottom:4px;">Optional protection products do not guarantee full coverage and are subject to the terms, limits, and exclusions set out by the provider and in your agreement.</li>
    </ul>
  `;

  return {
    subject: subjectLine,
    html: `
<!DOCTYPE html>
<html>
  <head>
    <meta charSet="utf-8" />
    <title>${subjectLine}</title>
  </head>
  <body style="margin:0;padding:0;background-color:#020617;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color:#020617;padding:24px 0;">
      <tr>
        <td align="center">
          <table width="600" border="0" cellspacing="0" cellpadding="0" style="background:linear-gradient(145deg,#020617,#0b1120);border-radius:24px;overflow:hidden;border:1px solid #27272a;">
            <!-- Header -->
            <tr>
              <td style="padding:24px 32px;border-bottom:1px solid #27272a;background:radial-gradient(circle at top,#1e293b,#020617);">
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td align="left">
                      <div style="color:#f9fafb;font-size:20px;font-weight:800;letter-spacing:0.12em;text-transform:uppercase;">
                        ${COMPANY.name}
                      </div>
                      <div style="color:#a1a1aa;font-size:11px;margin-top:4px;">
                        ${COMPANY.tagline}
                      </div>
                      <div style="color:#71717a;font-size:11px;margin-top:2px;font-style:italic;">
                        ${COMPANY.slogan}
                      </div>
                    </td>
                    <td align="right" style="text-align:right;color:#e5e5e5;font-size:11px;">
                      <div>${COMPANY.address}</div>
                      <div>${COMPANY.phone}</div>
                      <div>${COMPANY.email}</div>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Intro -->
            <tr>
              <td style="padding:24px 32px 8px 32px;">
                <div style="color:#f9fafb;font-size:18px;font-weight:600;margin-bottom:4px;">
                  ${headerTitle}
                </div>
                <div style="color:#a1a1aa;font-size:13px;line-height:1.6;">
                  ${introLine}
                </div>
              </td>
            </tr>

            <!-- Guest + vehicle -->
            <tr>
              <td style="padding:8px 32px 8px 32px;">
                <table width="100%" cellpadding="0" cellspacing="0" style="border-radius:16px;border:1px solid #27272a;background:radial-gradient(circle at top left,#111827,#020617);">
                  <tr>
                    <td style="padding:16px 20px;">
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td style="vertical-align:top;">
                            <div style="color:#e5e5e5;font-size:13px;font-weight:600;margin-bottom:4px;">
                              Guest details
                            </div>
                            <div style="color:#a1a1aa;font-size:12px;line-height:1.5;">
                              ${fullName ? `<div><strong>Name:</strong> ${fullName}</div>` : ""}
                              ${email ? `<div><strong>Email:</strong> ${email}</div>` : ""}
                              ${phone ? `<div><strong>Phone:</strong> ${phone}</div>` : ""}
                            </div>
                          </td>
                          <td style="vertical-align:top;text-align:right;">
                            <div style="color:#e5e5e5;font-size:13px;font-weight:600;margin-bottom:4px;">
                              Vehicle reserved
                            </div>
                            <div style="color:#f9fafb;font-size:13px;font-weight:600;">
                              ${vehicleName || "Vehicle"}
                            </div>
                            <div style="color:#a1a1aa;font-size:12px;margin-top:4px;">
                              Daily rate: ${dailyRateLine}
                              ${
                                promoCode
                                  ? `<div style="color:#22c55e;font-size:11px;margin-top:2px;">Promo code applied: ${promoCode}</div>`
                                  : ""
                              }
                            </div>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Dates & overview -->
            <tr>
              <td style="padding:8px 32px 16px 32px;">
                <table width="100%" cellpadding="0" cellspacing="0" style="border-radius:16px;border:1px solid #27272a;background-color:#020617;">
                  <tr>
                    <td style="padding:16px 20px;">
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td style="vertical-align:top;">
                            <div style="color:#e5e5e5;font-size:13px;font-weight:600;margin-bottom:4px;">
                              Trip details
                            </div>
                            <div style="color:#a1a1aa;font-size:12px;line-height:1.6;">
                              ${
                                startDate
                                  ? `<div><strong>Pick-up:</strong> ${startDate}</div>`
                                  : ""
                              }
                              ${
                                endDate
                                  ? `<div><strong>Return:</strong> ${endDate}</div>`
                                  : ""
                              }
                              ${
                                days
                                  ? `<div><strong>Rental length:</strong> ${days} day${
                                      days > 1 ? "s" : ""
                                    }</div>`
                                  : ""
                              }
                            </div>
                          </td>
                          <td style="vertical-align:top;text-align:right;">
                            <div style="color:#e5e5e5;font-size:13px;font-weight:600;margin-bottom:4px;">
                              Pricing snapshot
                            </div>
                            <div style="color:#a1a1aa;font-size:12px;line-height:1.6;">
                              <div>
                                <span>Vehicle rental:</span>
                                <strong style="margin-left:6px;">${formatCurrency(
                                  subtotal || 0
                                )}</strong>
                              </div>
                              <div>
                                <span>Estimated extras:</span>
                                <strong style="margin-left:6px;">${formatCurrency(
                                  (insuranceCost || 0) +
                                    (ezPassCost || 0) +
                                    (fuelPrepayCost || 0) +
                                    (amenitiesCost || 0)
                                )}</strong>
                              </div>
                              <div style="margin-top:4px;">
                                <span>Estimated trip total:</span>
                                <strong style="margin-left:6px;">${formatCurrency(
                                  total || 0
                                )}</strong>
                              </div>
                            </div>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Extras -->
            <tr>
              <td style="padding:0 32px 16px 32px;">
                <table width="100%" cellpadding="0" cellspacing="0" style="border-radius:16px;border:1px solid #27272a;background-color:#020617;">
                  <tr>
                    <td style="padding:16px 20px;">
                      <div style="color:#e5e5e5;font-size:13px;font-weight:600;margin-bottom:6px;">
                        Protection & optional add-ons
                      </div>
                      <div style="color:#a1a1aa;font-size:12px;line-height:1.6;">
                        <ul style="margin:0;padding-left:18px;">
                          <li>
                            <strong>Protection plan:</strong>
                            ${
                              insurance === "asani"
                                ? `Added (estimate ${formatCurrency(
                                    insuranceCost || 0
                                  )})`
                                : "Declined"
                            }
                          </li>
                          <li>
                            <strong>EZ-Pass / toll device:</strong>
                            ${
                              ezPass
                                ? `Added (estimate ${formatCurrency(
                                    ezPassCost || 0
                                  )})`
                                : "Not added"
                            }
                          </li>
                          <li>
                            <strong>Prepaid fuel:</strong>
                            ${
                              prepayFuel
                                ? `Added (estimate ${formatCurrency(
                                    fuelPrepayCost || 0
                                  )})`
                                : "Not added"
                            }
                          </li>
                          <li>
                            <strong>Child/booster seats:</strong>
                            ${
                              amenitiesSelected.length
                                ? `${amenitiesSelected.join(
                                    ", "
                                  )} (estimate ${formatCurrency(
                                    amenitiesCost || 0
                                  )})`
                                : "None selected"
                            }
                          </li>
                        </ul>
                      </div>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Deposit -->
            <tr>
              <td style="padding:0 32px 16px 32px;">
                <table width="100%" cellpadding="0" cellspacing="0" style="border-radius:16px;border:1px solid #27272a;background:linear-gradient(135deg,#111827,#020617);">
                  <tr>
                    <td style="padding:16px 20px;">
                      <div style="color:#f9fafb;font-size:13px;font-weight:600;margin-bottom:4px;">
                        Deposit & payment
                      </div>
                      <div style="color:#e5e5e5;font-size:24px;font-weight:700;margin-bottom:6px;">
                        ${formatCurrency(deposit || 0)} <span style="font-size:12px;color:#a1a1aa;font-weight:500;">deposit</span>
                      </div>
                      <div style="color:#a1a1aa;font-size:12px;line-height:1.6;">
                        The deposit is used to secure your reservation and is
                        typically held on the payment method used. The remaining
                        rental balance, taxes, security holds, tolls, fuel,
                        violations, and any other charges will be processed at or
                        after pick-up in accordance with your signed rental agreement.
                      </div>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Legal + closing -->
            <tr>
              <td style="padding:0 32px 24px 32px;">
                <table width="100%" cellpadding="0" cellspacing="0" style="border-radius:16px;border:1px solid #27272a;background-color:#020617;">
                  <tr>
                    <td style="padding:16px 20px;">
                      <div style="color:#e5e5e5;font-size:13px;font-weight:600;margin-bottom:4px;">
                        Important information
                      </div>
                      <div style="color:#a1a1aa;font-size:12px;line-height:1.6;">
                        ${isForCustomer ? legalBlockCustomer : legalBlockCustomer}
                      </div>
                      <div style="color:#e5e5e5;font-size:12px;line-height:1.6;margin-top:12px;">
                        If you have any questions or need to adjust your reservation,
                        contact our team at <a href="mailto:${COMPANY.email}" style="color:#38bdf8;text-decoration:none;">${COMPANY.email}</a> or call ${COMPANY.phone}.
                      </div>
                      <div style="color:#a1a1aa;font-size:12px;margin-top:10px;">
                        With appreciation,<br/>
                        <span style="color:#f9fafb;font-weight:600;">${COMPANY.name}</span>
                      </div>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
    `,
  };
}

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const booking =
      typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};

    if (!booking || !booking.customer || !booking.customer.email) {
      res.status(400).json({ error: "Missing booking or customer information." });
      return;
    }

    const customerEmail = booking.customer.email;

    const customerTemplate = buildBookingEmailHTML(booking, true);
    const internalTemplate = buildBookingEmailHTML(booking, false);

    // Send to customer
    const emailsToSend = [];

    emailsToSend.push(
      resend.emails.send({
        from: `${COMPANY.name} <${COMPANY.email}>`,
        to: customerEmail,
        subject: customerTemplate.subject,
        html: customerTemplate.html,
      })
    );

    // Internal copy
    emailsToSend.push(
      resend.emails.send({
        from: `${COMPANY.name} <${COMPANY.email}>`,
        to: COMPANY.email,
        subject: internalTemplate.subject,
        html: internalTemplate.html,
      })
    );

    await Promise.all(emailsToSend);

    res.status(200).json({ ok: true });
  } catch (err) {
    console.error("Booking email error", err);
    // Soft failure: don't break the front-end flow
    res.status(200).json({ ok: false, error: "Email send failed" });
  }
};
