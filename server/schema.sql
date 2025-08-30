PRAGMA foreign_keys = ON;
PRAGMA journal_mode = WAL;

/* USERS */
CREATE TABLE IF NOT EXISTS users (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  name          TEXT NOT NULL,
  email         TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role          TEXT NOT NULL DEFAULT 'student',  -- 'admin' | 'student'
  created_at    DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

/* COURSES */
CREATE TABLE IF NOT EXISTS courses (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  title       TEXT NOT NULL,
  description TEXT,
  cover       TEXT,
  is_public   INTEGER DEFAULT 0,
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
);

/* EXAMS */
CREATE TABLE IF NOT EXISTS exams (
  id               INTEGER PRIMARY KEY AUTOINCREMENT,
  course_id        INTEGER NOT NULL,
  title            TEXT NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 90,
  duration_sec     INTEGER NOT NULL DEFAULT 5400,
  total_marks      INTEGER NOT NULL DEFAULT 100,
  is_free          INTEGER DEFAULT 0,
  config_json      TEXT DEFAULT '{}',
  created_at       DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(course_id) REFERENCES courses(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_exams_course ON exams(course_id);

CREATE TRIGGER IF NOT EXISTS trg_exams_duration_sync_insert
AFTER INSERT ON exams
FOR EACH ROW
WHEN NEW.duration_sec IS NULL OR NEW.duration_sec <= 0
BEGIN
  UPDATE exams SET duration_sec = (NEW.duration_minutes * 60) WHERE id = NEW.id;
END;

/* EXAM TOPICS (per exam) */
CREATE TABLE IF NOT EXISTS exam_topics (
  id       INTEGER PRIMARY KEY AUTOINCREMENT,
  exam_id  INTEGER NOT NULL,
  name     TEXT NOT NULL,
  slug     TEXT,
  section  TEXT,
  FOREIGN KEY(exam_id) REFERENCES exams(id) ON DELETE CASCADE
);

/* QUESTIONS */
CREATE TABLE IF NOT EXISTS questions (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  exam_id        INTEGER NOT NULL,
  topic_id       INTEGER NOT NULL,
  type           TEXT NOT NULL DEFAULT 'mcq',
  text           TEXT NOT NULL,
  options_json   TEXT NOT NULL,       -- ["A","B","C","D"]
  correct_index  INTEGER,             -- 0-based / optional
  answer         TEXT,                -- e.g. "A"
  explanation    TEXT,
  difficulty     TEXT,
  tags           TEXT,
  marks          INTEGER NOT NULL DEFAULT 1,
  negative_marks REAL NOT NULL DEFAULT 0,
  FOREIGN KEY(exam_id) REFERENCES exams(id) ON DELETE CASCADE,
  FOREIGN KEY(topic_id) REFERENCES exam_topics(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_questions_exam ON questions(exam_id);

/* View for legacy join */
DROP VIEW IF EXISTS exam_questions;
CREATE VIEW exam_questions AS
SELECT q.exam_id AS exam_id, q.id AS question_id FROM questions q;

/* ACCESS */
CREATE TABLE IF NOT EXISTS access (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id    INTEGER NOT NULL,
  course_id  INTEGER NOT NULL,
  expires_at DATETIME,
  granted_by INTEGER,
  UNIQUE(user_id, course_id),
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY(course_id) REFERENCES courses(id) ON DELETE CASCADE,
  FOREIGN KEY(granted_by) REFERENCES users(id) ON DELETE SET NULL
);

/* ATTEMPTS */
CREATE TABLE IF NOT EXISTS attempts (
  id                 INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id            INTEGER NOT NULL,
  exam_id            INTEGER NOT NULL,
  started_at         INTEGER NOT NULL, -- epoch ms
  submitted_at       INTEGER,
  duration_sec       INTEGER NOT NULL, -- snapshot from exam
  last_seen_at       INTEGER,
  score              REAL,
  breakdown          TEXT,             -- JSON per-topic
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY(exam_id) REFERENCES exams(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_attempts_user ON attempts(user_id);

/* ANSWERS */
CREATE TABLE IF NOT EXISTS answers (
  id                  INTEGER PRIMARY KEY AUTOINCREMENT,
  attempt_id          INTEGER NOT NULL,
  question_id         INTEGER NOT NULL,
  selected_index      INTEGER,
  is_correct          INTEGER DEFAULT 0,
  time_spent_seconds  INTEGER DEFAULT 0,
  FOREIGN KEY(attempt_id) REFERENCES attempts(id) ON DELETE CASCADE,
  FOREIGN KEY(question_id) REFERENCES questions(id) ON DELETE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_answer_unique ON answers(attempt_id, question_id);

/* FRIENDS */
CREATE TABLE IF NOT EXISTS friends (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id        INTEGER NOT NULL,
  friend_user_id INTEGER NOT NULL,
  status         TEXT NOT NULL DEFAULT 'pending',
  created_at     DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, friend_user_id),
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY(friend_user_id) REFERENCES users(id) ON DELETE CASCADE
);
