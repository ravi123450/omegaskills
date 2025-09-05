// src/components/RazorpayButton.jsx
import React, { useEffect, useRef } from "react";


export default function RazorpayButton({
  paymentButtonId,
  className,
  buttonText,   // optional: overrides text from Razorpay dashboard
}) {
  const ref = useRef(null);


  useEffect(() => {
    if (!ref.current) return;


    // remove any old script (hot-reload safe)
    ref.current
      .querySelectorAll("script[src*='checkout.razorpay.com']")
      .forEach((n) => n.remove());


    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/payment-button.js";
    s.async = true;
    s.setAttribute("data-payment_button_id", paymentButtonId);
    if (buttonText) s.setAttribute("data-button_text", buttonText);
    ref.current.appendChild(s);


    return () => s.remove();
  }, [paymentButtonId, buttonText]);


  const stop = (e) => e.stopPropagation(); // don’t trigger parent card click


  return <form ref={ref} onClick={stop} className={className} />;
}





