// api/newsletter.js
const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const { email } = req.body || {};
    if (!email) {
      res.status(400).json({ error: "Missing email" });
      return;
    }

    await resend.emails.send({
      from: "Asani Rentals <notifications@rentwithasani.com>",
      to: "notifications@rentwithasani.com",
      subject: "New newsletter signup",
      html: `
        <p>New newsletter signup:</p>
        <p><strong>Email:</strong> ${email}</p>
      `,
    });

    res.status(200).json({ ok: true });
  } catch (err) {
    console.error("Newsletter error", err);
    res.status(500).json({ error: "Newsletter failed" });
  }
};
