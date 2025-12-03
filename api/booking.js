// api/booking.js
import { Resend } from "resend";
import { supabase } from "../lib/supabaseAdmin.js";

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { booking } = req.body;

    if (!booking) {
      return res.status(400).json({ error: "Missing booking in body" });
    }

    // 1) Store in Supabase
    const { error: dbError } = await supabase.from("bookings").insert({
      vehicle_id: booking.vehicleId,
      full_name: booking.customer?.fullName || null,
      email: booking.customer?.email || null,
      phone: booking.customer?.phone || null,
      start_date: booking.startDate || null,
      end_date: booking.endDate || null,
      days: booking.days || null,
      subtotal: booking.subtotal ?? null,
      deposit: booking.deposit ?? null,
      total: booking.total ?? null,
      extras: booking.extras || {},
    });

    if (dbError) {
      console.error("Supabase bookings insert error:", dbError);
      // we don't fail the whole request just because logging failed
    }

    // 2) Send notification email
    const subject = `New booking — ${booking.vehicleName || booking.vehicleId}`;

    const lines = [
      `<p><strong>Vehicle:</strong> ${booking.vehicleName || booking.vehicleId}</p>`,
      `<p><strong>Name:</strong> ${booking.customer?.fullName || "N/A"}</p>`,
      `<p><strong>Email:</strong> ${booking.customer?.email || "N/A"}</p>`,
      `<p><strong>Phone:</strong> ${booking.customer?.phone || "N/A"}</p>`,
      `<p><strong>Dates:</strong> ${booking.startDate || "?"} → ${
        booking.endDate || "?"
      } (${booking.days} day(s))</p>`,
      `<p><strong>Subtotal:</strong> $${booking.subtotal?.toFixed?.(2) || booking.subtotal}</p>`,
      `<p><strong>Estimated total:</strong> $${booking.total?.toFixed?.(2) || booking.total}</p>`,
      `<p><strong>Deposit:</strong> $${booking.deposit?.toFixed?.(2) || booking.deposit}</p>`,
    ];

    await resend.emails.send({
      from: "notifications@rentwithasani.com",
      to: ["reserve@rentwithasani.com"],
      subject,
      html: `
        <div>
          <h2>New Booking Received</h2>
          ${lines.join("")}
          <p>Logged in Supabase & ready to review.</p>
        </div>
      `,
    });

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("Booking API error:", err);
    return res
      .status(500)
      .json({ error: "Failed to process booking on the server" });
  }
}
