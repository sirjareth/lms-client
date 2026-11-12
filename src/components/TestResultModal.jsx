import { useState, useEffect } from 'react';
import { api } from '../services/api';

export default function TestResultModal({ submissionId, onClose }) {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchResult = async () => {
      try {
        const res = await api.getCheckResult(submissionId);
        if (res.checkResult) {
          setResult(res.checkResult);
        } else if (res._id) {
          setResult(res);
        } else {
          setError(res.message || 'Check result not found.');
        }
      } catch (err) {
        console.error(err);
        setError('Failed to load test results.');
      } finally {
        setLoading(false);
      }
    };

    if (submissionId) {
      fetchResult();
    }
  }, [submissionId]);

  return (
    <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-lg modal-dialog-centered">
        <div className="modal-content kodigo-card border-0 shadow-lg">
          <div className="modal-header bg-kodigo-navy text-white">
            <h5 className="modal-title d-flex align-items-center gap-2">
              <i className="bi bi-shield-check text-kodigo-blue"></i> JUnit Test Results
            </h5>
            <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
          </div>

          <div className="modal-body p-4">
            {loading ? (
              <div className="text-center py-4">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : error ? (
              <div className="alert alert-warning" role="alert">{error}</div>
            ) : result ? (
              <div>
                <div className="d-flex justify-content-between align-items-center mb-4 p-3 bg-light rounded border">
                  <div>
                    <h4 className="fw-bold mb-1">
                      {result.testsPassed} of {result.testsTotal} tests passed
                    </h4>
                    <span className="text-muted small">
                      Checked at: {new Date(result.checkedAt || Date.now()).toLocaleString()} ({result.durationMs || 0}ms)
                    </span>
                  </div>
                  <div>
                    {result.testsPassed === result.testsTotal ? (
                      <span className="badge-pass fs-6"><i className="bi bi-check-circle-fill me-1"></i> PASSED</span>
                    ) : (
                      <span className="badge-fail fs-6"><i className="bi bi-x-circle-fill me-1"></i> FAILED</span>
                    )}
                  </div>
                </div>

                {result.errorType && (
                  <div className="alert alert-danger mb-4">
                    <strong>Error Type:</strong> {result.errorType}
                    <pre className="mt-2 mb-0 small bg-white p-2 border rounded">{result.outputLog}</pre>
                  </div>
                )}

                <h6 className="fw-bold mb-3 text-kodigo-navy">Test Cases:</h6>
                <div className="list-group">
                  {result.tests && result.tests.map((test, index) => (
                    <div key={index} className={`list-group-item d-flex flex-column gap-1 py-3 ${test.passed ? 'border-success-subtle' : 'border-danger-subtle'}`}>
                      <div className="d-flex justify-content-between align-items-center">
                        <span className="fw-semibold font-monospace">
                          <i className={`bi ${test.passed ? 'bi-check-circle-fill text-success' : 'bi-x-circle-fill text-danger'} me-2`}></i>
                          {test.name}
                        </span>
                        <span className={`badge ${test.passed ? 'bg-success' : 'bg-danger'}`}>
                          {test.passed ? 'Pass' : 'Fail'}
                        </span>
                      </div>
                      {!test.passed && test.details && (
                        <div className="text-danger small bg-danger bg-opacity-10 p-2 rounded mt-1 font-monospace">
                          {test.details}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-muted text-center py-3">No test results available.</p>
            )}
          </div>

          <div className="modal-footer bg-light">
            <button type="button" className="btn btn-secondary btn-sm" onClick={onClose}>Close</button>
          </div>
        </div>
      </div>
    </div>
  );
}
