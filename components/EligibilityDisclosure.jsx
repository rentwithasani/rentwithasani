import React from "react";

export default function EligibilityDisclosure() {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 md:p-6">
      <h3 className="text-sm font-semibold text-zinc-900">Eligibility and identity disclosure</h3>
      <div className="mt-2 text-sm text-zinc-700 space-y-2 leading-relaxed">
        <p><b>Minimum age:</b> You must be at least <b>21</b> to rent (some vehicles may require 25+).</p>
        <p><b>License requirements:</b> A valid, non-expired driver’s license is required. We may request additional identity verification.</p>
        <p><b>Insurance requirement:</b> You must carry valid auto insurance that transfers to rental vehicles, or purchase/accept an approved protection option if offered.</p>
        <p><b>Additional drivers:</b> Only drivers disclosed and approved before driving may operate the vehicle.</p>
      </div>
    </div>
  );
}
