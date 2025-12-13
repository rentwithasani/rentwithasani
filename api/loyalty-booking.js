// /api/loyalty-booking.js
// Adds points per booking and recalculates tier for a member.
// Requires SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY on the server.

const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

function calcTier(points = 0) {
  const p = Number(points) || 0;
  if (p >= 300) return 4;
  if (p >= 150) return 3;
  if (p >= 50) return 2;
  return 1;
}

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    if (!supabaseUrl || !serviceKey) {
      res.status(500).json({ error: "Missing Supabase server keys." });
      return;
    }

    const supabase = createClient(supabaseUrl, serviceKey);

    const { email, total, days } = req.body || {};
    if (!email) {
      res.status(400).json({ error: "Missing email." });
      return;
    }

    // Points per booking (simple + editable):
    // - 1 point minimum
    // - ~1 point per $50 of booking total
    const t = Number(total) || 0;
    const pointsEarned = Math.max(1, Math.round(t / 50));

    const { data: user, error: fetchErr } = await supabase
      .from("users")
      .select("email, points, tier")
      .eq("email", email)
      .maybeSingle();

    if (fetchErr) {
      console.error("loyalty fetch error", fetchErr);
      res.status(500).json({ error: "Could not load user." });
      return;
    }

    if (!user?.email) {
      // If the booking email isn't a member, just no-op
      res.status(200).json({ ok: true, member: false });
      return;
    }

    const currentPoints = Number(user.points || 0);
    const newPoints = currentPoints + pointsEarned;
    const newTier = calcTier(newPoints);

    const { error: updateErr } = await supabase
      .from("users")
      .update({ points: newPoints, tier: newTier })
      .eq("email", email);

    if (updateErr) {
      console.error("loyalty update error", updateErr);
      res.status(500).json({ error: "Could not update points." });
      return;
    }

    res.status(200).json({
      ok: true,
      member: true,
      pointsEarned,
      points: newPoints,
      tier: newTier,
      days: Number(days) || null,
    });
  } catch (e) {
    console.error("loyalty-booking error", e);
    res.status(500).json({ error: "Server error." });
  }
};
