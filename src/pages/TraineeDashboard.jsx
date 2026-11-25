import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import TestResultModal from '../components/TestResultModal';
import SessionFeedbackModal from '../components/SessionFeedbackModal';

export default function TraineeDashboard() {
  const { user } = useAuth();
  const [enrollments, setEnrollments] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [submissions, setSubmissions] = useState({});
  const [githubUrls, setGithubUrls] = useState({});
  const [loading, setLoading] = useState(true);
  const [submittingId, setSubmittingId] = useState(null);
  const [editingUrlId, setEditingUrlId] = useState(null);
  const [error, setError] = useState('');

  const [activeTestSubmissionId, setActiveTestSubmissionId] = useState(null);
  const [activeFeedbackSession, setActiveFeedbackSession] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Auto-poll silently if any submission is currently queued or checking
  useEffect(() => {
    const hasPending = Object.values(submissions).some(
      (sub) => sub.status === 'queued' || sub.status === 'checking'
    );
    if (!hasPending) return;

    const interval = setInterval(() => {
      fetchDashboardData(true);
    }, 3000);

    return () => clearInterval(interval);
  }, [submissions]);

  const fetchDashboardData = async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    setError('');
    try {
      const enrollRes = await api.getMyEnrollments();
      const userEnrollments = Array.isArray(enrollRes) ? enrollRes : enrollRes?.enrollments || [];
      setEnrollments(userEnrollments);

      if (userEnrollments.length > 0) {
        const activeEnrollment = userEnrollments[0];
        // Safely extract batch object or ID
        const batchObj = typeof activeEnrollment.batch === 'object' ? activeEnrollment.batch : null;
        const batchId = batchObj ? batchObj._id : activeEnrollment.batch;

        if (batchObj) {
          setSelectedBatch(batchObj);
        }

        if (batchId) {
          const [sessionsRes, submissionsRes] = await Promise.all([
            api.getSessionsByBatch(batchId),
            api.getMySubmissions().catch(() => [])
          ]);

          const sessionsList = Array.isArray(sessionsRes) ? sessionsRes : sessionsRes?.sessions || [];
          setSessions(sessionsList);

          const subList = Array.isArray(submissionsRes) ? submissionsRes : submissionsRes?.submissions || [];
          const subMap = {};
          subList.forEach((sub) => {
            const actId = sub.activity?._id ? sub.activity._id.toString() : (sub.activity ? sub.activity.toString() : null);
            // Since subList is sorted by attemptNo DESC, only take the first (latest) attempt!
            if (actId && !subMap[actId]) subMap[actId] = sub;
          });
          setSubmissions(subMap);
        }
      }
    } catch (err) {
      console.error('Error loading dashboard:', err);
      setError('Failed to load dashboard data.');
    } finally {
      if (!isSilent) setLoading(false);
    }
  };

  const handleUrlChange = (activityId, value) => {
    setGithubUrls((prev) => ({ ...prev, [activityId]: value }));
  };

  const handleEditClick = (activityId, currentUrl) => {
    setGithubUrls((prev) => ({ ...prev, [activityId]: currentUrl }));
    setEditingUrlId(activityId);
  };

  const handleCancelEdit = () => {
    setEditingUrlId(null);
  };

  const handleSubmit = async (e, activityId) => {
    if (e) e.preventDefault();
    const url = githubUrls[activityId];
    if (!url || !url.trim()) return;

    setSubmittingId(activityId);

    // Optimistic UI update
    setSubmissions(prev => ({
      ...prev,
      [activityId]: { ...prev[activityId], status: 'checking', githubUrl: url.trim() }
    }));

    try {
      await api.submitActivity(activityId, url.trim());
      setEditingUrlId(null);
    } catch (err) {
      console.error(err);
      alert('Error submitting activity URL.');
      fetchDashboardData();
    } finally {
      setSubmittingId(null);
    }
  };

  const activities = sessions
    .map((session) => session.activity)
    .filter(Boolean);
  const totalActivities = activities.length;
  const passedCount = Math.min(
    totalActivities,
    activities.filter((activity) => {
      const activityId = activity._id?.toString() || activity.toString();
      return submissions[activityId]?.status === 'passed';
    }).length
  );
  const pendingCount = Math.max(0, totalActivities - passedCount);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center flex-grow-1 py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      {/* Dashboard Title Section */}
      <div className="mb-4">
        <h2 className="fw-bold mb-1" style={{ color: '#0f172a' }}>{selectedBatch?.name || 'Classroom Dashboard'}</h2>
        <p className="text-muted small mb-0">
          <span className="text-uppercase">{selectedBatch?.programTitle || 'Java Backend Development'}</span> | {selectedBatch?.mode || 'Online Class'}
        </p>
      </div>

      {/* Tabs Header */}
      <div className="d-flex border-bottom mb-4">
        <button className="btn border-0 py-2 px-4 border-bottom border-3 border-primary text-primary fw-bold bg-transparent">Sessions</button>
        <button className="btn border-0 py-2 px-4 text-muted bg-transparent">Grades</button>
        <button className="btn border-0 py-2 px-4 text-muted bg-transparent">Attendance</button>
        <button className="btn border-0 py-2 px-4 text-muted bg-transparent">Recordings</button>
        <button className="btn border-0 py-2 px-4 text-muted bg-transparent">Requirements</button>
      </div>

      {/* Stats Cards Row */}
      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <div className="bg-white p-4 rounded-3 border h-100 shadow-sm">
            <h1 className="fw-bold mb-1" style={{ color: '#16a34a' }}>{passedCount} / {totalActivities}</h1>
            <div className="text-muted small">Activities passed</div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="bg-white p-4 rounded-3 border h-100 shadow-sm">
            <h1 className="fw-bold mb-1" style={{ color: '#d97706' }}>{pendingCount}</h1>
            <div className="text-muted small">Pending activities</div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="bg-white p-4 rounded-3 border h-100 shadow-sm">
            <h1 className="fw-bold mb-1" style={{ color: '#2563eb' }}>92%</h1>
            <div className="text-muted small">Attendance</div>
          </div>
        </div>
      </div>

      {/* Legend & Search */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div className="d-flex gap-3 small fw-semibold text-uppercase" style={{ letterSpacing: '0.5px' }}>
          <span className="text-success"><span className="me-1">●</span> PASS</span>
          <span className="text-danger"><span className="me-1">●</span> FAIL</span>
          <span className="text-warning"><span className="me-1">●</span> CHECKING</span>
          <span className="text-secondary"><span className="me-1">●</span> NOT SUBMITTED</span>
        </div>
        <div className="input-group input-group-sm w-auto" style={{ minWidth: '250px' }}>
          <input type="text" className="form-control" placeholder="Search sessions..." />
        </div>
      </div>

      {/* Sessions List Container */}
      <div className="bg-kodigo-navy text-white p-3 rounded-top d-flex justify-content-between align-items-center mb-0">
        <h6 className="mb-0 fw-bold">{selectedBatch?.name || 'Batch'} · {selectedBatch?.programTitle || 'Java'} Fundamentals - {sessions.length} Sessions</h6>
        <span className="small">{passedCount} / {totalActivities} passed</span>
      </div>

      <div className="bg-white border rounded-bottom border-top-0 mb-4 overflow-hidden">
        {sessions.length === 0 ? (
          <div className="p-5 text-center text-muted">No sessions published for this batch yet.</div>
        ) : (
          sessions.map((session, index) => {
            const activity = session.activity;
            const actIdKey = activity ? (activity._id?.toString() || activity.toString()) : null;
            const submission = actIdKey ? submissions[actIdKey] : null;
            const status = submission?.status || 'not submitted';

            return (
              <div key={session._id} className={`trainee-session-row ${index !== sessions.length - 1 ? 'border-bottom' : ''}`}>
                <div className="trainee-session-status">
                  <div className={`text-uppercase fw-bold small mb-2 ${
                    status === 'passed' ? 'text-success' :
                    status === 'failed' ? 'text-danger' :
                    status === 'checking' || status === 'queued' ? 'text-warning' : 'text-secondary'
                  }`}>
                    {status === 'queued' || status === 'checking' ? 'CHECKING' : status.replace('-', ' ')}
                  </div>
                  {submission ? (
                    <button className="btn btn-primary btn-sm px-3 w-100" style={{ fontSize: '0.7rem' }} onClick={() => setActiveTestSubmissionId(submission._id)}>
                      See results
                    </button>
                  ) : (
                    <button className="btn btn-outline-secondary btn-sm px-3 w-100 disabled" style={{ fontSize: '0.7rem' }}>
                      No result yet
                    </button>
                  )}
                </div>

                <div className="trainee-session-content">
                  {/* Session Header Title & Discussed Info */}
                  <div className="trainee-session-heading">
                    <div className="trainee-session-details">
                      <h6 className="fw-bold mb-1" style={{ color: '#0f172a', fontSize: '1rem' }}>
                        {session.code} {session.title}
                      </h6>
                      {activity && activity.title && (
                        <div className="text-secondary small fw-semibold">
                          Activity:
                          <a href={activity.instructions} target="_blank" rel="noreferrer" className="ms-1 text-primary text-decoration-underline">
                            {activity.title}
                          </a>
                        </div>
                      )}
                    </div>
                    <div className="trainee-session-meta text-end text-muted small">
                      <div className="mb-1"><span className="me-1">●</span> Discussed on {session.discussedAt ? new Date(session.discussedAt).toLocaleDateString() : 'TBA'}</div>
                      <a href="#feedback" className="text-primary text-decoration-none" onClick={(e) => { e.preventDefault(); setActiveFeedbackSession(session); }}>How was the activity?</a>
                    </div>
                  </div>

                  {/* Activity Submissions Area */}
                  {activity && (
                    <div className="trainee-session-submission">
                      <div className="d-flex align-items-center gap-2 mb-1 w-100">
                        {submission?.githubUrl && editingUrlId !== activity._id ? (
                          <div className="d-flex align-items-center gap-2 flex-shrink-1" style={{ minWidth: 0 }}>
                             <a href={submission.githubUrl} target="_blank" rel="noreferrer" className="text-primary small text-decoration-none text-truncate" style={{ minWidth: 0 }}>
                              {submission.githubUrl}
                            </a>
                            <button className="btn btn-link btn-sm p-0 text-secondary" onClick={() => handleEditClick(activity._id, submission.githubUrl)}>
                              <i className="bi bi-pencil-fill"></i>
                            </button>
                          </div>
                        ) : (
                          <div className="input-group input-group-sm flex-grow-1" style={{ minWidth: '240px' }}>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Paste your GitHub repo URL"
                              value={githubUrls[activity._id] || ''}
                              onChange={(e) => handleUrlChange(activity._id, e.target.value)}
                            />
                            {editingUrlId === activity._id && (
                                <button className="btn btn-outline-secondary px-2" onClick={handleCancelEdit}>Cancel</button>
                            )}
                            <button
                              className="btn btn-primary px-3"
                              onClick={(e) => handleSubmit(e, activity._id)}
                              disabled={submittingId === activity._id || !githubUrls[activity._id]}
                            >
                              {editingUrlId === activity._id ? 'Update' : 'Submit'}
                            </button>
                          </div>
                        )}
                        {submission?.githubUrl && editingUrlId !== activity._id && (
                          <button
                            className="btn btn-outline-secondary btn-sm px-3 py-1 flex-shrink-0"
                            style={{ fontSize: '0.7rem' }}
                            disabled={submittingId === activity._id}
                            onClick={async () => {
                              setSubmittingId(activity._id);
                              try {
                                const res = await api.recheckSubmission(submission._id);
                                if (res.message) {
                                  // Optimistically update status to checking
                                  setSubmissions((prev) => ({
                                    ...prev,
                                    [activity._id]: { ...submission, status: 'checking' }
                                  }));
                                }
                              } catch (err) {
                                console.error(err);
                                alert('Failed to queue resubmission.');
                              } finally {
                                setSubmittingId(null);
                              }
                            }}
                          >
                            {submittingId === activity._id ? 'Re-checking...' : 'Resubmit'}
                          </button>
                        )}
                      </div>
                      {submission && (
                        <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                          Graded by: {submission.gradedBy?.name || 'CodeGo auto-checker'} @ {new Date(submission.gradedAt || submission.submittedAt).toLocaleString()}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {activeTestSubmissionId && (
        <TestResultModal
          submissionId={activeTestSubmissionId}
          onClose={() => {
            setActiveTestSubmissionId(null);
            fetchDashboardData();
          }}
        />
      )}

      {activeFeedbackSession && (
        <SessionFeedbackModal
          session={activeFeedbackSession}
          onClose={() => setActiveFeedbackSession(null)}
          onSuccess={() => alert('Thank you for your feedback!')}
        />
      )}
    </div>
  );
}
