import React from "react";

export default function IncidentInstructions({ compact = false }) {
  return (
    <div className={compact ? "text-sm text-zinc-700 space-y-2" : "rounded-2xl border border-zinc-200 bg-white p-5 md:p-6 text-sm text-zinc-700 space-y-3"}>
      {!compact && <h3 className="text-sm font-semibold text-zinc-900">Incident and claims process</h3>}
      <div className="space-y-2 leading-relaxed">
        <p><b>If there is an accident, damage, theft, or vandalism:</b> ensure everyone is safe and call emergency services if needed.</p>
        <p><b>Report timeline:</b> notify Asani Rentals immediately and no later than <b>2 hours</b> after the incident (or as soon as safely possible).</p>
        <p><b>Required documentation:</b> photos/video of the scene and vehicle, other party information, witness info, and a police report for accidents/theft/vandalism.</p>
        <p><b>If not reported:</b> failure to report promptly or provide documentation may result in full renter responsibility, loss of protection eligibility, and additional fees.</p>
      </div>
    </div>
  );
}
