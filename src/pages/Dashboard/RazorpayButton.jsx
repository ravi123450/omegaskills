// RazorpayButton.jsx
import React, { useEffect, useRef } from "react";

export default function RazorpayButton() {
  const ref = useRef(null);

  useEffect(() => {
    if (ref.current && !ref.current.querySelector("script")) {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/payment-button.js";
      script.setAttribute("data-payment_button_id", "pl_RC4fYVag9khclc"); // replace with your Razorpay Button ID
      script.async = true;
      ref.current.appendChild(script);
    }
  }, []);

  return <form ref={ref}></form>;
}
