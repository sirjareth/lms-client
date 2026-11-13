import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import TestResultModal from '../components/TestResultModal';
import NewSessionModal from '../components/NewSessionModal';

export default function TrainerDashboard() {
  const { user } = useAuth();
  const { setActiveBatch } = useOutletContext();
  const [batches, setBatches] = useState([]);
  const [selectedBatchId, setSelectedBatchId] = useState('');
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNewSessionModal, setShowNewSessionModal] = useState(false);
  const [activeTestSubmissionId, setActiveTestSubmissionId] = useState(null);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const batchesRes = await api.getBatches();
      const list = Array.isArray(batchesRes) ? batchesRes : batchesRes.batches || [];
      setBatches(list);

      if (list.length > 0) {
        const firstId = list[0]._id;
        setSelectedBatchId(firstId);
        fetchBatchDetails(firstId);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchBatchDetails = async (batchId) => {
    if (!batchId) return;
    try {
      const sessionsRes = await api.getSessionsByBatch(batchId);
      setSessions(Array.isArray(sessionsRes) ? sessionsRes : sessionsRes.sessions || []);

      // Update sidebar when trainer selects a batch
      const selectedBatch = batches.find(b => b._id === batchId);
      if (selectedBatch) {
        setActiveBatch(selectedBatch);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleBatchSelect = (e) => {
    const batchId = e.target.value;
    setSelectedBatchId(batchId);
    fetchBatchDetails(batchId);
  };

  if (loading) return <div className="p-5 text-center"><div className="spinner-border text-primary"></div></div>;

  return (
    <div className="p-4" style={{ backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="fw-bold mb-0" style={{ color: '#0f172a' }}>Sessions Overview</h3>
          <div className="d-flex align-items-center gap-2 mt-2">
            <span className="small fw-bold text-muted text-uppercase">Select a Class:</span>
            <select className="form-select form-select-sm w-auto" value={selectedBatchId} onChange={handleBatchSelect}>
              {batches.map((b) => <option key={b._id} value={b._id}>{b.name}</option>)}
            </select>
          </div>
        </div>
        <button
          className="btn btn-primary px-4 fw-semibold shadow-sm"
          style={{ backgroundColor: '#2563eb', borderColor: '#2563eb' }}
          onClick={() => setShowNewSessionModal(true)}
        >
          <i className="bi bi-plus-lg me-1"></i> + New Session & Activity
        </button>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-md-3"><div className="bg-white p-4 rounded-3 border shadow-sm"><h2 className="fw-bold mb-1" style={{ color: '#0f172a' }}>25</h2><div className="text-muted small">Students</div></div></div>
        <div className="col-md-3"><div className="bg-white p-4 rounded-3 border shadow-sm"><h2 className="fw-bold mb-1" style={{ color: '#d97706' }}>2</h2><div className="text-muted small">Checking now</div></div></div>
        <div className="col-md-3"><div className="bg-white p-4 rounded-3 border shadow-sm"><h2 className="fw-bold mb-1" style={{ color: '#dc2626' }}>20</h2><div className="text-muted small">Failed attempts</div></div></div>
        <div className="col-md-3"><div className="bg-white p-4 rounded-3 border shadow-sm"><h2 className="fw-bold mb-1" style={{ color: '#16a34a' }}>79%</h2><div className="text-muted small">Avg pass rate</div></div></div>
      </div>

      <div className="bg-kodigo-navy text-white p-3 rounded-top d-flex justify-content-between align-items-center mb-0">
        <h6 className="mb-0 fw-bold">Sessions & Activities</h6>
      </div>

      <div className="bg-white border rounded-bottom border-top-0 mb-4 overflow-hidden">
        <table className="table align-middle mb-0">
          <thead className="table-light border-bottom">
            <tr className="small text-muted text-uppercase">
              <th className="py-3 px-4">Session / Activity</th>
              <th>Submitted</th>
              <th>Passed</th>
              <th>Failed</th>
              <th style={{ width: '200px' }}>Pass rate</th>
              <th className="text-end px-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sessions.length === 0 ? (
              <tr><td colSpan="6" className="text-center py-5 text-muted">No sessions for this batch.</td></tr>
            ) : (
              sessions.map((session) => (
                <tr key={session._id}>
                  <td className="px-4 fw-bold" style={{ color: '#0f172a' }}>{session.code} {session.title}</td>
                  <td>25 / 25</td>
                  <td className="text-success fw-semibold">24</td>
                  <td className="text-danger fw-semibold">1</td>
                  <td>
                    <div className="d-flex align-items-center gap-2">
                      <div className="progress flex-grow-1" style={{ height: '8px' }}><div className="progress-bar bg-primary" style={{ width: '96%' }}></div></div>
                      <span className="small fw-bold">96%</span>
                    </div>
                  </td>
                  <td className="text-end px-4">
                    <div className="d-flex justify-content-end gap-2">
                      <button className="btn btn-outline-primary btn-sm px-3">Submissions</button>
                      <button className="btn btn-outline-secondary btn-sm px-3">Edit</button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showNewSessionModal && (
        <NewSessionModal
          batchId={selectedBatchId}
          onClose={() => setShowNewSessionModal(false)}
          onSuccess={() => {
            setShowNewSessionModal(false);
            fetchBatchDetails(selectedBatchId);
          }}
        />
      )}
    </div>
  );
}
