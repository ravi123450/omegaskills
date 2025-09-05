import React from "react";
import LegalLayout, { SectionTitle } from "./LegalLayout";
import { Shield } from "lucide-react";


export default function Privacy() {
  return (
    <LegalLayout title="Privacy Policy" icon={<Shield className="h-5 w-5" />}>
      <SectionTitle eyebrow="Scope">How we handle your data</SectionTitle>
      <p className="mt-4 text-slate-300/90">
        This Policy explains how <strong>Omega Skills Academy</strong> (“Omega”) collects, uses, shares, and protects
        information when you use our Services at <a className="text-orange-300 hover:text-orange-200" href="https://omegaskillsacademy.online">omegaskillsacademy.online</a>.
        By using our Services, you consent to this Policy.
      </p>


      <SectionTitle eyebrow="Data">Information we collect</SectionTitle>
      <ul className="mt-4 list-disc pl-6 text-slate-300/90 space-y-2">
        <li><strong>Provided by you:</strong> name, email, phone, college, interests, billing details, messages/uploads (e.g., résumé), quiz submissions.</li>
        <li><strong>Transactions:</strong> order IDs, payment status via our payment partners (no full card storage).</li>
        <li><strong>Technical:</strong> device/browser, IP, approximate location, pages viewed, cookies, analytics events.</li>
        <li><strong>Learning:</strong> enrollments, progress, scores, certificates.</li>
        <li><strong>Comms:</strong> emails/WhatsApp/SMS (if opted in), preferences.</li>
      </ul>


      <SectionTitle eyebrow="Use">How we use information</SectionTitle>
      <ul className="mt-4 list-disc pl-6 text-slate-300/90 space-y-2">
        <li>Provide and improve Services, courses, mock tests, and support.</li>
        <li>Process payments, send invoices, manage enrollments.</li>
        <li>Personalize content, recommendations, and reminders.</li>
        <li>Send transactional emails and—if opted in—marketing (unsubscribe anytime).</li>
        <li>Security, fraud prevention, and compliance.</li>
      </ul>


      <SectionTitle eyebrow="Bases">Legal bases (intl.)</SectionTitle>
      <p className="mt-4 text-slate-300/90">Consent, contract performance, legitimate interests, and legal obligations.</p>


      <SectionTitle eyebrow="Sharing">Sharing & disclosures</SectionTitle>
      <ul className="mt-4 list-disc pl-6 text-slate-300/90 space-y-2">
        <li>Payment processors (e.g., Razorpay/Stripe/PayU).</li>
        <li>Hosting/infra (e.g., AWS, Vercel/Netlify, Cloudflare).</li>
        <li>Email/communications (e.g., Hostinger SMTP, SendGrid/Mailgun).</li>
        <li>Analytics & tools (e.g., Google Analytics, Meta Pixel, Hotjar).</li>
        <li>Operational partners/mentors under confidentiality.</li>
        <li>Authorities where required by law or to protect rights/safety.</li>
      </ul>
      <p className="mt-2 text-slate-300/90">We do <strong>not</strong> sell personal data.</p>


      <SectionTitle eyebrow="Transfers">International transfers</SectionTitle>
      <p className="mt-4 text-slate-300/90">Your data may be processed outside India; we use safeguards for adequate protection.</p>


      <SectionTitle eyebrow="Cookies">Cookies & tracking</SectionTitle>
      <p className="mt-4 text-slate-300/90">We use essential cookies and optional analytics/marketing cookies. Browser settings can control cookies; some features may break if disabled.</p>


      <SectionTitle eyebrow="Retention">Data retention</SectionTitle>
      <p className="mt-4 text-slate-300/90">We retain data only as long as needed for the purposes above or as required by law.</p>


      <SectionTitle eyebrow="Your rights">Access & control</SectionTitle>
      <p className="mt-4 text-slate-300/90">
        You may request access, correction, deletion, portability, or restriction, and withdraw marketing consent via{" "}
        <a className="text-orange-300 hover:text-orange-200" href="mailto:support@omegaskillsacademy.online">support@omegaskillsacademy.online</a>.
      </p>


      <SectionTitle eyebrow="Children">Children</SectionTitle>
      <p className="mt-4 text-slate-300/90">Services are intended for users aged 13+. If a child under 13 provided data without consent, we will delete it.</p>


      <SectionTitle eyebrow="Security">Security</SectionTitle>
      <p className="mt-4 text-slate-300/90">We use administrative, technical, and physical safeguards (e.g., TLS). No method is 100% secure.</p>


      <SectionTitle eyebrow="Changes">Changes</SectionTitle>
      <p className="mt-4 text-slate-300/90">We may update this Policy; material changes will be notified on the site or via email.</p>
    </LegalLayout>
  );
}





