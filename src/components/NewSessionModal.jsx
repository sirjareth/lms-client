import { useState, useEffect } from 'react';
import { api } from '../services/api';

export default function NewSessionModal({ batchId, onClose, onSuccess }) {
  const [code, setCode] = useState('');
  const [title, setTitle] = useState('');
  const [order, setOrder] = useState(1);
  const [discussedAt, setDiscussedAt] = useState('');

  // Activity fields
  const [hasActivity, setHasActivity] = useState(true);
  const [activityTitle, setActivityTitle] = useState('');
  const [activityType, setActivityType] = useState('activity');
  const [instructions, setInstructions] = useState('');
  const [dueAt, setDueAt] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!code || !title || !batchId) {
      setError('Please fill in all required session fields.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // 1. Create Session
      const sessionRes = await api.createSession({
        batch: batchId,
        code: code.trim().toUpperCase(),
        title: title.trim(),
        order: Number(order),
        discussedAt: discussedAt ? new Date(discussedAt) : undefined
      });

      const session = sessionRes.session || sessionRes;
      const sessionId = session._id;

      // 2. Create Activity if enabled
      if (hasActivity && sessionId) {
        await api.createActivity({
          session: sessionId,
          title: activityTitle.trim() || title.trim(),
          type: activityType,
          instructions: instructions.trim(),
          dueAt: dueAt ? new Date(dueAt) : undefined
        });
      }

      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to create session and activity.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header bg-kodigo-navy text-white">
            <h5 className="modal-title fw-bold">Create New Session & Activity</h5>
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
                    placeholder="e.g. JV-1.08"
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
                    placeholder="e.g. Exception Handling"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-bold">Order / Sequence #</label>
                  <input
                    type="number"
                    className="form-control"
                    min="1"
                    value={order}
                    onChange={(e) => setOrder(e.target.value)}
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
                <h6 className="fw-bold text-primary mb-0">Linked Java Activity</h6>
                <div className="form-check form-switch">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="hasActivitySwitch"
                    checked={hasActivity}
                    onChange={(e) => setHasActivity(e.target.checked)}
                  />
                  <label className="form-check-label small fw-semibold" htmlFor="hasActivitySwitch">Include Activity</label>
                </div>
              </div>

              {hasActivity && (
                <div className="row g-3">
                  <div className="col-md-8">
                    <label className="form-label small fw-bold">Activity Title</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Leave blank to use session title"
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
                    <label className="form-label small fw-bold">Instructions (Markdown)</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      placeholder="Write instructions or markdown details here..."
                      value={instructions}
                      onChange={(e) => setInstructions(e.target.value)}
                    ></textarea>
                  </div>
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
            <div className="modal-footer bg-light">
              <button type="button" className="btn btn-secondary btn-sm px-4" onClick={onClose}>Cancel</button>
              <button type="submit" className="btn btn-primary btn-sm px-4" disabled={loading}>
                {loading ? 'Creating...' : 'Create Session'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
