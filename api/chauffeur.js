// api/chauffeur.js
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Vercel parses JSON automatically when Content-Type is application/json
    const body = req.body || {};
    console.log("New chauffeur request:", body);

    // TODO later: send email via Resend or save to DB

    return res.status(200).json({
      ok: true,
      message:
        "Chauffeur request received. In production this will also notify Asani Rentals.",
    });
  } catch (err) {
    console.error("Chauffeur API error:", err);
    return res.status(500).json({
      error: "Server error",
    });
  }
}
