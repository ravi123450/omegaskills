import React from "react";

export default function TemplateOne({ data, font }) {
  return (
    <div style={{ fontFamily: font }} className="p-6 bg-white text-black">
      <h1 className="text-3xl font-bold">{data.name || "John Doe"}</h1>
      <p>{data.title || "Software Engineer"}</p>
      <hr className="my-2" />
      <h2 className="font-semibold">Experience</h2>
      <ul>
        {(data.experience || ["Worked on projects, improved efficiency."]).map((exp, i) => (
          <li key={i}>• {exp}</li>
        ))}
      </ul>
    </div>
  );
}
