export const DOMAINS = [
  "Software Engineering","Data Science","Web Development","AI / ML","Cybersecurity","Cloud / DevOps",
  "Mobile (Android)","Mobile (iOS)","Full Stack","QA / Testing","Product Management","UI/UX Design",
  "Graphic Design","Game Development","Blockchain","IoT","Embedded Systems","Computer Vision","NLP","AR/VR",
  "Data Engineering","Business Analyst","Digital Marketing","Finance / FinTech","Sales","HR","Operations",
  "Supply Chain","Mechanical Engineering","Electrical Engineering","Civil Engineering","Biomedical",
  "Chemical Engineering","Aerospace","Education","Healthcare","Law","Content Writing","Customer Support",

  // --- Added EEE specializations ---
  "VLSI / Chip Design",
  "Communication Systems",
  "Signal Processing (DSP)",
  "Power Systems",
  "Power Electronics",
  "Control Systems",
  "Electronics & PCB Design",
  "Instrumentation",
  "Renewable Energy",
  "Automotive Electronics",
  "Robotics & Automation"
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
  },

  // --- Added EEE specializations ---
  "VLSI / Chip Design": {
    bullets: [
      "Designed synthesizable RTL in Verilog/SystemVerilog; met timing at 500 MHz after STA-driven optimizations.",
      "Built UVM testbenches achieving >95% functional coverage; closed code coverage gaps with targeted tests.",
      "Automated synthesis and static timing (DC/PrimeTime) with TCL; reduced area by 12% and power by 8%."
    ],
    skills: ["Verilog","SystemVerilog","UVM","RTL Design","Synthesis","STA","DFT","TCL","Python","Cadence/Synopsys EDA"]
  },
  "Communication Systems": {
    bullets: [
      "Implemented QPSK/QAM modem in MATLAB/Simulink; verified BER vs. Eb/N0 across AWGN and Rayleigh channels.",
      "Prototyped OFDM PHY on SDR (GNU Radio/USRP) and validated spectral mask compliance.",
      "Integrated channel coding (Convolutional/LDPC) to reduce BER by ~10× at low SNR."
    ],
    skills: ["MATLAB","Simulink","GNU Radio","SDR","Modulation","OFDM","Channel Coding","Python","C/C++"]
  },
  "Signal Processing (DSP)": {
    bullets: [
      "Designed FIR/IIR filters and optimized FFT pipelines; 2× speedup on ARM Cortex using fixed-point math.",
      "Built speech features (MFCC) for keyword spotting; improved accuracy by 6%.",
      "Developed real-time image processing (Canny/DoG) on embedded targets."
    ],
    skills: ["DSP","Filters","FFT","Fixed-Point","CMSIS-DSP","MATLAB","NumPy/SciPy","C/C++"]
  },
  "Power Systems": {
    bullets: [
      "Performed load flow and short-circuit studies (ETAP/PSS®E); recommended tap settings to improve voltage profile.",
      "Designed protection coordination (O/C, E/F, Distance); reduced nuisance trips by 30%.",
      "Modeled solar DG integration with reactive power support and inverter limits."
    ],
    skills: ["ETAP","PSS®E","PowerWorld","SCADA","Protection","Load Flow","Short-Circuit","MATLAB/Simulink"]
  },
  "Power Electronics": {
    bullets: [
      "Designed buck/boost and LLC converters; achieved >92% efficiency at rated load.",
      "Modeled converters in LTspice/PSIM; validated loop stability with Bode plots.",
      "Developed gate-driver and thermal design; ensured EMI/EMC compliance in PCB layout."
    ],
    skills: ["DC-DC Converters","PWM","MOSFET/IGBT","LTspice","PSIM","Simulink","Altium/KiCad","Control Loops"]
  },
  "Control Systems": {
    bullets: [
      "Tuned PID and implemented state-space controllers for BLDC speed control; ±1% steady-state error.",
      "Designed LQR + Kalman filter for position tracking; reduced settling time by 35%.",
      "Built plant models in Simulink; deployed on STM32 with embedded C."
    ],
    skills: ["Control Theory","PID","State-Space","LQR","Kalman","MATLAB/Simulink","Embedded C","STM32/Arduino"]
  },
  "Electronics & PCB Design": {
    bullets: [
      "Designed multi-layer PCBs with high-speed constraints; passed DRC and EMC pre-compliance.",
      "Performed schematic capture and BOM optimization; reduced cost by 18%.",
      "Applied SI/PI best practices (impedance control, decoupling, return paths)."
    ],
    skills: ["Altium","KiCad","OrCAD","Schematic","PCB Layout","SI/PI","DFM/DFT","Oscilloscope/Logic Analyzer"]
  },
  "Instrumentation": {
    bullets: [
      "Developed DAQ systems with sensor calibration; improved measurement uncertainty by 25%.",
      "Built PLC/SCADA dashboards for real-time monitoring and alarms.",
      "Automated test rigs in LabVIEW; cut test cycle time by 40%."
    ],
    skills: ["LabVIEW","NI DAQ","PLC","SCADA","OPC UA","Sensors","Calibration","DAQ"]
  },
  "Renewable Energy": {
    bullets: [
      "Designed rooftop PV systems (PVsyst); sized inverter/cables and performed yield assessment.",
      "Implemented MPPT algorithms and validated under dynamic irradiance profiles.",
      "Evaluated hybrid PV-battery systems; optimized LCOE using HOMER."
    ],
    skills: ["PVsyst","HOMER Pro","Solar PV","MPPT","Inverters","Energy Storage","Grid Interconnection","Standards (IEC)"]
  },
  "Automotive Electronics": {
    bullets: [
      "Integrated ECUs over CAN/LIN; implemented UDS diagnostics and flashing.",
      "Followed ISO 26262 process; created safety goals and DFMEAs for ASIL-B component.",
      "Built HIL tests (dSPACE/Vector); automated regression scenarios."
    ],
    skills: ["CAN","LIN","UDS","AUTOSAR","ISO 26262","HIL","Vector CANoe","dSPACE","Embedded C"]
  },
  "Robotics & Automation": {
    bullets: [
      "Developed ROS navigation stack with SLAM; achieved <3 cm localization error in lab environment.",
      "Implemented inverse kinematics and trajectory planning for 6-DOF arm.",
      "Integrated machine vision (OpenCV) for pick-and-place QA."
    ],
    skills: ["ROS","SLAM","Kinematics","Path Planning","OpenCV","Python/C++","PLC","Motor Control"]
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
