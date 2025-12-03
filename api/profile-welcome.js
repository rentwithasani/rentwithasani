// api/profile-welcome.js
const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const { fullName, email } = req.body || {};
    if (!email) {
      res.status(400).json({ error: "Missing email" });
      return;
    }

    await resend.emails.send({
      from: "Asani Rentals <reserve@rentwithasani.com>",
      to: email,
      subject: "Welcome to Asani Rentals",
      html: `
        <div style="font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #0b0b0b">
          <h2>Welcome${fullName ? ", " + fullName : ""}</h2>
          <p>Your profile has been created with Asani Rentals.</p>
          <p>You'll be able to reserve faster and receive tailored offers for premium economy, luxury, and exotic rentals.</p>
          <p style="margin-top:16px;">— Asani Rentals</p>
        </div>
      `,
    });

    res.status(200).json({ ok: true });
  } catch (err) {
    console.error("Profile welcome error", err);
    res.status(500).json({ error: "Profile welcome failed" });
  }
};
