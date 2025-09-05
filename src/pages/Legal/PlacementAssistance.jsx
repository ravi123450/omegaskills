import React from "react";
import LegalLayout, { SectionTitle } from "./LegalLayout";
import { Handshake } from "lucide-react";


export default function PlacementAssistance() {
  return (
    <LegalLayout title="Placement-Assistance Policy" icon={<Handshake className="h-5 w-5" />}>
      <SectionTitle eyebrow="Promise">What we offer</SectionTitle>
      <p className="mt-4 text-slate-300/90">
        Omega provides <strong>placement assistance</strong>—not guaranteed placement. Our goal is to enhance your job readiness and visibility.
      </p>


      <SectionTitle eyebrow="Scope">Scope of assistance</SectionTitle>
      <ul className="mt-4 list-disc pl-6 text-slate-300/90 space-y-2">
        <li>Resume building & ATS optimization (templates, score feedback).</li>
        <li>Mock interviews and interview-prep resources.</li>
        <li>Industry workshops, career counselling, and networking.</li>
        <li>Referrals to partner companies when opportunities are available.</li>
      </ul>


      <SectionTitle eyebrow="Your role">Student responsibilities</SectionTitle>
      <ul className="mt-4 list-disc pl-6 text-slate-300/90 space-y-2">
        <li>Active participation; complete projects; follow mentor feedback.</li>
        <li>Provide accurate information; keep your profile updated.</li>
        <li>Attend interviews on time; communicate promptly for rescheduling.</li>
      </ul>


      <SectionTitle eyebrow="Limits">Limitations</SectionTitle>
      <ul className="mt-4 list-disc pl-6 text-slate-300/90 space-y-2">
        <li>No promise of a specific job, salary, or timeline.</li>
        <li>Employer selection processes are outside our control.</li>
        <li>Assistance may be paused for policy violations (plagiarism, harassment, fraud).</li>
      </ul>


      <SectionTitle eyebrow="Changes">Policy updates</SectionTitle>
      <p className="mt-4 text-slate-300/90">This Policy may be updated to reflect operational realities and market conditions.</p>
    </LegalLayout>
  );
}





