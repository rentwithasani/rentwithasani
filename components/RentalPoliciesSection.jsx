import React from "react";

export const POLICY_URL = "https://rentwithasani.com/#/policies";

/**
 * Reusable, enforceable policy language (plain English, structured).
 * Use on Policies page, inside checkout (before payment), and in confirmation emails.
 */
export default function RentalPoliciesSection({ compact = false }) {
  const Section = ({ title, children }) => (
    <section className={compact ? "space-y-2" : "space-y-2"}>
      <h3 className="font-semibold text-zinc-900">{title}</h3>
      <div className="text-sm text-zinc-700 leading-relaxed space-y-2">{children}</div>
    </section>
  );

  return (
    <div className={compact ? "space-y-5" : "space-y-7"}>
      <Section title="Security deposit and authorization holds">
        <p>
          A refundable security deposit and/or an authorization hold may be required prior to vehicle release.
          Holds are placed on your payment method and are released after the vehicle is returned and the rental is closed.
          Your bank controls the posting timeline—holds typically clear within <b>5–7 business days</b> after return.
        </p>
        <p>
          We may increase the hold amount for high-risk reservations, extended rentals, delivery requests, young drivers,
          out-of-area travel, or if prior charges remain unpaid.
        </p>
      </Section>

      <Section title="Cancellation and no-show">
        <p>
          You may request cancellation through your profile. Cancellations are subject to approval and any posted terms at the time of booking.
          No-shows (failure to arrive at the scheduled pickup time without an approved change) may result in forfeiture of deposits and/or charges for reserved time.
        </p>
      </Section>

      <Section title="Late return and extensions">
        <p>
          Returns after the scheduled end time are considered late. Late returns may incur additional daily/partial-day charges,
          and we may recover loss of use if the late return impacts another reservation.
        </p>
        <p>
          Extensions must be requested <b>before</b> the scheduled return time and are not guaranteed. Approval depends on availability and verification.
        </p>
      </Section>

      <Section title="Fuel">
        <p>
          Vehicles must be returned at the same fuel level provided at pickup. If returned below the pickup level, a fuel charge will be applied,
          plus an administrative fee where permitted.
        </p>
      </Section>

      <Section title="Tolls, tickets, and violations">
        <p>
          You are responsible for all tolls, parking tickets, camera tickets, citations, impound/tow fees, and related charges incurred during the rental period,
          including any fees assessed after return. Administrative fees may apply for processing and dispute handling.
        </p>
      </Section>

      <Section title="Smoking and cleaning">
        <p>
          Smoking/vaping is prohibited in all vehicles. Excessive dirt, odor, pet hair, stains, or biohazards may trigger cleaning and remediation fees.
          Ozone treatment and loss-of-use may be charged if the vehicle must be removed from service.
        </p>
      </Section>

      <Section title="Damage, theft, and loss of use">
        <p>
          You are responsible for damage, theft, vandalism, missing items, and any related costs (repairs, towing, storage, diminished value),
          plus <b>loss of use</b> (downtime while the vehicle is unavailable), and administrative costs for claim handling.
        </p>
        <p>
          Failure to report incidents promptly or to cooperate (police report, photos, statements) may result in full financial responsibility.
        </p>
      </Section>

      <Section title="Additional drivers">
        <p>
          Only verified and approved drivers may operate the vehicle. Additional drivers must be disclosed and approved before driving.
          Unapproved drivers void coverage assumptions and may result in immediate termination of the rental and additional fees.
        </p>
      </Section>

      <Section title="Geographic restrictions">
        <p>
          Vehicles may not be taken outside approved geographic areas without written authorization. GPS or telematics may be used for recovery and safety.
          Unauthorized travel, border crossings, or restricted use may result in immediate termination and recovery charges.
        </p>
      </Section>

      <Section title="Payment disputes and chargebacks">
        <p>
          By booking, you authorize Asani Rentals to charge your payment method for the rental, deposits/holds, tolls/fees, damages, and approved adjustments.
          Disputed charges and chargebacks may trigger additional documentation, collections, and suspension of future rentals.
        </p>
      </Section>

      <div className="pt-4 border-t border-zinc-200 text-xs text-zinc-500">
        This summary is provided for clarity. Your booking is subject to verification, availability, and agreement terms at release.
      </div>
    </div>
  );
}
