export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.statusCode = 405;
    res.json({ error: "Method not allowed" });
    return;
  }

  try {
    const booking = req.body || {};
    const apiKey = process.env.RESEND_API_KEY;

    if (!apiKey) {
      console.error("Missing RESEND_API_KEY");
      res.statusCode = 500;
      res.json({ error: "Server email config error" });
      return;
    }

    const {
      vehicleId,
      startDate,
      endDate,
      days,
      subtotal,
      deposit,
      total,
      customer = {},
      extras = {},
    } = booking;

    const subject = `New booking — ${customer.fullName || "Unknown customer"}`;
    const html = `
      <h2>New booking</h2>
      <p><strong>Customer:</strong> ${customer.fullName || "N/A"}</p>
      <p><strong>Email:</strong> ${customer.email || "N/A"}</p>
      <p><strong>Phone:</strong> ${customer.phone || "N/A"}</p>
      <p><strong>Vehicle ID:</strong> ${vehicleId}</p>
      <p><strong>Dates:</strong> ${startDate} → ${endDate}</p>
      <p><strong>Days:</strong> ${days}</p>
      <p><strong>Subtotal (rental):</strong> $${subtotal?.toFixed?.(2) ?? subtotal}</p>
      <p><strong>Extras total (est.):</strong> $${((total || 0) - (subtotal || 0))?.toFixed?.(2) ?? ""}</p>
      <p><strong>Deposit due now:</strong> $${deposit?.toFixed?.(2) ?? deposit}</p>
      <p><strong>Estimated trip total:</strong> $${total?.toFixed?.(2) ?? total}</p>
      <h3>Extras</h3>
      <pre style="background:#f4f4f5;padding:8px;border-radius:6px;font-size:12px;">
${JSON.stringify(extras, null, 2)}
      </pre>
    `;

    const resp = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: "Asani Rentals <onboarding@resend.dev>",
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
    console.error("Booking handler error:", err);
    res.statusCode = 500;
    res.json({ error: "Unexpected server error" });
  }
}
