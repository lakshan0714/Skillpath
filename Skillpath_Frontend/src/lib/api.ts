const BACKEND = `http://${process.env.NEXT_PUBLIC_BACKEND_HOST}:${process.env.NEXT_PUBLIC_BACKEND_PORT}`;

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BACKEND}${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: "Request failed" }));
    throw new Error(error.detail || "Request failed");
  }

  return res.json();
}

// ── Auth ──────────────────────────────────────────
export const getMe = () =>
  request("/user/me");

// ── Onboarding ────────────────────────────────────
export const submitOnboarding = (data: {
  skill_name: string;
  timeline_weeks: number;
  hours_per_day: number;
  available_days: string[];
  level: string;
}) => request("/api/onboarding", { method: "POST", body: JSON.stringify(data) });

// ── Dashboard ─────────────────────────────────────
export const getDashboard = () =>
  request("/api/dashboard");

// ── Roadmap ───────────────────────────────────────
export const getRoadmap = (planId: number) =>
  request(`/api/roadmap/${planId}`);

// ── Today ─────────────────────────────────────────
export const getTodayLesson = (planId: number) =>
  request(`/api/today/${planId}`);

// ── Lesson ────────────────────────────────────────
export const getLessonContent = (lessonId: number) =>
  request(`/api/lesson/${lessonId}/content`);

export const markLesson = (data: {
  lesson_id: number;
  plan_id: number;
  status: "completed" | "missed" | "difficult";
}) => request("/api/lesson/mark", { method: "POST", body: JSON.stringify(data) });

// ── Skills ────────────────────────────────────────
export const getSkills = () =>
  request("/api/skills");

// ── Profile ───────────────────────────────────────
export const getProfile = () =>
  request("/api/profile");

// ── Plan management ───────────────────────────────
export const getPlan = (planId: number) =>
  request(`/api/plan/${planId}`);

export const updatePlan = (planId: number, data: {
  available_days: string[];
  hours_per_day: number;
}) => request(`/api/plan/${planId}`, { method: "PUT", body: JSON.stringify(data) });

export const deletePlan = (planId: number) =>
  request(`/api/plan/${planId}`, { method: "DELETE" });

export const extendPlan = (planId: number, days: number) =>
  request(`/api/plan/extend/${planId}`, {
    method: "PUT",
    body: JSON.stringify({ days }),
  });