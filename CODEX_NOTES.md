# Codex project notes: CodeGo LMS

Read this file at the start of future work in this workspace, then read `PRODUCT_NOTES.md` for planned product decisions. Treat source code as authoritative if a note and the code disagree. Do not implement future plans unless the user asks.

## Workspace map

- This working directory is the React client (`client/`). It uses React 19, Vite, React Router, Bootstrap, and Oxlint.
- The sibling `../server/` directory is the Express 5 + Mongoose API. It connects to MongoDB Atlas using `MONGODB_STRING`.
- Client API calls live in `src/services/api.js`; pages are in `src/pages/`; shared UI is in `src/components/`.
- `CLAUDE.md` in the client workspace contains older project context that describes a backend repo and says the frontend is future work. Do not rely on those statements as current architecture. `../server/CLAUDE.md` is separate server context.
- The root `README.md` is still the stock Vite template and is not a useful product overview.

## Product and current client state

- Product name is **CodeGo LMS** (formerly Kodigo). Keep user-visible branding as CodeGo.
- The client has trainee and trainer dashboards, sessions and activities, GitHub submissions, an auto-checker status flow, and trainer grading/submission views.
- Trainer dashboard consumes `GET /dashboard/batch/:batchId/trainer`. The API items have shape `{ session, activity, stats }`; the client normalizes them before rendering sortable session rows.
- Trainer session metrics and summary cards are dynamic. The `+ New Session & Activity` button uses one plus icon only.
- Trainee activity counters are scoped to activities in the selected batch; passed count is capped at total activities and pending is clamped at zero. Overall grade was removed and Attendance moved to the last stats card. Attendance is still a hardcoded `92%` placeholder.
- Trainee session rows are laid out as four desktop columns: status/results; session/activity title; GitHub URL, edit/resubmit, and graded-by line; discussed date and activity-feedback link. Responsive CSS stacks/reflows these columns at narrower widths.
- Feedback UI says **How was the activity?** / **Activity Feedback**. The current API operation remains session feedback; change its backend semantics only if explicitly requested.
- Dashboard top-right has a Google-photo avatar fallback and a GitHub-inspired dropdown with name/email, My dashboard, and Sign out.
- Admins land on `/admin`, which provides batch creation/editing, batch archiving, manual trainee enrollment/reactivation, and a roster for selected non-archived batches. Archiving preserves enrollment history. Admins can enroll by email before first login; the server provisions a trainee record that Google OAuth links by email. Archived batches and trainees actively enrolled in a different batch are excluded from enrollment choices.

## Google sign-in status

See `PRODUCT_NOTES.md` for the approved design. Current flow:

- Client goes to `GET /users/google`, then Passport returns to `/auth/callback` on Vite.
- Client exchanges the Passport session at `GET /users/google/session`, receives an access JWT and LMS user record, and stores the JWT through `AuthContext`.
- Google accounts are matched/created in MongoDB; `picture` and `googleId` are stored. New Google accounts are trainees by default; existing `isAdmin` status is preserved when linking by Google email.
- Google sign-in does not enroll a trainee into a batch. The admin manually assigns trainees to the correct batch.
- The user wants `jronquillo@joysistvi.edu.ph` designated as the CodeGo admin through explicit one-time provisioning. Never grant admin to everyone based only on the school email domain.
- Completed batches should be archived with enrollment history retained. Check for an existing admin enrollment UI before planning new work; if absent, admin needs a safe way to enroll and review trainees.
- Client sign-out calls `POST /users/logout`, then clears the local JWT.
- The UI and server bridge build and pass syntax checks, but the complete browser OAuth flow still needs manual verification.

## Deployment discussion and known checks

- The user expects about 25 students. Vercel for the static Vite client plus Render for the Express server may be adequate for a prototype or light pilot, but Render Free is not reliable for a real class and may struggle with concurrent auto-checks. Re-check current vendor terms/limits before making a new recommendation.
- Server CORS now uses `CLIENT_URL` (defaults to `http://localhost:5173`). Production needs `CLIENT_URL`, `GOOGLE_CALLBACK_URL`, and a suitable session secret configured, plus matching Google OAuth redirect configuration.
- `../server/services/checkerService.js` clones trainee repositories and runs `mvn test` via a child process in `../server/temp/submissions`. A production runtime needs Java and Maven installed, and the checker needs a safe isolated execution design and capacity/queue planning. Do not imply the current checker is production-safe.
- Database availability, persistence, and free-tier limits are separate from Vercel/Render hosting and must be checked for the chosen MongoDB provider.

## Collaboration preferences

- The user communicates in Tagalog; reply in Tagalog unless they request otherwise.
- When the user says “plan lang muna” or says not to change code, discuss or document the plan without editing application code.
- For code tasks, inspect existing code and the current Git working tree first. Preserve existing user edits. Report what changed and what verification ran; do not claim a feature is live-tested unless it was actually exercised.
