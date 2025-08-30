export const DOMAINS = [
  "Software Engineering","Data Science","Web Development","AI / ML","Cybersecurity","Cloud / DevOps",
  "Mobile (Android)","Mobile (iOS)","Full Stack","QA / Testing","Product Management","UI/UX Design",
  "Graphic Design","Game Development","Blockchain","IoT","Embedded Systems","Computer Vision","NLP","AR/VR",
  "Data Engineering","Business Analyst","Digital Marketing","Finance / FinTech","Sales","HR","Operations",
  "Supply Chain","Mechanical Engineering","Electrical Engineering","Civil Engineering","Biomedical",
  "Chemical Engineering","Aerospace","Education","Healthcare","Law","Content Writing","Customer Support"
];

export const DOMAIN_SUGGESTIONS = {
  "Software Engineering": {
    bullets: [
      "Built and maintained scalable React + Node.js apps serving 50k+ monthly users.",
      "Reduced API latency by 35% by optimizing SQL queries and introducing caching.",
      "Wrote 200+ unit/integration tests to improve coverage from 45% to 85%."
    ],
    skills: ["JavaScript","TypeScript","React","Node.js","REST","SQL","Git","Docker"]
  },
  "Data Science": {
    bullets: [
      "Developed predictive models (XGBoost) improving forecast accuracy by 18%.",
      "Automated data cleaning pipelines using Pandas, cutting prep time by 60%.",
      "Built dashboards to communicate insights to business stakeholders."
    ],
    skills: ["Python","Pandas","NumPy","Scikit-learn","XGBoost","SQL","Statistics"]
  },
  "AI / ML": {
    bullets: [
      "Fine-tuned transformer models to increase F1 by 0.08 on imbalanced data.",
      "Deployed ML services with FastAPI + Docker; monitored drift and retrained weekly.",
      "Implemented a feature store to standardize and reuse features across teams."
    ],
    skills: ["PyTorch","TensorFlow","FastAPI","Docker","MLflow","Airflow","NLP","Computer Vision"]
  },
  "UI/UX Design": {
    bullets:[
      "Redesigned onboarding flow; reduced drop-off by 21%.",
      "Ran usability tests with 12 participants; prioritized top 5 issues.",
      "Built reusable Figma components to speed up delivery by 30%."
    ],
    skills:["Figma","User Research","Wireframing","Prototyping","Design Systems"]
  },
  "Digital Marketing": {
    bullets:[
      "Launched paid campaigns; improved CAC by 17%.",
      "Designed SEO content plan; +42% organic sessions in 3 months.",
      "Automated email sequences; +12% upsell conversion."
    ],
    skills:["SEO","SEM","Google Analytics","Email Automation","Copywriting"]
  },
  "Product Management": {
    bullets:[
      "Defined roadmap with OKRs; shipped 8 features in 2 quarters.",
      "Led cross-functional squad of 7; improved activation by 15%.",
      "Ran discovery interviews; prioritized opportunities with RICE."
    ],
    skills:["Roadmapping","A/B Testing","Analytics","Stakeholder Management"]
  }
};

export const fallbackBullets = [
  "Delivered projects on time and within scope.",
  "Collaborated cross-functionally to meet goals.",
  "Improved process efficiency with automation."
];

export const fallbackSkills = [
  "Communication","Teamwork","Problem Solving"
];
