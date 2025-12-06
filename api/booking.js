import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

function formatCurrency(n) {
  if (typeof n !== "number") return "$0.00";
  return `$${n.toFixed(2)}`;
}

function buildCustomerHtml(booking) {
  const {
    vehicleName,
    startDate,
    endDate,
    days,
    subtotal,
    discountedSubtotal,
    discountPercent,
    discountAmount,
    deposit,
    total,
    customer,
  } = booking;

  const hasDiscount = discountPercent > 0 && discountAmount > 0;

  return `
  <div style="background-color:#0a0a0a;padding:32px 16px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
    <div style="max-width:640px;margin:0 auto;background:#050505;border-radius:20px;overflow:hidden;border:1px solid #262626;color:#e5e5e5;">
      <div style="padding:24px 28px 18px;border-bottom:1px solid #262626;">
        <div style="font-size:11px;letter-spacing:0.25em;text-transform:uppercase;color:#a1a1aa;">
          Asani Rentals · Reservation Confirmation
        </div>
        <h1 style="margin:8px 0 4px;font-size:22px;font-weight:700;color:white;">
          Your reservation is pending deposit
        </h1>
        <p style="margin:0;font-size:13px;color:#a1a1aa;">
          Thank you for choosing Asani Rentals. Please review your details below.
        </p>
      </div>

      <div style="padding:24px 28px;">

        <div style="margin-bottom:20px;padding:14px 16px;border-radius:14px;background:linear-gradient(135deg,#18181b,#020617);border:1px solid #27272a;">
          <div style="font-size:13px;margin-bottom:4px;color:#e5e5e5;">
            Vehicle
          </div>
          <div style="font-size:16px;font-weight:600;color:#fafafa;">
            ${vehicleName || "Vehicle"}
          </div>
        </div>

        <div style="display:flex;flex-wrap:wrap;gap:16px;margin-bottom:20px;">
          <div style="flex:1;min-width:170px;padding:12px 14px;border-radius:12px;background:#050509;border:1px solid #27272a;">
            <div style="font-size:11px;text-transform:uppercase;color:#71717a;">
              Pickup
            </div>
            <div style="margin-top:4px;font-size:13px;color:#e5e5e5;">
              ${startDate || "TBD"}
            </div>
          </div>
          <div style="flex:1;min-width:170px;padding:12px 14px;border-radius:12px;background:#050509;border:1px solid #27272a;">
            <div style="font-size:11px;text-transform:uppercase;color:#71717a;">
              Return
            </div>
            <div style="margin-top:4px;font-size:13px;color:#e5e5e5;">
              ${endDate || "TBD"}
            </div>
          </div>
          <div style="flex:1;min-width:140px;padding:12px 14px;border-radius:12px;background:#050509;border:1px solid #27272a;">
            <div style="font-size:11px;text-transform:uppercase;color:#71717a;">
              Duration
            </div>
            <div style="margin-top:4px;font-size:13px;color:#e5e5e5;">
              ${days || 1} day${days > 1 ? "s" : ""}
            </div>
          </div>
        </div>

        <div style="margin-bottom:20px;">
          <div style="font-size:12px;font-weight:600;margin-bottom:8px;color:#e5e5e5;">
            Rental summary
          </div>

          <div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:4px;color:#d4d4d8;">
            <span>Rental (${days || 1} day${days > 1 ? "s" : ""})</span>
            <span>${formatCurrency(subtotal)}</span>
          </div>

          ${
            hasDiscount
              ? `
          <div style="display:flex;justify-content:space-between;font-size:11px;color:#a1a1aa;">
            <span>Promo discount (${discountPercent}% off rental)</span>
            <span>- ${formatCurrency(discountAmount)}</span>
          </div>
          <div style="display:flex;justify-content:space-between;font-size:13px;margin-top:4px;color:#e5e5e5;">
            <span>Adjusted rental</span>
            <span>${formatCurrency(discountedSubtotal)}</span>
          </div>
          `
              : ""
          }

          <div style="display:flex;justify-content:space-between;font-size:13px;margin-top:10px;padding-top:8px;border-top:1px dashed #27272a;color:#d4d4d8;">
            <span>Estimated trip total*</span>
            <span style="font-weight:600;">${formatCurrency(total)}</span>
          </div>

          <div style="display:flex;justify-content:space-between;font-size:13px;margin-top:4px;">
            <span>Deposit due now</span>
            <span style="font-weight:600;color:#fafafa;">${formatCurrency(
              deposit
            )}</span>
          </div>

          <div style="margin-top:8px;font-size:11px;color:#71717a;">
            *Final charges may vary based on mileage, fuel, optional protection,
            tolls, violations, damage, or additional time.
          </div>
        </div>

        <div style="margin-bottom:20px;">
          <div style="font-size:12px;font-weight:600;margin-bottom:6px;color:#e5e5e5;">
            Renter details
          </div>
          <div style="font-size:13px;color:#d4d4d8;">
            <div>${customer.fullName || "Guest"}</div>
            ${
              customer.email
                ? `<div style="color:#a1a1aa;">${customer.email}</div>`
                : ""
            }
            ${
              customer.phone
                ? `<div style="color:#a1a1aa;">${customer.phone}</div>`
                : ""
            }
          </div>
        </div>

        <div style="margin-top:24px;padding:16px 14px;border-radius:14px;background:#020617;border:1px solid #27272a;">
          <div style="font-size:12px;font-weight:600;margin-bottom:8px;color:#e5e5e5;">
            Important reservation information
          </div>
          <ul style="margin:0 0 6px 18px;padding:0;font-size:11px;color:#9ca3af;line-height:1.5;">
            <li>
              Your reservation is not final until the required deposit is successfully paid
              and Asani Rentals has issued a signed rental agreement.
            </li>
            <li>
              The primary driver must present a valid driver’s license, a major credit
              or debit card in their name, and meet Asani Rentals’ age and underwriting criteria.
            </li>
            <li>
              Additional fees may apply for late returns, excessive mileage, tolls, tickets,
              cleaning, smoking, or damage beyond normal wear and tear.
            </li>
            <li>
              Optional protection products, if selected, are subject to the specific terms,
              conditions, exclusions, and limits provided by the protection provider and
              your rental agreement.
            </li>
            <li>
              By proceeding with payment of the deposit, you acknowledge that you have
              reviewed these terms and agree to be bound by the full rental agreement
              provided at or before vehicle handover.
            </li>
          </ul>
        </div>
      </div>

      <div style="padding:16px 28px 22px;border-top:1px solid #262626;font-size:11px;color:#71717a;">
        <div>Asani Rentals</div>
        <div>1001 S Main #8227 · Kalispell, MT 59901</div>
        <div>Phone: 732-470-8233 · Email: reserve@rentwithasani.com</div>
      </div>
    </div>
  </div>
  `;
}

function buildAdminHtml(booking) {
  const {
    vehicleName,
    startDate,
    endDate,
    days,
    subtotal,
    discountedSubtotal,
    discountPercent,
    discountAmount,
    deposit,
    total,
    customer,
  } = booking;

  const hasDiscount = discountPercent > 0 && discountAmount > 0;

  return `
  <div style="background-color:#020617;padding:24px 16px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
    <div style="max-width:680px;margin:0 auto;background:#020617;border-radius:16px;border:1px solid #27272a;color:#e5e5e5;">
      <div style="padding:18px 22px;border-bottom:1px solid #27272a;">
        <div style="font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:#a1a1aa;">
          Asani Rentals · New Booking
        </div>
        <h1 style="margin:6px 0 0;font-size:18px;font-weight:700;color:#fafafa;">
          New reservation request
        </h1>
      </div>

      <div style="padding:18px 22px 20px;">
        <h2 style="margin:0 0 8px;font-size:14px;font-weight:600;color:#e5e5e5;">
          Vehicle & dates
        </h2>
        <div style="font-size:13px;margin-bottom:4px;color:#fafafa;">
          ${vehicleName || "Vehicle"}
        </div>
        <div style="font-size:12px;color:#a1a1aa;margin-bottom:12px;">
          ${startDate || "TBD"} → ${endDate || "TBD"} · ${days || 1} day${
    days > 1 ? "s" : ""
  }
        </div>

        <h2 style="margin:14px 0 6px;font-size:13px;font-weight:600;color:#e5e5e5;">
          Renter
        </h2>
        <div style="font-size:12px;color:#d4d4d8;margin-bottom:10px;">
          <div>${customer.fullName || "Guest"}</div>
          ${
            customer.email
              ? `<div style="color:#a1a1aa;">${customer.email}</div>`
              : ""
          }
          ${
            customer.phone
              ? `<div style="color:#a1a1aa;">${customer.phone}</div>`
              : ""
          }
        </div>

        <h2 style="margin:14px 0 6px;font-size:13px;font-weight:600;color:#e5e5e5;">
          Pricing
        </h2>
        <div style="font-size:12px;color:#d4d4d8;">
          <div style="display:flex;justify-content:space-between;margin-bottom:3px;">
            <span>Rental subtotal</span>
            <span>${formatCurrency(subtotal)}</span>
          </div>
          ${
            hasDiscount
              ? `
          <div style="display:flex;justify-content:space-between;margin-bottom:3px;color:#a1a1aa;font-size:11px;">
            <span>Promo discount (${discountPercent}%)</span>
            <span>- ${formatCurrency(discountAmount)}</span>
          </div>
          <div style="display:flex;justify-content:space-between;margin-bottom:3px;">
            <span>Adjusted rental</span>
            <span>${formatCurrency(discountedSubtotal)}</span>
          </div>
          `
              : ""
          }
          <div style="display:flex;justify-content:space-between;margin-bottom:3px;">
            <span>Estimated total</span>
            <span>${formatCurrency(total)}</span>
          </div>
          <div style="display:flex;justify-content:space-between;margin-bottom:3px;">
            <span>Deposit expected</span>
            <span style="font-weight:600;">${formatCurrency(deposit)}</span>
          </div>
        </div>

        <div style="margin-top:16px;padding-top:10px;border-top:1px dashed #27272a;font-size:11px;color:#9ca3af;">
          <div>
            This is an automated booking notice from the website. Confirm
            payment status in Stripe and ensure a rental agreement is generated
            and signed before releasing any vehicle.
          </div>
        </div>
      </div>
    </div>
  </div>
  `;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { booking, to, customerEmail } = req.body || {};

    if (!booking || !to || !customerEmail) {
      return res.status(400).json({
        error: "Missing required fields: booking, to, customerEmail",
      });
    }

    // Customer email
    const customerHtml = buildCustomerHtml(booking);
    await resend.emails.send({
      from: "Asani Rentals <notifications@rentwithasani.com>",
      to: [customerEmail],
      subject: `Your Asani Rentals reservation – ${booking.vehicleName || "Vehicle"} (${booking.startDate || "Dates TBD"})`,
      html: customerHtml,
    });

    // Internal admin email
    const adminHtml = buildAdminHtml(booking);
    await resend.emails.send({
      from: "Asani Rentals <notifications@rentwithasani.com>",
      to: [to],
      subject: `New reservation – ${booking.vehicleName || "Vehicle"} (${booking.startDate || "Dates TBD"})`,
      html: adminHtml,
    });

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("Booking email handler error:", err);
    return res.status(500).json({ error: "Failed to send emails" });
  }
}
