// /api/damage-upload.js
// Optional: uploads damage photos to Supabase Storage (if configured) and notifies internal email.
// Requires env: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, and bucket "damage-photos" to exist.

const formidable = require("formidable");
const fs = require("fs");
const path = require("path");
const { Resend } = require("resend");
const resend = new Resend(process.env.RESEND_API_KEY);

let supabase = null;
try {
  const { createClient } = require("@supabase/supabase-js");
  if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
  }
} catch (e) {
  // supabase optional
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).send("Method not allowed");

  const form = formidable({ multiples: true, keepExtensions: true });

  form.parse(req, async (err, fields, files) => {
    try {
      if (err) return res.status(400).send("Upload parse error");
      const reservationId = String(fields.reservationId || "").trim();
      if (!reservationId) return res.status(400).send("Missing reservationId");

      const uploaded = [];
      const now = new Date().toISOString();

      const fileList = []
        .concat(files.files || [])
        .filter(Boolean);

      for (const f of fileList) {
        const filepath = f.filepath || f.path;
        const original = f.originalFilename || f.name || "photo.jpg";
        const storagePath = `${reservationId}/${now}-${original}`.replace(/\s+/g, "_");

        if (supabase) {
          const buf = fs.readFileSync(filepath);
          const { data, error } = await supabase.storage
            .from("damage-photos")
            .upload(storagePath, buf, { contentType: f.mimetype || "image/jpeg", upsert: true });

          if (error) throw error;

          const { data: pub } = supabase.storage.from("damage-photos").getPublicUrl(storagePath);
          uploaded.push({ storagePath, publicUrl: pub?.publicUrl });
        } else {
          // No storage configured — still record filenames
          uploaded.push({ storagePath, publicUrl: null });
        }
      }

      if (process.env.INTERNAL_NOTIFY_EMAIL) {
        const html = `
          <div style="font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.55; color: #111827;">
            <h1 style="font-size: 18px; font-weight: 700;">Damage photos uploaded</h1>
            <p style="font-size: 14px;">Reservation ID: <b>${reservationId}</b></p>
            <p style="font-size: 14px;">Timestamp: <b>${now}</b></p>
            <ul style="font-size: 14px;">
              ${uploaded.map(u => `<li>${u.publicUrl ? `<a href="${u.publicUrl}">${u.storagePath}</a>` : u.storagePath}</li>`).join("")}
            </ul>
          </div>
        `;
        await resend.emails.send({
          from: "reserve@rentwithasani.com",
          to: process.env.INTERNAL_NOTIFY_EMAIL,
          subject: `[Damage Upload] ${reservationId}`,
          html,
        });
      }

      return res.status(200).json({ ok: true, uploaded });
    } catch (e) {
      console.error("Damage upload error:", e);
      return res.status(500).send("Server error");
    }
  });
};

// Vercel / Node: disable default body parser
module.exports.config = {
  api: { bodyParser: false },
};
