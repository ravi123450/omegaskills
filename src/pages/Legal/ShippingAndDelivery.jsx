import React from "react";
import LegalLayout, { SectionTitle } from "./LegalLayout";
import { Package } from "lucide-react";


export default function ShippingAndDelivery() {
  return (
    <LegalLayout title="Shipping & Delivery" icon={<Package className="h-5 w-5" />}>
      <SectionTitle eyebrow="Digital-first">Digital delivery</SectionTitle>
      <ul className="mt-4 list-disc pl-6 text-slate-300/90 space-y-2">
        <li>Access is provisioned immediately after successful payment, or within 24 hours for manual verification.</li>
        <li>Login instructions are sent to your registered email (check spam/junk if missing).</li>
      </ul>


      <SectionTitle eyebrow="Physical (if any)">Physical shipping</SectionTitle>
      <ul className="mt-4 list-disc pl-6 text-slate-300/90 space-y-2">
        <li><strong>Coverage:</strong> India (PAN-India) and <em>[add other countries if any]</em>.</li>
        <li><strong>Carriers:</strong> <em>[DTDC/Blue Dart/India Post/Shiprocket]</em>.</li>
        <li><strong>Dispatch:</strong> 2–3 business days after order confirmation.</li>
        <li><strong>Delivery:</strong> 3–7 business days (metro); 5–10 (non-metro).</li>
        <li><strong>Charges:</strong> Calculated at checkout unless marked “Free Shipping”.</li>
        <li><strong>Tracking:</strong> Link emailed/SMSed after dispatch.</li>
        <li><strong>Failed delivery:</strong> Reattempted or we’ll contact you; extra charges may apply for wrong/incomplete addresses.</li>
      </ul>


      <SectionTitle eyebrow="Issues">Damaged / wrong items</SectionTitle>
      <p className="mt-4 text-slate-300/90">Report within 48 hours of delivery with photos and order ID. We will arrange a replacement or refund per assessment.</p>


      <SectionTitle eyebrow="International">Customs & duties</SectionTitle>
      <p className="mt-4 text-slate-300/90">Recipient is responsible for any import duties/taxes imposed by the destination country.</p>
    </LegalLayout>
  );
}





