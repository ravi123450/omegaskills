import React from "react";
import LegalLayout, { SectionTitle } from "./LegalLayout";
import { ScrollText } from "lucide-react";


export default function TermsAndConditions() {
  return (
    <LegalLayout title="Terms & Conditions" icon={<ScrollText className="h-5 w-5" />}>
      <SectionTitle eyebrow="Overview">Agreement to Terms</SectionTitle>
      <p className="mt-4 text-slate-300/90">
        These Terms govern your use of the services provided by <strong>Omega Skills Academy</strong>
        (“Omega”, “we”, “us”, “our”). By accessing or using our website, apps, and related services
        (the “Services”), you agree to be bound by these Terms.
      </p>


      <SectionTitle eyebrow="Eligibility">Accounts & Use</SectionTitle>
      <ul className="mt-4 list-disc pl-6 text-slate-300/90 space-y-2">
        <li>You must be at least <strong>13 years</strong> old to create an account.</li>
        <li>You’re responsible for all activity under your account; keep credentials confidential.</li>
        <li>Provide accurate information and keep it updated.</li>
      </ul>


      <SectionTitle eyebrow="Programs">Programs & Digital Products</SectionTitle>
      <ul className="mt-4 list-disc pl-6 text-slate-300/90 space-y-2">
        <li>Program details (curriculum, schedule, mentors) may be updated to improve outcomes.</li>
        <li>Default access window to recordings/self-paced content: <strong>6 months</strong> (unless stated).</li>
        <li>Sessions may be rescheduled with reasonable notice; alternatives include recordings or make-up classes.</li>
      </ul>


      <SectionTitle eyebrow="Billing">Payments, Pricing & Taxes</SectionTitle>
      <ul className="mt-4 list-disc pl-6 text-slate-300/90 space-y-2">
        <li>Prices in INR/AUD as indicated; taxes as shown. Invoices go to your billing email.</li>
        <li>Payments are processed by our partners (e.g., Razorpay/Stripe). We don’t store full card details.</li>
        <li>Discounts/coupons are time-bound and non-transferable.</li>
      </ul>


      <SectionTitle eyebrow="Fair Use">Acceptable Use</SectionTitle>
      <ul className="mt-4 list-disc pl-6 text-slate-300/90 space-y-2">
        <li>No sharing accounts or redistributing content outside personal educational use.</li>
        <li>No unlawful/abusive content or attempts to disrupt the Services.</li>
        <li>Scraping/bots require prior written consent.</li>
      </ul>


      <SectionTitle eyebrow="IP">Intellectual Property</SectionTitle>
      <p className="mt-4 text-slate-300/90">
        All content (videos, PDFs, question banks, code, templates, logos) is owned by Omega or its
        licensors. Enrollment grants a <strong>limited, non-exclusive, non-transferable</strong> license for
        personal educational use only. No commercial use without written permission.
      </p>


      <SectionTitle eyebrow="Outcomes">Certificates & Results</SectionTitle>
      <p className="mt-4 text-slate-300/90">
        We do not guarantee job placement, certification results, or specific outcomes.
      </p>


      <SectionTitle eyebrow="Links">Third-Party Links & Tools</SectionTitle>
      <p className="mt-4 text-slate-300/90">
        We’re not responsible for third-party content, availability, or policies.
      </p>


      <SectionTitle eyebrow="Refunds">Cancellations & Refunds</SectionTitle>
      <p className="mt-4 text-slate-300/90">
        Refunds are governed by our <a className="text-orange-300 hover:text-orange-200" href="/legal/refund-policy">Refund Policy</a>.
      </p>


      <SectionTitle eyebrow="Breach">Termination</SectionTitle>
      <p className="mt-4 text-slate-300/90">
        We may suspend or terminate access for material breach (e.g., plagiarism, harassment, payment fraud). Outstanding fees remain payable.
      </p>


      <SectionTitle eyebrow="Liability">Limitation of Liability</SectionTitle>
      <p className="mt-4 text-slate-300/90">
        To the fullest extent permitted by law, we’re not liable for indirect, incidental, special, or consequential
        damages. Aggregate liability won’t exceed fees you paid for the affected service in the preceding 6 months.
      </p>


      <SectionTitle eyebrow="Indemnity">Your Responsibility</SectionTitle>
      <p className="mt-4 text-slate-300/90">
        You agree to indemnify and hold Omega and its affiliates harmless from claims arising from your misuse of the Services or violation of these Terms.
      </p>


      <SectionTitle eyebrow="Law">Governing Law & Disputes</SectionTitle>
      <p className="mt-4 text-slate-300/90">
        Indian law applies. Courts at <strong>[Your City, State]</strong> have exclusive jurisdiction.
      </p>
    </LegalLayout>
  );
}





