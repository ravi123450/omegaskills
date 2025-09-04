import React, { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle, Info } from "lucide-react";


const courses = [
  {
    title: "Full Stack Development with Java",
    description: "Complete roadmap to become a professional Java Full Stack Developer.",
    categories: [
      {
        name: "Java Fundamentals",
        color: "bg-orange-500",
        skills: [
          { name: "Variables & Data Types", description: "Learn Java variables, primitive & non-primitive types." },
          { name: "OOP Concepts", description: "Classes, Objects, Inheritance, Polymorphism." },
          { name: "Collections & Generics", description: "Lists, Maps, Sets, and generics usage." },
        ],
      },
      {
        name: "Frontend",
        color: "bg-green-500",
        skills: [
          { name: "HTML & CSS", description: "Semantic HTML5 & modern CSS, Flexbox, Grid." },
          { name: "JavaScript & DOM", description: "JS fundamentals & DOM manipulation." },
          { name: "React Basics", description: "Components, Props, State, Lifecycle." },
        ],
      },
      {
        name: "Backend",
        color: "bg-blue-500",
        skills: [
          { name: "Spring Boot", description: "Build REST APIs using Spring Boot." },
          { name: "Database Integration", description: "MySQL, PostgreSQL, MongoDB." },
          { name: "Security", description: "JWT, OAuth2, Authentication." },
        ],
      },
      {
        name: "Deployment & DevOps",
        color: "bg-purple-500",
        skills: [
          { name: "Docker", description: "Containerize applications." },
          { name: "CI/CD Pipelines", description: "GitHub Actions & Jenkins pipelines." },
          { name: "Cloud Deployment", description: "Deploy to AWS, GCP, Azure." },
        ],
      },
    ],
  },
  {
    title: "Data Science & Big Data Analytics",
    description: "Learn data processing, machine learning, and data visualization techniques for making data-driven decisions.",
    categories: [
      {
        name: "Python & Statistics",
        color: "bg-orange-500",
        skills: [
          { name: "Python Basics", description: "Variables, loops, functions, libraries (NumPy, Pandas)." },
          { name: "Statistics & Probability", description: "Descriptive, inferential statistics and distributions." },
          { name: "Data Cleaning & Preprocessing", description: "Handling missing values, encoding, scaling." },
        ],
      },
      {
        name: "Machine Learning",
        color: "bg-green-500",
        skills: [
          { name: "Supervised Learning", description: "Regression, classification algorithms." },
          { name: "Unsupervised Learning", description: "Clustering, dimensionality reduction." },
          { name: "Model Evaluation", description: "Cross-validation, metrics, hyperparameter tuning." },
        ],
      },
      {
        name: "Big Data",
        color: "bg-blue-500",
        skills: [
          { name: "Hadoop & Spark", description: "Processing large datasets." },
          { name: "NoSQL Databases", description: "MongoDB, Cassandra basics." },
          { name: "Data Pipelines", description: "ETL process & workflow management." },
        ],
      },
      {
        name: "Visualization & Reporting",
        color: "bg-purple-500",
        skills: [
          { name: "Matplotlib & Seaborn", description: "Plot graphs, charts and heatmaps." },
          { name: "PowerBI & Tableau", description: "Interactive dashboards & reporting." },
          { name: "Storytelling with Data", description: "Present insights effectively." },
        ],
      },
    ],
  },
  {
    title: "Cloud Computing & AWS",
    description: "Learn cloud concepts and AWS services for deploying scalable applications.",
    categories: [
      {
        name: "Cloud Fundamentals",
        color: "bg-orange-500",
        skills: [
          { name: "Cloud Basics", description: "IaaS, PaaS, SaaS concepts." },
          { name: "Virtualization", description: "VMs, containers, hypervisors." },
          { name: "Networking in Cloud", description: "VPC, Subnets, Security Groups." },
        ],
      },
      {
        name: "AWS Core Services",
        color: "bg-green-500",
        skills: [
          { name: "EC2 & S3", description: "Compute and storage services." },
          { name: "Lambda & API Gateway", description: "Serverless architecture." },
          { name: "RDS & DynamoDB", description: "Managed databases." },
        ],
      },
      {
        name: "Deployment & DevOps",
        color: "bg-blue-500",
        skills: [
          { name: "Infrastructure as Code", description: "Terraform, CloudFormation." },
          { name: "CI/CD Pipelines", description: "Automated deployments with CodePipeline." },
          { name: "Monitoring & Logging", description: "CloudWatch, CloudTrail basics." },
        ],
      },
      {
        name: "Security & Cost Optimization",
        color: "bg-purple-500",
        skills: [
          { name: "IAM & Security", description: "User roles, policies, encryption." },
          { name: "Cost Management", description: "Billing, budgets, cost optimization." },
          { name: "High Availability & Scaling", description: "Auto-scaling, load balancing." },
        ],
      },
    ],
  },
  {
    title: "Mobile App Development (Android & iOS)",
    description: "Learn to develop native and cross-platform mobile applications.",
    categories: [
      {
        name: "Android Development",
        color: "bg-orange-500",
        skills: [
          { name: "Kotlin / Java Basics", description: "Syntax, OOP, Android SDK." },
          { name: "UI & UX", description: "Layouts, views, Material Design." },
          { name: "Data Storage & APIs", description: "SQLite, Room, REST APIs." },
        ],
      },
      {
        name: "iOS Development",
        color: "bg-green-500",
        skills: [
          { name: "Swift Basics", description: "Swift syntax, Xcode setup." },
          { name: "UIKit & SwiftUI", description: "Build responsive interfaces." },
          { name: "Networking & Core Data", description: "API integration and local storage." },
        ],
      },
      {
        name: "Cross-Platform",
        color: "bg-blue-500",
        skills: [
          { name: "Flutter", description: "Build apps for Android & iOS from single codebase." },
          { name: "React Native", description: "Develop mobile apps using JavaScript & React." },
          { name: "State Management", description: "Provider, Bloc, Redux patterns." },
        ],
      },
      {
        name: "Deployment & Testing",
        color: "bg-purple-500",
        skills: [
          { name: "App Store & Play Store", description: "Publish mobile applications." },
          { name: "Automated Testing", description: "Unit & integration testing." },
          { name: "CI/CD for Mobile", description: "Fastlane & GitHub Actions." },
        ],
      },
    ],
  },
  {
    title: "UI/UX Design",
    description: "Learn principles and tools to design intuitive user interfaces and experiences.",
    categories: [
      {
        name: "Design Fundamentals",
        color: "bg-orange-500",
        skills: [
          { name: "Color Theory & Typography", description: "Basics of visual design." },
          { name: "Wireframing & Prototyping", description: "Sketch, Figma, Adobe XD." },
          { name: "User-Centered Design", description: "Design thinking methodology." },
        ],
      },
      {
        name: "UI Design",
        color: "bg-green-500",
        skills: [
          { name: "Visual Design Principles", description: "Consistency, hierarchy, balance." },
          { name: "Design Systems & Components", description: "Reusable UI elements." },
          { name: "Responsive Design", description: "Layouts for multiple devices." },
        ],
      },
      {
        name: "UX Design",
        color: "bg-blue-500",
        skills: [
          { name: "User Research", description: "Interviews, surveys, personas." },
          { name: "Usability Testing", description: "Evaluate prototypes with users." },
          { name: "Information Architecture", description: "Structure content effectively." },
        ],
      },
      {
        name: "Tools & Portfolio",
        color: "bg-purple-500",
        skills: [
          { name: "Figma & Adobe XD", description: "Industry-standard tools." },
          { name: "Portfolio Creation", description: "Showcase design projects." },
          { name: "Collaboration Tools", description: "Slack, Zeplin, Miro." },
        ],
      },
    ],
  },
  {
    title: "DevOps Engineering",
    description: "Master DevOps tools and practices to streamline software delivery and operations.",
    categories: [
      {
        name: "DevOps Basics",
        color: "bg-orange-500",
        skills: [
          { name: "CI/CD Concepts", description: "Continuous Integration & Delivery principles." },
          { name: "Version Control", description: "Git workflows & branching strategies." },
          { name: "Monitoring & Logging", description: "Prometheus, Grafana basics." },
        ],
      },
      {
        name: "Configuration Management",
        color: "bg-green-500",
        skills: [
          { name: "Ansible & Puppet", description: "Automate infrastructure configuration." },
          { name: "Terraform", description: "Infrastructure as code." },
          { name: "Docker & Kubernetes", description: "Containerization & orchestration." },
        ],
      },
      {
        name: "Cloud Integration",
        color: "bg-blue-500",
        skills: [
          { name: "AWS / Azure / GCP", description: "Cloud service providers integration." },
          { name: "Serverless & Lambda", description: "Event-driven architecture." },
          { name: "Auto-scaling & Load Balancing", description: "High availability systems." },
        ],
      },
      {
        name: "Security & Best Practices",
        color: "bg-purple-500",
        skills: [
          { name: "IAM & Access Control", description: "Identity & access management." },
          { name: "Secrets Management", description: "Vault, Key management." },
          { name: "DevSecOps", description: "Security in DevOps pipelines." },
        ],
      },
    ],
  },
  {
    title: "Artificial Intelligence & Machine Learning",
    description: "Build intelligent systems using AI & ML concepts.",
    categories: [
      {
        name: "AI & ML Basics",
        color: "bg-orange-500",
        skills: [
          { name: "Python & Libraries", description: "NumPy, Pandas, Scikit-learn." },
          { name: "Statistics & Probability", description: "Foundational math for ML." },
          { name: "Data Preprocessing", description: "Cleaning, encoding, scaling data." },
        ],
      },
      {
        name: "Supervised & Unsupervised Learning",
        color: "bg-green-500",
        skills: [
          { name: "Regression & Classification", description: "Linear, logistic, SVM, decision trees." },
          { name: "Clustering & Dimensionality Reduction", description: "KMeans, PCA, t-SNE." },
          { name: "Model Evaluation", description: "Accuracy, precision, recall, F1-score." },
        ],
      },
      {
        name: "Deep Learning",
        color: "bg-blue-500",
        skills: [
          { name: "Neural Networks", description: "Perceptron, feedforward networks." },
          { name: "CNN & RNN", description: "Image & sequential data modeling." },
          { name: "Frameworks", description: "TensorFlow, PyTorch basics." },
        ],
      },
      {
        name: "AI Deployment",
        color: "bg-purple-500",
        skills: [
          { name: "Model Serving", description: "Flask API, FastAPI." },
          { name: "Cloud ML", description: "SageMaker, Azure ML, Vertex AI." },
          { name: "Monitoring & Maintenance", description: "Model drift & retraining." },
        ],
      },
    ],
  },
  {
    title: "Cybersecurity",
    description: "Protect systems and networks by mastering cybersecurity skills.",
    categories: [
      {
        name: "Cybersecurity Fundamentals",
        color: "bg-orange-500",
        skills: [
          { name: "Networking Basics", description: "TCP/IP, DNS, routing & switching." },
          { name: "Operating Systems", description: "Linux & Windows security basics." },
          { name: "Threats & Vulnerabilities", description: "Common attacks & defense." },
        ],
      },
      {
        name: "Security Tools & Practices",
        color: "bg-green-500",
        skills: [
          { name: "Firewalls & IDS/IPS", description: "Network security devices." },
          { name: "Penetration Testing", description: "Kali Linux, Metasploit basics." },
          { name: "Encryption & PKI", description: "SSL, certificates, asymmetric & symmetric encryption." },
        ],
      },
      {
        name: "Cloud & Web Security",
        color: "bg-blue-500",
        skills: [
          { name: "AWS & Azure Security", description: "IAM, encryption, monitoring." },
          { name: "Web App Security", description: "OWASP Top 10 vulnerabilities." },
          { name: "Incident Response", description: "Handling and recovery from attacks." },
        ],
      },
      {
        name: "Compliance & Governance",
        color: "bg-purple-500",
        skills: [
          { name: "ISO & NIST Frameworks", description: "Security standards & policies." },
          { name: "GDPR & Data Privacy", description: "Legal compliance basics." },
          { name: "Risk Assessment", description: "Identify, evaluate, and mitigate risks." },
        ],
      },
    ],
  },
  {
    title: "Internet of Things (IoT)",
    description: "Design and implement IoT systems with sensors, microcontrollers, and cloud integration.",
    categories: [
      {
        name: "Embedded Programming",
        color: "bg-orange-500",
        skills: [
          { name: "C / C++ Basics", description: "Programming for microcontrollers." },
          { name: "RTOS Concepts", description: "Real-time operating systems." },
          { name: "Peripheral Interfacing", description: "GPIO, I2C, SPI, UART." },
        ],
      },
      {
        name: "IoT Platforms",
        color: "bg-green-500",
        skills: [
          { name: "AWS IoT & Azure IoT", description: "Cloud IoT platforms." },
          { name: "Data Visualization", description: "Dashboards, Grafana, ThingsBoard." },
          { name: "Edge Computing", description: "Processing at device level." },
        ],
      },
      {
        name: "Security & Deployment",
        color: "bg-blue-500",
        skills: [
          { name: "IoT Security", description: "Encryption, device authentication." },
          { name: "Firmware Updates", description: "OTA updates and patching." },
          { name: "Deployment & Maintenance", description: "Device management at scale." },
        ],
      },
    ],
  },
  {
    title: "Blockchain Development",
    description: "Learn blockchain fundamentals and build decentralized applications.",
    categories: [
      {
        name: "Blockchain Basics",
        color: "bg-orange-500",
        skills: [
          { name: "Distributed Ledger", description: "Concepts of blockchain." },
          { name: "Consensus Mechanisms", description: "PoW, PoS basics." },
          { name: "Smart Contracts", description: "Ethereum Solidity basics." },
        ],
      },
      {
        name: "DApp Development",
        color: "bg-green-500",
        skills: [
          { name: "Ethereum & Solidity", description: "Smart contract development." },
          { name: "Web3.js & Ethers.js", description: "Frontend integration with blockchain." },
          { name: "Testing & Deployment", description: "Truffle, Hardhat basics." },
        ],
      },
      {
        name: "Advanced Concepts",
        color: "bg-blue-500",
        skills: [
          { name: "DeFi & NFTs", description: "Decentralized finance & token standards." },
          { name: "Layer 2 Solutions", description: "Scaling blockchains." },
          { name: "Security Audits", description: "Smart contract vulnerabilities." },
        ],
      },
    ],
  },
  {
    title: "Robotic Process Automation (RPA)",
    description: "Automate repetitive business processes using RPA tools.",
    categories: [
      {
        name: "RPA Fundamentals",
        color: "bg-orange-500",
        skills: [
          { name: "RPA Concepts", description: "Introduction to automation & bots." },
          { name: "Process Identification", description: "Select tasks for automation." },
          { name: "RPA Lifecycle", description: "Design, develop, deploy, maintain bots." },
        ],
      },
      {
        name: "Tools & Platforms",
        color: "bg-green-500",
        skills: [
          { name: "UiPath", description: "Build and deploy automation workflows." },
          { name: "Automation Anywhere", description: "RPA platform basics." },
          { name: "Blue Prism", description: "Develop digital workforce bots." },
        ],
      },
      {
        name: "Advanced Automation",
        color: "bg-blue-500",
        skills: [
          { name: "OCR & AI Integration", description: "Extract data & integrate AI models." },
          { name: "Error Handling", description: "Exception management in workflows." },
          { name: "Analytics & Reporting", description: "Monitor bot performance." },
        ],
      },
    ],
  },
  {
    title: "Quantum Computing",
    description: "Learn fundamentals of quantum computing and implement algorithms.",
    categories: [
      {
        name: "Quantum Fundamentals",
        color: "bg-orange-500",
        skills: [
          { name: "Qubits & Gates", description: "Basics of quantum bits and logic gates." },
          { name: "Quantum Algorithms", description: "Grover, Shor algorithms." },
          { name: "Quantum Circuits", description: "Circuit modeling & simulation." },
        ],
      },
      {
        name: "Programming & Tools",
        color: "bg-green-500",
        skills: [
          { name: "Qiskit & Cirq", description: "Quantum programming frameworks." },
          { name: "Quantum Simulation", description: "Simulate quantum circuits." },
          { name: "Visualization & Debugging", description: "Understand quantum states." },
        ],
      },
      {
        name: "Applications",
        color: "bg-blue-500",
        skills: [
          { name: "Cryptography & Security", description: "Quantum-safe algorithms." },
          { name: "Optimization Problems", description: "Quantum optimization." },
          { name: "Research & Development", description: "Cutting-edge quantum computing research." },
        ],
      },
    ],
  },
];



export default function Roadmap() {
  const [activeCourse, setActiveCourse] = useState(null);
  const [activeSkill, setActiveSkill] = useState(null);

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      {/* Course Overview */}
      {activeCourse === null && (
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl text-white font-bold text-center mb-12">
            Developer Course Roadmaps
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {courses.map((course, idx) => (
              <motion.div
                key={idx}
                className="p-6 bg-gray-800 rounded-xl shadow-xl cursor-pointer hover:scale-105 transition-transform duration-300"
                whileHover={{ scale: 1.05 }}
                onClick={() => setActiveCourse(idx)}
              >
                <h3 className="text-xl text-orange-400 font-bold mb-2">
                  {course.title}
                </h3>
                <p className="text-gray-300 mb-2">{course.description}</p>
                <p className="text-gray-500 text-sm">Click to see roadmap</p>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Detailed Roadmap */}
      {activeCourse !== null && (
        <div className="max-w-7xl mx-auto relative">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl text-white font-bold">
              {courses[activeCourse].title}
            </h2>
            <button
              className="text-orange-400 hover:underline"
              onClick={() => {
                setActiveCourse(null);
                setActiveSkill(null);
              }}
            >
              Back
            </button>
          </div>

          {/* Horizontal Scrollable Roadmap */}
          <div className="overflow-x-auto py-6">
            <div className="flex items-center relative space-x-20">
              {courses[activeCourse].categories.map((category, catIdx) => (
                <div key={catIdx} className="flex flex-col items-center relative">
                  {/* Category Node */}
                  <div
                    className={`w-12 h-12 rounded-full ${category.color} flex items-center justify-center shadow-lg mb-4`}
                  >
                    <CheckCircle className="text-white" size={28} />
                  </div>
                  <h3 className="text-white font-bold text-lg mb-6 text-center">
                    {category.name}
                  </h3>

                  {/* Skills inside category */}
                  <div className="flex flex-col space-y-6">
                    {category.skills.map((skill, skillIdx) => (
                      <motion.div
                        key={skillIdx}
                        className="bg-gray-800 p-4 rounded-xl shadow-lg cursor-pointer hover:shadow-2xl relative"
                        onClick={() =>
                          setActiveSkill(
                            activeSkill === `${catIdx}-${skillIdx}`
                              ? null
                              : `${catIdx}-${skillIdx}`
                          )
                        }
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: skillIdx * 0.1 }}
                      >
                        <div className="flex items-center justify-between">
                          <h4 className="text-white font-semibold text-lg">
                            {skill.name}
                          </h4>
                          <Info className="text-gray-400" size={18} />
                        </div>
                        {activeSkill === `${catIdx}-${skillIdx}` && (
                          <p className="text-gray-300 mt-2">
                            {skill.description}
                          </p>
                        )}
                      </motion.div>
                    ))}
                  </div>

                  {/* Curved connector */}
                  {catIdx !== courses[activeCourse].categories.length - 1 && (
                    <div className="absolute top-10 right-[-80px] w-40 h-4">
                      <svg
                        viewBox="0 0 100 20"
                        className="w-full h-full"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M0,10 C50,0 50,20 100,10"
                          stroke="#4B5563"
                          strokeWidth="2"
                          fill="transparent"
                        />
                      </svg>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Success marker at the end */}
          <div className="flex justify-center mt-12">
            <div className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center shadow-xl">
              <CheckCircle className="text-white" size={32} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
