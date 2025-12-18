// /api/contact.js
// Handles general contact messages and sends luxury-styled emails
// to BOTH the guest and the Asani Rentals team using Resend.

const { Resend } = require("resend");

// Make sure this env var is set in Vercel:
// RESEND_API_KEY
const resend = new Resend(process.env.RESEND_API_KEY);

// Brand info (keep consistent with the rest of the project)
const COMPANY = {
  name: "Asani Rentals",
  email: "reserve@rentwithasani.com",
  phone: "732-470-8233",
  serviceArea: "United States • Tri-State Area (NY • NJ • CT)",
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

    const name = (body.name || "").trim();
    const email = (body.email || "").trim();
    const message = (body.message || "").trim();

    if (!name || !email || !message) {
      res.status(400).json({
        error: "Missing required fields. Name, email, and message are required.",
      });
      return;
    }

    // If Resend API key isn't set, don't break the UX — just soft succeed.
    if (!process.env.RESEND_API_KEY) {
      console.warn(
        "[contact] RESEND_API_KEY not set. Skipping email send but returning success."
      );
      res.status(200).json({ success: true, skippedEmail: true });
      return;
    }

    const subjectGuest = "We’ve received your message — Asani Rentals";
    const subjectInternal = `NEW CONTACT — ${name}`;

    const safeMessage = message
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .trim();

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
                    <div>${COMPANY.serviceArea}</div>
                    <div>${COMPANY.phone}</div>
                    <div>${COMPANY.email}</div>
                  </div>
                </div>
              </td>
            </tr>

            <!-- Intro -->
            <tr>
              <td style="padding:24px 32px 8px 32px;">
                <div style="font-size:12px;color:#9ca3af;margin-bottom:4px;">
                  Message received
                </div>
                <div style="font-size:20px;font-weight:700;color:#f9fafb;">
                  Thank you, ${name}. We’ve received your message.
                </div>
                <div style="font-size:13px;color:#a1a1aa;margin-top:8px;line-height:1.7;">
                  Our team will review your note and respond with next steps. For time-sensitive
                  reservations or same-day requests, please also call us directly.
                </div>
              </td>
            </tr>

            <!-- Message summary -->
            <tr>
              <td style="padding:4px 32px 24px 32px;">
                <table width="100%" cellpadding="0" cellspacing="0" style="border-radius:20px;background:rgba(15,23,42,0.92);border:1px solid rgba(148,163,184,0.28);">
                  <tr>
                    <td style="padding:18px 20px 14px 20px;">
                      <div style="font-size:13px;font-weight:600;color:#e5e7eb;margin-bottom:8px;">
                        Your message
                      </div>
                      <table width="100%" cellpadding="0" cellspacing="0" style="font-size:12px;color:#9ca3af;line-height:1.8;margin-bottom:10px;">
                        <tr>
                          <td style="padding:2px 0;width:110px;color:#6b7280;">Name</td>
                          <td style="padding:2px 0;color:#e5e7eb;">${name}</td>
                        </tr>
                        <tr>
                          <td style="padding:2px 0;width:110px;color:#6b7280;">Email</td>
                          <td style="padding:2px 0;color:#e5e7eb;">${email}</td>
                        </tr>
                      </table>
                      <div style="font-size:12px;font-weight:500;color:#e5e7eb;margin-bottom:4px;">
                        Message
                      </div>
                      <div style="font-size:12px;color:#9ca3af;line-height:1.7;white-space:pre-line;">
                        ${safeMessage}
                      </div>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="padding:0 32px 28px 32px;">
                <div style="border-top:1px solid rgba(31,41,55,0.9);padding-top:12px;font-size:11px;color:#6b7280;line-height:1.6;text-align:center;">
                  If your inquiry is urgent, you can reach us at
                  <a href="tel:${COMPANY.phone}" style="color:#e5e7eb;text-decoration:none;">${COMPANY.phone}</a>
                  or email
                  <a href="mailto:${COMPANY.email}" style="color:#e5e7eb;text-decoration:none;">${COMPANY.email}</a>.
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

    const textGuest = `We’ve received your message — Asani Rentals

Name: ${name}
Email: ${email}

Message:
${message}

Our team will review your note and respond with next steps. For urgent or same-day requests, please call us directly.

${COMPANY.name}
Service Area: ${COMPANY.serviceArea}
${COMPANY.phone}
${COMPANY.email}
`;

    const textInternal = `NEW CONTACT MESSAGE — Asani Rentals

From:
- Name: ${name}
- Email: ${email}

Message:
${message}

Reply directly to this email to continue the conversation with the guest.
`;

    const fromAddress = `"${COMPANY.name}" <${COMPANY.email}>`;

    const guestSend = resend.emails.send({
      from: fromAddress,
      to: email,
      subject: subjectGuest,
      html: htmlGuest,
      text: textGuest,
    });

    const internalSend = resend.emails.send({
      from: fromAddress,
      to: COMPANY.email,
      subject: subjectInternal,
      text: textInternal,
    });

    await Promise.all([guestSend, internalSend]);

    res.status(200).json({ success: true });
  } catch (err) {
    console.error("Contact email error", err);
    res.status(500).json({ error: "Failed to send contact emails" });
  }
};
