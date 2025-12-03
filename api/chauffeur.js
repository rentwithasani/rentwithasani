export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.statusCode = 405;
    res.json({ error: "Method not allowed" });
    return;
  }

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

  // Basic validation
  if (!name || !email || !phone || !serviceType || !date || !time || !pickup || !dropoff) {
    res.statusCode = 400;
    res.json({ error: "Missing required fields" });
    return;
  }

  // Log to server logs so you can see every request in Vercel → Functions → Logs
  console.log("New chauffeur request:", {
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
  });

  let emailSent = false;

  // Try to send via Resend **if** the API key exists,
  // but DO NOT fail the request if email sending breaks.
  const apiKey = process.env.RESEND_API_KEY;

  if (apiKey) {
    try {
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
          from: "Asani Rentals <onboarding@resend.dev>", // change later to your verified domain if you want
          to: ["reserve@rentwithasani.com"],
          subject,
          html,
        }),
      });

      if (!resp.ok) {
        const text = await resp.text();
        console.error("Resend error:", text);
      } else {
        emailSent = true;
      }
    } catch (err) {
      console.error("Error sending email via Resend:", err);
    }
  } else {
    console.warn("RESEND_API_KEY not set. Chauffeur requests will not send email yet.");
  }

  // ✅ Always respond 200 so the frontend shows success
  res.statusCode = 200;
  res.json({ ok: true, emailSent });
}
