import { useState } from 'react';
import { api } from '../services/api';

export default function SessionFeedbackModal({ session, onClose, onSuccess }) {
  const [rating, setRating] = useState(5);
  const [remarks, setRemarks] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.submitSessionFeedback(session._id, rating, remarks);
      if (res.message || res.rating) {
        if (onSuccess) onSuccess();
        onClose();
      } else {
        setError(res.message || 'Failed to submit feedback.');
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred submitting feedback.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content kodigo-card border-0 shadow-lg">
          <div className="modal-header bg-kodigo-navy text-white">
            <h5 className="modal-title d-flex align-items-center gap-2">
              <i className="bi bi-chat-heart text-kodigo-blue"></i> Session Feedback
            </h5>
            <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="modal-body p-4">
              <h6 className="fw-bold text-kodigo-navy mb-1">{session?.code}: {session?.title}</h6>
              <p className="text-muted small mb-4">How was today's session? Share your thoughts to help us improve!</p>

              {error && <div className="alert alert-danger py-2 small">{error}</div>}

              <div className="mb-4 text-center">
                <label className="form-label d-block fw-semibold text-muted mb-2">Rating</label>
                <div className="d-flex justify-content-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      className={`btn ${rating >= star ? 'btn-warning' : 'btn-outline-secondary'} rounded-circle`}
                      style={{ width: '45px', height: '45px' }}
                      onClick={() => setRating(star)}
                    >
                      <i className="bi bi-star-fill fs-5"></i>
                    </button>
                  ))}
                </div>
                <div className="mt-2 text-muted small">
                  {rating === 5 && '🌟 Excellent!'}
                  {rating === 4 && '👍 Good'}
                  {rating === 3 && '😐 Average'}
                  {rating === 2 && '👎 Below Average'}
                  {rating === 1 && '😞 Poor'}
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold small text-muted">Remarks / Suggestions (Optional)</label>
                <textarea
                  className="form-control"
                  rows="3"
                  placeholder="What went well? Any topic you'd like more practice on?"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                ></textarea>
              </div>
            </div>

            <div className="modal-footer bg-light">
              <button type="button" className="btn btn-secondary btn-sm" onClick={onClose}>Cancel</button>
              <button type="submit" className="btn btn-kodigo-primary btn-sm px-4" disabled={loading}>
                {loading ? 'Submitting...' : 'Submit Feedback'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
