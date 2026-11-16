import { useState, useEffect } from 'react';
import { api } from '../services/api';

export default function SubmissionsModal({ activityId, onClose }) {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubmissions();
  }, [activityId]);

  const fetchSubmissions = async () => {
    setLoading(true);
    try {
      const res = await api.getActivitySubmissions(activityId);
      setSubmissions(Array.isArray(res) ? res : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGrade = async (submissionId, status) => {
    try {
      await api.gradeSubmissionManually(submissionId, status);
      fetchSubmissions();
    } catch (err) {
      alert('Failed to update grade');
    }
  };

  return (
    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-xl">
        <div className="modal-content">
          <div className="modal-header bg-kodigo-navy text-white">
            <h5 className="modal-title">Submissions</h5>
            <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            {loading ? <p>Loading...</p> : (
              <table className="table">
                <thead>
                  <tr>
                    <th>Trainee</th>
                    <th>GitHub URL</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {submissions.map(sub => (
                    <tr key={sub._id}>
                      <td>{sub.trainee?.firstName} {sub.trainee?.lastName}</td>
                      <td><a href={sub.githubUrl} target="_blank">{sub.githubUrl}</a></td>
                      <td>{sub.status}</td>
                      <td>
                        <button className="btn btn-success btn-sm me-2" onClick={() => handleGrade(sub._id, 'passed')}>Pass</button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleGrade(sub._id, 'failed')}>Fail</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
