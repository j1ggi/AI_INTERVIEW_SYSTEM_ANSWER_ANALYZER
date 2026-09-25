# MockVue — Quality Backlog & Issue Tracker

**Severity Categories:**
* **P0 — Critical:** System crash, security vulnerability, data loss, blocker preventing core user flow.
* **P1 — Major:** Broken key feature, evaluation failure, timer failure, submission race condition.
* **P2 — Moderate:** Responsive layout defect, missing edge-case handling, minor animation stutter.
* **P3 — Cosmetic:** Spacing inconsistency, typography tweak, minor color contrast improvement.

---

## Active Issues & Backlog

| Issue ID | Severity | Category | Description | Discovered In | Status | Resolution |
| :--- | :---: | :---: | :--- | :---: | :---: | :--- |
| *None* | - | - | All P0–P3 issues resolved. | Phase 11 | CLOSED | Verified via E2E test suite. |

---

## Resolved Issues Log

| Issue ID | Severity | Description | Phase | Root Cause & Resolution |
| :--- | :---: | :--- | :---: | :--- |
| **ISSUE-01** | P1 | Vite build exceeded 500kB chunk warning for Recharts bundle. | Phase 9 | Added `manualChunks` in `vite.config.js` to split `vendor-charts`, `vendor-react`, and `vendor-icons`. Bundle now splits cleanly under 400kB. |
| **ISSUE-02** | P1 | Node memory ceiling warning on Windows during bundle compilation. | Phase 9 | Added memory cleanup and optimized Rollup chunking rules in Vite configuration. |
| **ISSUE-03** | P0 | Potential cheating vector: reference concepts exposed in GET `/api/interviews/:id` during active session. | Phase 5 | Added server-side projection sanitization in `interview.controller.js` to strip `referenceConcepts` and `evaluationCriteria` until interview status is `'completed'`. |
| **ISSUE-04** | P1 | Timer resets or jumps on page refresh or browser tab backgrounding. | Phase 5 | Implemented absolute Unix timestamp architecture (`targetEndTime = Date.now() + duration * 60 * 1000`) stored in `localStorage` and server checkpoints. |
| **ISSUE-05** | P0 | Missing local `mongod` service on host Windows environment. | Phase 2 | Implemented automatic in-memory MongoDB fallback via `mongodb-memory-server` in `server/src/config/db.js` so MockVue runs out-of-the-box for viva examiners. |
