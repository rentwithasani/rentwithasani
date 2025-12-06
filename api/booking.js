// /api/booking.js
const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

// Fallbacks if you don't want to use env vars for from / internal copy
const COMPANY_NAME = "Asani Rentals";
const COMPANY_EMAIL = "reserve@rentwithasani.com";
const FROM_EMAIL =
  process.env.RESEND_FROM_EMAIL || `Asani Rentals <${COMPANY_EMAIL}>`;

/**
 * Expected JSON body from frontend (from App.jsx handlePay):
 * {
 *   vehicleId: string,
 *   vehicleName: string,
 *   startDate: string,
 *   endDate: string,
 *   days: number,
 *   subtotal: number,
 *   deposit: number,
 *   total: number,
 *   customer: {
 *     fullName: string,
 *     email: string,
 *     phone: string
 *   },
 *   extras: {
 *     insurance: "none" | "asani",
 *     insuranceDailyRate: number,
 *     insuranceCost: number,
 *     ezPass: boolean,
 *     ezPassDailyRate: number,
 *     ezPassCost: number,
 *     prepayFuel: boolean,
 *     fuelPrepayCost: number,
 *     amenities: { infantSeat: boolean, childSeat: boolean, boosterSeat: boolean },
 *     amenityDailyRate: number,
 *     amenityCount: number,
 *     amenitiesCost: number,
 *     riskAccepted: boolean,
 *     promoCode: string | null,
 *     originalDailyRate: number,
 *     discountedDailyRate: number
 *   }
 * }
 */
module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const booking =
      typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};

    const customer = booking.customer || {};
    const extras = booking.extras || {};

    if (!customer.email) {
      res.status(400).json({ error: "Missing customer email." });
      return;
    }

    if (!process.env.RESEND_API_KEY) {
      console.error("Missing RESEND_API_KEY env var for booking emails.");
      // Don't block the booking – just respond ok so frontend continues to Stripe
      res.status(200).json({
        ok: false,
        warning: "Email service not configured (RESEND_API_KEY missing).",
      });
      return;
    }

    const start = booking.startDate || "";
    const end = booking.endDate || "";
    const days = booking.days || 1;

    const amenitiesList = [];
    if (extras.amenities?.infantSeat) amenitiesList.push("Infant seat");
    if (extras.amenities?.childSeat) amenitiesList.push("Child seat");
    if (extras.amenities?.boosterSeat) amenitiesList.push("Booster seat");

    const hasExtras =
      extras.insuranceCost ||
      extras.ezPassCost ||
      extras.fuelPrepayCost ||
      extras.amenitiesCost;

    const promoText = extras.promoCode
      ? `Promo code: ${extras.promoCode} (original daily rate ${currency(
          extras.originalDailyRate
        )}/day)`
      : "";

    const subject = `Your ${booking.vehicleName || "vehicle"} reservation — Asani Rentals`;

    const html = buildBookingHtml({
      companyName: COMPANY_NAME,
      companyEmail: COMPANY_EMAIL,
      booking,
      customer,
      extras,
      start,
      end,
      days,
      amenitiesList,
      hasExtras,
      promoText,
    });

    const toList = [customer.email, COMPANY_EMAIL];

    const sendResult = await resend.emails.send({
      from: FROM_EMAIL,
      to: toList,
      subject,
      html,
    });

    if (sendResult.error) {
      console.error("Resend booking email error", sendResult.error);
      res.status(200).json({
        ok: false,
        warning: "Booking saved but email failed to send.",
      });
      return;
    }

    res.status(200).json({ ok: true });
  } catch (err) {
    console.error("Booking email handler error", err);
    // Don't kill the booking flow if email fails
    res.status(200).json({
      ok: false,
      warning: "Exception while sending booking email.",
    });
  }
};

function currency(n) {
  if (typeof n !== "number") n = Number(n || 0);
  return `$${n.toFixed(2)}`;
}

function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function buildBookingHtml({
  companyName,
  companyEmail,
  booking,
  customer,
  extras,
  start,
  end,
  days,
  amenitiesList,
  hasExtras,
  promoText,
}) {
  const vehicleName = escapeHtml(booking.vehicleName || "");
  const fullName = escapeHtml(customer.fullName || "");
  const phone = escapeHtml(customer.phone || "");
  const email = escapeHtml(customer.email || "");
  const insuranceLabel =
    extras.insurance === "asani"
      ? "Optional protection plan (accepted)"
      : "Protection plan declined";

  const today = new Date().toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  return `
  <div style="background-color:#0b0b0b;padding:32px 16px;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#f5f5f5;">
    <div style="max-width:640px;margin:0 auto;background:#050505;border-radius:24px;border:1px solid #262626;overflow:hidden;">
      <div style="padding:24px 24px 8px 24px;border-bottom:1px solid #262626;">
        <div style="font-size:11px;letter-spacing:0.16em;text-transform:uppercase;color:#9ca3af;margin-bottom:4px;">
          Reservation confirmation
        </div>
        <div style="font-size:22px;font-weight:700;color:#f9fafb;">
          ${vehicleName || "Your Asani reservation"}
        </div>
        <div style="margin-top:4px;font-size:12px;color:#9ca3af;">
          ${today}
        </div>
      </div>

      <div style="padding:24px;">
        <p style="font-size:14px;color:#e5e7eb;margin:0 0 16px 0;">
          Hi ${fullName || "Guest"},
        </p>
        <p style="font-size:13px;color:#9ca3af;margin:0 0 16px 0;line-height:1.6;">
          Thank you for choosing <span style="color:#f9fafb;font-weight:600;">${companyName}</span>.
          This email summarizes the key details of your upcoming rental and the security deposit you are about to place.
        </p>

        <div style="margin:18px 0;padding:16px;border-radius:16px;background:linear-gradient(135deg,#111827,#020617);border:1px solid #1f2937;">
          <div style="display:flex;justify-content:space-between;align-items:center;">
            <div>
              <div style="font-size:12px;text-transform:uppercase;letter-spacing:0.16em;color:#9ca3af;margin-bottom:4px;">
                Trip overview
              </div>
              <div style="font-size:16px;font-weight:600;color:#f9fafb;">
                ${vehicleName || "Reserved vehicle"}
              </div>
            </div>
            <div style="text-align:right;">
              <div style="font-size:12px;color:#9ca3af;">Deposit due now</div>
              <div style="font-size:18px;font-weight:700;color:#f3f4f6;">
                ${currency(booking.deposit || 0)}
              </div>
            </div>
          </div>

          <div style="margin-top:12px;font-size:12px;color:#9ca3af;">
            <div>
              <span style="color:#e5e7eb;">Pickup:</span> ${escapeHtml(start)}
            </div>
            <div style="margin-top:2px;">
              <span style="color:#e5e7eb;">Return:</span> ${escapeHtml(end)}
            </div>
            <div style="margin-top:2px;">
              <span style="color:#e5e7eb;">Duration:</span> ${
                days || 1
              } day${days > 1 ? "s" : ""}
            </div>
          </div>
        </div>

        <div style="margin-top:16px;display:grid;grid-template-columns:1.1fr 0.9fr;gap:16px;">
          <div style="border-radius:16px;border:1px solid #1f2937;padding:14px;background:#020617;">
            <div style="font-size:12px;text-transform:uppercase;letter-spacing:0.16em;color:#9ca3af;margin-bottom:8px;">
              Guest details
            </div>
            <div style="font-size:13px;color:#d1d5db;">
              <div><strong>Name:</strong> ${fullName || "—"}</div>
              <div><strong>Email:</strong> ${email || "—"}</div>
              <div><strong>Phone:</strong> ${phone || "—"}</div>
            </div>
          </div>

          <div style="border-radius:16px;border:1px solid #1f2937;padding:14px;background:#020617;">
            <div style="font-size:12px;text-transform:uppercase;letter-spacing:0.16em;color:#9ca3af;margin-bottom:8px;">
              Trip pricing (estimate)
            </div>
            <div style="font-size:13px;color:#d1d5db;">
              ${
                promosHtml(extras)
              }
              <div style="display:flex;justify-content:space-between;margin-top:4px;">
                <span>Rental (${days || 1} day${
    days > 1 ? "s" : ""
  })</span>
                <span>${currency(booking.subtotal || 0)}</span>
              </div>
              ${
                hasExtras
                  ? `<div style="display:flex;justify-content:space-between;margin-top:4px;font-size:12px;color:#9ca3af;">
                      <span>Extras & protection (est.)</span>
                      <span>${currency(extras.insuranceCost + extras.ezPassCost + extras.fuelPrepayCost + extras.amenitiesCost)}</span>
                    </div>`
                  : ""
              }
              <div style="border-top:1px solid #1f2937;margin-top:8px;padding-top:8px;display:flex;justify-content:space-between;font-weight:600;">
                <span>Estimated trip total*</span>
                <span>${currency(booking.total || 0)}</span>
              </div>
              <div style="margin-top:4px;font-size:11px;color:#6b7280;">
                *Trip total is an estimate only. Taxes, tolls, violations, fuel, mileage,
                and other incidentals will be calculated in your final rental agreement.
              </div>
            </div>
          </div>
        </div>

        <div style="margin-top:18px;padding:14px;border-radius:16px;border:1px solid #1f2937;background:#020617;">
          <div style="font-size:12px;text-transform:uppercase;letter-spacing:0.16em;color:#9ca3af;margin-bottom:8px;">
            Protection & options
          </div>
          <div style="font-size:13px;color:#d1d5db;">
            <div style="margin-bottom:4px;">
              <strong>${insuranceLabel}</strong>${
    extras.insuranceCost
      ? ` — approx. ${currency(extras.insuranceCost)}`
      : ""
  }
            </div>
            ${
              promoText
                ? `<div style="margin-bottom:4px;color:#a5b4fc;">${escapeHtml(
                    promoText
                  )}</div>`
                : ""
            }
            ${
              extras.ezPass
                ? `<div>• EZ-Pass / toll device selected (tolls plus service fees billed after rental).</div>`
                : ""
            }
            ${
              extras.prepayFuel
                ? `<div>• Prepaid fuel selected — return at any level.</div>`
                : ""
            }
            ${
              amenitiesList.length
                ? `<div>• Amenities: ${escapeHtml(
                    amenitiesList.join(", ")
                  )} (per-day charges apply).</div>`
                : ""
            }
            ${
              extras.riskAccepted && extras.insurance === "none"
                ? `<div style="margin-top:6px;font-size:11px;color:#f97373;">
                     You confirmed that you understand you may be fully financially responsible
                     for damage, loss, or liability not covered by your own policy or card.
                   </div>`
                : ""
            }
          </div>
        </div>

        <div style="margin-top:22px;padding:14px;border-radius:16px;border:1px solid #1f2937;background:#050816;">
          <div style="font-size:12px;text-transform:uppercase;letter-spacing:0.16em;color:#9ca3af;margin-bottom:8px;">
            Important rental terms (summary)
          </div>
          <ul style="font-size:11px;color:#9ca3af;line-height:1.7;padding-left:18px;margin:0;">
            <li>
              Your reservation is held by the security deposit listed above. The deposit may be
              <strong>pre-authorized or charged</strong> to your payment method and is typically
              released within 5–7 business days after the vehicle is returned in acceptable condition.
            </li>
            <li>
              You remain responsible for <strong>all traffic violations, tolls, parking tickets,
              towing, and similar charges</strong> incurred during the rental period, plus any
              applicable administrative or processing fees.
            </li>
            <li>
              Returning the vehicle earlier than the scheduled end date does not guarantee a refund
              of unused days. Daily and minimum charges are based on the originally reserved period.
            </li>
            <li>
              Driving under the influence, reckless use, unapproved drivers, or use outside permitted
              regions may void protection and result in full financial responsibility for all losses.
            </li>
            <li>
              The full rental agreement provided at vehicle pickup will govern all terms and will
              supersede any summary in this email. Please review it carefully before signing.
            </li>
          </ul>
        </div>

        <p style="margin-top:22px;font-size:12px;color:#9ca3af;line-height:1.6;">
          If you have any questions or wish to adjust your reservation, reply to this email or contact us at
          <a href="mailto:${companyEmail}" style="color:#e5e7eb;text-decoration:none;border-bottom:1px solid #4b5563;">
            ${companyEmail}
          </a>.
        </p>

        <p style="margin-top:12px;font-size:12px;color:#6b7280;">
          With appreciation,<br/>
          <span style="color:#e5e7eb;font-weight:600;">${companyName}</span>
        </p>
      </div>
    </div>
  `;
}

function promosHtml(extras) {
  if (!extras || !extras.originalDailyRate) return "";
  const orig = currency(extras.originalDailyRate);
  const disc = currency(extras.discountedDailyRate || extras.originalDailyRate);
  if (!extras.promoCode) {
    return `
      <div style="display:flex;justify-content:space-between;margin-bottom:4px;font-size:12px;color:#9ca3af;">
        <span>Daily rate</span>
        <span>${disc}/day</span>
      </div>
    `;
  }
  return `
    <div style="display:flex;justify-content:space-between;margin-bottom:4px;font-size:12px;color:#9ca3af;">
      <span>Daily rate</span>
      <span>
        <span style="text-decoration:line-through;color:#6b7280;margin-right:4px;">${orig}</span>
        <span style="color:#a5b4fc;">${disc}</span>/day
      </span>
    </div>
  `;
}
