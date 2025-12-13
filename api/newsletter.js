// /api/newsletter.js
// Handles newsletter sign-ups and sends:
// 1) A luxury welcome email to the guest
// 2) A notification email to Asani Rentals
//
// Uses Resend (https://resend.com)

const { Resend } = require("resend");

// Make sure RESEND_API_KEY is set in Vercel
const resend = new Resend(process.env.RESEND_API_KEY);

// Brand info — keep this aligned with the rest of your project
const COMPANY = {
  name: "Asani Rentals",
  email: "reserve@rentwithasani.com",
  phone: "732-470-8233",
  address: "Kalispell MT, 59901",
  tagline:
    "Premium economy to luxury rentals • Business • Events • Private travel",
  slogan: "Arrive like it’s already yours.",
};

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const body = req.body || {};
    const email = (body.email || "").trim();
    const name = (body.name || "").trim();
    const source = (body.source || "").trim(); // optional, e.g. "homepage", "checkout"

    if (!email) {
      res.status(400).json({ error: "Missing email." });
      return;
    }

    // If Resend is not configured, don't block the UX:
    if (!process.env.RESEND_API_KEY) {
      console.warn(
        "[newsletter] RESEND_API_KEY missing. Skipping email send but returning success."
      );
      res.status(200).json({ success: true, skippedEmail: true });
      return;
    }

    const friendlyName = name || "Guest";
    const subjectGuest = "Welcome to Asani Rentals — insider access unlocked";
    const subjectInternal = `NEW NEWSLETTER SIGNUP — ${friendlyName} (${email})`;

    // ---------- Guest HTML ----------
    const htmlGuest = `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charSet="UTF-8" />
    <title>${subjectGuest}</title>
  </head>
  <body style="margin:0;padding:0;background:#020617;font-family:-apple-system,BlinkMacSystemFont,'SF Pro Text',system-ui,sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background:radial-gradient(circle at top left,#0b1120,#020617);padding:32px 16px;">
      <tr>
        <td align="center">
          <table width="100%" cellpadding="0" cellspacing="0" style="max-width:640px;border-radius:28px;overflow:hidden;background:linear-gradient(145deg,#020617,#020617,#050816,#030712);border:1px solid #1f2937;">
            <!-- Header -->
            <tr>
              <td style="padding:24px 32px 16px 32px;border-bottom:1px solid rgba(148,163,184,0.12);">
                <div style="font-size:11px;letter-spacing:0.25em;text-transform:uppercase;color:#9ca3af;margin-bottom:6px;">
                  ${COMPANY.tagline}
                </div>
                <div style="display:flex;justify-content:space-between;align-items:center;gap:12px;">
                  <div>
                    <div style="font-size:22px;font-weight:800;letter-spacing:0.08em;text-transform:uppercase;color:#f9fafb;">
                      ${COMPANY.name}
                    </div>
                    <div style="font-size:13px;color:#9ca3af;margin-top:4px;">
                      ${COMPANY.slogan}
                    </div>
                  </div>
                  <div style="text-align:right;font-size:11px;color:#9ca3af;line-height:1.4;">
                    <div>${COMPANY.address}</div>
                    <div>${COMPANY.phone}</div>
                    <div>${COMPANY.email}</div>
                  </div>
                </div>
              </td>
            </tr>

            <!-- Body -->
            <tr>
              <td style="padding:24px 32px 16px 32px;">
                <div style="font-size:12px;color:#9ca3af;margin-bottom:4px;">
                  You’re on the list
                </div>
                <div style="font-size:20px;font-weight:700;color:#f9fafb;">
                  Welcome, ${friendlyName}.
                </div>
                <div style="font-size:13px;color:#a1a1aa;margin-top:8px;line-height:1.7;">
                  You now have first look access to new fleet arrivals, preferred client
                  rates, last-minute upgrades, and private invitations for select
                  experiences with Asani Rentals.
                </div>
              </td>
            </tr>

            <!-- Highlights -->
            <tr>
              <td style="padding:4px 32px 20px 32px;">
                <table width="100%" cellpadding="0" cellspacing="0" style="border-radius:20px;background:rgba(15,23,42,0.92);border:1px solid rgba(148,163,184,0.28);">
                  <tr>
                    <td style="padding:18px 20px;">
                      <div style="font-size:13px;font-weight:600;color:#e5e7eb;margin-bottom:8px;">
                        As a subscriber, you can expect:
                      </div>
                      <ul style="margin:0;padding-left:18px;font-size:12px;color:#9ca3af;line-height:1.7;">
                        <li>Priority access to new premium and exotic vehicles.</li>
                        <li>Occasional preferred daily rates and seasonal offers.</li>
                        <li>Invites to private events, launches, and showcases.</li>
                        <li>Travel tips and itinerary ideas for business & leisure.</li>
                      </ul>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="padding:0 32px 28px 32px;">
                <div style="border-top:1px solid rgba(31,41,55,0.9);padding-top:12px;font-size:11px;color:#6b7280;line-height:1.6;text-align:center;">
                  To update your preferences or book directly, contact us at
                  <a href="mailto:${COMPANY.email}" style="color:#e5e7eb;text-decoration:none;">${COMPANY.email}</a>
                  or call
                  <a href="tel:${COMPANY.phone}" style="color:#e5e7eb;text-decoration:none;">${COMPANY.phone}</a>.
                  <br />
                  ${COMPANY.name} • ${COMPANY.tagline}
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

    const textGuest = `Welcome to Asani Rentals

You’re now subscribed to receive:
- Priority access to new premium and exotic vehicles
- Preferred daily rates and seasonal offers
- Invitations to private events and showcases
- Travel tips and itinerary ideas

If you ever need to update your details or book directly, contact us:

${COMPANY.name}
${COMPANY.phone}
${COMPANY.email}
${COMPANY.address}
`;

    const textInternal = `NEW NEWSLETTER SUBSCRIBER — Asani Rentals

Email: ${email}
Name: ${friendlyName}
Source: ${source || "Not specified"}

Add this subscriber to your marketing list / CRM as needed.
`;

    const fromAddress = `"${COMPANY.name}" <${COMPANY.email}>`;

    // 1) Send welcome email to guest
    const guestSend = resend.emails.send({
      from: fromAddress,
      to: email,
      subject: subjectGuest,
      html: htmlGuest,
      text: textGuest,
    });

    // 2) Notify internal team
    const internalSend = resend.emails.send({
      from: fromAddress,
      to: COMPANY.email,
      subject: subjectInternal,
      text: textInternal,
    });

    await Promise.all([guestSend, internalSend]);

    res.status(200).json({ success: true });
  } catch (err) {
    console.error("Newsletter email error", err);
    res.status(500).json({ error: "Failed to process newsletter signup" });
  }
};