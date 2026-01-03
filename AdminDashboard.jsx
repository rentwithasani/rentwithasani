import React, { useEffect, useMemo, useState } from "react";

function TabButton({ active, children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        "rounded-full px-4 py-2 text-sm font-semibold border " +
        (active
          ? "border-black bg-black text-white"
          : "border-zinc-200 bg-white text-zinc-800 hover:bg-zinc-50")
      }
    >
      {children}
    </button>
  );
}

export default function AdminDashboard({
  supabase,
  vehicles,
  vehicleBlocks,
  setVehicleBlocks,
  onBack,
}) {
  const [tab, setTab] = useState("vehicles");
  const [msg, setMsg] = useState("");
    const [adminEmail, setAdminEmail] = useState("");

    async function logAdminAction(action, details) {
      try {
        if (!supabase) return;
        await supabase.from("admin_audit").insert({ action, details: details || null });
      } catch {
        // non-blocking
      }
    }


  // -------- VEHICLE OVERRIDES --------
  const [vrows, setVrows] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
      (async () => {
        try {
          if (!supabase) return;
          const { data } = await supabase.auth.getSession();
          setAdminEmail(data?.session?.user?.email || "");
        } catch {}
      })();

    setVrows(
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
      const { data, error } = await supabase
        .from("vehicle_overrides")
        .select("vehicle_id, blocked, price_per_day_override, deposit_override");
      if (error) throw error;
      const map = {};
      (data || []).forEach((r) => (map[r.vehicle_id] = r));
      setVrows((prev) =>
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
      setMsg("Overrides loaded.");
    } catch {
      setMsg("Could not load overrides. Confirm Supabase SQL + RLS.");
    }
  }

  async function saveOverrideRow(r) {
    setSaving(true);
    setMsg("");
    try {
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
        logAdminAction('vehicle_override_upsert', { vehicle_id: r.vehicle_id, blocked: !!r.blocked, price_per_day_override: payload.price_per_day_override, deposit_override: payload.deposit_override });
    } catch {
      setMsg("Save failed. Ensure your email is allowlisted in admin_allowlist.");
    } finally {
      setSaving(false);
    }
  }

  // -------- BLOCK DATES --------
  const [blockVehicleId, setBlockVehicleId] = useState("");
  const [blockStart, setBlockStart] = useState("");
  const [blockEnd, setBlockEnd] = useState("");
  const [blockReason, setBlockReason] = useState("");

  async function refreshBlocks() {
    setMsg("");
    try {
      const { data, error } = await supabase
        .from("vehicle_blocks")
        .select("id, vehicle_id, start_date, end_date, reason, created_at")
        .order("created_at", { ascending: false });
      if (error) throw error;
      setVehicleBlocks(Array.isArray(data) ? data : []);
      setMsg("Blocks loaded.");
    } catch {
      setMsg("Could not load blocks. Confirm vehicle_blocks table exists.");
    }
  }

  async function addBlock() {
    setMsg("");
    try {
      if (!blockVehicleId || !blockStart || !blockEnd) {
        setMsg("Select vehicle and start/end dates.");
        return;
      }
      const payload = {
        vehicle_id: blockVehicleId,
        start_date: blockStart,
        end_date: blockEnd,
        reason: blockReason || null,
      };
      const { error } = await supabase.from("vehicle_blocks").insert(payload);
      if (error) throw error;
      setBlockStart("");
      setBlockEnd("");
      setBlockReason("");
      await refreshBlocks();
      setMsg("Block created.");
        logAdminAction('vehicle_block_create', { vehicle_id: blockVehicleId, start_date: blockStart, end_date: blockEnd, reason: blockReason || null });
    } catch {
      setMsg("Failed to create block. Ensure you have admin write access.");
    }
  }

  async function deleteBlock(id) {
    setMsg("");
    try {
      const { error } = await supabase.from("vehicle_blocks").delete().eq("id", id);
      if (error) throw error;
      await refreshBlocks();
      setMsg("Block removed.");
        logAdminAction('vehicle_block_delete', { block_id: id });
    } catch {
      setMsg("Failed to delete block.");
    }
  }

  // -------- USERS (DISABLE / TIER) --------
  const [users, setUsers] = useState([]);
  const [userSearch, setUserSearch] = useState("");

  async function refreshUsers() {
    setMsg("");
    try {
      const { data, error } = await supabase
        .from("users")
        .select("id, email, full_name, created_at, disabled, tier, total_rentals")
        .order("created_at", { ascending: false })
        .limit(200);
      if (error) throw error;
      setUsers(Array.isArray(data) ? data : []);
      setMsg("Users loaded.");
    } catch {
      setMsg("Could not load users. Confirm users table + columns exist.");
    }
  }

  async function setUserDisabled(email, disabled) {
    setMsg("");
    try {
      const { error } = await supabase
        .from("users")
        .update({ disabled })
        .eq("email", email);
      if (error) throw error;
      await refreshUsers();
      setMsg(disabled ? "User disabled." : "User enabled.");
        logAdminAction('user_disabled_update', { email, disabled });
    } catch {
      setMsg("Failed to update user. Ensure admin RLS for users_admin_write exists.");
    }
  }

  async function setUserTier(email, tier) {
    setMsg("");
    try {
      const { error } = await supabase.from("users").update({ tier }).eq("email", email);
      if (error) throw error;
      await refreshUsers();
      setMsg("Tier updated.");
        logAdminAction('user_tier_update', { email, tier });
    } catch {
      setMsg("Failed to update tier.");
    }
  }

  // -------- CHARGES (ADD/VIEW) --------
  const [bookings, setBookings] = useState([]);
  const [selectedBookingId, setSelectedBookingId] = useState("");
  const [chargeAmount, setChargeAmount] = useState("");
  const [chargeDesc, setChargeDesc] = useState("");
  const [chargeItems, setChargeItems] = useState([]);

  async function refreshBookings() {
    setMsg("");
    try {
      const { data, error } = await supabase
        .from("bookings")
        .select("id, reservation_id, vehicle_name, start_date, end_date, customer_email, total")
        .order("created_at", { ascending: false })
        .limit(150);
      if (error) throw error;
      setBookings(Array.isArray(data) ? data : []);
      setMsg("Bookings loaded.");
    } catch {
      setMsg("Could not load bookings.");
    }
  }

  async function loadCharges(bookingId) {
    try {
      const { data, error } = await supabase
        .from("booking_charges")
        .select("id, booking_id, amount, description, created_at")
        .eq("booking_id", bookingId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      setChargeItems(Array.isArray(data) ? data : []);
    } catch {
      setChargeItems([]);
    }
  }

  async function addCharge() {
    setMsg("");
    try {
      if (!selectedBookingId) {
        setMsg("Select a booking.");
        return;
      }
      const amt = Number(chargeAmount);
      if (!amt || amt <= 0) {
        setMsg("Enter a valid amount.");
        return;
      }
      const { error } = await supabase.from("booking_charges").insert({
        booking_id: selectedBookingId,
        amount: amt,
        description: chargeDesc || "Additional charge",
      });
      if (error) throw error;
      setChargeAmount("");
      setChargeDesc("");
      await loadCharges(selectedBookingId);
      setMsg("Charge added.");
        logAdminAction('booking_charge_add', { booking_id: selectedBookingId, amount: amt, description: chargeDesc || 'Additional charge' });
    } catch {
      setMsg("Failed to add charge. Confirm booking_charges RLS.");
    }
  }

  async function deleteCharge(id) {
    setMsg("");
    try {
      const { error } = await supabase.from("booking_charges").delete().eq("id", id);
      if (error) throw error;
      await loadCharges(selectedBookingId);
      setMsg("Charge removed.");
        logAdminAction('booking_charge_delete', { charge_id: id, booking_id: selectedBookingId });
    } catch {
      setMsg("Failed to remove charge.");
    }
  }

  // Initial loads when switching tabs
  useEffect(() => {
    if (!supabase) return;
    if (tab === "vehicles") refreshOverrides();
    if (tab === "blocks") refreshBlocks();
    if (tab === "users") refreshUsers();
    if (tab === "charges") refreshBookings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  const filteredUsers = useMemo(() => {
    const q = userSearch.trim().toLowerCase();
    if (!q) return users;
    return users.filter((u) =>
      String(u.email || "").toLowerCase().includes(q) ||
      String(u.full_name || "").toLowerCase().includes(q)
    );
  }, [users, userSearch]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex items-end justify-between gap-4">
        <div>
          <div className="text-2xl font-semibold tracking-tight text-zinc-900">
            Admin Dashboard
          </div>
          <div className="mt-1 text-sm text-zinc-600">
            Operations controls: block cars, pricing, users, charges, blocked dates.
          </div>
        </div>
        <button
          type="button"
          onClick={onBack}
          className="rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-800 hover:bg-zinc-50"
        >
          Back
        </button>
      </div>

      {/* ADMIN_VERIFIED_PANEL */}
<div className="mt-4 rounded-3xl border border-zinc-200 bg-white p-4">
  <div className="text-sm font-semibold text-zinc-900">Admin Verified</div>
  <div className="mt-1 text-xs text-zinc-600">
    Signed in as <span className="font-semibold">{adminEmail || "—"}</span>
  </div>
  <div className="mt-2 text-xs text-zinc-600">
    This panel confirms admin detection live (email + session present).
  </div>
</div>

        <div className="mt-6 flex flex-wrap gap-2">
        <TabButton active={tab === "vehicles"} onClick={() => setTab("vehicles")}>
          Vehicles
        </TabButton>
        <TabButton active={tab === "blocks"} onClick={() => setTab("blocks")}>
          Block Dates
        </TabButton>
        <TabButton active={tab === "users"} onClick={() => setTab("users")}>
          Users
        </TabButton>
        <TabButton active={tab === "charges"} onClick={() => setTab("charges")}>
          Charges
        </TabButton>
      </div>

      {msg ? (
        <div className="mt-4 rounded-2xl border border-zinc-200 bg-white p-3 text-sm text-zinc-700">
          {msg}
        </div>
      ) : null}

      {/* VEHICLES */}
      {tab === "vehicles" ? (
        <div className="mt-6 overflow-hidden rounded-3xl border border-zinc-200 bg-white">
          <div className="grid grid-cols-12 gap-2 border-b border-zinc-200 bg-zinc-50 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-zinc-600">
            <div className="col-span-4">Vehicle</div>
            <div className="col-span-2">Current $/day</div>
            <div className="col-span-2">Override $/day</div>
            <div className="col-span-2">Deposit override</div>
            <div className="col-span-1">Blocked</div>
            <div className="col-span-1 text-right">Save</div>
          </div>

          {vrows.map((r) => (
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
                    setVrows((prev) =>
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
                    setVrows((prev) =>
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
                    setVrows((prev) =>
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
                  onClick={() => saveOverrideRow(r)}
                  className="rounded-full border border-zinc-200 bg-white px-3 py-2 text-xs font-semibold text-zinc-800 hover:bg-zinc-50 disabled:opacity-50"
                >
                  Save
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {/* BLOCK DATES */}
      {tab === "blocks" ? (
        <div className="mt-6 grid gap-4">
          <div className="rounded-3xl border border-zinc-200 bg-white p-5">
            <div className="text-sm font-semibold text-zinc-900">Create block</div>
            <div className="mt-3 grid gap-3 md:grid-cols-4">
              <select
                className="rounded-2xl border border-zinc-200 bg-white px-3 py-2 text-sm"
                value={blockVehicleId}
                onChange={(e) => setBlockVehicleId(e.target.value)}
              >
                <option value="">Select vehicle…</option>
                {(vehicles || []).map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name}
                  </option>
                ))}
              </select>
              <input
                type="date"
                value={blockStart}
                onChange={(e) => setBlockStart(e.target.value)}
                className="rounded-2xl border border-zinc-200 bg-white px-3 py-2 text-sm"
              />
              <input
                type="date"
                value={blockEnd}
                onChange={(e) => setBlockEnd(e.target.value)}
                className="rounded-2xl border border-zinc-200 bg-white px-3 py-2 text-sm"
              />
              <input
                value={blockReason}
                onChange={(e) => setBlockReason(e.target.value)}
                placeholder="Reason (optional)"
                className="rounded-2xl border border-zinc-200 bg-white px-3 py-2 text-sm"
              />
            </div>
            <div className="mt-3">
              <button
                type="button"
                onClick={addBlock}
                className="rounded-full border border-black bg-black px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-900"
              >
                Add block
              </button>
              <button
                type="button"
                onClick={refreshBlocks}
                className="ml-2 rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-800 hover:bg-zinc-50"
              >
                Refresh
              </button>
            </div>
          </div>

          <div className="overflow-hidden rounded-3xl border border-zinc-200 bg-white">
            <div className="border-b border-zinc-200 bg-zinc-50 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-zinc-600">
              Current blocks
            </div>
            {(vehicleBlocks || []).length === 0 ? (
              <div className="p-5 text-sm text-zinc-600">No blocks yet.</div>
            ) : (
              (vehicleBlocks || []).map((b) => (
                <div key={b.id} className="flex items-center justify-between gap-3 border-b border-zinc-100 p-4">
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-zinc-900">
                      {(vehicles || []).find((v) => v.id === b.vehicle_id)?.name || b.vehicle_id}
                    </div>
                    <div className="text-xs text-zinc-600">
                      {b.start_date} → {b.end_date}{b.reason ? ` • ${b.reason}` : ""}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => deleteBlock(b.id)}
                    className="rounded-full border border-zinc-200 bg-white px-3 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-50"
                  >
                    Remove
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      ) : null}

      {/* USERS */}
      {tab === "users" ? (
        <div className="mt-6 rounded-3xl border border-zinc-200 bg-white p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-sm font-semibold text-zinc-900">Users</div>
              <div className="text-xs text-zinc-500">Disable/enable accounts and set tier.</div>
            </div>
            <div className="flex items-center gap-2">
              <input
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder="Search email/name"
                className="rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm"
              />
              <button
                type="button"
                onClick={refreshUsers}
                className="rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-800 hover:bg-zinc-50"
              >
                Refresh
              </button>
            </div>
          </div>

          <div className="mt-4 overflow-hidden rounded-2xl border border-zinc-200">
            {filteredUsers.length === 0 ? (
              <div className="p-4 text-sm text-zinc-600">No users found.</div>
            ) : (
              filteredUsers.map((u) => (
                <div key={u.id || u.email} className="grid grid-cols-12 items-center gap-2 border-b border-zinc-100 p-3 text-sm">
                  <div className="col-span-5 min-w-0">
                    <div className="font-semibold text-zinc-900 truncate">{u.email}</div>
                    <div className="text-xs text-zinc-600 truncate">{u.full_name || ""}</div>
                  </div>
                  <div className="col-span-2 text-xs text-zinc-600">
                    Tier: <b>{u.tier || "Silver"}</b>
                  </div>
                  <div className="col-span-2 text-xs text-zinc-600">
                    Rentals: <b>{u.total_rentals || 0}</b>
                  </div>
                  <div className="col-span-1 text-xs">
                    {u.disabled ? (
                      <span className="rounded-full bg-red-50 px-2 py-1 text-red-700 border border-red-200">Disabled</span>
                    ) : (
                      <span className="rounded-full bg-emerald-50 px-2 py-1 text-emerald-700 border border-emerald-200">Active</span>
                    )}
                  </div>
                  <div className="col-span-2 flex items-center justify-end gap-2">
                    <select
                      className="rounded-full border border-zinc-200 bg-white px-3 py-2 text-xs"
                      value={u.tier || "Silver"}
                      onChange={(e) => setUserTier(u.email, e.target.value)}
                    >
                      <option>Silver</option>
                      <option>Gold</option>
                      <option>Platinum</option>
                    </select>
                    {u.disabled ? (
                      <button
                        type="button"
                        onClick={() => setUserDisabled(u.email, false)}
                        className="rounded-full border border-zinc-200 bg-white px-3 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-50"
                      >
                        Enable
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setUserDisabled(u.email, true)}
                        className="rounded-full border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-100"
                      >
                        Disable
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      ) : null}

      {/* CHARGES */}
      {tab === "charges" ? (
        <div className="mt-6 grid gap-4">
          <div className="rounded-3xl border border-zinc-200 bg-white p-5">
            <div className="text-sm font-semibold text-zinc-900">Add charge to booking</div>
            <div className="mt-3 grid gap-3 md:grid-cols-4">
              <select
                className="rounded-2xl border border-zinc-200 bg-white px-3 py-2 text-sm"
                value={selectedBookingId}
                onChange={async (e) => {
                  const id = e.target.value;
                  setSelectedBookingId(id);
                  if (id) await loadCharges(id);
                }}
              >
                <option value="">Select booking…</option>
                {bookings.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.reservation_id || b.id} • {b.vehicle_name} • {b.customer_email}
                  </option>
                ))}
              </select>
              <input
                value={chargeAmount}
                onChange={(e) => setChargeAmount(e.target.value)}
                placeholder="Amount"
                className="rounded-2xl border border-zinc-200 bg-white px-3 py-2 text-sm"
              />
              <input
                value={chargeDesc}
                onChange={(e) => setChargeDesc(e.target.value)}
                placeholder="Description"
                className="rounded-2xl border border-zinc-200 bg-white px-3 py-2 text-sm"
              />
              <button
                type="button"
                onClick={addCharge}
                className="rounded-full border border-black bg-black px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-900"
              >
                Add
              </button>
            </div>
            <div className="mt-3">
              <button
                type="button"
                onClick={refreshBookings}
                className="rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-800 hover:bg-zinc-50"
              >
                Refresh bookings
              </button>
            </div>
          </div>

          <div className="overflow-hidden rounded-3xl border border-zinc-200 bg-white">
            <div className="border-b border-zinc-200 bg-zinc-50 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-zinc-600">
              Charges for selected booking
            </div>
            {!selectedBookingId ? (
              <div className="p-5 text-sm text-zinc-600">Select a booking to view charges.</div>
            ) : chargeItems.length === 0 ? (
              <div className="p-5 text-sm text-zinc-600">No charges yet.</div>
            ) : (
              chargeItems.map((c) => (
                <div key={c.id} className="flex items-center justify-between gap-3 border-b border-zinc-100 p-4">
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-zinc-900">${c.amount}</div>
                    <div className="text-xs text-zinc-600">
                      {c.description} • {new Date(c.created_at).toLocaleString()}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => deleteCharge(c.id)}
                    className="rounded-full border border-zinc-200 bg-white px-3 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-50"
                  >
                    Remove
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
