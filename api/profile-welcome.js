// /api/profile-welcome.js
// Sends a welcome email when a guest creates or updates a profile,
// and notifies Asani Rentals internally.
//
// Uses Resend (https://resend.com)

const { Resend } = require("resend");

// Make sure RESEND_API_KEY is set in Vercel
const resend = new Resend(process.env.RESEND_API_KEY);

// Brand info (keep aligned with the rest of your project)
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

    // Allow both shapes:
    // 1) { email, fullName, phone, driversLicense }
    // 2) { profile: { email, fullName, phone, driversLicense } }
    const payload = body.profile || body;

    const email = (payload.email || "").trim();
    const fullName = (payload.fullName || "").trim();
    const phone = (payload.phone || "").trim();
    const driversLicense = (payload.driversLicense || "").trim();

    if (!email) {
      res.status(400).json({ error: "Missing email." });
      return;
    }

    // If Resend is not configured, don't break the flow
    if (!process.env.RESEND_API_KEY) {
      console.warn(
        "[profile-welcome] RESEND_API_KEY missing. Skipping email send but returning success."
      );
      res.status(200).json({ success: true, skippedEmail: true });
      return;
    }

    const friendlyName = fullName || "Guest";

    const subjectGuest = "Your Asani Rentals profile is ready";
    const subjectInternal = `NEW / UPDATED PROFILE — ${friendlyName} (${email})`;

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
                  Profile created
                </div>
                <div style="font-size:20px;font-weight:700;color:#f9fafb;">
                  Welcome to Asani Rentals, ${friendlyName}.
                </div>
                <div style="font-size:13px;color:#a1a1aa;margin-top:8px;line-height:1.7;">
                  Your guest profile is now on file. This means smoother checkouts, faster
                  confirmations, and a more tailored experience each time you reserve a vehicle
                  with Asani Rentals.
                </div>
              </td>
            </tr>

            <!-- Benefits -->
            <tr>
              <td style="padding:4px 32px 20px 32px;">
                <table width="100%" cellpadding="0" cellspacing="0" style="border-radius:20px;background:rgba(15,23,42,0.92);border:1px solid rgba(148,163,184,0.28);">
                  <tr>
                    <td style="padding:18px 20px;">
                      <div style="font-size:13px;font-weight:600;color:#e5e7eb;margin-bottom:8px;">
                        With your profile, you can enjoy:
                      </div>
                      <ul style="margin:0;padding-left:18px;font-size:12px;color:#9ca3af;line-height:1.7;">
                        <li>Faster reservations with your details pre-filled.</li>
                        <li>Priority handling for repeat bookings and special requests.</li>
                        <li>Access to our curated range of premium and exotic vehicles.</li>
                        <li>Optional notifications about preferred rates and upgrades.</li>
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
                  To update your details or request your next reservation, reply to this email or contact us at
                  <a href="mailto:${COMPANY.email}" style="color:#e5e7eb;text-decoration:none;">${COMPANY.email}</a>
                  or
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

    const textGuest = `Your Asani Rentals profile is ready

Name: ${friendlyName}
Email: ${email}
Phone: ${phone || "N/A"}
Driver's license: ${driversLicense || "N/A"}

Your details are now on file so we can prepare reservations faster, tailor your experience, and streamline future bookings.

To update your details or request your next reservation, contact us:

${COMPANY.name}
${COMPANY.phone}
${COMPANY.email}
${COMPANY.address}
`;

    const textInternal = `NEW / UPDATED PROFILE — Asani Rentals

Name: ${friendlyName}
Email: ${email}
Phone: ${phone || "N/A"}
Driver's license: ${driversLicense || "N/A"}

Add or update this guest in your CRM as needed.
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
    console.error("Profile welcome email error", err);
    res.status(500).json({ error: "Failed to send profile welcome emails" });
  }
};