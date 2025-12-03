// api/booking.js

const { Resend } = require("resend");
const { createClient } = require("@supabase/supabase-js");

// ---- ENV VARIABLES (set in Vercel → Project → Settings → Environment Variables) ----
// RESEND_API_KEY              = your Resend API key
// RESEND_FROM_BOOKING         = "notifications@rentwithasani.com" (or reserve@rentwithasani.com)
// BOOKING_ADMIN_EMAIL         = "reserve@rentwithasani.com" (where YOU receive booking alerts)
// SUPABASE_URL                = your Supabase project URL
// SUPABASE_SERVICE_ROLE_KEY   = service_role key from Supabase (NOT the anon key)

const resend = new Resend(process.env.RESEND_API_KEY);
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const { vehicle, customer, booking } = req.body;

    if (!vehicle || !customer || !booking) {
      res.status(400).json({ error: "Missing booking data in request body" });
      return;
    }

    const {
      fullName,
      email,
      phone,
      driversLicense, // optional if you add it later
    } = customer;

    if (!email || !fullName) {
      res
        .status(400)
        .json({ error: "Customer name and email are required for booking." });
      return;
    }

    // 1) UPSERT PROFILE IN SUPABASE (simple profile table keyed by email)
    // Make sure you have a "profiles" table in Supabase:
    // id (uuid, default uuid_generate_v4())
    // email (text, unique, not null)
    // full_name (text)
    // phone (text)
    // drivers_license (text, nullable)
    // created_at (timestamptz, default now())

    let profileError = null;
    try {
      const { error: profileErr } = await supabase
        .from("profiles")
        .upsert(
          {
            email,
            full_name: fullName,
            phone,
            drivers_license: driversLicense || null,
          },
          { onConflict: "email" }
        );

      if (profileErr) {
        profileError = profileErr;
        console.error("Supabase profile upsert error:", profileErr);
      }
    } catch (err) {
      profileError = err;
      console.error("Supabase profile upsert threw:", err);
    }

    // 2) INSERT BOOKING ROW (best-effort; won't block emails)
    // Make sure you have a "bookings" table in Supabase:
    // id (uuid, default uuid_generate_v4())
    // profile_email (text, references profiles(email))
    // vehicle_id (text)
    // vehicle_name (text)
    // start_date (date)
    // end_date (date)
    // days (integer)
    // subtotal (numeric)
    // total (numeric)
    // deposit (numeric)
    // extras (jsonb)
    // created_at (timestamptz, default now())

    let bookingError = null;
    try {
      const { error: bookErr } = await supabase.from("bookings").insert({
        profile_email: email,
        vehicle_id: vehicle.id,
        vehicle_name: vehicle.name,
        start_date: booking.startDate,
        end_date: booking.endDate,
        days: booking.days,
        subtotal: booking.subtotal,
        total: booking.total,
        deposit: booking.deposit,
        extras: booking.extras || null,
      });

      if (bookErr) {
        bookingError = bookErr;
        console.error("Supabase booking insert error:", bookErr);
      }
    } catch (err) {
      bookingError = err;
      console.error("Supabase booking insert threw:", err);
    }

    // 3) SEND EMAILS VIA RESEND
    const from = process.env.RESEND_FROM_BOOKING || "notifications@rentwithasani.com";
    const adminTo =
      process.env.BOOKING_ADMIN_EMAIL || "reserve@rentwithasani.com";

    const tripSummary = `
Vehicle: ${vehicle.name}
Rate: $${vehicle.pricePerDay}/day
Dates: ${booking.startDate} → ${booking.endDate}
Days: ${booking.days}
Estimated subtotal: $${booking.subtotal}
Estimated extras: $${booking.extrasTotal || 0}
Estimated total: $${booking.total}
Deposit due now: $${booking.deposit}
`.trim();

    // 3a) Email to CUSTOMER
    const customerSubject = `Your Asani Rentals reservation — ${vehicle.name}`;
    const customerHtml = `
      <div style="font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; padding: 16px; line-height: 1.5; color: #111827;">
        <h2 style="margin-bottom: 8px;">Thank you for booking with Asani Rentals, ${fullName}.</h2>
        <p>We received your reservation request and will confirm details shortly. Your estimated trip details are below.</p>
        <pre style="background:#F3F4F6;padding:12px;border-radius:8px;font-size:13px;white-space:pre-wrap;">${tripSummary}</pre>
        <p style="font-size:13px;color:#4B5563;">
          This email is a confirmation that we received your request. Your final rental agreement, fees, and any changes
          will be confirmed by an Asani Rentals representative.
        </p>
        <p style="margin-top:16px;font-size:13px;">
          If you have any questions, contact us at <a href="mailto:reserve@rentwithasani.com">reserve@rentwithasani.com</a>.
        </p>
        <p style="margin-top:16px;font-size:12px;color:#6B7280;">
          Asani Rentals<br/>
          1001 S Main #8227, Kalispell, MT 59901<br/>
          732-470-8233
        </p>
      </div>
    `;

    // 3b) Email to YOU (admin)
    const adminSubject = `New booking — ${vehicle.name} — ${fullName}`;
    const adminHtml = `
      <div style="font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; padding: 16px; line-height: 1.5; color: #111827;">
        <h2 style="margin-bottom: 8px;">New booking received via website</h2>
        <h3 style="margin: 12px 0 4px;">Customer</h3>
        <ul style="margin:0;padding-left:16px;font-size:13px;">
          <li><strong>Name:</strong> ${fullName}</li>
          <li><strong>Email:</strong> ${email}</li>
          <li><strong>Phone:</strong> ${phone || "—"}</li>
        </ul>
        <h3 style="margin: 12px 0 4px;">Trip details</h3>
        <pre style="background:#F3F4F6;padding:12px;border-radius:8px;font-size:13px;white-space:pre-wrap;">${tripSummary}</pre>
        <h3 style="margin: 12px 0 4px;">Raw extras payload</h3>
        <pre style="background:#F9FAFB;padding:12px;border-radius:8px;font-size:11px;white-space:pre-wrap;">${JSON.stringify(
          booking.extras || {},
          null,
          2
        )}</pre>
        ${
          profileError || bookingError
            ? `<p style="color:#B91C1C;font-size:12px;margin-top:12px;">
                 ⚠ Supabase error encountered while saving:
                 ${profileError ? `Profile: ${profileError.message || profileError}` : ""}
                 ${bookingError ? ` | Booking: ${bookingError.message || bookingError}` : ""}
               </p>`
            : ""
        }
      </div>
    `;

    // actually send emails
    const [customerEmailResult, adminEmailResult] = await Promise.all([
      resend.emails.send({
        from,
        to: email, // customer
        subject: customerSubject,
        html: customerHtml,
        reply_to: adminTo,
      }),
      resend.emails.send({
        from,
        to: adminTo,
        subject: adminSubject,
        html: adminHtml,
        reply_to: email,
      }),
    ]);

    if (customerEmailResult.error || adminEmailResult.error) {
      console.error("Resend customer error:", customerEmailResult.error);
      console.error("Resend admin error:", adminEmailResult.error);
      res.status(500).json({
        error: "Email send failed",
        details: {
          customer: customerEmailResult.error,
          admin: adminEmailResult.error,
          profileError,
          bookingError,
        },
      });
      return;
    }

    // All good
    res.status(200).json({
      ok: true,
      profileError,
      bookingError,
    });
  } catch (err) {
    console.error("Booking API unexpected error:", err);
    res.status(500).json({ error: "Unexpected server error", details: err });
  }
};
