import React from "react";
import RentalPoliciesSection from "./components/RentalPoliciesSection";

export default function PoliciesPage({ setRoute }) {
  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 py-10">
      <div className="flex items-center justify-between gap-4 mb-6">
        <h2 className="text-2xl font-bold text-zinc-900">Rental Policies</h2>
        <button
          type="button"
          onClick={() => (setRoute ? setRoute("home") : null)}
          className="text-sm underline text-zinc-700"
        >
          Back
        </button>
      </div>

      <div className="bg-white border border-zinc-200 rounded-2xl p-6 md:p-8">
        <div className="text-sm text-zinc-700 leading-relaxed space-y-2 mb-8">
          <p>
            These policies are binding and are referenced during booking. By reserving a vehicle,
            you acknowledge you have read and agree to these terms.
          </p>
        </div>

        <RentalPoliciesSection />
      </div>
    </div>
  );
}
