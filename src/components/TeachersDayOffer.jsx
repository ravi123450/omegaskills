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
          🎉 Teachers’ Day Sale
        </h2>

        {/* Badge */}
        <div className="inline-block px-3 py-1 mb-4 rounded-full bg-green-100 text-green-700 text-sm font-semibold">
          25% OFF Today Only
        </div>

        {/* Main text */}
        <p className="text-gray-700 mb-3">
          Avail <span className="font-semibold text-green-600">25% OFF</span> on all
          courses today. Don’t miss out!
        </p>

        <p className="text-sm text-gray-600 mb-6">
          In the payments and checkout page you can grab this{" "}
          <span className="font-bold text-green-600">25% discount</span>. Don’t waste
          time — grab now!
        </p>

        {/* CTA */}
        <a
          href="https://omegaskillsacademy.online/courses"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block rounded-lg bg-orange-500 px-6 py-2 text-base font-semibold text-white hover:bg-orange-400 transition"
          onClick={() => setShow(false)}
        >
          Avail Now
        </a>

        {/* Quote */}
        <p className="mt-6 italic text-sm text-gray-500">
          “An investment in knowledge pays the best interest.” — Benjamin Franklin
        </p>
      </div>
    </div>
  );
}
