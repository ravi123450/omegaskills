import React from "react";
import LegalLayout, { SectionTitle } from "./LegalLayout";
import { AlertTriangle } from "lucide-react";


export default function Disclaimer() {
  return (
    <LegalLayout title="Disclaimer" icon={<AlertTriangle className="h-5 w-5" />}>
      <SectionTitle eyebrow="Purpose">Educational use</SectionTitle>
      <p className="mt-4 text-slate-300/90">
        The information, courses, and resources on our Services are provided for educational purposes.
        Omega makes no warranties of any kind, express or implied, regarding accuracy, completeness, or fitness for a particular purpose.
      </p>


      <SectionTitle eyebrow="No guarantees">Outcomes</SectionTitle>
      <p className="mt-4 text-slate-300/90">
        Outcomes such as certifications, grades, internships, or jobs depend on individual effort, market conditions, and employer decisions.
      </p>


      <SectionTitle eyebrow="Third-party">External links & tools</SectionTitle>
      <p className="mt-4 text-slate-300/90">We may reference third-party tools, websites, or materials. We’re not responsible for their content, availability, or policies.</p>


      <SectionTitle eyebrow="Liability">Limitation of liability</SectionTitle>
      <p className="mt-4 text-slate-300/90">To the maximum extent permitted by law, Omega is not liable for indirect, incidental, or consequential damages arising from your use of the Services.</p>
    </LegalLayout>
  );
}





