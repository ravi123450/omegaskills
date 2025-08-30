// src/features/resumeBuild/ResumeForm.jsx
import React, { useMemo, useState } from "react";
import { DOMAINS, DOMAIN_SUGGESTIONS, fallbackBullets, fallbackSkills } from "./utils/domains";
import { enhanceText } from "./utils/enhancer";
import { Button } from "@/components/ui/button";

export const FONT_OPTIONS = [
  "Inter","Poppins","Roboto","Lato","Montserrat","Nunito","Source Sans 3","Raleway","Manrope","Merriweather",
  "Playfair Display","EB Garamond","Georgia","Times New Roman","Helvetica","Arial","Tahoma","Verdana","Trebuchet MS",
  "Noto Sans","Karla","Heebo","Barlow","Fira Sans","Public Sans","UI Sans","System UI",
  "Space Grotesk","Urbanist","Oswald","Bebas Neue","Josefin Sans","Exo 2","Quicksand","Varela Round","Titillium Web",
  "DM Sans","Plus Jakarta Sans","Cabin","Mulish","IBM Plex Sans","Open Sans","PT Sans","Mukta","Rubik","Hind","Domine",
  "Arvo","Spectral","Lora","Crimson Pro"
];

export default function ResumeForm({
  onData, font, setFont, cfg, setOpenGallery,
  margin, setMargin, lineHeight, setLineHeight
}) {
  const [domain, setDomain] = useState(DOMAINS[0]);
  const [form, setForm] = useState({
    name:"", title:"", email:"", phone:"", location:"",
    links:"", skills:"", summary:"", experience:"", projects:"", education:"",
    certifications:""
  });

  const parsed = useMemo(() => {
    const links = form.links ? form.links.split(",").map(s=>s.trim()).filter(Boolean) : [];
    const skills = form.skills ? form.skills.split(",").map(s=>s.trim()).filter(Boolean) : [];

    const expBlocks = form.experience
      ? form.experience.split(/\n\n+/).map(s=>s.trim()).filter(Boolean)
      : [];
    const experience = expBlocks.map(blk => {
      const [head, ...rest] = blk.split("\n");
      const [rolePart, periodPart] = (head || "").split("|");
      const [role, company] = (rolePart || "").split("@");
      const bullets = rest.length
        ? rest.map(l => l.replace(/^[-•]\s?/, "").trim()).filter(Boolean)
        : [];
      return {
        role:(role||"").trim()||"Role",
        company:(company||"").trim()||"Company",
        period:(periodPart||"").trim()||"YYYY – YYYY",
        bullets: bullets.length ? bullets : ["Describe impact in a concise bullet."]
      };
    });

    const projBlocks = form.projects
      ? form.projects.split(/\n\n+/).map(s=>s.trim()).filter(Boolean)
      : [];
    const projects = projBlocks.map(blk => {
      const [head, ...rest] = blk.split("\n");
      const [name, desc] = (head || "").split(":");
      const bullets = rest.length
        ? rest.map(l => l.replace(/^[-•]\s?/, "").trim()).filter(Boolean)
        : [];
      return {
        name:(name||"Project").trim(),
        desc:(desc||"Short description").trim(),
        bullets: bullets.length ? bullets : ["Key feature or achievement."]
      };
    });

    const education = form.education
      ? form.education.split(/\n+/).map(l=>l.trim()).filter(Boolean).map(l=>{
          const [left, year] = l.split("|");
          const [degree, school] = (left||"").split("@");
          return { degree:(degree||"Degree").trim(), school:(school||"School").trim(), year:(year||"Year").trim() };
        })
      : [];

    const certifications = form.certifications
      ? form.certifications.split(/\n+/).map(l=>l.trim()).filter(Boolean).map(line=>{
          const parts = line.split("|").map(s=>s.trim());
          return { name:parts[0]||"", issuer:parts[1]||"", year:parts[2]||"", link:parts[3]||"" };
        })
      : [];

    return { ...form, links, skills, experience, projects, education, certifications };
  }, [form]);

  const applySuggestion = (type) => {
    if (type === "skills") {
      const sugg = DOMAIN_SUGGESTIONS[domain]?.skills || fallbackSkills;
      setForm(f => ({ ...f, skills: sugg.join(", ") }));
    } else if (type === "experience") {
      const sugg = DOMAIN_SUGGESTIONS[domain]?.bullets || fallbackBullets;
      setForm(f => ({ ...f, experience: `Role @ Company | 2023 – Present\n- ${sugg.join("\n- ")}` }));
    } else if (type === "summary") {
      setForm(f => ({ ...f, summary: `Results-driven ${domain} professional with hands-on experience. Focused on impact, reliability, and collaboration.` }));
    }
  };

  const enhance = (field) => {
    setForm((prev) => {
      const updated = { ...prev };

      if (field === "summary") {
        updated.summary = enhanceText(prev.summary, domain, "summary");
      } else if (field === "projects") {
        const projBlocks = prev.projects
          .split(/\n\n+/)
          .map((block) => {
            const [head, ...rest] = block.split("\n");
            const [name, desc=""] = (head||"").split(":");
            const enhancedHead = `${name || "Project"}: ${enhanceText(desc.trim(), domain, "project")}`;
            const enhancedBullets = rest.map((line) => enhanceText(line, domain, "project"));
            return [enhancedHead, ...enhancedBullets].join("\n");
          })
          .join("\n\n");
        updated.projects = projBlocks;
      } else if (field === "experience") {
        const expBlocks = prev.experience
          .split(/\n\n+/)
          .map((block) => {
            const [head, ...rest] = block.split("\n");
            const enhancedBullets = rest.map((line) => enhanceText(line, domain, "experience"));
            return [head, ...enhancedBullets].join("\n");
          })
          .join("\n\n");
        updated.experience = expBlocks;
      }

      return updated;
    });
  };

  React.useEffect(() => { onData(parsed); }, [parsed, onData]);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <div className="mt-5 text-lg font-extrabold text-white">Resume Builder — Step 1</div>
          <div className="small">No sign-in • Live preview • PDF</div>
        </div>
        <Button
          variant="secondary"
          className="bg-slate-800 text-slate-100 hover:bg-slate-700 cursor-pointer hover:text-orange-300"
          onClick={() => setOpenGallery(true)}
        >
          Templates
        </Button>
      </div>

      {/* Controls grid */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="field">
          <label className="label">Font (50+)</label>
          <select
            className="w-full rounded-xl border border-slate-800/60 bg-slate-900/40 p-3 text-sm text-slate-100 outline-none focus:border-orange-600"
            value={font}
            onChange={(e)=>setFont(e.target.value)}
          >
            {FONT_OPTIONS.map(f => (
              <option key={f} value={f} style={{ fontFamily: f }}>{f}</option>
            ))}
          </select>
          <div className="hint">Popular fonts preloaded.</div>
        </div>

        <div className="field">
          <label className="label">Domain (30+)</label>
          <select
            className="w-full rounded-xl border border-slate-800/60 bg-slate-900/40 p-3 text-sm text-slate-100 outline-none focus:border-orange-600"
            value={domain}
            onChange={(e)=>setDomain(e.target.value)}
          >
            {DOMAINS.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>

        <div className="field">
          <label className="label">Margins (px)</label>
          <input
            className="w-full rounded-xl border border-slate-800/60 bg-slate-900/40 p-3 text-sm text-slate-100 outline-none focus:border-orange-600"
            type="number" min="8" max="48" value={margin}
            onChange={(e)=>setMargin(Number(e.target.value) || 24)}
          />
        </div>

        <div className="field">
          <label className="label">Line height</label>
          <input
            className="w-full rounded-xl border border-slate-800/60 bg-slate-900/40 p-3 text-sm text-slate-100 outline-none focus:border-orange-600"
            type="number" step="0.05" min="1.1" max="1.8" value={lineHeight}
            onChange={(e)=>setLineHeight(Number(e.target.value) || 1.4)}
          />
        </div>
      </div>

      {/* Identity & contacts */}
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        {[
          ["Full Name","name"],
          ["Headline / Title","title"],
          ["Email","email"],
          ["Phone","phone"],
          ["Location","location"],
          ["Links (comma separated)","links"],
        ].map(([label, key]) => (
          <div key={key} className="field">
            <label className="label">{label}</label>
            <input
              className="w-full rounded-xl border border-slate-800/60 bg-slate-900/40 p-3 text-sm text-slate-100 outline-none focus:border-orange-600"
              value={form[key]} onChange={(e)=>setForm({ ...form, [key]: e.target.value })}
            />
          </div>
        ))}
      </div>

      {/* Skills */}
      <div className="mt-4 field">
        <label className="label">Skills (comma separated)</label>
        <input
          className="w-full rounded-xl border border-slate-800/60 bg-slate-900/40 p-3 text-sm text-slate-100 outline-none focus:border-orange-600"
          value={form.skills} onChange={(e)=>setForm({ ...form, skills: e.target.value })}
        />
        <div className="mt-2 flex gap-2">
          <Button variant="secondary" className="bg-slate-800 text-slate-100 hover:bg-slate-700 cursor-pointer hover:text-orange-300" onClick={()=>applySuggestion("skills")}>Suggest skills</Button>
        </div>
      </div>

      {/* Summary */}
      <div className="mt-4 field">
        <label className="label">Professional Summary</label>
        <textarea
          rows={3}
          className="w-full rounded-xl border border-slate-800/60 bg-slate-900/40 p-3 text-sm text-slate-100 outline-none focus:border-orange-600"
          value={form.summary} onChange={(e)=>setForm({ ...form, summary: e.target.value })}
          placeholder="2–3 lines about your impact, strengths, and focus."
        />
        <div className="mt-2 flex gap-2">
          <Button variant="secondary" className="bg-slate-800 text-slate-100 hover:bg-slate-700 cursor-pointer hover:text-orange-300" onClick={()=>applySuggestion("summary")}>Suggest</Button>
          <Button className="bg-orange-500 text-slate-900 hover:bg-orange-400 cursor-pointer hover:text-black" onClick={()=>enhance("summary")}>Enhance</Button>
        </div>
      </div>

      {/* Experience */}
      <div className="mt-4 field">
        <label className="label">Experience (format: Role @ Company | Period, bullets start with -)</label>
        <textarea
          rows={6}
          className="w-full rounded-xl border border-slate-800/60 bg-slate-900/40 p-3 text-sm text-slate-100 outline-none focus:border-orange-600"
          value={form.experience} onChange={(e)=>setForm({ ...form, experience: e.target.value })}
          placeholder={`Senior Frontend Engineer @ Zeta Labs | 2022 – Present
- Led migration to React 18; improved TTI by 28%.
- Built design system components used by 5 squads.

Full-Stack Developer @ NovaWorks | 2020 – 2022
- Developed Node.js microservices; reduced failures by 40%.`}
        />
        <div className="mt-2 flex gap-2">
          <Button variant="secondary" className="bg-slate-800 text-slate-100 hover:bg-slate-700 cursor-pointer hover:text-orange-400" onClick={()=>applySuggestion("experience")}>Suggest</Button>
          <Button className="bg-orange-500 text-slate-900 hover:bg-orange-400 hover:text-black cursor-pointer" onClick={()=>enhance("experience")}>Enhance</Button>
        </div>
      </div>

      {/* Projects */}
      <div className="mt-4 field">
        <label className="label">Projects (format: Name: desc, bullets start with -)</label>
        <textarea
          rows={4}
          className="w-full rounded-xl border border-slate-800/60 bg-slate-900/40 p-3 text-sm text-slate-100 outline-none focus:border-orange-600"
          value={form.projects} onChange={(e)=>setForm({ ...form, projects: e.target.value })}
          placeholder={`Portfolio Site: Next.js static site
- Built with ISR; 99 Lighthouse score.`}
        />
        <div className="mt-2">
          <Button className="bg-orange-500 text-slate-900 hover:bg-orange-400 hover:text-black cursor-pointer" onClick={()=>enhance("projects")}>Enhance</Button>
        </div>
      </div>

      {/* Education */}
      <div className="mt-4 field">
        <label className="label">Education (each line: Degree @ School | Year)</label>
        <textarea
          rows={3}
          className="w-full rounded-xl border border-slate-800/60 bg-slate-900/40 p-3 text-sm text-slate-100 outline-none focus:border-orange-600"
          value={form.education} onChange={(e)=>setForm({ ...form, education: e.target.value })}
          placeholder={`B.Tech, Computer Science @ IIIT Hyderabad | 2020`}
        />
      </div>

      {/* Certifications */}
      <div className="mt-4 field">
        <label className="label">Certifications (each line: Name | Issuer | Year | Link)</label>
        <textarea
          rows={4}
          className="w-full rounded-xl border border-slate-800/60 bg-slate-900/40 p-3 text-sm text-slate-100 outline-none focus:border-orange-600"
          value={form.certifications} onChange={(e)=>setForm({ ...form, certifications: e.target.value })}
          placeholder={`AWS Certified Developer – Associate | Amazon | 2024 | https://verify.aws.amazon.com/...
Google Data Analytics Professional | Coursera | 2023 | https://coursera.org/verify/...`}
        />
      </div>
    </div>
  );
}
