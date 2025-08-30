// server/seed_users.js
// Creates admin + 4 students and grants them access to "Soft Skills Mastery".

import sqlite3 from "sqlite3";
import path from "path";
import { fileURLToPath } from "url";
import crypto from "crypto";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

sqlite3.verbose();
const db = new sqlite3.Database(path.join(__dirname, "data.db"));

function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) return reject(err);
      resolve(this);
    });
  });
}
function get(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, function (err, row) {
      if (err) return reject(err);
      resolve(row);
    });
  });
}
function all(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, function (err, rows) {
      if (err) return reject(err);
      resolve(rows);
    });
  });
}

function hash(pw) {
  return crypto.createHash("sha256").update(String(pw)).digest("hex");
}

async function main() {
  console.log("Seeding users & access…");

  // Ensure course exists
  const course = await get("SELECT id FROM courses WHERE title = ?", ["Soft Skills Mastery"]);
  if (!course) {
    console.error("Course 'Soft Skills Mastery' not found. Run `npm run import:papers` first.");
    process.exit(1);
  }

  const users = [
    { email: "admin@softskills.pro", name: "Admin", password: "J1@2e#3s0", role: "admin" },
    { email: "aarav@example.com",    name: "Aarav", password: "password123", role: "student" },
    { email: "isha@example.com",     name: "Isha",  password: "password123", role: "student" },
    { email: "rahul@example.com",    name: "Rahul", password: "password123", role: "student" },
    { email: "neha@example.com",     name: "Neha",  password: "password123", role: "student" },
  ];

  for (const u of users) {
    const existing = await get("SELECT id FROM users WHERE email = ?", [u.email]);
    if (!existing) {
      const r = await run(
        "INSERT INTO users(email,name,password_hash,role) VALUES(?,?,?,?)",
        [u.email, u.name, hash(u.password), u.role]
      );
      console.log(`Created: ${u.email} (${u.role})`);
    } else {
      console.log(`Exists: ${u.email}`);
    }
  }

  // Grant course access to all students
  for (const u of users.filter(x => x.role === "student")) {
    const row = await get("SELECT id FROM users WHERE email = ?", [u.email]);
    await run(
      "INSERT OR IGNORE INTO course_access(user_id, course_id) VALUES(?,?)",
      [row.id, course.id]
    );
    console.log(`Access granted: ${u.email} → Soft Skills Mastery`);
  }

  // Optional: create simple friend relationships (everyone friends with everyone)
  const rows = await all("SELECT id FROM users WHERE role='student'");
  for (let i = 0; i < rows.length; i++) {
    for (let j = 0; j < rows.length; j++) {
      if (i === j) continue;
      await run(
        "INSERT OR IGNORE INTO friendships(user_id, friend_id) VALUES(?,?)",
        [rows[i].id, rows[j].id]
      );
    }
  }

  console.log("Seeding complete.");
  db.close();
}

main().catch(e => {
  console.error(e);
  db.close();
});
