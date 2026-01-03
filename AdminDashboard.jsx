import React, { useEffect, useMemo, useState } from "react";

export default function AdminDashboard({ supabase, vehicles, onBack }) {
  const [rows, setRows] = useState([]);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    setRows(
      (vehicles || []).map((v) => ({
        vehicle_id: v.id,
        name: v.name,
        category: v.category,
        current_price: v.pricePerDay,
        blocked: v.available === false,
        price_per_day_override: "",
        deposit_override: "",
      }))
    );
  }, [vehicles]);

  async function refreshOverrides() {
    setMsg("");
    try {
      if (!supabase) {
        setMsg("Supabase is not configured.");
        return;
      }
      const { data, error } = await supabase
        .from("vehicle_overrides")
        .select("vehicle_id, blocked, price_per_day_override, deposit_override");
      if (error) throw error;

      const map = {};
      (data || []).forEach((r) => (map[r.vehicle_id] = r));

      setRows((prev) =>
        prev.map((x) => {
          const o = map[x.vehicle_id];
          if (!o) return x;
          return {
            ...x,
            blocked: !!o.blocked,
            price_per_day_override:
              o.price_per_day_override == null ? "" : String(o.price_per_day_override),
            deposit_override: o.deposit_override == null ? "" : String(o.deposit_override),
          };
        })
      );
    } catch (e) {
      setMsg("Could not load overrides. Confirm Supabase SQL + RLS are set.");
    }
  }

  useEffect(() => {
    refreshOverrides();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function saveRow(r) {
    setSaving(true);
    setMsg("");
    try {
      if (!supabase) throw new Error("Supabase not configured");
      const payload = {
        vehicle_id: r.vehicle_id,
        blocked: !!r.blocked,
        price_per_day_override:
          r.price_per_day_override === "" ? null : Number(r.price_per_day_override),
        deposit_override: r.deposit_override === "" ? null : Number(r.deposit_override),
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase.from("vehicle_overrides").upsert(payload, {
        onConflict: "vehicle_id",
      });
      if (error) throw error;
      setMsg("Saved.");
    } catch (e) {
      setMsg("Save failed. Ensure your email is in admin_allowlist.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex items-end justify-between gap-4">
        <div>
          <div className="text-2xl font-semibold tracking-tight text-zinc-900">
            Admin Dashboard
          </div>
          <div className="mt-1 text-sm text-zinc-600">
            Block cars, adjust pricing, override deposits.
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onBack}
            className="rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-800 hover:bg-zinc-50"
          >
            Back
          </button>
          <button
            type="button"
            onClick={refreshOverrides}
            className="rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-800 hover:bg-zinc-50"
          >
            Refresh
          </button>
        </div>
      </div>

      {msg ? (
        <div className="mt-4 rounded-2xl border border-zinc-200 bg-white p-3 text-sm text-zinc-700">
          {msg}
        </div>
      ) : null}

      <div className="mt-6 overflow-hidden rounded-3xl border border-zinc-200 bg-white">
        <div className="grid grid-cols-12 gap-2 border-b border-zinc-200 bg-zinc-50 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-zinc-600">
          <div className="col-span-4">Vehicle</div>
          <div className="col-span-2">Current $/day</div>
          <div className="col-span-2">Override $/day</div>
          <div className="col-span-2">Deposit override</div>
          <div className="col-span-1">Blocked</div>
          <div className="col-span-1 text-right">Save</div>
        </div>

        {rows.map((r) => (
          <div
            key={r.vehicle_id}
            className="grid grid-cols-12 items-center gap-2 px-4 py-3 text-sm border-b border-zinc-100"
          >
            <div className="col-span-4">
              <div className="font-semibold text-zinc-900">{r.name}</div>
              <div className="text-xs text-zinc-500">
                {r.vehicle_id} • {r.category}
              </div>
            </div>
            <div className="col-span-2 text-zinc-800">${r.current_price}</div>
            <div className="col-span-2">
              <input
                value={r.price_per_day_override}
                onChange={(e) =>
                  setRows((prev) =>
                    prev.map((x) =>
                      x.vehicle_id === r.vehicle_id
                        ? { ...x, price_per_day_override: e.target.value }
                        : x
                    )
                  )
                }
                placeholder="(none)"
                className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm"
              />
            </div>
            <div className="col-span-2">
              <input
                value={r.deposit_override}
                onChange={(e) =>
                  setRows((prev) =>
                    prev.map((x) =>
                      x.vehicle_id === r.vehicle_id
                        ? { ...x, deposit_override: e.target.value }
                        : x
                    )
                  )
                }
                placeholder="(none)"
                className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm"
              />
            </div>
            <div className="col-span-1">
              <input
                type="checkbox"
                checked={!!r.blocked}
                onChange={(e) =>
                  setRows((prev) =>
                    prev.map((x) =>
                      x.vehicle_id === r.vehicle_id ? { ...x, blocked: e.target.checked } : x
                    )
                  )
                }
              />
            </div>
            <div className="col-span-1 text-right">
              <button
                type="button"
                disabled={saving}
                onClick={() => saveRow(r)}
                className="rounded-full border border-zinc-200 bg-white px-3 py-2 text-xs font-semibold text-zinc-800 hover:bg-zinc-50 disabled:opacity-50"
              >
                Save
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
