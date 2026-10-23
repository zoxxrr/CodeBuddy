import "dotenv/config";
import express from "express";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import { db } from "./db.js";
import { lessons, paths, getLesson, evaluateExercise } from "./lessons.js";

const app = express();
const port = Number(process.env.PORT || 3000);
const secret = process.env.JWT_SECRET;

if (!secret || secret.length < 32) {
  if (process.env.NODE_ENV === "production") throw new Error("JWT_SECRET must be at least 32 characters in production.");
  process.env.JWT_SECRET = "development-only-change-this-secret-before-deploying";
}
const jwtSecret = process.env.JWT_SECRET;

app.disable("x-powered-by");
app.use(helmet({ contentSecurityPolicy: { directives: { defaultSrc: ["'self'"], scriptSrc: ["'self'"], styleSrc: ["'self'", "'unsafe-inline'"], imgSrc: ["'self'", "data:"], connectSrc: ["'self'"], objectSrc: ["'none'"], upgradeInsecureRequests: null } } }));
app.use(express.json({ limit: "32kb" }));
app.use(cookieParser());
app.use("/api/auth", rateLimit({ windowMs: 15 * 60 * 1000, limit: 30, standardHeaders: true, legacyHeaders: false }));
app.use("/api", rateLimit({ windowMs: 60 * 1000, limit: 120, standardHeaders: true, legacyHeaders: false }));

const cookieOptions = {
  httpOnly: true,
  sameSite: "lax",
  secure: process.env.COOKIE_SECURE === "true",
  path: "/",
  maxAge: 7 * 24 * 60 * 60 * 1000
};

function safeUser(user) {
  return { id: user.id, username: user.username, xp: user.xp, level: Math.floor(user.xp / 250) + 1, streak: user.streak, longestStreak: user.longest_streak, createdAt: user.created_at };
}

function issueToken(user) {
  return jwt.sign({ sub: String(user.id) }, jwtSecret, { expiresIn: "7d", issuer: "codebuddy" });
}

function authRequired(req, res, next) {
  const token = req.cookies.codebuddy_session;
  if (!token) return res.status(401).json({ error: "Sign in to continue." });
  try {
    const payload = jwt.verify(token, jwtSecret, { issuer: "codebuddy" });
    const user = db.prepare("SELECT id, username, xp, streak, longest_streak, created_at FROM users WHERE id = ?").get(Number(payload.sub));
    if (!user) return res.status(401).json({ error: "Session is no longer valid." });
    req.user = user;
    next();
  } catch {
    res.clearCookie("codebuddy_session", cookieOptions);
    return res.status(401).json({ error: "Your session expired. Please sign in again." });
  }
}

function todayUtc() {
  return new Date().toISOString().slice(0, 10);
}

function touchStreak(userId) {
  const user = db.prepare("SELECT last_active_date, streak, longest_streak FROM users WHERE id = ?").get(userId);
  const today = todayUtc();
  if (user.last_active_date === today) return;
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  const streak = user.last_active_date === yesterday ? user.streak + 1 : 1;
  db.prepare("UPDATE users SET last_active_date = ?, streak = ?, longest_streak = MAX(longest_streak, ?) WHERE id = ?").run(today, streak, streak, userId);
}

function publicStats(userId) {
  const completed = db.prepare("SELECT COUNT(*) AS count FROM lesson_progress WHERE user_id = ?").get(userId).count;
  const attempts = db.prepare("SELECT COUNT(*) AS count, COALESCE(SUM(passed), 0) AS passed FROM exercise_attempts WHERE user_id = ?").get(userId);
  return { completedLessons: completed, attempts: attempts.count, successfulAttempts: attempts.passed };
}

app.get("/api/health", (req, res) => res.json({ status: "ok" }));
app.get("/api/curriculum", (req, res) => {
  res.json({ paths, lessons: lessons.map(({ exercise, quiz, ...lesson }) => ({ ...lesson, exercise: { prompt: exercise.prompt, starter: exercise.starter, hint: exercise.hint }, quiz })) });
});
app.post("/api/auth/register", async (req, res) => {
  const username = typeof req.body.username === "string" ? req.body.username.trim() : "";
  const email = typeof req.body.email === "string" ? req.body.email.trim().toLowerCase() : "";
  const password = typeof req.body.password === "string" ? req.body.password : "";
  if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) return res.status(400).json({ error: "Username must be 3–20 letters, numbers, or underscores." });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) return res.status(400).json({ error: "Enter a valid email address." });
  if (password.length < 10 || password.length > 128) return res.status(400).json({ error: "Password must be between 10 and 128 characters." });
  if (db.prepare("SELECT id FROM users WHERE username = ? OR email = ?").get(username, email)) return res.status(409).json({ error: "That username or email is already registered." });
  const hash = await bcrypt.hash(password, 12);
  try {
    const result = db.prepare("INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)").run(username, email, hash);
    const user = db.prepare("SELECT id, username, xp, streak, longest_streak, created_at FROM users WHERE id = ?").get(result.lastInsertRowid);
    res.cookie("codebuddy_session", issueToken(user), cookieOptions);
    res.status(201).json({ user: safeUser(user) });
  } catch {
    res.status(409).json({ error: "That username or email is already registered." });
  }
});
app.post("/api/auth/login", async (req, res) => {
  const login = typeof req.body.login === "string" ? req.body.login.trim() : "";
  const password = typeof req.body.password === "string" ? req.body.password : "";
  const user = db.prepare("SELECT * FROM users WHERE username = ? COLLATE NOCASE OR email = ? COLLATE NOCASE").get(login, login);
  if (!user || !(await bcrypt.compare(password, user.password_hash))) return res.status(401).json({ error: "The username/email or password is incorrect." });
  res.cookie("codebuddy_session", issueToken(user), cookieOptions);
  res.json({ user: safeUser(user) });
});
app.post("/api/auth/logout", (req, res) => {
  res.clearCookie("codebuddy_session", cookieOptions);
  res.json({ ok: true });
});
app.get("/api/me", authRequired, (req, res) => {
  touchStreak(req.user.id);
  const user = db.prepare("SELECT id, username, xp, streak, longest_streak, created_at FROM users WHERE id = ?").get(req.user.id);
  const progress = db.prepare("SELECT lesson_id, completed_at, score, attempts, next_review_at, interval_days FROM lesson_progress WHERE user_id = ?").all(req.user.id);
  const due = db.prepare("SELECT lesson_id, next_review_at FROM lesson_progress WHERE user_id = ? AND next_review_at <= datetime('now') ORDER BY next_review_at LIMIT 20").all(req.user.id);
  const rewards = db.prepare("SELECT reward_key, xp_delta, created_at FROM reward_history WHERE user_id = ? ORDER BY id DESC LIMIT 20").all(req.user.id);
  res.json({ user: safeUser(user), stats: publicStats(user.id), progress, due, rewards });
});
app.get("/api/lessons/:id", (req, res) => {
  const lesson = getLesson(req.params.id);
  if (!lesson) return res.status(404).json({ error: "Lesson not found." });
  const { exercise, ...rest } = lesson;
  res.json({ ...rest, exercise: { prompt: exercise.prompt, starter: exercise.starter, hint: exercise.hint, solution: exercise.solution }, pathTitle: paths.find(p => p.id === lesson.path)?.title });
});
app.post("/api/lessons/:id/attempt", authRequired, (req, res) => {
  const lesson = getLesson(req.params.id);
  if (!lesson) return res.status(404).json({ error: "Lesson not found." });
  const source = req.body.code;
  const usedHint = req.body.usedHint === true;
  const result = evaluateExercise(lesson, source);
  db.prepare("INSERT INTO exercise_attempts (user_id, lesson_id, passed, used_hint) VALUES (?, ?, ?, ?)").run(req.user.id, lesson.id, result.passed ? 1 : 0, usedHint ? 1 : 0);
  if (!result.passed) return res.json(result);
  const existing = db.prepare("SELECT * FROM lesson_progress WHERE user_id = ? AND lesson_id = ?").get(req.user.id, lesson.id);
  if (existing) {
    const attempts = existing.attempts + 1;
    const interval = Math.min(Math.max(existing.interval_days * (usedHint ? 1 : 2), 1), 30);
    db.prepare("UPDATE lesson_progress SET attempts = ?, score = MAX(score, 100), interval_days = ?, next_review_at = datetime('now', ?) WHERE user_id = ? AND lesson_id = ?")
      .run(attempts, interval, `+${interval} days`, req.user.id, lesson.id);
    return res.json({ ...result, alreadyCompleted: true, xpAwarded: 0, progress: publicStats(req.user.id) });
  }
  const rewardKey = `lesson:${lesson.id}`;
  const award = db.transaction(() => {
    const insert = db.prepare("INSERT OR IGNORE INTO reward_history (user_id, reward_key, xp_delta) VALUES (?, ?, ?)").run(req.user.id, rewardKey, lesson.xp);
    if (!insert.changes) return 0;
    db.prepare("UPDATE users SET xp = xp + ? WHERE id = ?").run(lesson.xp, req.user.id);
    db.prepare("INSERT INTO lesson_progress (user_id, lesson_id, score, attempts, interval_days, next_review_at) VALUES (?, ?, 100, 1, ?, datetime('now', '+1 day'))").run(req.user.id, lesson.id, lesson.reviewDays || 1);
    touchStreak(req.user.id);
    return lesson.xp;
  });
  const xpAwarded = award();
  const user = db.prepare("SELECT id, username, xp, streak, longest_streak, created_at FROM users WHERE id = ?").get(req.user.id);
  res.json({ ...result, alreadyCompleted: false, xpAwarded, user: safeUser(user), progress: publicStats(req.user.id) });
});
app.post("/api/quiz/:id", authRequired, (req, res) => {
  const lesson = getLesson(req.params.id);
  if (!lesson) return res.status(404).json({ error: "Lesson not found." });
  const answer = Number(req.body.answer);
  const correct = Number.isInteger(answer) && answer === lesson.quiz.answer;
  res.json({ correct, explanation: lesson.quiz.explanation });
});
app.get("/api/leaderboard", (req, res) => {
  const period = req.query.period === "weekly" ? "weekly" : "all";
  const rows = period === "weekly"
    ? db.prepare("SELECT u.id, u.username, u.xp, COUNT(DISTINCT p.lesson_id) AS lessons FROM users u LEFT JOIN lesson_progress p ON p.user_id = u.id AND p.completed_at >= datetime('now', '-7 days') GROUP BY u.id ORDER BY (SELECT COALESCE(SUM(r.xp_delta),0) FROM reward_history r WHERE r.user_id=u.id AND r.created_at >= datetime('now','-7 days')) DESC, u.xp DESC LIMIT 50").all()
    : db.prepare("SELECT u.id, u.username, u.xp, COUNT(DISTINCT p.lesson_id) AS lessons FROM users u LEFT JOIN lesson_progress p ON p.user_id = u.id GROUP BY u.id ORDER BY u.xp DESC, lessons DESC LIMIT 50").all();
  const result = rows.map((row, index) => ({ rank: index + 1, username: row.username, xp: row.xp, level: Math.floor(row.xp / 250) + 1, lessons: row.lessons }));
  res.json({ period, entries: result });
});
app.get("/api/profiles/:username", (req, res) => {
  const user = db.prepare("SELECT id, username, xp, streak, longest_streak, created_at FROM users WHERE username = ? COLLATE NOCASE").get(req.params.username);
  if (!user) return res.status(404).json({ error: "Profile not found." });
  const stats = publicStats(user.id);
  const achievements = [];
  if (user.xp >= 100) achievements.push("Getting started");
  if (stats.completedLessons >= 5) achievements.push("Curious builder");
  if (stats.completedLessons >= 10) achievements.push("Consistent learner");
  res.json({ user: safeUser(user), stats, achievements });
});
app.get("/api/reviews", authRequired, (req, res) => {
  const due = db.prepare("SELECT p.lesson_id, p.next_review_at, p.interval_days, l.title FROM lesson_progress p LEFT JOIN (SELECT '' AS title) l ON 1=0 WHERE p.user_id = ? AND p.next_review_at <= datetime('now') ORDER BY p.next_review_at LIMIT 20").all(req.user.id);
  res.json({ reviews: due.map(item => ({ ...item, title: getLesson(item.lesson_id)?.title || item.lesson_id })) });
});
app.use(express.static("public"));
app.get("*", (req, res) => res.sendFile(new URL("../public/index.html", import.meta.url).pathname));
app.use((err, req, res, next) => {
  res.status(500).json({ error: "Something went wrong. Please try again." });
});

app.listen(port, () => {
  process.stdout.write(`CodeBuddy is ready on http://localhost:${port}\n`);
});
