-- schema.pg.sql  (PostgreSQL / Neon)

-- Optional but nice to have:
-- CREATE EXTENSION IF NOT EXISTS pgcrypto;

BEGIN;

-- =========================== USERS ===========================
CREATE TABLE IF NOT EXISTS users (
  id            BIGSERIAL PRIMARY KEY,
  name          TEXT        NOT NULL,
  email         TEXT        NOT NULL UNIQUE,
  password_hash TEXT        NOT NULL,
  role          TEXT        NOT NULL DEFAULT 'student',  -- 'admin' | 'student'
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- (UNIQUE already indexes email; keep extra index out)

-- =========================== COURSES ===========================
CREATE TABLE IF NOT EXISTS courses (
  id          BIGSERIAL PRIMARY KEY,
  title       TEXT        NOT NULL,
  description TEXT,
  cover       TEXT,
  is_public   BOOLEAN     NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================ EXAMS ============================
CREATE TABLE IF NOT EXISTS exams (
  id               BIGSERIAL PRIMARY KEY,
  course_id        BIGINT      NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title            TEXT        NOT NULL,
  duration_minutes INTEGER     NOT NULL DEFAULT 90,
  duration_sec     INTEGER     NOT NULL DEFAULT 5400,
  total_marks      INTEGER     NOT NULL DEFAULT 100,
  is_free          BOOLEAN     NOT NULL DEFAULT FALSE,
  config_json      JSONB       NOT NULL DEFAULT '{}'::jsonb,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_exams_course ON exams(course_id);

-- Sync NEW.duration_sec when null/<=0 (SQLite trigger replacement)
CREATE OR REPLACE FUNCTION trg_exams_duration_sync() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.duration_sec IS NULL OR NEW.duration_sec <= 0 THEN
    NEW.duration_sec := COALESCE(NEW.duration_minutes, 0) * 60;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_exams_duration_sync_insert ON exams;
DROP TRIGGER IF EXISTS trg_exams_duration_sync_update ON exams;

CREATE TRIGGER trg_exams_duration_sync_insert
BEFORE INSERT ON exams
FOR EACH ROW
EXECUTE FUNCTION trg_exams_duration_sync();

CREATE TRIGGER trg_exams_duration_sync_update
BEFORE UPDATE OF duration_minutes, duration_sec ON exams
FOR EACH ROW
EXECUTE FUNCTION trg_exams_duration_sync();

-- ========================= EXAM TOPICS =========================
CREATE TABLE IF NOT EXISTS exam_topics (
  id       BIGSERIAL PRIMARY KEY,
  exam_id  BIGINT NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
  name     TEXT   NOT NULL,
  slug     TEXT,
  section  TEXT
);

-- =========================== QUESTIONS =========================
CREATE TABLE IF NOT EXISTS questions (
  id             BIGSERIAL PRIMARY KEY,
  exam_id        BIGINT  NOT NULL REFERENCES exams(id)       ON DELETE CASCADE,
  topic_id       BIGINT  NOT NULL REFERENCES exam_topics(id) ON DELETE CASCADE,
  type           TEXT    NOT NULL DEFAULT 'mcq',
  text           TEXT    NOT NULL,
  options_json   JSONB   NOT NULL,      -- ["A","B","C","D"]
  correct_index  INTEGER,                -- 0-based / optional
  answer         TEXT,                   -- e.g. "A"
  explanation    TEXT,
  difficulty     TEXT,
  tags           TEXT,
  marks          INTEGER NOT NULL DEFAULT 1,
  negative_marks NUMERIC(6,2) NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_questions_exam ON questions(exam_id);

-- Legacy-compatible view (unchanged name/shape)
DROP VIEW IF EXISTS exam_questions;
CREATE VIEW exam_questions AS
SELECT q.exam_id AS exam_id, q.id AS question_id
FROM questions q;

-- ============================ ACCESS ===========================
CREATE TABLE IF NOT EXISTS access (
  id         BIGSERIAL PRIMARY KEY,
  user_id    BIGINT      NOT NULL REFERENCES users(id)   ON DELETE CASCADE,
  course_id  BIGINT      NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  expires_at TIMESTAMPTZ,
  granted_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
  UNIQUE(user_id, course_id)
);

-- Compatibility view for legacy scripts that used "course_access"
DROP VIEW IF EXISTS course_access;
CREATE VIEW course_access AS
SELECT id, user_id, course_id FROM access;

-- =========================== ATTEMPTS ==========================
-- epoch millis are BIGINT here to match your existing usage
CREATE TABLE IF NOT EXISTS attempts (
  id           BIGSERIAL PRIMARY KEY,
  user_id      BIGINT  NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  exam_id      BIGINT  NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
  started_at   BIGINT  NOT NULL,  -- epoch ms
  submitted_at BIGINT,
  duration_sec INTEGER NOT NULL,  -- snapshot from exam
  last_seen_at BIGINT,
  score        DOUBLE PRECISION,
  breakdown    JSONB
);
CREATE INDEX IF NOT EXISTS idx_attempts_user ON attempts(user_id);

-- ============================ ANSWERS ==========================
CREATE TABLE IF NOT EXISTS answers (
  id                 BIGSERIAL PRIMARY KEY,
  attempt_id         BIGINT NOT NULL REFERENCES attempts(id)  ON DELETE CASCADE,
  question_id        BIGINT NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  selected_index     INTEGER,
  is_correct         BOOLEAN NOT NULL DEFAULT FALSE,
  time_spent_seconds INTEGER NOT NULL DEFAULT 0,
  UNIQUE(attempt_id, question_id)
);

-- ============================ FRIENDS ==========================
CREATE TABLE IF NOT EXISTS friends (
  id             BIGSERIAL PRIMARY KEY,
  user_id        BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  friend_user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status         TEXT   NOT NULL DEFAULT 'pending',
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, friend_user_id)
);

-- Compatibility view for legacy code that used "friendships(user_id, friend_id)"
DROP VIEW IF EXISTS friendships;
CREATE VIEW friendships AS
SELECT
  id,
  user_id,
  friend_user_id AS friend_id,
  status,
  created_at
FROM friends;

-- ======================= PASSWORD RESETS =======================
CREATE TABLE IF NOT EXISTS password_resets (
  id            BIGSERIAL PRIMARY KEY,
  user_id       BIGINT  NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token         TEXT,                -- reset link token
  otp_code_hash TEXT,                -- hashed 6-digit OTP
  expires_at    BIGINT NOT NULL,     -- epoch ms
  used          BOOLEAN NOT NULL DEFAULT FALSE,
  created_at    BIGINT NOT NULL      -- epoch ms
);

-- ========================== LOGIN OTPS =========================
CREATE TABLE IF NOT EXISTS login_otps (
  id         BIGSERIAL PRIMARY KEY,
  user_id    BIGINT  NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  code_hash  TEXT    NOT NULL,
  expires_at BIGINT  NOT NULL,
  consumed   BOOLEAN NOT NULL DEFAULT FALSE,
  created_at BIGINT  NOT NULL
);

-- ======================== PENDING SIGNUPS ======================
CREATE TABLE IF NOT EXISTS pending_signups (
  id             TEXT PRIMARY KEY,
  name           TEXT   NOT NULL,
  email          TEXT   NOT NULL UNIQUE,
  password_hash  TEXT   NOT NULL,
  otp_code       TEXT   NOT NULL,
  otp_expires_at BIGINT NOT NULL,
  attempts       INTEGER NOT NULL DEFAULT 0,
  resend_count   INTEGER NOT NULL DEFAULT 0,
  created_at     BIGINT  NOT NULL
);

COMMIT;
