// /api/member-promo.js
// Sends the member their unique 10% promo code after signup.
// Uses Resend (RESEND_API_KEY)

const { Resend } = require("resend");
const resend = new Resend(process.env.RESEND_API_KEY);

const COMPANY = {
  name: "Asani Rentals",
  email: "reserve@rentwithasani.com",
  phone: "732-470-8233",
  website: "www.rentwithasani.com",
  tagline: "Arrive like it’s already yours.",
};

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const { email, fullName, membershipId, promoCode } = req.body || {};

    if (!email || !promoCode) {
      res.status(400).json({ error: "Missing email or promoCode." });
      return;
    }

    const name = fullName || "Member";

    const subject = `Your Asani Rentals 10% promo code`;

    const html = `
      <div style="background:#0a0a0a;padding:32px 18px;font-family:Arial,sans-serif;">
        <div style="max-width:640px;margin:0 auto;background:#111;border:1px solid #222;border-radius:18px;overflow:hidden;">
          <div style="padding:22px 22px 8px;">
            <div style="color:#fff;font-size:18px;font-weight:700;">${COMPANY.name}</div>
            <div style="color:#9ca3af;font-size:12px;margin-top:6px;">${COMPANY.tagline}</div>
          </div>
          <div style="padding:0 22px 22px;">
            <h2 style="color:#fff;margin:14px 0 8px;font-size:22px;">Welcome, ${name}.</h2>
            <p style="color:#d1d5db;margin:0 0 14px;font-size:14px;line-height:1.6;">
              Thanks for becoming a member. Here is your unique 10% off promo code:
            </p>
            <div style="background:#000;border:1px solid #2b2b2b;border-radius:14px;padding:14px 16px;color:#fff;font-size:18px;font-weight:800;letter-spacing:0.5px;">
              ${promoCode}
            </div>
            ${membershipId ? `<p style="color:#9ca3af;margin:12px 0 0;font-size:12px;">Membership ID: <strong style="color:#e5e7eb;">${membershipId}</strong></p>` : ""}
            <p style="color:#9ca3af;margin:14px 0 0;font-size:12px;line-height:1.6;">
              Use your code at checkout anytime. You also earn points on every booking and unlock exclusive tier pricing.
            </p>
          </div>
          <div style="padding:16px 22px;border-top:1px solid #222;color:#9ca3af;font-size:12px;display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap;">
            <span>${COMPANY.website}</span>
            <span>${COMPANY.phone}</span>
            <span>${COMPANY.email}</span>
          </div>
        </div>
      </div>
    `;

    const { error } = await resend.emails.send({
      from: `${COMPANY.name} <${COMPANY.email}>`,
      to: [email],
      subject,
      html,
    });

    if (error) {
      console.error("Resend error", error);
      res.status(500).json({ error: "Email failed to send." });
      return;
    }

    res.status(200).json({ ok: true });
  } catch (e) {
    console.error("member-promo error", e);
    res.status(500).json({ error: "Server error." });
  }
};
