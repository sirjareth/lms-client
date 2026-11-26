import { Link } from 'react-router-dom';

export default function PublicHome() {
  return (
    <main className="container py-5" style={{ minHeight: '100vh' }}>
      <header className="d-flex justify-content-between align-items-center mb-5">
        <div className="d-flex align-items-center gap-3">
          <img src="/codego-logo.png" alt="" style={{ width: 44, height: 44 }} />
          <span className="fs-3 fw-bold" style={{ color: '#0f172a' }}>CodeGo LMS</span>
        </div>
        <Link to="/login" className="btn btn-primary px-4">Sign in</Link>
      </header>

      <section className="row align-items-center py-5">
        <div className="col-lg-8">
          <p className="text-primary text-uppercase fw-semibold small mb-2">Learning Management System</p>
          <h1 className="display-4 fw-bold mb-3" style={{ color: '#0f172a' }}>Learn, practice, and track your progress.</h1>
          <p className="lead text-secondary mb-4">
            CodeGo LMS helps trainees follow Java training batches, review session materials,
            submit programming activities, and see their checking results. Trainers and
            administrators use it to manage sessions, enrollments, and activity progress.
          </p>
          <Link to="/login" className="btn btn-primary btn-lg px-4">Continue with Google</Link>
        </div>
      </section>

      <footer className="border-top pt-4 mt-5 d-flex flex-wrap justify-content-between gap-3 text-muted small">
        <span>CodeGo LMS</span>
        <Link to="/privacy">Privacy Policy</Link>
      </footer>
    </main>
  );
}
