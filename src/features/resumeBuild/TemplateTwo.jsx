import React from "react";

export default function TemplateOne({ data }) {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold">{data.name}</h1>
      <p className="text-gray-600">{data.email} | {data.phone}</p>

      <h2 className="mt-6 text-xl font-semibold">Education</h2>
      <p>{data.education}</p>

      <h2 className="mt-6 text-xl font-semibold">Experience</h2>
      <p>{data.experience}</p>

      <h2 className="mt-6 text-xl font-semibold">Skills</h2>
      <p>{data.skills}</p>
    </div>
  );
}
