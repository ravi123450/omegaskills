import React from "react";
import LegalLayout, { SectionTitle } from "./LegalLayout";
import { FileText } from "lucide-react";


export default function RefundPolicy() {
  return (
    <LegalLayout title="Refund Policy" icon={<FileText className="h-5 w-5" />}>
      <SectionTitle eyebrow="Scope">Applies to purchases on our site</SectionTitle>
      <p className="mt-4 text-slate-300/90">
        This policy applies to purchases made directly on <strong>omegaskillsacademy.online</strong>.
        We aim to be fair while ensuring cohort quality and seat planning.
      </p>


      <SectionTitle eyebrow="Live">Live Cohorts / Instructor-Led Programs</SectionTitle>
      <ul className="mt-4 list-disc pl-6 text-slate-300/90 space-y-2">
        <li><strong>Cooling-off:</strong> Full refund within <strong>7 days</strong> of purchase if you haven’t attended the first live session.</li>
        <li><strong>After first session (within week 1):</strong> 80% refund or 100% credit toward a future batch.</li>
        <li><strong>After week 1:</strong> No cash refunds; partial credit (e.g., 50%) may be offered at our discretion.</li>
        <li><strong>Omega cancels before start:</strong> choose full refund or transfer to next batch.</li>
      </ul>


      <SectionTitle eyebrow="Digital">Self-Paced Courses / Digital Downloads</SectionTitle>
      <p className="mt-4 text-slate-300/90">
        Due to the nature of digital goods, <strong>all sales are final</strong> once access/download is granted.
        For access issues, contact support within 72 hours.
      </p>


      <SectionTitle eyebrow="Events">Workshops / Events</SectionTitle>
      <ul className="mt-4 list-disc pl-6 text-slate-300/90 space-y-2">
        <li>Refunds up to <strong>48 hours</strong> before start (minus gateway fees).</li>
        <li>Within 48 hours, transfers to a future event may be allowed subject to seat availability.</li>
      </ul>


      <SectionTitle eyebrow="Vouchers">Certification Concierge / Exam Vouchers</SectionTitle>
      <p className="mt-4 text-slate-300/90">
        Exam vouchers & third-party fees are <strong>non-refundable</strong> once issued.
        Rescheduling follows vendor policy. Concierge fee refundable only if we fail to deliver agreed scope.
      </p>


      <SectionTitle eyebrow="How to">How to request a refund</SectionTitle>
      <p className="mt-4 text-slate-300/90">
        Email <a className="text-orange-300 hover:text-orange-200" href="mailto:support@omegaskillsacademy.online">support@omegaskillsacademy.online</a> with order ID, product name, and reason.
        Approved refunds are processed to the original payment method within 7–10 business days (bank timelines vary).
        Gateway/FX fees are non-refundable.
      </p>


      <SectionTitle eyebrow="Conduct">Code of conduct & abuse</SectionTitle>
      <p className="mt-4 text-slate-300/90">No-shows and policy abuse may lead to denial of refunds and/or account action.</p>
    </LegalLayout>
  );
}





