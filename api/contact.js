// api/contact.js
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const body = req.body || {};
    console.log("New contact message:", body);

    // TODO later: send email via Resend or save to DB

    return res.status(200).json({
      ok: true,
      message:
        "Contact message received. In production this will also notify Asani Rentals.",
    });
  } catch (err) {
    console.error("Contact API error:", err);
    return res.status(500).json({
      error: "Server error",
    });
  }
}
