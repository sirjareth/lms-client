import { Link } from 'react-router-dom';

export default function PrivacyPolicy() {
  return (
    <main className="container py-5" style={{ maxWidth: 900 }}>
      <header className="d-flex align-items-center gap-3 mb-4">
        <img src="/codego-logo.png" alt="" style={{ width: 40, height: 40 }} />
        <Link to="/" className="fs-4 fw-bold text-decoration-none" style={{ color: '#0f172a' }}>CodeGo LMS</Link>
      </header>

      <article className="bg-white border rounded-3 shadow-sm p-4 p-md-5">
        <h1 className="fw-bold mb-2">Privacy Policy</h1>
        <p className="text-muted">Last updated: November 26, 2026</p>

        <p>
          This Privacy Policy explains how CodeGo LMS collects and uses information when
          trainees, trainers, and administrators use the learning management system.
        </p>

        <h2 className="h5 fw-bold mt-4">Information we collect</h2>
        <ul>
          <li>Account details such as name, email address, and mobile number when provided during registration.</li>
          <li>When you sign in with Google: your Google account identifier, name, email address, and profile photo.</li>
          <li>Training records such as batch enrollment, session and activity progress, attendance information when recorded, and feedback.</li>
          <li>Activity submissions, including GitHub repository links, submission attempts, automated test results, and grades.</li>
        </ul>

        <h2 className="h5 fw-bold mt-4">How we use information</h2>
        <p>
          We use this information to authenticate accounts, enroll trainees in batches,
          provide training materials, receive and check activity submissions, show progress
          and grades, and let authorized trainers and administrators manage the program.
          Passwords for accounts created with email and password are stored as password hashes.
        </p>

        <h2 className="h5 fw-bold mt-4">Google account information</h2>
        <p>
          Google sign-in is used to verify your identity and create or access your CodeGo
          account. We use the basic profile and email information described above for account
          sign-in and profile display. CodeGo does not sell Google user data or use it for
          advertising.
        </p>

        <h2 className="h5 fw-bold mt-4">Sharing and service providers</h2>
        <p>
          Authorized trainers and administrators can view information needed to manage
          enrollment and training progress. We use Google for sign-in, Vercel to serve the
          web app, Render to run the API, and MongoDB Atlas to store application records.
          When a GitHub repository is submitted for an activity, its contents are retrieved
          for automated checking. We do not sell personal information.
        </p>

        <h2 className="h5 fw-bold mt-4">Storage and retention</h2>
        <p>
          Account and training records are kept while needed to operate the LMS and maintain
          training records. The app does not currently apply an automatic deletion schedule.
          To request access, correction, or deletion, contact us using the email below. Some
          records may need to be retained for training administration.
        </p>

        <h2 className="h5 fw-bold mt-4">Contact</h2>
        <p className="mb-0">
          For privacy questions or requests, email{' '}
          <a href="mailto:jarethronquillo12@gmail.com">jarethronquillo12@gmail.com</a>.
        </p>
      </article>

      <footer className="pt-4 text-center small">
        <Link to="/">Back to CodeGo LMS</Link>
      </footer>
    </main>
  );
}
