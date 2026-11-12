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
  const [error, setError] = useState('');

  // Modals state
  const [activeTestSubmissionId, setActiveTestSubmissionId] = useState(null);
  const [activeFeedbackSession, setActiveFeedbackSession] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError('');
    try {
      const enrollRes = await api.getMyEnrollments();
      const userEnrollments = Array.isArray(enrollRes) ? enrollRes : enrollRes.enrollments || [];
      setEnrollments(userEnrollments);

      if (userEnrollments.length > 0) {
        const activeBatch = userEnrollments[0].batch || userEnrollments[0];
        setSelectedBatch(activeBatch);

        const batchId = activeBatch._id || activeBatch;
        const [sessionsRes, submissionsRes] = await Promise.all([
          api.getSessionsByBatch(batchId),
          api.getMySubmissions()
        ]);

        const sessionsList = Array.isArray(sessionsRes) ? sessionsRes : sessionsRes.sessions || [];
        setSessions(sessionsList);

        const subList = Array.isArray(submissionsRes) ? submissionsRes : submissionsRes.submissions || [];
        const subMap = {};
        subList.forEach((sub) => {
          const actId = sub.activity?._id || sub.activity;
          subMap[actId] = sub;
        });
        setSubmissions(subMap);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  const handleUrlChange = (activityId, value) => {
    setGithubUrls((prev) => ({ ...prev, [activityId]: value }));
  };

  const handleSubmit = async (activityId) => {
    const url = githubUrls[activityId];
    if (!url || !url.trim()) return;

    setSubmittingId(activityId);
    try {
      const res = await api.submitActivity(activityId, url.trim());
      if (res.submission || res._id) {
        const newSub = res.submission || res;
        setSubmissions((prev) => ({
          ...prev,
          [activityId]: newSub
        }));
      } else {
        alert(res.message || 'Submission failed.');
      }
    } catch (err) {
      console.error(err);
      alert('Error submitting activity URL.');
    } finally {
      setSubmittingId(null);
    }
  };

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
    <div className="container-fluid py-4 px-4" style={{ backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      {/* Dashboard Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1" style={{ color: '#0f172a' }}>{selectedBatch?.name || 'Batch'}</h2>
          <p className="text-muted mb-0">JAVA BACKEND DEVELOPMENT | {selectedBatch?.mode || 'Day Class | Online'}</p>
        </div>
        <div className="text-end">
          <p className="mb-0 fw-bold" style={{ color: '#0f172a' }}>{user?.name || 'Maria Santos'}</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="row g-3 mb-4">
        <div className="col-md-3">
          <div className="p-3 bg-white rounded shadow-sm border">
            <h6 className="text-muted small">Activities passed</h6>
            <h3 className="fw-bold mb-0">2 / 12</h3>
          </div>
        </div>
        <div className="col-md-3">
          <div className="p-3 bg-white rounded shadow-sm border">
            <h6 className="text-muted small">Attendance</h6>
            <h3 className="fw-bold mb-0" style={{ color: '#1d4ed8' }}>92%</h3>
          </div>
        </div>
        <div className="col-md-3">
          <div className="p-3 bg-white rounded shadow-sm border">
            <h6 className="text-muted small">Pending activities</h6>
            <h3 className="fw-bold mb-0">3</h3>
          </div>
        </div>
        <div className="col-md-3">
          <div className="p-3 bg-white rounded shadow-sm border">
            <h6 className="text-muted small">Overall grade</h6>
            <h3 className="fw-bold mb-0">87</h3>
          </div>
        </div>
      </div>

      {/* Sessions Table */}
      <div className="bg-white rounded shadow-sm border overflow-hidden">
        <div className="p-3 border-bottom d-flex gap-4">
          <span className="fw-bold pb-2 border-bottom border-2 border-primary" style={{ color: '#1d4ed8' }}>Sessions</span>
          <span className="text-muted">Grades</span>
          <span className="text-muted">Attendance</span>
          <span className="text-muted">Recordings</span>
          <span className="text-muted">Requirements</span>
        </div>
        <table className="table table-hover mb-0">
          <thead className="table-light">
            <tr>
              <th className="px-4">Status</th>
              <th>Activity</th>
              <th>GitHub URL</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {sessions.map((session) => {
              const activity = session.activity;
              const submission = activity ? submissions[activity._id] : null;

              return (
                <tr key={session._id}>
                  <td className="px-4">
                    <span className={`badge ${submission?.status === 'passed' ? 'bg-success' : submission?.status === 'failed' ? 'bg-danger' : 'bg-warning'}`}>
                      {submission?.status?.toUpperCase() || 'NOT SUBMITTED'}
                    </span>
                  </td>
                  <td>
                    <div className="fw-bold">{session.code} {session.title}</div>
                    <small className="text-muted">Discussed on {new Date(session.discussedAt).toLocaleDateString()}</small>
                  </td>
                  <td>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      placeholder="Paste your GitHub repo URL"
                      onChange={(e) => handleUrlChange(activity._id, e.target.value)}
                    />
                  </td>
                  <td>
                    <button
                      className="btn btn-sm btn-primary"
                      onClick={() => handleSubmit(activity._id)}
                    >
                      {submission ? 'Resubmit' : 'Submit'}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
