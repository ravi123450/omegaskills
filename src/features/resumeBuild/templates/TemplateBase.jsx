// src/features/resumeBuild/templates/TemplateBase.jsx
import React from "react";

function SectionHeader({ title, styleType }) {
  if (styleType === "bar") {
    return (
      <div className="hBar sectionTitle">
        <span className="hBarDot"></span>
        <span>{title}</span>
      </div>
    );
  }
  if (styleType === "underline") {
    return (
      <div className="sectionTitle">
        <span className="hUnderline">{title}</span>
      </div>
    );
  }
  if (styleType === "pill") {
    return (
      <div className="sectionTitle">
        <span className="hPill">{title}</span>
      </div>
    );
  }
  return <div className="sectionTitle hBlock">{title}</div>;
}

function Bullets({ items = [] }) {
  return (
    <ul style={{ margin: "0 0 0 18px", padding: 0 }}>
      {items.map((b, i) => (
        <li key={i} style={{ marginBottom: 6 }}>
          {b}
        </li>
      ))}
    </ul>
  );
}

export default function TemplateBase({ data, cfg, font }) {
  const use = (arr, fallback) => (arr && arr.length ? arr : fallback);

  const Experience = () => (
    <div className="section">
      <SectionHeader title="Experience" styleType={cfg.header} />
      {use(data.experience, [
        {
          role: "Senior Frontend Engineer",
          company: "Zeta Labs",
          period: "2022 – Present",
          bullets: [
            "Led migration to React 18 + hooks; improved TTI by 28%.",
            "Built design system components adopted across 5 squads.",
            "Partnered with PM/Design to A/B test features; +14% conversion.",
          ],
        },
        {
          role: "Full-Stack Developer",
          company: "NovaWorks",
          period: "2020 – 2022",
          bullets: [
            "Developed Node.js microservices; reduced failure rate by 40%.",
            "Implemented PostgreSQL indexing and caching to cut query time by 65%.",
            "Wrote Cypress tests improving e2e stability.",
          ],
        },
      ]).map((exp, i) => (
        <div key={i} style={{ marginBottom: 10 }}>
          <div className="row" style={{ justifyContent: "space-between" }}>
            <strong>
              {exp.role} — {exp.company}
            </strong>
            <span className="small">{exp.period}</span>
          </div>
          <Bullets items={exp.bullets} />
        </div>
      ))}
    </div>
  );

  const Projects = () => (
    <div className="section">
      <SectionHeader title="Projects" styleType={cfg.header} />
      {use(data.projects, [
        {
          name: "ResumeBuilder Pro",
          desc: "Open-source builder with 30+ templates & PDF export.",
          bullets: ["Dynamic template engine", "AI text suggestions", "ATS-friendly output"],
        },
      ]).map((p, i) => (
        <div key={i} style={{ marginBottom: 8 }}>
          <div>
            <strong>{p.name}</strong>
          </div>
          <div className="small" style={{ marginBottom: 4 }}>
            {p.desc}
          </div>
          <Bullets items={p.bullets} />
        </div>
      ))}
    </div>
  );

  const Education = () => (
    <div className="section">
      <SectionHeader title="Education" styleType={cfg.header} />
      {use(data.education, [{ degree: "B.Tech, Computer Science", school: "IIIT Hyderabad", year: "2020" }]).map(
        (ed, i) => (
          <div key={i} className="row" style={{ justifyContent: "space-between", marginBottom: 6 }}>
            <div>
              <strong>{ed.degree}</strong> — {ed.school}
            </div>
            <div className="small">{ed.year}</div>
          </div>
        )
      )}
    </div>
  );

  const Certifications = () => (
    <div className="section">
      <SectionHeader title="Certifications" styleType={cfg.header} />
      {use(data.certifications, [
        { name: "AWS Certified Solutions Architect", issuer: "Amazon", year: "2024", link: "https://aws.amazon.com/cert" },
        { name: "Oracle Certified Professional: Java", issuer: "Oracle", year: "2023", link: "https://oracle.com/cert" },
      ]).map((c, i) => (
        <div key={i} className="row" style={{ justifyContent: "space-between", marginBottom: 6 }}>
          <div>
            <strong>{c.name}</strong>
            {c.issuer && <span> — {c.issuer}</span>}
            {c.link && (
              <span style={{ marginLeft: 8 }}>
                <a href={c.link} target="_blank" rel="noreferrer">
                  verify
                </a>
              </span>
            )}
          </div>
          <div className="small">{c.year}</div>
        </div>
      ))}
    </div>
  );

  const Skills = () => (
    <div className="section">
      <SectionHeader title="Skills" styleType={cfg.header} />
      <div className="pills">
        {use(data.skills, ["React", "TypeScript", "Node.js", "PostgreSQL", "Docker", "AWS", "CI/CD", "Testing"]).map(
          (s, i) => (
            <span key={i} className="pill">
              {s}
            </span>
          )
        )}
      </div>
    </div>
  );

  const Summary = () => (
    <div className="section">
      <SectionHeader title="Summary" styleType={cfg.header} />
      <div>{data.summary || "Write a crisp 2–3 line summary here."}</div>
    </div>
  );

  const HeaderBlock = () => (
    <div>
      <div className="row" style={{ justifyContent: "space-between", marginBottom: 4 }}>
        <div style={{ fontSize: 24, fontWeight: 800, color: "var(--accent)" }}>{data.name || "Your Name"}</div>
        <div className="small right">{data.location || "City, Country"}</div>
      </div>
      <div className="small" style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <span>{data.title || "Job Title"}</span>
        <span>•</span>
        <span>{data.email || "email@example.com"}</span>
        <span>•</span>
        <span>{data.phone || "+91 00000 00000"}</span>
        {(data.links || []).length ? (
          <>
            <span>•</span>
            <span>{data.links.join(" | ")}</span>
          </>
        ) : null}
      </div>
      <div className="hr"></div>
    </div>
  );

  const fontStyle = { fontFamily: font };

  // Layouts
  if (cfg.layout === "oneColumn") {
    return (
      <div className="resumePage" style={fontStyle}>
        <HeaderBlock />
        <Summary />
        <Experience />
        <Projects />
        <Education />
        <Certifications />
        <Skills />
      </div>
    );
  }

  if (cfg.layout === "twoLeft") {
    return (
      <div className="resumePage" style={fontStyle}>
        <HeaderBlock />
        <div className="row">
          <div className="col" style={{ flex: "1 1 34%" }}>
            <Summary />
            <Skills />
            <Education />
          </div>
          <div className="col" style={{ flex: "1 1 66%" }}>
            <Experience />
            <Projects />
          </div>
        </div>
      </div>
    );
  }

  if (cfg.layout === "twoRight") {
    return (
      <div className="resumePage" style={fontStyle}>
        <HeaderBlock />
        <div className="row">
          <div className="col" style={{ flex: "1 1 66%" }}>
            <Experience />
            <Projects />
          </div>
          <div className="col" style={{ flex: "1 1 34%" }}>
            <Summary />
            <Skills />
            <Education />
          </div>
        </div>
      </div>
    );
  }

  if (cfg.layout === "minimal") {
    return (
      <div className="resumePage" style={{ ...fontStyle, fontSize: 13 }}>
        <div className="m0" style={{ fontSize: 22, fontWeight: 800 }}>
          {data.name || "Your Name"}
        </div>
        <div className="small" style={{ marginBottom: 10 }}>
          {data.title || "Job Title"} — {data.email || "email@example.com"} — {data.phone || "+91 00000 00000"} —{" "}
          {data.location || "City, Country"}
        </div>
        <Summary />
        <div className="hr"></div>
        <Experience />
        <div className="hr"></div>
        <Projects />
        <div className="hr"></div>
        <Education />
        <Skills />
      </div>
    );
  }

  // default: behave like oneColumn
  return (
    <div className="resumePage" style={fontStyle}>
      <HeaderBlock />
      <Summary />
      <Experience />
      <Projects />
      <Education />
      <Skills />
    </div>
  );
}
