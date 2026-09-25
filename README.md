# MockVue — AI-Powered Mock Interview & Technical Evaluation Platform

> **A Production-Grade, Full-Stack Academic Capstone Project for Campus Placements & Technical Interviews.**

[![Node.js](https://img.shields.io/badge/Node.js-v24.19.0-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-v18.3.1-blue.svg)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-v6.0.7-purple.svg)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v3.4.17-38bdf8.svg)](https://tailwindcss.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-brightgreen.svg)](https://www.mongodb.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## 1. Executive Summary & Problem Statement

College placement preparation frequently suffers from a critical gap: students either solve disconnected algorithmic problems on competitive programming sites without verbalizing their thought processes, or they experience high stress during real interviews due to unfamiliarity with timed, question-by-question technical evaluations.

**MockVue** bridges this gap by providing an end-to-end, AI-powered interview platform designed specifically for campus placements and technical evaluations.

### Key Capabilities:
1. **Dynamic Question Generation:** Adapts questions dynamically to target roles (SDE, Frontend, Backend, Full Stack, Data Analyst), topic domains (DSA, DBMS, OS, Networks, System Design), and difficulty tiers (Easy, Medium, Hard).
2. **Dual-Mode Answer Submission:** Supports both typed structured explanations and live speech-to-text voice dictation using browser Web Speech APIs.
3. **4-Tier Semantic Evaluation Rubric:** Evaluates responses out of 100 points based on:
   - **Technical Correctness (40%)**
   - **Relevance (20%)**
   - **Completeness & Edge Cases (20%)**
   - **Clarity & Structure (20%)**
4. **Anti-Cheating & Assessment Integrity:** Reference answers and grading rubrics are strictly sanitized and concealed on the server until the session is completed.
5. **Privacy-Preserving Focus Monitoring:** Tracks candidate presence and multi-face alerts locally in the browser without recording or streaming raw video footage.
6. **Data-Driven Performance Analytics:** Aggregates real MongoDB records to compute score trajectories over time, topic proficiency bars, and personalized next-interview recommendations.

---

## 2. System Architecture & Tech Stack

```text
                            ┌──────────────────────────────────────────────┐
                            │              BROWSER / CLIENT                │
                            │  React 18 • Vite • Tailwind • Recharts • STT │
                            └──────────────────────┬───────────────────────┘
                                                   │
                                      HTTPS / REST (JWT Bearer)
                                                   │
                            ┌──────────────────────▼───────────────────────┐
                            │             EXPRESS API BACKEND              │
                            │  Security Guard • Engine • Rubric Evaluator  │
                            └───────┬──────────────┬──────────────┬────────┘
                                    │              │              │
                   Mongoose / ODM   │              │ Strategy     │ Local Privacy
                                    │              │ Pattern      │ Telemetry
           ┌────────────────────────▼───┐   ┌──────▼──────┐   ┌───▼─────────────────┐
           │     MONGODB DATABASE       │   │  AI SERVICE │   │  FOCUS MONITORING   │
           │ Users, Interviews, Answers,│   │(Gemini / OAI│   │  (MediaPipe Client  │
           │ Questions, MonitoringLogs  │   │ / Fallback) │   │   Presence Engine)  │
           └────────────────────────────┘   └─────────────┘   └─────────────────────┘
```

### Technology Breakdown:
* **Frontend:** React 18, Vite 6, Tailwind CSS 3 (Dark/Light mode design system), React Router 6, Axios, Recharts, Lucide Icons, Canvas Confetti.
* **Backend:** Node.js (v24), Express 4, Mongoose 8, JWT, bcryptjs, Helmet, CORS, Express-Rate-Limit, Morgan.
* **Database Resilience:** Standard MongoDB with automatic in-memory fallback (`mongodb-memory-server`) during development and offline viva demonstrations.
* **AI Layer:** Provider-agnostic adapter decoupling business logic from external LLMs (Google Gemini, OpenAI GPT-4o-mini, or Curated Placement Bank).

---

## 3. Database Schema Design

* **`User`:** Identity, bcrypt password hash, placement preferences (`targetRole`, `experienceLevel`, `preferredTopics`, `bio`).
* **`Interview`:** Session status state machine (`created` → `in_progress` → `completed`), question references, overall score, timestamp metrics.
* **`Question`:** Text, topic, difficulty, type, reference concepts, evaluation criteria (sanitized during active interview).
* **`Answer`:** Candidate response, overall rubric score (0–100), 4-tier criteria breakdown, identified concepts, missing concepts, constructive feedback, and model answer.
* **`MonitoringEvent`:** Presence events (`no_face_detected`, `multiple_faces_detected`, `tab_switched`), timestamps, durations, confidence scores.

---

## 4. API Endpoints

### Authentication
* `POST /api/auth/register` — Register candidate account & issue JWT.
* `POST /api/auth/login` — Authenticate credentials & return session token.
* `GET /api/auth/me` — Fetch authenticated profile.

### Candidate Profile
* `GET /api/users/profile` — Fetch candidate settings and preferences.
* `PUT /api/users/profile` — Update target role, experience level, topics, and bio.

### Interview Engine
* `POST /api/interviews/generate` — Generate dynamic AI placement questions & initialize interview.
* `GET /api/interviews/:id` — Fetch interview session (questions sanitized during active state).
* `POST /api/interviews/:id/start` — Transition status to `in_progress` and start timer.
* `POST /api/interviews/:id/answer` — Submit answer, evaluate against rubric, and progress pointer.
* `POST /api/interviews/:id/complete` — Finalize session and compute cumulative score.
* `GET /api/interviews/history` — Retrieve candidate's past interview sessions.
* `GET /api/interviews/:id/report` — Fetch comprehensive end-of-interview assessment report.

### Analytics & Monitoring
* `GET /api/analytics/overview` — Aggregated counts, mean score, and practice duration.
* `GET /api/analytics/performance` — Chronological score trends and topic proficiency bars.
* `POST /api/interviews/:id/monitoring` — Log client-side presence/focus event.

---

## 5. Local Setup & Quick Start

### Prerequisites
* Node.js v18+ (tested on v24.19)
* npm v9+

### 1. Clone & Install
```bash
# Clone the repository
git clone https://github.com/mockvue/mockvue.git
cd mockvue

# Install all dependencies (root, server, and client)
npm run install:all
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env` in `server/`:
```bash
cp server/.env.example server/.env
```

*(Note: MockVue runs out-of-the box using its curated offline placement bank and automatic in-memory MongoDB without requiring an external DB installation or paid API keys).*

### 3. Launch the Platform
```bash
# Run both client and server concurrently
npm run dev
```

* **Client:** `http://localhost:5173`
* **API Server:** `http://localhost:5000`
* **Healthcheck:** `http://localhost:5000/api/health`

---

## 6. Automated Testing Suite

MockVue includes automated end-to-end integration tests:

```bash
# Run AI Integration & Fallback Tests
node server/tests/ai_service.test.js

# Run Full 10-Step End-to-End User Flow Test
node server/tests/e2e_full_flow.test.js
```

---

## 7. Comprehensive Viva Defense Q&A

### Q1: Why use an Adapter Pattern for the AI Service layer instead of calling an LLM directly in the controller?
**Answer:** Directly calling an LLM inside an Express controller creates tight vendor coupling. If an API provider changes its endpoints, pricing, or experiences an outage during an evaluation, the entire application fails. The Adapter Pattern defines a strict `AIProvider` interface (`generateQuestions` and `evaluateAnswer`). Concrete adapters (Gemini, OpenAI, Fallback) implement this interface. If an external API key is invalid or times out (>12s), the `AIServiceManager` catches the error and smoothly falls back to the curated placement bank without crashing the user session.

### Q2: How is cheating prevented during active interviews?
**Answer:** In `interview.controller.js`, when a candidate queries `GET /api/interviews/:id`, the backend inspects `interview.status`. If the interview is `created` or `in_progress`, the server strips `referenceConcepts` and `evaluationCriteria` from all question objects before dispatching the JSON payload. Only after the interview reaches `status === 'completed'` does the report route expose expected answers and rubric keys.

### Q3: Why run focus monitoring locally on the client instead of streaming video to a server?
**Answer:** Streaming 30 FPS video to a Node.js or Python backend consumes enormous server bandwidth, introduces high cloud latency, and creates major privacy liabilities. MockVue executes computer vision locally in the browser using MediaPipe / WebAssembly. Frames are analyzed on the candidate's GPU, and only lightweight telemetry events (e.g. `no_face_detected` for 6s) are dispatched via JSON to the backend. Raw video footage is never stored.

### Q4: How does the countdown timer handle page refreshes or background browser throttling?
**Answer:** Rather than relying on simple JavaScript `setInterval` counters (which drift when browser tabs are backgrounded or reset on page reload), MockVue uses a **target timestamp architecture**. When the interview starts, the server and client store the absolute Unix timestamp (`targetEndTime = Date.now() + duration * 60 * 1000`). On every interval tick or reload, remaining seconds are calculated as `Math.max(0, targetEndTime - Date.now())`. This ensures accurate, jump-free time tracking regardless of reloads or tab switches.

### Q5: How does the database handle local development if no local MongoDB service is installed?
**Answer:** In `server/src/config/db.js`, the connection attempts to reach `MONGODB_URI` with a 3-second timeout. If the connection fails in `development` mode, it dynamically initializes an embedded `mongodb-memory-server` instance. This guarantees that evaluators and professors can run the project on any computer without pre-installing MongoDB.

---

## 8. Academic Integrity & Ethics

* **Focus Monitoring Disclaimer:** All computer vision telemetry is strictly framed as engagement and presence indicators. The system makes no claims regarding lie detection, intent, or conclusive cheating proof.
* **Rubric Transparency:** Candidates receive transparent breakdowns across 4 distinct criteria so they can systematically prepare for campus placement interviews.

---
*Built with ❤️ for B.Tech Campus Placement Success.*
