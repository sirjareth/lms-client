import { useState, useEffect } from 'react';
import { api } from '../services/api';

const toDateTimeLocalValue = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return localDate.toISOString().slice(0, 16);
};

export default function EditSessionModal({ session, onClose, onSuccess }) {
  const [code, setCode] = useState(session.code || '');
  const [title, setTitle] = useState(session.title || '');
  const [discussedAt, setDiscussedAt] = useState(
    session.discussedAt ? new Date(session.discussedAt).toISOString().split('T')[0] : ''
  );

  // Activity fields
  const [hasActivity, setHasActivity] = useState(!!session.activity);
  const [activityTitle, setActivityTitle] = useState(session.activity?.title || '');
  const [activityType, setActivityType] = useState(session.activity?.type || 'activity');
  const [testSuitePath, setTestSuitePath] = useState(session.activity?.testSuite || '');
  const [instructions, setInstructions] = useState(session.activity?.instructions || '');
  const [dueAt, setDueAt] = useState(
    session.activity?.dueAt ? new Date(session.activity.dueAt).toISOString().slice(0, 16) : ''
  );

  const [loading, setLoading] = useState(false);
  const [activityLoading, setActivityLoading] = useState(Boolean(session.activity?._id));
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');
  const [activityLoadError, setActivityLoadError] = useState('');

  useEffect(() => {
    const activityId = session.activity?._id || session.activity?.id;
    if (!activityId) {
      setActivityLoading(false);
      return undefined;
    }

    let cancelled = false;
    setActivityLoading(true);
    setActivityLoadError('');

    api.getActivity(activityId)
      .then((activity) => {
        if (cancelled) return;
        setHasActivity(true);
        setActivityTitle(activity.title || '');
        setActivityType(activity.type || 'activity');
        setTestSuitePath(activity.testSuite || '');
        setInstructions(activity.instructions || '');
        setDueAt(toDateTimeLocalValue(activity.dueAt));
      })
      .catch((err) => {
        if (!cancelled) {
          console.error('Failed to load activity details:', err);
          setActivityLoadError(err.message || 'Could not load existing activity details.');
        }
      })
      .finally(() => {
        if (!cancelled) setActivityLoading(false);
      });

    return () => { cancelled = true; };
  }, [session._id, session.activity?._id, session.activity?.id]);

  const handleDeleteActivity = async () => {
    if (!session.activity?._id) return;
    if (!window.confirm('Are you sure you want to delete this activity?')) return;

    setDeleting(true);
    try {
      await api.deleteActivity(session.activity._id);
      setHasActivity(false);
      setActivityTitle('');
      setTestSuitePath('');
      setInstructions('');
      setDueAt('');
      // We don't close, just clear local state so user can save or re-add
    } catch (err) {
      console.error(err);
      alert('Failed to delete activity.');
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteSession = async () => {
    if (!window.confirm('Are you sure you want to delete this session? This will also delete any linked activity.')) return;

    setDeleting(true);
    try {
      await api.deleteSession(session._id);
      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      alert('Failed to delete session.');
    } finally {
      setDeleting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!code || !title) {
      setError('Please fill in all required session fields.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // 1. Update Session
      await api.updateSession(session._id, {
        code: code.trim().toUpperCase(),
        title: title.trim(),
        discussedAt: discussedAt ? new Date(discussedAt) : undefined
      });

      // 2. Handle Activity (Update or Create)
      if (hasActivity) {
        const activityData = {
          title: activityTitle.trim() || title.trim(),
          type: activityType,
          testSuite: testSuitePath.trim(),
          instructions: instructions.trim(),
          dueAt: dueAt ? new Date(dueAt) : undefined
        };

        if (session.activity?._id) {
          // Update existing
          await api.updateActivity(session.activity._id, activityData);
        } else {
          // Create new for this session
          await api.createActivity({
            session: session._id,
            ...activityData
          });
        }
      }

      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to update session.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-lg">
        <div className="modal-content kodigo-card">
          <div className="modal-header bg-kodigo-navy text-white">
            <h5 className="modal-title fw-bold">Edit Session & Activity</h5>
            <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              {error && <div className="alert alert-danger">{error}</div>}

              <h6 className="fw-bold text-primary mb-3">Session Details</h6>
              <div className="row g-3 mb-4">
                <div className="col-md-4">
                  <label className="form-label small fw-bold">Session Code *</label>
                  <input
                    type="text"
                    className="form-control font-monospace"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    required
                  />
                </div>
                <div className="col-md-8">
                  <label className="form-label small fw-bold">Session Title *</label>
                  <input
                    type="text"
                    className="form-control"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-bold">Discussed At Date</label>
                  <input
                    type="date"
                    className="form-control"
                    value={discussedAt}
                    onChange={(e) => setDiscussedAt(e.target.value)}
                  />
                </div>
              </div>

              <hr />

              <div className="d-flex justify-content-between align-items-center mb-3">
                <h6 className="fw-bold text-primary mb-0">Linked Activity</h6>
                <div className="form-check form-switch">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="editHasActivitySwitch"
                    checked={hasActivity}
                    onChange={(e) => setHasActivity(e.target.checked)}
                  />
                  <label className="form-check-label small fw-semibold" htmlFor="editHasActivitySwitch">Include Activity</label>
                </div>
              </div>

              {activityLoadError && <div className="alert alert-warning py-2">{activityLoadError}</div>}
              {activityLoading && <div className="small text-muted mb-3">Loading existing activity details...</div>}

              {hasActivity && (
                <div className="row g-3">
                  <div className="col-md-8">
                    <label className="form-label small fw-bold">Activity Title</label>
                    <input
                      type="text"
                      className="form-control"
                      value={activityTitle}
                      onChange={(e) => setActivityTitle(e.target.value)}
                    />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label small fw-bold">Activity Type</label>
                    <select
                      className="form-select"
                      value={activityType}
                      onChange={(e) => setActivityType(e.target.value)}
                    >
                      <option value="activity">Activity</option>
                      <option value="capstone">Capstone</option>
                      <option value="exam">Exam</option>
                    </select>
                  </div>
                  <div className="col-md-12">
                    <label className="form-label small fw-bold">Test Suite Path</label>
                    <input
                      type="text"
                      className="form-control font-monospace"
                      value={testSuitePath}
                      onChange={(e) => setTestSuitePath(e.target.value)}
                    />
                  </div>
                  <div className="col-md-12">
                    <label className="form-label small fw-bold">Instructions URL *</label>
                    <input
                      type="url"
                      className="form-control"
                      placeholder="Paste GitHub Markdown URL here"
                      value={instructions}
                      onChange={(e) => setInstructions(e.target.value)}
                      required
                    />
                  </div>
                  {session.activity?._id && (
                    <div className="col-12 mt-2">
                        <button type="button" className="btn btn-outline-danger btn-sm" onClick={handleDeleteActivity} disabled={deleting}>
                            {deleting ? 'Deleting...' : 'Delete Activity'}
                        </button>
                    </div>
                  )}
                  <div className="col-md-6">
                    <label className="form-label small fw-bold">Due Date & Time</label>
                    <input
                      type="datetime-local"
                      className="form-control"
                      value={dueAt}
                      onChange={(e) => setDueAt(e.target.value)}
                    />
                  </div>
                </div>
              )}
            </div>
            <div className="modal-footer bg-light d-flex justify-content-between">
              <button type="button" className="btn btn-danger btn-sm px-3" onClick={handleDeleteSession} disabled={deleting || loading}>
                <i className="bi bi-trash me-1"></i> {deleting ? 'Deleting Session...' : 'Delete Session'}
              </button>
              <div>
                <button type="button" className="btn btn-secondary btn-sm px-4 me-2" onClick={onClose}>Cancel</button>
                <button type="submit" className="btn btn-primary btn-sm px-4" disabled={loading || deleting || activityLoading || Boolean(activityLoadError)}>
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
