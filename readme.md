# SkillPath AI 🎯

> **Personalized Skill Learning with Adaptive AI Roadmaps**

SkillPath AI is a Adaptive Learning web application that generates a personalized day-by-day learning roadmap for any technical skill and dynamically adapts it based on how the user actually learns. When a user struggles with a topic, an AI agent regenerates the lesson in a simpler, beginner-friendly format — keeping the learning journey on track no matter what.

---

## The Problem

When someone decides to learn a new skill — Python, React, SQL, Docker — they face three major challenges:

- **No structured roadmap** — they don't know where to start or what order to follow
- **Generic content** — resources on YouTube or Google are not tailored to their pace or level
- **No adaptation** — if they struggle, there is no system to help them recover and continue

SkillPath AI solves all three.

---

## Key Features

### Smart Onboarding
A 5-step form collects the user's skill, timeline, hours per day, available days, and current level. This is used immediately to generate a personalized plan — no waiting.

### AI-Generated Roadmap
An AI agent generates a full day-by-day learning plan broken into logical phases (Basics → Core Concepts → Projects). Each lesson has a topic, difficulty level, estimated time, and scheduled date that respects the user's available days.

### Daily Progress Tracker
Each day the user sees their scheduled lesson and marks it as:
- ✅ **Completed** — move on, streak increases
- 📌 **Missed** — lesson rescheduled to next available day, schedule shifts
- 🔥 **Difficult** — AI regenerates a simplified version of the lesson for tomorrow

### AI Lesson Regenerator
When a user marks a lesson as difficult, an AI agent rewrites it in a beginner-friendly way including a real-world analogy, plain English explanation, minimal code example, and 3 practice exercises. Reference links are fetched dynamically via DuckDuckGo search.

### Smart Rescheduling
The system never places lessons on unavailable days. When shifts occur, all future lessons are rescheduled to the next valid available day — not just blindly shifted by +1 calendar day.

### Timeline Health Indicator
- 🟢 **Green** — on track
- 🟡 **Yellow** — 1 day behind
- 🔴 **Red** — 2+ days behind, with option to extend the timeline

### Multi-Skill Support
Users can learn multiple skills simultaneously. A skill switcher in the sidebar lets users switch between their active learning plans.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14, TypeScript, Tailwind CSS, shadcn/ui |
| Backend | Python, FastAPI, SQLAlchemy (async) |
| Database | PostgreSQL |
| AI | OpenAI API (gpt-4o-mini) |
| Reference Search | DuckDuckGo Search (duckduckgo-search) |
| Auth | Session-based (HTTP-only cookies) |

---

## Project Structure

```
skillpath-backend/
├── src/
│   ├── agents/          # AI agents (roadmap + regenerator)
│   ├── config/          # Database and settings
│   ├── dependencies/    # Auth dependencies
│   ├── models/          # SQLAlchemy models
│   ├── repository/      # Database query layer
│   ├── routes/          # FastAPI routers
│   ├── schemas/         # Pydantic schemas
│   ├── services/        # Business logic
│   └── utils/           # Date utils, reference fetcher

skillpath-frontend/
├── src/
│   ├── app/
│   │   ├── onboarding/        # Onboarding form
│   │   ├── generating/        # AI generation loading screen
│   │   └── user_dashboard/    # Main app pages
│   │       ├── overview/      # Dashboard
│   │       ├── roadmap/       # Full roadmap view
│   │       ├── today/         # Today's lesson
│   │       ├── lesson/[id]/   # Lesson content
│   │       ├── progress/      # Progress & analytics
│   │       ├── profile/       # User profile
│   │       └── settings/      # Plan settings
│   ├── components/      # Reusable UI components
│   ├── context/         # PlanContext (global plan state)
│   ├── hooks/           # useAuth, usePlanContext
│   └── lib/             # api.ts, utils.ts
```

---

## Getting Started

### Prerequisites

- Python 3.10+
- Node.js 18+
- PostgreSQL
- OpenAI API key

### Backend Setup

```bash
cd skillpath-backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Create .env file
cp .env.example .env
# Fill in DB credentials and OPENAI_API_KEY

# Run the server
uvicorn src.main:app --reload
```

### Frontend Setup

```bash
cd skillpath-frontend
npm install

# Create .env.local
NEXT_PUBLIC_BACKEND_HOST=localhost
NEXT_PUBLIC_BACKEND_PORT=8000

npm run dev
```

### Environment Variables

**Backend `.env`**
```
DB_USER=postgres
DB_PASSWORD=yourpassword
DB_HOST=localhost
DB_PORT=5432
DB_NAME=skillpath
OPENAI_API_KEY=sk-...
ENV=dev
```

**Frontend `.env.local`**
```
NEXT_PUBLIC_BACKEND_HOST=localhost
NEXT_PUBLIC_BACKEND_PORT=8000
```

---

## API Overview

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/onboarding` | Submit onboarding, generate roadmap |
| GET | `/api/dashboard` | All dashboard data |
| GET | `/api/roadmap/{plan_id}` | Full roadmap by week |
| GET | `/api/today/{plan_id}` | Today's lesson |
| GET | `/api/lesson/{id}/content` | Open lesson content (generates if not exists) |
| POST | `/api/lesson/mark` | Mark completed / missed / difficult |
| GET | `/api/profile` | User info and all plans |
| PUT | `/api/plan/{plan_id}` | Update available days and hours |
| DELETE | `/api/plan/{plan_id}` | Delete a plan |
| PUT | `/api/plan/extend/{plan_id}` | Extend timeline |
| GET | `/api/skills` | List all skills |

---

## How the AI Works

### Roadmap Generation
On onboarding submission, an AI agent receives the skill, level, timeline, and schedule preferences. It generates a structured JSON array of lessons organized into phases. The backend then assigns actual calendar dates to each lesson respecting the user's available days.

### Lesson Regeneration
When a user marks a lesson as difficult, a second AI agent rewrites that lesson with a simplified structure. DuckDuckGo is used to find official documentation links which are appended to the lesson as references. The regenerated lesson is inserted into the next available day and all future lessons shift forward by one slot.

---





