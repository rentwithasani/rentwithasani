export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.statusCode = 405;
    res.json({ error: "Method not allowed" });
    return;
  }

  try {
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
      notes,
    } = req.body || {};

    if (!name || !email || !phone || !serviceType || !date || !time || !pickup || !dropoff) {
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

    const subject = `New chauffeur request from ${name}`;
    const html = `
      <h2>New chauffeur service request</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Phone:</strong> ${phone}</p>
      <p><strong>Service type:</strong> ${serviceType}</p>
      <p><strong>Date:</strong> ${date}</p>
      <p><strong>Time:</strong> ${time}</p>
      <p><strong>Passengers:</strong> ${passengers || "N/A"}</p>
      <p><strong>Estimated hours:</strong> ${hours || "N/A"}</p>
      <p><strong>Pickup:</strong> ${pickup}</p>
      <p><strong>Dropoff / itinerary:</strong> ${dropoff}</p>
      <p><strong>Notes:</strong><br/>${(notes || "").replace(/\n/g, "<br/>")}</p>
    `;

    const resp = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: "Asani Rentals <onboarding@resend.dev>", // later you can change this to your own verified domain
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
    console.error("Chauffeur handler error:", err);
    res.statusCode = 500;
    res.json({ error: "Unexpected server error" });
  }
}
