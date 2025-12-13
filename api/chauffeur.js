// /api/chauffeur.js
// Luxury black-gradient chauffeur request confirmation for guest + internal

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

const SERVICE_LABELS = {
  "sprinter": "Sprinter",
  "black-suv": "Black truck / black SUV",
  "elite-luxury": "Elite luxury sedan",
  "armed-chauffeur": "Armed chauffeur (licensed protection)"
};

// Helpers
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

function fmtTime(t) {
  if (!t) return "";
  // Expecting "HH:MM" (24h) from <input type="time">
  const [hStr, mStr] = t.split(":");
  const h = parseInt(hStr, 10);
  const m = parseInt(mStr || "0", 10);
  if (isNaN(h)) return t;
  const period = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 || 12;
  const mm = String(m).padStart(2, "0");
  return `${hour12}:${mm} ${period}`;
}

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const body = req.body || {};
    const {
      name,
      email,
      phone,
      serviceType,
      date,
      time,
      passengers,
      hours,
      pickup,
      dropoff,
      notes
    } = body;

    if (!email || !name) {
      res.status(400).json({ error: "Missing name or email." });
      return;
    }

    const serviceLabel = SERVICE_LABELS[serviceType] || "Chauffeur service";

    const subject = `Asani Rentals — Chauffeur request received`;

    // ---------- HTML (luxury dark chauffeur email) ----------
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
                  Chauffeur service request
                </div>
                <div style="font-size:20px;font-weight:700;color:#f9fafb;">
                  Thank you, ${name} — your request has been received.
                </div>
                <div style="font-size:13px;color:#a1a1aa;margin-top:6px;line-height:1.5;">
                  Our concierge team is reviewing your details and will follow up shortly to confirm availability,
                  pricing, and next steps. Your booking is not yet confirmed until you receive a formal itinerary
                  and confirmation from Asani Rentals.
                </div>
              </td>
            </tr>

            <!-- REQUEST SUMMARY CARD -->
            <tr>
              <td style="padding:8px 24px 22px;">
                <table width="100%" cellpadding="0" cellspacing="0" style="
                  border-radius:20px;
                  background:radial-gradient(circle at top left,#020617,#020617 60%,#030712);
                  border:1px solid rgba(148,163,184,0.35);
                ">
                  <tr>
                    <td style="padding:16px 18px 4px 18px;vertical-align:top;">
                      <div style="font-size:12px;color:#9ca3af;text-transform:uppercase;letter-spacing:0.22em;margin-bottom:4px;">
                        Service overview
                      </div>
                      <div style="font-size:17px;font-weight:600;color:#f9fafb;">
                        ${serviceLabel}
                      </div>
                      <div style="font-size:13px;color:#a3a3a3;margin-top:6px;">
                        ${fmtDate(date)} • ${fmtTime(time)}${hours
                          ? ` • Approx. ${hours} hour${hours > 1 ? "s" : ""}`
                          : ""
                        }
                      </div>
                      <div style="font-size:13px;color:#a3a3a3;margin-top:4px;">
                        Passengers: ${passengers || "Not specified"}
                      </div>

                      <div style="font-size:12px;color:#9ca3af;margin-top:10px;">
                        Pick-up
                      </div>
                      <div style="font-size:13px;color:#e5e7eb;margin-top:2px;">
                        ${pickup || "Not specified"}
                      </div>

                      <div style="font-size:12px;color:#9ca3af;margin-top:10px;">
                        Drop-off / itinerary
                      </div>
                      <div style="font-size:13px;color:#e5e7eb;margin-top:2px;">
                        ${dropoff || "Not specified"}
                      </div>

                      ${
                        notes
                          ? `
                      <div style="font-size:12px;color:#9ca3af;margin-top:10px;">
                        Notes
                      </div>
                      <div style="font-size:13px;color:#d1d5db;margin-top:2px;white-space:pre-line;">
                        ${String(notes).trim()}
                      </div>
                      `
                          : ""
                      }
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- GUEST + NEXT STEPS -->
            <tr>
              <td style="padding:0 24px 6px;">
                <table width="100%" cellpadding="0" cellspacing="0" style="
                  border-radius:18px;
                  background:rgba(15,23,42,0.96);
                  border:1px solid rgba(31,41,55,0.9);
                ">
                  <tr>
                    <td style="padding:14px 18px 6px;">
                      <div style="font-size:13px;font-weight:600;color:#e5e7eb;margin-bottom:6px;">
                        Guest details
                      </div>
                      <table width="100%" cellpadding="0" cellspacing="0" style="font-size:12px;color:#9ca3af;">
                        <tr>
                          <td style="padding:2px 0;width:30%;">Name</td>
                          <td style="padding:2px 0;color:#e5e7eb;">${name}</td>
                        </tr>
                        <tr>
                          <td style="padding:2px 0;">Email</td>
                          <td style="padding:2px 0;color:#e5e7eb;">${email}</td>
                        </tr>
                        <tr>
                          <td style="padding:2px 0;">Phone</td>
                          <td style="padding:2px 0;color:#e5e7eb;">${phone || "—"}</td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:0 18px 14px;">
                      <div style="font-size:13px;font-weight:600;color:#e5e7eb;margin-bottom:6px;margin-top:6px;">
                        What happens next
                      </div>
                      <ul style="margin:0;padding-left:18px;font-size:11px;color:#9ca3af;line-height:1.7;">
                        <li>Our team reviews your request and confirms vehicle and chauffeur availability.</li>
                        <li>We send you a quote with pricing, minimum hours, and any security requirements.</li>
                        <li>Once you approve the quote, you’ll receive your service agreement and payment link.</li>
                        <li>Your booking is fully confirmed after the agreement is signed and payment is received.</li>
                      </ul>
                      <div style="font-size:11px;color:#6b7280;margin-top:8px;line-height:1.6;">
                        For premium and armed chauffeur services, additional screening, security protocols,
                        and deposit requirements may apply. All details will be outlined in your formal proposal
                        and service agreement.
                      </div>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- FOOTER -->
            <tr>
              <td style="padding:10px 24px 24px;">
                <div style="border-top:1px solid rgba(31,41,55,0.9);padding-top:10px;font-size:11px;color:#6b7280;line-height:1.6;text-align:left;">
                  This email acknowledges your chauffeur service request and does not guarantee availability.
                  Final confirmation is issued once Asani Rentals provides your written itinerary and receives
                  signed documents and any required payments.
                  <br/><br/>
                  For updates or questions, reply to this email or contact us at
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

    // ---------- TEXT-ONLY FALLBACK ----------
    const text = `
Asani Rentals – Chauffeur service request

Guest:
- Name: ${name}
- Email: ${email}
- Phone: ${phone || "N/A"}

Service:
- Type: ${serviceLabel}
- Date: ${fmtDate(date)}
- Time: ${fmtTime(time)}
- Passengers: ${passengers || "Not specified"}
- Estimated hours: ${hours || "Not specified"}

Pickup:
- ${pickup || "Not specified"}

Drop-off / itinerary:
- ${dropoff || "Not specified"}

Notes:
${notes ? String(notes).trim() : "None provided"}

Next steps:
- Our team will confirm availability and pricing.
- You will receive a quote and, if approved, a service agreement and payment link.
- Your booking is confirmed once agreements are signed and payment is received.

This email acknowledges your request and does not guarantee availability.

${COMPANY.name}
${COMPANY.phone}
${COMPANY.email}
${COMPANY.address}
`;

    const from = `"Asani Rentals" <${COMPANY.email}>`;

    // send to guest + internal
    await Promise.all([
      resend.emails.send({
        from,
        to: email,
        subject,
        html,
        text
      }),
      resend.emails.send({
        from,
        to: COMPANY.email,
        subject: `NEW CHAUFFEUR REQUEST — ${name}`,
        html,
        text
      })
    ]);

    res.status(200).json({ success: true });
  } catch (err) {
    console.error("Chauffeur email error", err);
    // Soft fail: don’t crash the form, just return 500 so frontend can show a message
    res.status(500).json({ error: "Failed to send chauffeur emails" });
  }
};