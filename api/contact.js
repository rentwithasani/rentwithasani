// api/contact.js
const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const {
      name,
      email,
      phone,
      message,
      subject,
      type, // e.g. "booking", "contact", "chauffeur"
    } = req.body || {};

    const adminTo =
      process.env.CONTACT_TO_EMAIL || "reserve@rentwithasani.com";
    const from =
      process.env.RESEND_FROM_EMAIL || "notifications@rentwithasani.com";

    if (!message) {
      res.status(400).json({ error: "Message is required." });
      return;
    }

    const displayName = name || email || "Guest";
    const safePhone = phone || "Not provided";
    const kindLabel = type ? type.toUpperCase() : "GENERAL";

    // ---- SUBJECTS ----
    const adminSubject =
      subject ||
      `[${kindLabel}] New message from ${displayName} — Asani Rentals`;

    const customerSubject =
      type === "booking"
        ? "We received your Asani Rentals booking request"
        : "We received your message at Asani Rentals";

    // ---- HTML FOR ADMIN ----
    const adminHtml = `
      <div style="font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; padding: 16px; line-height: 1.5; color: #111827;">
        <h2 style="margin-bottom: 8px;">New ${kindLabel.toLowerCase()} submission from the website</h2>
        <h3 style="margin: 12px 0 4px;">Contact</h3>
        <ul style="margin:0;padding-left:16px;font-size:13px;">
          <li><strong>Name:</strong> ${displayName}</li>
          <li><strong>Email:</strong> ${email || "Not provided"}</li>
          <li><strong>Phone:</strong> ${safePhone}</li>
          <li><strong>Type:</strong> ${type || "general"}</li>
        </ul>
        <h3 style="margin: 12px 0 4px;">Message</h3>
        <pre style="background:#F3F4F6;padding:12px;border-radius:8px;font-size:13px;white-space:pre-wrap;">${message}</pre>
        <p style="margin-top:16px;font-size:12px;color:#6B7280;">
          Asani Rentals<br/>
          1001 S Main #8227, Kalispell, MT 59901<br/>
          732-470-8233
        </p>
      </div>
    `;

    // ---- HTML FOR CUSTOMER ----
    const customerHtml = email
      ? `
      <div style="font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; padding: 16px; line-height: 1.5; color: #111827;">
        <h2 style="margin-bottom: 8px;">Thank you, ${displayName}.</h2>
        <p>We received your ${
          type === "booking" ? "booking request" : "message"
        } at Asani Rentals.</p>
        ${
          type === "booking"
            ? `<p>Our team will review availability and follow up to confirm your reservation details and final pricing.</p>`
            : `<p>We will get back to you as soon as possible.</p>`
        }
        <h3 style="margin: 12px 0 4px;">Summary we received</h3>
        <pre style="background:#F3F4F6;padding:12px;border-radius:8px;font-size:13px;white-space:pre-wrap;">${message}</pre>
        <p style="margin-top:16px;font-size:13px;">
          If anything looks incorrect, you can reply to this email or contact us at 
          <a href="mailto:reserve@rentwithasani.com">reserve@rentwithasani.com</a>.
        </p>
        <p style="margin-top:16px;font-size:12px;color:#6B7280;">
          Asani Rentals<br/>
          1001 S Main #8227, Kalispell, MT 59901<br/>
          732-470-8233
        </p>
      </div>
    `
      : null;

    // ---- SEND EMAILS ----
    const sendPromises = [];

    // admin email (always)
    sendPromises.push(
      resend.emails.send({
        from,
        to: adminTo,
        subject: adminSubject,
        html: adminHtml,
        reply_to: email || adminTo,
      })
    );

    // customer email (if customer email present)
    if (customerHtml && email) {
      sendPromises.push(
        resend.emails.send({
          from,
          to: email,
          subject: customerSubject,
          html: customerHtml,
          reply_to: adminTo,
        })
      );
    }

    const results = await Promise.all(sendPromises);

    const anyError = results.find((r) => r && r.error);
    if (anyError) {
      console.error("Resend contact error:", anyError.error || anyError);
      res
        .status(500)
        .json({ error: "Email send failed", details: anyError.error || anyError });
      return;
    }

    res.status(200).json({ ok: true });
  } catch (err) {
    console.error("Contact API unexpected error:", err);
    res
      .status(500)
      .json({ error: "Unexpected server error", details: err.message || String(err) });
  }
};
