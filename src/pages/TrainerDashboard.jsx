import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import TestResultModal from '../components/TestResultModal';

export default function TrainerDashboard() {
  const { user } = useAuth();
  const [batches, setBatches] = useState([]);
  const [selectedBatchId, setSelectedBatchId] = useState('');
  const [sessions, setSessions] = useState([]);
  const [recentSubmissions, setRecentSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
      setError('Failed to fetch data.');
    } finally {
      setLoading(false);
    }
  };

  const fetchBatchDetails = async (batchId) => {
    if (!batchId) return;
    try {
      const [sessionsRes, submissionsRes] = await Promise.all([
        api.getSessionsByBatch(batchId),
        api.getSubmissionsByBatch(batchId)
      ]);

      setSessions(Array.isArray(sessionsRes) ? sessionsRes : sessionsRes.sessions || []);
      setRecentSubmissions(Array.isArray(submissionsRes) ? submissionsRes : submissionsRes.submissions || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleBatchSelect = (e) => {
    const batchId = e.target.value;
    setSelectedBatchId(batchId);
    fetchBatchDetails(batchId);
  };

  if (loading) return <div className="p-5 text-center">Loading...</div>;

  return (
    <div className="container-fluid py-4 px-4" style={{ backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold" style={{ color: '#0f172a' }}>Sessions Overview</h2>
          <select className="form-select w-auto mt-2" value={selectedBatchId} onChange={handleBatchSelect}>
            {batches.map((b) => <option key={b._id} value={b._id}>{b.name}</option>)}
          </select>
        </div>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-md-3"><div className="p-3 bg-white rounded border"><h6>Students</h6><h3>25</h3></div></div>
        <div className="col-md-3"><div className="p-3 bg-white rounded border"><h6>Checking now</h6><h3>2</h3></div></div>
        <div className="col-md-3"><div className="p-3 bg-white rounded border"><h6>Failed attempts</h6><h3>20</h3></div></div>
        <div className="col-md-3"><div className="p-3 bg-white rounded border"><h6>Avg pass rate</h6><h3>79%</h3></div></div>
      </div>

      <div className="bg-white rounded shadow-sm border mb-4">
        <table className="table mb-0">
          <thead className="table-light">
            <tr>
              <th>Session / Activity</th>
              <th>Submitted</th>
              <th>Passed</th>
              <th>Failed</th>
              <th>Pass Rate</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sessions.map(s => (
              <tr key={s._id}>
                <td>{s.title}</td>
                <td>25/25</td>
                <td>24</td>
                <td>1</td>
                <td>96%</td>
                <td>
                  <button className="btn btn-sm btn-outline-primary me-2">Submissions</button>
                  <button className="btn btn-sm btn-outline-secondary">Edit</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
