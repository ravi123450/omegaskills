// src/lib/api.js
// One source of truth for API origin
const API_ORIGIN = (import.meta.env.VITE_API_URL || "http://54.89.165.43").replace(/\/$/, "");
const BASE = `${API_ORIGIN}/api`;

/* -------------------------- core fetch helper -------------------------- */
function pickToken(explicitToken) {
  if (explicitToken !== undefined) return explicitToken; // allow explicit null
  try {
    const auth = JSON.parse(localStorage.getItem("auth") || "null");
    if (auth?.token) return auth.token;
    if (auth?.accessToken) return auth.accessToken;
    if (auth?.jwt) return auth.jwt;
  } catch {}
  return localStorage.getItem("token") || null;
}

export async function request(path, opts = {}) {
  const token = pickToken(opts.token);
  const isFormData = typeof FormData !== "undefined" && opts.body instanceof FormData;

  const headers = {
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    ...(token ? { Authorization: `Bearer ${token}`, "x-auth-token": token } : {}),
    ...(opts.headers || {}),
  };

  let body = opts.body;
  if (body !== undefined && body !== null && !isFormData && typeof body !== "string") {
    body = JSON.stringify(body);
  }

  const res = await fetch(BASE + path, {
    method: opts.method || "GET",
    headers,
    body,
    credentials: "include", // keep cookie session support
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.error || data.message || res.statusText || "Request failed");
    err.status = res.status;
    err.data = data;
    if (res.status === 401) {
      localStorage.removeItem("auth");
      localStorage.removeItem("token");
    }
    throw err;
  }
  return data;
}

/* ------------------------------- AUTH --------------------------------- */
// OTP-first signup (does NOT create account yet)
export const signupStart = (name, email, password) =>
  request("/auth/signup", { method: "POST", token: null, body: { name, email, password } });

// Verify signup OTP (creates account + logs user in on server, returns user/token)
export const verifySignupOtp = (pending_id, otp) =>
  request("/auth/signup-verify", { method: "POST", token: null, body: { pending_id, otp } });

// Resend signup OTP
export const resendSignupOtp = (pending_id) =>
  request("/auth/signup-resend", { method: "POST", token: null, body: { pending_id } });

// ⚠️ Back-compat aliases so existing imports continue to work.
// These now point to OTP-first flow intentionally.
export const signUp = (name, email, password) => signupStart(name, email, password);
export const signup = (...args) => signUp(...args);

export const signIn = async (email, password) => {
  const data = await request("/auth/login", { method: "POST", token: null, body: { email, password } });
  const token = data?.token || data?.accessToken || data?.jwt || data?.authToken || null;
  if (token) localStorage.setItem("token", token);
  return { token, user: data.user ?? data.profile ?? null };
};

export const me = (token) => request("/auth/me", { method: "GET", token });
export const logout = () => request("/auth/logout", { method: "POST", token: null });

/* ----------------------- COURSES / EXAMS / DASHBOARD ------------------- */
export const getCourses = (token) => request("/courses", { method: "GET", token });
export const getExams = (token, courseId) => request(`/courses/${courseId}/exams`, { method: "GET", token });
export const startAttempt = (token, exam_id) =>
  request("/attempts/start", { method: "POST", token, body: { exam_id } });
export const saveAnswer = (token, attempt_id, question_id, chosen, time_spent_sec = 0) =>
  request(`/attempts/${attempt_id}/answer`, { method: "POST", token, body: { question_id, chosen, time_spent_sec } });
export const focusViolation = (token, attempt_id) =>
  request(`/attempts/${attempt_id}/focus-violation`, { method: "POST", token });
export const finishAttempt = (token, attempt_id) =>
  request(`/attempts/${attempt_id}/finish`, { method: "POST", token });
export const myAttempts = (token) => request("/attempts/my", { method: "GET", token });
export const getDashboard = (token) => request("/dashboard", { method: "GET", token });

/* -------------------------------- FRIENDS ------------------------------ */
export const getFriends = (token) => request("/friends", { method: "GET", token });
export const sendFriendRequest = (token, email) =>
  request("/friends/request", { method: "POST", token, body: { email } });
export const friendRequest = (...args) => sendFriendRequest(...args); // alias
export const respondFriendRequest = (token, from_user_id, action) =>
  request("/friends/respond", { method: "POST", token, body: { from_user_id, action } });
export const friendRespond = (...args) => respondFriendRequest(...args); // alias
export const removeFriend = (token, friend_id) =>
  request(`/friends/${friend_id}`, { method: "DELETE", token });
export const getFriendsLeaderboard = (token) =>
  request("/leaderboard/friends", { method: "GET", token });

/* -------------------------------- ADMIN ------------------------------- */
export const grantAccessBulk = (token, course_id, emails) =>
  request("/admin/access/bulk", { method: "POST", token, body: { course_id, emails } });
export const createCourse = (token, { title, description, is_public }) =>
  request("/admin/courses", { method: "POST", token, body: { title, description, is_public } });
export const deleteCourse = (token, course_id) =>
  request(`/admin/courses/${course_id}`, { method: "DELETE", token });

/* ------------------------------- PUBLIC ------------------------------- */
export const getCoursesPublic = () =>
  request("/public/courses", { method: "GET", token: null });

/* --------------------------- MOCK INTERVIEWS -------------------------- */
export const getMockSlotsPublic = () =>
  request("/public/mock-slots", { method: "GET", token: null });
export const getMockSlots = (token) =>
  request("/mock-slots", { method: "GET", token });
export const createMockSlot = (token, payload) =>
  request("/admin/mock-slots", { method: "POST", token, body: payload });
export const deleteMockSlot = (token, slot_id) =>
  request(`/admin/mock-slots/${slot_id}`, { method: "DELETE", token });
export const toggleMockSlot = (token, slot_id) =>
  request(`/admin/mock-slots/${slot_id}/toggle`, { method: "POST", token });
