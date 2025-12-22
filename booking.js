// /api/booking.js
// Luxury black-gradient booking confirmation for guest + internal

const { Resend } = require("resend");
const resend = new Resend(process.env.RESEND_API_KEY);

const COMPANY = {
  name: "Asani Rentals",
  email: "reserve@rentwithasani.com",
  phone: "732-470-8233",
  address: "Kalispell MT, 59901",
  tagline: "Premium economy to luxury rentals • Business • Events • Private travel",
  slogan: "Arrive like it’s already yours."
};

// Helpers
function money(n) {
  if (typeof n !== "number" || isNaN(n)) return "$0.00";
  return `$${n.toFixed(2)}`;
}
function fmtDate(d) {
  if (!d) return "";
  const x = new Date(d);
  if (isNaN(x.getTime())) return d;
  return x.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric"
  });
}

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const booking = req.body || {};
    const customer = booking.customer || {};

    if (!customer.email) {
      res.status(400).json({ error: "Missing customer email." });
      return;
    }

    const {
      vehicleName,
      vehicleImage,
      startDate,
      endDate,
      days,
      subtotal,
      deposit,
      total,
      extras = {}
    } = booking;

    const {
      insuranceCost,
      ezPassCost,
      fuelPrepayCost,
      amenities = {},
      amenitiesCost,
      promoCode,
      originalDailyRate,
      discountedDailyRate
    } = extras;

    const amenityList = [
      amenities.infantSeat && "Infant seat",
      amenities.childSeat && "Child seat",
      amenities.boosterSeat && "Booster seat"
    ].filter(Boolean);

    const extrasSum =
      (insuranceCost || 0) +
      (ezPassCost || 0) +
      (fuelPrepayCost || 0) +
      (amenitiesCost || 0);

    const hasExtras = extrasSum > 0;

    const hasDiscount =
      promoCode &&
      typeof originalDailyRate === "number" &&
      typeof discountedDailyRate === "number" &&
      discountedDailyRate < originalDailyRate;

    const subject = `Asani Rentals — Your ${vehicleName || "vehicle"} reservation`;

    // ---- HTML EMAIL (luxury, dark, refined) ----
    const html = `
<!DOCTYPE html>
<html lang="en">
  <body style="margin:0;padding:0;background:#000;font-family:-apple-system,BlinkMacSystemFont,'SF Pro Text',system-ui,sans-serif;">
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
                  ${COMPANY.tagline}
                </div>
                <div style="display:flex;justify-content:space-between;align-items:flex-end;gap:12px;">
                  <div>
                    <div style="
                      font-size:22px;
                      font-weight:800;
                      letter-spacing:0.14em;
                      text-transform:uppercase;
                      color:#f9fafb;
                      white-space:nowrap;
                    ">
                      Asani Rentals
                    </div>
                    <div style="font-size:13px;color:#a3a3a3;margin-top:4px;">
                      ${COMPANY.slogan}
                    </div>
                  </div>
                  <div style="text-align:right;font-size:11px;color:#9ca3af;line-height:1.5;">
                    <div>${COMPANY.address}</div>
                    <div>${COMPANY.phone}</div>
                    <div>${COMPANY.email}</div>
                  </div>
                </div>
              </td>
            </tr>

            <!-- TITLE -->
            <tr>
              <td style="padding:20px 24px 10px;">
                <div style="font-size:13px;color:#9ca3af;margin-bottom:4px;">
                  Reservation acknowledgement
                </div>
                <div style="font-size:20px;font-weight:700;color:#f9fafb;">
                  Thank you, ${customer.fullName || "Guest"} — your reservation has been received.
                </div>
                <div style="font-size:13px;color:#a1a1aa;margin-top:6px;line-height:1.5;">
                  Our team will confirm availability and send your rental agreement with final details.
                  Your booking is fully confirmed once your agreement is signed and your deposit is processed.
                </div>
              </td>
            </tr>

            <!-- VEHICLE + TRIP CARD -->
            <tr>
              <td style="padding:8px 24px 22px;">
                <table width="100%" cellpadding="0" cellspacing="0" style="
                  border-radius:20px;
                  background:radial-gradient(circle at top left,#020617,#020617 60%,#030712);
                  border:1px solid rgba(148,163,184,0.35);
                ">
                  <tr>
                    <!-- VEHICLE IMAGE -->
                    ${
                      vehicleImage
                        ? `
                    <td style="width:40%;padding:16px 12px 16px 16px;vertical-align:top;">
                      <div style="border-radius:16px;overflow:hidden;border:1px solid rgba(55,65,81,0.9);background:#020617;">
                        <img src="${vehicleImage}" alt="${vehicleName ||
                          "Vehicle"}" style="display:block;width:100%;height:auto;object-fit:cover;" />
                      </div>
                    </td>
                    <td style="width:60%;padding:16px 16px 16px 4px;vertical-align:top;">
                      `
                        : `
                    <td style="width:100%;padding:16px 18px 10px 18px;vertical-align:top;">
                      `
                    }
                      <div style="font-size:12px;color:#9ca3af;text-transform:uppercase;letter-spacing:0.22em;margin-bottom:4px;">
                        Trip overview
                      </div>
                      <div style="font-size:18px;font-weight:600;color:#f9fafb;">
                        ${vehicleName || "Vehicle reservation"}
                      </div>
                      <div style="font-size:13px;color:#a3a3a3;margin-top:6px;">
                        ${days || 1} day${days && days > 1 ? "s" : ""} • ${fmtDate(
      startDate
    )} – ${fmtDate(endDate)}
                      </div>
                      <div style="font-size:12px;color:#9ca3af;margin-top:6px;">
                        Guest:
                        <span style="color:#e5e7eb;">${customer.fullName || "Guest"}</span>
                        ${customer.phone ? ` • <span>${customer.phone}</span>` : ""}
                      </div>
                      <div style="font-size:12px;color:#9ca3af;margin-top:2px;">
                        Email: <span style="color:#e5e7eb;">${customer.email}</span>
                      </div>
                      <div style="font-size:11px;color:#4b5563;margin-top:8px;line-height:1.4;">
                        Pickup time and exact location will be confirmed in your agreement or by our concierge team.
                      </div>
                    </td>
                  </tr>

                  <!-- PRICING -->
                  <tr>
                    <td colspan="2" style="padding:4px 18px 14px 18px;">
                      <table width="100%" cellpadding="0" cellspacing="0" style="font-size:13px;color:#e5e7eb;">
                        <tr>
                          <td style="padding:4px 0;color:#9ca3af;">Daily rate</td>
                          <td style="padding:4px 0;text-align:right;">
                            ${
                              hasDiscount
                                ? `
                              <span style="text-decoration:line-through;color:#6b7280;margin-right:6px;">
                                ${money(originalDailyRate)}
                              </span>
                              <span style="font-weight:600;color:#f9fafb;">
                                ${money(discountedDailyRate)}
                              </span>
                              `
                                : `<span style="font-weight:600;color:#f9fafb;">${money(
                                    discountedDailyRate || originalDailyRate || 0
                                  )}</span>`
                            } / day
                          </td>
                        </tr>
                        <tr>
                          <td style="padding:4px 0;color:#9ca3af;">
                            Rental (${days || 1} day${days && days > 1 ? "s" : ""})
                          </td>
                          <td style="padding:4px 0;text-align:right;font-weight:500;color:#f9fafb;">
                            ${money(subtotal || 0)}
                          </td>
                        </tr>

                        ${
                          hasExtras
                            ? `
                        <tr>
                          <td style="padding:4px 0;color:#9ca3af;">
                            Protection & extras (estimate)
                          </td>
                          <td style="padding:4px 0;text-align:right;color:#e5e7eb;">
                            ${money(extrasSum)}
                          </td>
                        </tr>
                        ${
                          insuranceCost
                            ? `
                        <tr>
                          <td style="padding:3px 0 0;font-size:11px;color:#9ca3af;">
                            • Protection plan
                          </td>
                          <td style="padding:3px 0 0;font-size:11px;text-align:right;color:#9ca3af;">
                            ${money(insuranceCost)}
                          </td>
                        </tr>
                        `
                            : ""
                        }
                        ${
                          ezPassCost
                            ? `
                        <tr>
                          <td style="padding:3px 0 0;font-size:11px;color:#9ca3af;">
                            • Tolls / EZ-Pass
                          </td>
                          <td style="padding:3px 0 0;font-size:11px;text-align:right;color:#9ca3af;">
                            ${money(ezPassCost)}
                          </td>
                        </tr>
                        `
                            : ""
                        }
                        ${
                          fuelPrepayCost
                            ? `
                        <tr>
                          <td style="padding:3px 0 0;font-size:11px;color:#9ca3af;">
                            • Prepaid fuel
                          </td>
                          <td style="padding:3px 0 0;font-size:11px;text-align:right;color:#9ca3af;">
                            ${money(fuelPrepayCost)}
                          </td>
                        </tr>
                        `
                            : ""
                        }
                        ${
                          amenitiesCost
                            ? `
                        <tr>
                          <td style="padding:3px 0 0;font-size:11px;color:#9ca3af;">
                            • Child seats${amenityList.length
                              ? " (" + amenityList.join(", ") + ")"
                              : ""
                            }
                          </td>
                          <td style="padding:3px 0 0;font-size:11px;text-align:right;color:#9ca3af;">
                            ${money(amenitiesCost)}
                          </td>
                        </tr>
                        `
                            : ""
                        }
                        `
                            : ""
                        }

                        ${
                          promoCode
                            ? `
                        <tr>
                          <td style="padding:8px 0 0;font-size:11px;color:#22c55e;">
                            Promo code applied: ${promoCode}
                          </td>
                          <td style="padding:8px 0 0;font-size:11px;text-align:right;color:#22c55e;">
                            Preferred client rate
                          </td>
                        </tr>
                        `
                            : ""
                        }
                      </table>
                    </td>
                  </tr>

                  <!-- TOTAL & DEPOSIT -->
                  <tr>
                    <td colspan="2" style="padding:0 18px 16px 18px;">
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td style="font-size:12px;color:#9ca3af;padding-top:6px;">
                            Estimated trip total
                          </td>
                          <td style="font-size:15px;font-weight:600;color:#f9fafb;text-align:right;padding-top:6px;">
                            ${money(total || subtotal || 0)}
                          </td>
                        </tr>
                        <tr>
                          <td style="font-size:12px;color:#9ca3af;padding-top:4px;">
                            Deposit to secure your reservation
                          </td>
                          <td style="
                            font-size:19px;
                            font-weight:700;
                            text-align:right;
                            padding-top:4px;
                            color:#fbbf24; /* soft luxury gold */
                          ">
                            ${money(deposit || 0)}
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>

                </table>
              </td>
            </tr>

            <!-- GUEST DETAILS + SHORT NOTES -->
            <tr>
              <td style="padding:0 24px 6px;">
                <table width="100%" cellpadding="0" cellspacing="0" style="
                  border-radius:18px;
                  background:rgba(15,23,42,0.96);
                  border:1px solid rgba(31,41,55,0.9);
                ">
                  <tr>
                    <td style="padding:14px 18px 10px;">
                      <div style="font-size:13px;font-weight:600;color:#e5e7eb;margin-bottom:8px;">
                        Guest details
                      </div>
                      <table width="100%" cellpadding="0" cellspacing="0" style="font-size:12px;color:#9ca3af;">
                        <tr>
                          <td style="padding:2px 0;width:32%;">Name</td>
                          <td style="padding:2px 0;color:#e5e7eb;">${customer.fullName || "Guest"}</td>
                        </tr>
                        <tr>
                          <td style="padding:2px 0;">Email</td>
                          <td style="padding:2px 0;color:#e5e7eb;">${customer.email}</td>
                        </tr>
                        <tr>
                          <td style="padding:2px 0;">Phone</td>
                          <td style="padding:2px 0;color:#e5e7eb;">${customer.phone || "—"}</td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:0 18px 14px;">
                      <div style="font-size:13px;font-weight:600;color:#e5e7eb;margin-bottom:6px;margin-top:4px;">
                        Next steps
                      </div>
                      <ul style="margin:0;padding-left:18px;font-size:11px;color:#9ca3af;line-height:1.7;">
                        <li>You’ll receive your rental agreement with final pricing and pickup details.</li>
                        <li>Review and sign the agreement to complete your booking.</li>
                        <li>Bring your license, payment card, and any required insurance documents to pickup.</li>
                      </ul>
                      <div style="font-size:11px;color:#6b7280;margin-top:8px;line-height:1.6;">
                        Security deposits are typically released by your bank or card issuer
                        within <strong>5–7 business days</strong> after the vehicle is returned
                        in satisfactory condition, subject to any outstanding balances, tolls,
                        tickets, fuel or damage charges.
                      </div>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- FOOTER / LEGAL -->
            <tr>
              <td style="padding:10px 24px 24px;">
                <div style="border-top:1px solid rgba(31,41,55,0.9);padding-top:10px;font-size:11px;color:#6b7280;line-height:1.6;text-align:left;">
                  This email is a reservation acknowledgement and does not guarantee rental.
                  Your booking is confirmed once Asani Rentals issues your rental agreement
                  and your deposit is successfully processed. Any additional surcharges or
                  conditions will be detailed in your final agreement.
                  <br/><br/>
                  For changes or questions, reply to this email or contact us at
                  <a href="mailto:${COMPANY.email}" style="color:#e5e7eb;text-decoration:none;">${COMPANY.email}</a>.
                </div>
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
`;

    const text = `
Asani Rentals – Reservation acknowledgement

Guest:
- Name: ${customer.fullName || "Guest"}
- Email: ${customer.email}
- Phone: ${customer.phone || "N/A"}

Vehicle:
- ${vehicleName || "Vehicle"}
- Dates: ${fmtDate(startDate)} to ${fmtDate(endDate)}
- Days: ${days || 1}

Pricing (estimate):
- Daily rate: ${money(discountedDailyRate || originalDailyRate || 0)}
- Rental subtotal: ${money(subtotal || 0)}
- Protection & extras (estimate): ${money(extrasSum)}
- Estimated total: ${money(total || subtotal || 0)}
- Deposit due: ${money(deposit || 0)}

Next steps:
- We’ll send your rental agreement with final details.
- Review and sign the agreement to complete your booking.
- Bring your driver’s license, payment card, and required insurance documents at pickup.

Security deposits are typically released by your bank or card issuer within
5–7 business days after the vehicle is returned in satisfactory condition,
subject to any outstanding balances, tolls, tickets, fuel or damage charges.

This email acknowledges your reservation request.
Your booking is confirmed once the agreement and deposit are completed.

${COMPANY.name}
${COMPANY.phone}
${COMPANY.email}
${COMPANY.address}
`;

    const from = `"Asani Rentals" <${COMPANY.email}>`;

    await Promise.all([
      resend.emails.send({
        from,
        to: customer.email,
        subject,
        html,
        text
      }),
      resend.emails.send({
        from,
        to: COMPANY.email,
        subject: `NEW RESERVATION — ${customer.fullName || customer.email || "Guest"}`,
        html,
        text
      })
    ]);

    res.status(200).json({ success: true });
  } catch (err) {
    console.error("Booking email error", err);
    res.status(500).json({ error: "Failed to send booking emails" });
  }
};