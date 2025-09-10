import { useState } from "react";

export default function TeachersDayOffer() {
  const [show, setShow] = useState(true);

  if (!show) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-2xl shadow-lg max-w-md w-full p-8 text-center relative">
        {/* Close button */}
        <button
          onClick={() => setShow(false)}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          ✕
        </button>

        {/* Title */}
        <h2 className="text-2xl font-bold text-indigo-600 mb-3">
          🎓 Limited time Student’s Exclusive Offer
        </h2>

        {/* Badge */}
        <div className="inline-block px-3 py-1 mb-4 rounded-full bg-green-100 text-green-700 text-sm font-semibold">
          Free 3 Mock Tests
        </div>

        {/* Main text */}
        <p className="text-gray-700 mb-3">
          <span className="font-semibold text-green-600">Login now</span> to get{" "}
          <span className="font-semibold text-green-600">3 free mock tests</span> to write,after login in dashboard scroll down to your courses.
        </p>

        <p className="text-sm text-gray-600 mb-6">
          Perfect for trying out our platform and boosting your preparation. Offer valid
          for logged-in students only.
        </p>

        {/* CTA */}
        <a
          href="https://omegaskillsacademy.online/login"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block rounded-lg bg-orange-500 px-6 py-2 text-base font-semibold text-white hover:bg-orange-400 transition"
          onClick={() => setShow(false)}
        >
          Login &amp; Claim Now
        </a>

        {/* Quote */}
        <p className="mt-6 italic text-sm text-gray-500">
          “An investment in knowledge pays the best interest.” — Benjamin Franklin
        </p>
      </div>
    </div>
  );
}
