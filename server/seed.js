// server/seed.js
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import sqlite3 from "sqlite3";
import bcrypt from "bcryptjs";   // ✅ use bcrypt now

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
sqlite3.verbose();

const DB = path.join(__dirname, "data.db");
const SCHEMA = path.join(__dirname, "schema.sql");
const EXAMS_DIR = path.join(__dirname, "data", "exams");

// ✅ bcrypt hash
async function hash(pw) {
  return await bcrypt.hash(String(pw), 10);
}

function open() { return new sqlite3.Database(DB); }

function exec(db, sql){return new Promise((res,rej)=>db.exec(sql, e=>e?rej(e):res()));}
function run(db, sql, p=[]){return new Promise((res,rej)=>db.run(sql,p,function(e){e?rej(e):res(this)}));}
function get(db, sql, p=[]){return new Promise((res,rej)=>db.get(sql,p,(e,r)=>e?rej(e):res(r)));}

async function csv(text){
  const rows=[]; let f=""; let inQ=false; let cur=[];
  const pushF=()=>{cur.push(f); f="";}; const pushR=()=>{ if(cur.length){rows.push(cur.slice()); cur.length=0;} };
  for(let i=0;i<text.length;i++){
    const c=text[i];
    if(inQ){
      if(c==='"'){ if(text[i+1]==='"'){f+='"'; i++;} else inQ=false; }
      else f+=c;
    }else{
      if(c==='"') inQ=true;
      else if(c===',') pushF();
      else if(c==='\r'){}
      else if(c==='\n'){ pushF(); pushR(); }
      else f+=c;
    }
  } pushF(); pushR();
  return rows.filter(r=>r.some(x=>x.trim()!==""));
}

async function ensureSchema(db){
  const sql = await fs.readFile(SCHEMA,"utf8");
  await exec(db, sql);
  console.log("Schema migrated.");
}

async function upsertUser(db,{name,email,password,role="student"}){
  let row = await get(db,"SELECT id FROM users WHERE email=?",[email.toLowerCase()]);
  if(!row){
    const hashed = await hash(password);   // ✅ bcrypt
    const r=await run(db,"INSERT INTO users(name,email,password_hash,role) VALUES(?,?,?,?)",
      [name,email.toLowerCase(),hashed,role]);
    row={id:r.lastID};
    console.log(`${role==='admin'?'Admin':'Student'} created: ${email}${role==='admin'?' / '+password:''}`);
  }
  return row.id;
}

async function upsertCourse(db,{title,description,is_public=0}){
  let row=await get(db,"SELECT id FROM courses WHERE title=?", [title]);
  if(!row){
    const r=await run(db,"INSERT INTO courses(title,description,is_public) VALUES(?,?,?)",[title,description,is_public]);
    row={id:r.lastID};
  }
  return row.id;
}
async function grantAccess(db,user_id,course_id,by=null){
  const row=await get(db,"SELECT id FROM access WHERE user_id=? AND course_id=?", [user_id,course_id]);
  if(!row) await run(db,"INSERT INTO access(user_id,course_id,granted_by) VALUES(?,?,?)",[user_id,course_id,by]);
}

const DEFAULT_TOPICS=[
  {slug:"aptitude",      name:"Aptitude & Arithmetic", section:"Aptitude"},
  {slug:"quant",         name:"Quantitative Analysis", section:"Quant"},
  {slug:"reasoning",     name:"Logical Reasoning",     section:"Reasoning"},
  {slug:"verbal",        name:"Verbal Ability",        section:"Verbal"},
  {slug:"communication", name:"Communication Skills",  section:"Communication"},
];

async function createExam(db, course_id, title, minutes=90, free=0){
  const r=await run(db,
    "INSERT INTO exams(course_id,title,duration_minutes,duration_sec,total_marks,is_free,config_json) VALUES(?,?,?,?,?,?,?)",
    [course_id,title,minutes,minutes*60,100,free?1:0, JSON.stringify({sections:["Aptitude","Quant","Reasoning","Verbal","Communication"]})]
  );
  const exam_id=r.lastID;
  const topics=[];
  for(const t of DEFAULT_TOPICS){
    const rt = await run(db,"INSERT INTO exam_topics(exam_id,name,slug,section) VALUES(?,?,?,?)",
      [exam_id,t.name,t.slug,t.section]);
    topics.push({id:rt.lastID, ...t});
  }
  return { exam_id, topics };
}

function toInt(s){ const n=parseInt(String(s??"").trim(),10); return Number.isFinite(n)?n:null; }

async function insertQuestions(db, exam_id, topic_id, arr){
  for(const q of arr){
    const opts = JSON.stringify(q.options||[]);
    const cidx = Number.isInteger(q.correct_index) ? q.correct_index : null;
    const ans  = q.answer ?? (Number.isInteger(cidx) ? String((q.options||[])[cidx]) : null);
    await run(db,
      "INSERT INTO questions(exam_id,topic_id,type,text,options_json,correct_index,answer,explanation,difficulty,tags,marks,negative_marks) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)",
      [exam_id,topic_id,q.type||"mcq",q.text,opts,cidx,ans,q.explanation||"",q.difficulty||"mixed",q.tags||"",q.marks??1,q.negative_marks??0]
    );
  }
}

async function loadCsv(file){
  const content = await fs.readFile(file,"utf8");
  const rows= await csv(content);
  const header = rows[0].map(h=>h.trim().toLowerCase());
  const id=(n)=>header.indexOf(n);
  const out=[];
  for(let i=1;i<rows.length;i++){
    const r=rows[i];
    const optsRaw=(r[id("options_json")]||r[id("options")]||"").trim();
    let options=[];
    if(/^\s*\[/.test(optsRaw)){ try{options=JSON.parse(optsRaw);}catch{} }
    else options = optsRaw.split("|").map(s=>s.trim()).filter(Boolean);

    const answer = (r[id("answer")]||"").trim();
    let correct_index = toInt(r[id("correct_index")]);
    if(!Number.isInteger(correct_index) && answer){
      const ix = options.findIndex(o=>o.toLowerCase()===answer.toLowerCase());
      if(ix>=0) correct_index=ix;
    }
    out.push({
      topic_slug:(r[id("topic_slug")]||"aptitude").trim().toLowerCase(),
      type:(r[id("type")]||"mcq").trim().toLowerCase(),
      text:(r[id("text")]||"").trim(),
      options,
      correct_index,
      answer,
      explanation:(r[id("explanation")]||"").trim(),
      difficulty:(r[id("difficulty")]||"mixed").trim().toLowerCase(),
      marks: toInt(r[id("marks")])??1,
      negative_marks: parseFloat(r[id("negative_marks")]||0)||0,
      tags:(r[id("tags")]||"")
    });
  }
  return out;
}

function gen(topicSlug, count=18){
  const arr=[];
  for(let i=0;i<count;i++){
    if(["aptitude","quant"].includes(topicSlug)){
      const a=10+Math.floor(Math.random()*90);
      const b=10+Math.floor(Math.random()*90);
      const ans=a+b; const opts=[ans,ans-1,ans+1,ans+2].map(String);
      arr.push({type:"mcq",text:`What is ${a} + ${b}?`, options:opts, correct_index:0, explanation:`${a}+${b}=${ans}`});
    }else if(topicSlug==="reasoning"){
      const seq=[2,4,8,16]; arr.push({type:"mcq",text:`Next in series: ${seq.join(", ")} ...`, options:["32","36","30","28"], correct_index:0});
    }else if(topicSlug==="verbal"){
      arr.push({type:"mcq",text:"Synonym of 'rapid'?", options:["quick","slow","dull","weak"], correct_index:0});
    }else{
      arr.push({type:"mcq",text:"Best email etiquette?", options:["Clear subject","All caps","Emojis","No salutation"], correct_index:0});
    }
  }
  return arr;
}

async function seed(){
  await fs.mkdir(EXAMS_DIR,{recursive:true});
  const db = open();
  await ensureSchema(db);

  const admin = await upsertUser(db,{name:"Admin",email:"admin@softskills.pro",password:"J1@2e#3s0",role:"admin"});
  const u1 = await upsertUser(db,{name:"Aarav",email:"aarav@example.com",password:"pass123"});
  const u2 = await upsertUser(db,{name:"Isha", email:"isha@example.com", password:"pass123"});
  const u3 = await upsertUser(db,{name:"Rahul",email:"rahul@example.com",password:"pass123"});
  const u4 = await upsertUser(db,{name:"Neha", email:"neha@example.com", password:"pass123"});

  const courseId = await upsertCourse(db,{
    title:"Soft Skills Mastery",
    description:"20 mock tests (90Q each) with per-topic analytics."
  });

  for(const uid of [u1,u2,u3,u4]) await grantAccess(db, uid, courseId, admin);

  for(let i=1;i<=20;i++){
    const {exam_id, topics} = await createExam(db, courseId, `Soft Skills Mock Test ${String(i).padStart(2,"0")}`, 90, i<=2?1:0);
    let inserted=0;
    const csvPath = path.join(EXAMS_DIR,`exam_${String(i).padStart(2,"0")}.csv`);
    try{
      const stat=await fs.stat(csvPath).catch(()=>null);
      if(stat && stat.isFile()){
        const rows=await loadCsv(csvPath);
        const grouped=new Map();
        rows.forEach(q=>{
          const slug=q.topic_slug||"aptitude";
          if(!grouped.has(slug)) grouped.set(slug,[]);
          grouped.get(slug).push(q);
        });
        for(const [slug, arr] of grouped){
          const t = topics.find(x=>x.slug===slug) || topics[0];
          await insertQuestions(db, exam_id, t.id, arr);
          inserted += arr.length;
        }
        console.log(`Exam ${i}: loaded ${inserted} Q from CSV`);
        continue;
      }
    }catch(e){ console.warn("CSV error:",e.message); }

    // generator fallback
    for(const t of topics){
      const qs= gen(t.slug,18);
      await insertQuestions(db, exam_id, t.id, qs); inserted+=qs.length;
    }
    console.log(`Exam ${i}: generated ${inserted} sample questions`);
  }

  console.log("Seeding complete.");
  db.close();
}

seed().catch(e=>{ console.error(e); process.exit(1); });
