export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.statusCode = 405;
    res.json({ error: "Method not allowed" });
    return;
  }

  try {
    const { name, email, message } = req.body || {};

    if (!name || !email || !message) {
      res.statusCode = 400;
      res.json({ error: "Missing required fields" });
      return;
    }

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.error("Missing RESEND_API_KEY");
      res.statusCode = 500;
      res.json({ error: "Server email config error" });
      return;
    }

    const subject = `New contact form from ${name}`;
    const html = `
      <h2>New contact request</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Message:</strong></p>
      <p>${message.replace(/\n/g, "<br/>")}</p>
    `;

    const resp = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: "Asani Rentals <onboarding@resend.dev>", // change to your verified sender later
        to: ["reserve@rentwithasani.com"],
        subject,
        html,
      }),
    });

    if (!resp.ok) {
      const text = await resp.text();
      console.error("Resend error:", text);
      res.statusCode = 500;
      res.json({ error: "Failed to send email" });
      return;
    }

    res.statusCode = 200;
    res.json({ ok: true });
  } catch (err) {
    console.error("Contact handler error:", err);
    res.statusCode = 500;
    res.json({ error: "Unexpected server error" });
  }
}
