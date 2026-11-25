# CodeGo LMS product decisions

## Google sign-in and user menu

- The user approved implementing the simple Boodle-inspired login page: CodeGo name and **Login with Google** button.
- Google OAuth returns name, email, and profile photo. Link or create a CodeGo account from the Google profile, reject an email explicitly marked unverified, and use Google's stable ID to link the account.
- The dashboard header shows the user's avatar. Clicking it opens an account menu inspired by GitHub.
- Show avatar, name, and email at the top of the menu, an LMS dashboard navigation item, and **Sign out** at the bottom.
- Keep the Google session exchange server-to-client and do not put the JWT in a URL.

## Roles and batch enrollment

- Google sign-in must not automatically enroll a user into a batch. New Google accounts have the trainee role by default and remain unenrolled until an admin enrolls them.
- Designate `jronquillo@joysistvi.edu.ph` as the LMS admin through explicit one-time account provisioning. Do not make every account from the school email domain an admin.
- The admin is responsible for assigning trainees to the correct batch and managing batch enrollment, to avoid accidental cross-batch assignments.
- Keep completed batches archived and preserve their enrollment history. The admin controls which batch is active and who is enrolled in it.
- The admin dashboard has an Enrollment page at `/admin`. It lets admins create and edit Java batches, archive completed batches while preserving history, review selected batch rosters, enroll or reactivate existing trainees, and enroll by manually entering an email (including a trainee who has not logged in yet). The email flow creates a trainee account that Google sign-in can link by matching email. Archived batches are excluded, and users with an active enrollment in another batch are excluded from the candidate list.

## Implementation status

- The client login screen, callback page, and avatar menu are implemented.
- The server Google account mapping, callback redirect, session-to-JWT exchange, and logout endpoint are implemented.
- Admin-managed manual enrollment is the chosen policy; no auto-enrollment is implemented or wanted on login.
- Trainees resolve their classroom from their active, non-archived enrollment. If multiple active enrollments are present, the trainee dashboard asks them to choose a batch.
- Verify the end-to-end flow in the browser after restarting both dev servers. Check Google cancellation, successful trainee login, existing trainer/admin account login, profile photo, and logout.
- Do not treat an OAuth profile display alone as proof that the user has an LMS account or JWT session.
- Keep the product name **CodeGo LMS**.
