import { useCallback, useEffect, useMemo, useState } from 'react';
import { api } from '../services/api';

const getId = (value) => (value?._id || value)?.toString();
const getUserName = (user) => user?.name || [user?.firstName, user?.lastName].filter(Boolean).join(' ') || user?.email || 'Unknown user';

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [batches, setBatches] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [selectedBatchId, setSelectedBatchId] = useState('');
  const [selectedUserId, setSelectedUserId] = useState('');
  const [manualEmail, setManualEmail] = useState('');
  const [enrollmentMode, setEnrollmentMode] = useState('existing');
  const [showCreateBatch, setShowCreateBatch] = useState(false);
  const [editingBatch, setEditingBatch] = useState(false);
  const [batchForm, setBatchForm] = useState({ name: '', mode: 'Online', startDate: '', endDate: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [creatingBatch, setCreatingBatch] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const loadData = useCallback(async () => {
    try {
      const [usersRes, batchesRes, enrollmentsRes] = await Promise.all([
        api.getAllUsers(),
        api.getBatches(),
        api.getAllEnrollments(),
      ]);
      setError('');
      const availableBatches = (Array.isArray(batchesRes) ? batchesRes : batchesRes?.batches || [])
        .filter((batch) => batch.isArchived !== true);
      setUsers(Array.isArray(usersRes) ? usersRes : usersRes?.users || []);
      setBatches(availableBatches);
      setEnrollments(Array.isArray(enrollmentsRes) ? enrollmentsRes : enrollmentsRes?.enrollments || []);
      setSelectedBatchId((current) => (
        availableBatches.some((batch) => getId(batch) === current)
          ? current
          : getId(availableBatches[0]) || ''
      ));
    } catch (err) {
      setError(err.message || 'Could not load enrollment data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    Promise.resolve().then(loadData);
  }, [loadData]);

  const batchEnrollments = useMemo(
    () => enrollments.filter((enrollment) => getId(enrollment.batch) === selectedBatchId),
    [enrollments, selectedBatchId]
  );
  const activeRoster = batchEnrollments.filter((enrollment) => enrollment.status === 'active');
  const activeEnrollmentByUser = new Map(
    enrollments
      .filter((enrollment) => enrollment.status === 'active')
      .map((enrollment) => [getId(enrollment.user), enrollment])
  );
  const candidates = users
    .filter((user) => !user.isAdmin && user.isActive !== false)
    .map((user) => {
      const batchEnrollment = batchEnrollments.find((enrollment) => getId(enrollment.user) === getId(user));
      const otherActiveEnrollment = activeEnrollmentByUser.get(getId(user));
      return { user, batchEnrollment, otherActiveEnrollment };
    })
    .filter(({ batchEnrollment, otherActiveEnrollment }) => (
      batchEnrollment?.status !== 'active'
      && (!otherActiveEnrollment || getId(otherActiveEnrollment.batch) === selectedBatchId)
    ));

  const handleEnrollment = async (event) => {
    event.preventDefault();
    if (!selectedBatchId || (enrollmentMode === 'existing' && !selectedUserId) || (enrollmentMode === 'email' && !manualEmail.trim())) return;

    const existing = batchEnrollments.find((enrollment) => getId(enrollment.user) === selectedUserId);
    setSaving(true);
    setError('');
    setNotice('');
    try {
      let response;
      if (enrollmentMode === 'email') {
        response = await api.enrollByEmail(manualEmail.trim(), selectedBatchId);
      } else {
        response = existing
          ? await api.updateEnrollmentStatus(existing._id, 'active')
          : await api.createEnrollment(selectedUserId, selectedBatchId);
      }
      setNotice(response.message || 'Trainee enrolled successfully.');
      setSelectedUserId('');
      setManualEmail('');
      await loadData();
    } catch (err) {
      setError(err.message || 'Could not enroll trainee.');
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveEnrollment = async (enrollment) => {
    const traineeName = getUserName(enrollment.user);
    if (!window.confirm(`Remove ${traineeName} from this batch? Their enrollment history will be kept.`)) return;

    setSaving(true);
    setError('');
    setNotice('');
    try {
      await api.updateEnrollmentStatus(enrollment._id, 'dropped');
      setNotice(`${traineeName} was removed from this batch. Enrollment history was retained.`);
      await loadData();
    } catch (err) {
      setError(err.message || 'Could not remove trainee from this batch.');
    } finally {
      setSaving(false);
    }
  };

  const handleCreateBatch = async (event) => {
    event.preventDefault();
    if (!batchForm.name.trim() || !batchForm.startDate || !batchForm.endDate) return;
    if (batchForm.endDate < batchForm.startDate) {
      setError('End date must be on or after the start date.');
      return;
    }

    setCreatingBatch(true);
    setError('');
    setNotice('');
    try {
      const batchData = {
        name: batchForm.name.trim(),
        programTitle: 'Java',
        mode: batchForm.mode,
        startDate: batchForm.startDate,
        endDate: batchForm.endDate,
      };
      const response = editingBatch
        ? await api.updateBatch(selectedBatchId, batchData)
        : await api.createBatch(batchData);
      await loadData();
      if (!editingBatch && response.batch?._id) setSelectedBatchId(response.batch._id);
      setBatchForm({ name: '', mode: 'Online', startDate: '', endDate: '' });
      setShowCreateBatch(false);
      setEditingBatch(false);
      setNotice(response.message || (editingBatch ? 'Batch updated successfully.' : 'Batch created successfully.'));
    } catch (err) {
      setError(err.message || 'Could not create batch.');
    } finally {
      setCreatingBatch(false);
    }
  };

  const handleEditBatch = () => {
    const batch = batches.find((item) => getId(item) === selectedBatchId);
    if (!batch) return;
    setBatchForm({
      name: batch.name || '',
      mode: batch.mode || 'Online',
      startDate: batch.startDate ? new Date(batch.startDate).toISOString().slice(0, 10) : '',
      endDate: batch.endDate ? new Date(batch.endDate).toISOString().slice(0, 10) : '',
    });
    setEditingBatch(true);
    setShowCreateBatch(true);
    setError('');
    setNotice('');
  };

  const handleArchiveBatch = async () => {
    const batch = batches.find((item) => getId(item) === selectedBatchId);
    if (!batch) return;
    if (!window.confirm(`Archive ${batch.name}? It will be removed from active batch lists and trainee dashboards. Enrollment history will be kept.`)) return;

    setCreatingBatch(true);
    setError('');
    setNotice('');
    try {
      const response = await api.archiveBatch(selectedBatchId);
      setShowCreateBatch(false);
      setEditingBatch(false);
      await loadData();
      setNotice(response.message || `${batch.name} archived successfully.`);
    } catch (err) {
      setError(err.message || 'Could not archive batch.');
    } finally {
      setCreatingBatch(false);
    }
  };

  if (loading) {
    return <div className="p-5 text-center"><div className="spinner-border text-primary" role="status"><span className="visually-hidden">Loading</span></div></div>;
  }

  return (
    <main className="p-4" style={{ backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      <div className="d-flex flex-wrap justify-content-between align-items-start gap-3 mb-4">
        <div>
          <h2 className="fw-bold mb-1" style={{ color: '#0f172a' }}>Enrollment management</h2>
          <p className="text-muted mb-0">Assign trainees to the correct active batch and review its roster.</p>
        </div>
        <div className="d-flex flex-wrap align-items-center gap-2">
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => {
              setShowCreateBatch((show) => !show);
              setEditingBatch(false);
              setBatchForm({ name: '', mode: 'Online', startDate: '', endDate: '' });
              setError('');
            }}
          >
            <i className="bi bi-plus-lg me-1" /> Create batch
          </button>
          <label htmlFor="admin-batch" className="small fw-semibold text-muted">Active batch</label>
          <select
            id="admin-batch"
            className="form-select form-select-sm"
            value={selectedBatchId}
            onChange={(event) => { setSelectedBatchId(event.target.value); setSelectedUserId(''); setNotice(''); }}
            style={{ minWidth: '190px' }}
            disabled={!batches.length}
          >
            {batches.length ? batches.map((batch) => (
              <option key={batch._id} value={batch._id}>{batch.name}</option>
            )) : <option value="">No active batches</option>}
          </select>
          <button type="button" className="btn btn-outline-primary btn-sm" onClick={handleEditBatch} disabled={!selectedBatchId || creatingBatch}>
            <i className="bi bi-pencil me-1" /> Edit
          </button>
          <button type="button" className="btn btn-outline-danger btn-sm" onClick={handleArchiveBatch} disabled={!selectedBatchId || creatingBatch}>
            <i className="bi bi-archive me-1" /> Archive
          </button>
        </div>
      </div>

      {error && <div className="alert alert-danger" role="alert">{error}</div>}
      {notice && <div className="alert alert-success" role="status">{notice}</div>}

      {showCreateBatch && (
        <form className="bg-white border rounded-3 shadow-sm p-4 mb-4" onSubmit={handleCreateBatch}>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="fw-bold mb-0">{editingBatch ? 'Edit batch' : 'Create a batch'}</h5>
            <button type="button" className="btn-close" aria-label="Close" onClick={() => { setShowCreateBatch(false); setEditingBatch(false); }} />
          </div>
          <div className="row g-3 align-items-end">
            <div className="col-md-4">
              <label htmlFor="new-batch-name" className="form-label">Batch name</label>
              <input
                id="new-batch-name"
                className="form-control"
                value={batchForm.name}
                onChange={(event) => setBatchForm((current) => ({ ...current, name: event.target.value }))}
                placeholder="e.g. Batch 2"
                required
              />
            </div>
            <div className="col-md-2">
              <label htmlFor="new-batch-mode" className="form-label">Class mode</label>
              <select
                id="new-batch-mode"
                className="form-select"
                value={batchForm.mode}
                onChange={(event) => setBatchForm((current) => ({ ...current, mode: event.target.value }))}
                required
              >
                <option>Online</option>
                <option>Face-to-face</option>
                <option>Hybrid</option>
              </select>
            </div>
            <div className="col-md-2">
              <label htmlFor="new-batch-start" className="form-label">Start date</label>
              <input
                id="new-batch-start"
                type="date"
                className="form-control"
                value={batchForm.startDate}
                onChange={(event) => setBatchForm((current) => ({ ...current, startDate: event.target.value }))}
                required
              />
            </div>
            <div className="col-md-2">
              <label htmlFor="new-batch-end" className="form-label">End date</label>
              <input
                id="new-batch-end"
                type="date"
                className="form-control"
                value={batchForm.endDate}
                min={batchForm.startDate || undefined}
                onChange={(event) => setBatchForm((current) => ({ ...current, endDate: event.target.value }))}
                required
              />
            </div>
            <div className="col-md-2 d-grid">
              <button className="btn btn-primary" type="submit" disabled={creatingBatch}>
                {creatingBatch ? 'Saving…' : editingBatch ? 'Save changes' : 'Create batch'}
              </button>
            </div>
          </div>
          <div className="form-text mt-2">New batches are created for the Java program and appear in the batch selector.</div>
        </form>
      )}

      {!batches.length ? (
        <div className="alert alert-info">Walang active batch na mapag-e-enroll-an. Gumawa o mag-unarchive muna ng batch.</div>
      ) : (
        <>
          <section className="row g-3 mb-4">
            <div className="col-md-4">
              <div className="bg-white border rounded-3 shadow-sm p-4 h-100">
                <div className="fs-2 fw-bold text-primary">{activeRoster.length}</div>
                <div className="small text-muted">Trainees in this batch</div>
              </div>
            </div>
            <div className="col-md-8">
              <form className="bg-white border rounded-3 shadow-sm p-4 h-100" onSubmit={handleEnrollment}>
                <h5 className="fw-bold mb-3">Enroll a trainee</h5>
                <div className="btn-group btn-group-sm mb-3" role="group" aria-label="Enrollment method">
                  <button
                    className={`btn ${enrollmentMode === 'existing' ? 'btn-primary' : 'btn-outline-primary'}`}
                    type="button"
                    onClick={() => setEnrollmentMode('existing')}
                  >
                    Existing account
                  </button>
                  <button
                    className={`btn ${enrollmentMode === 'email' ? 'btn-primary' : 'btn-outline-primary'}`}
                    type="button"
                    onClick={() => setEnrollmentMode('email')}
                  >
                    Enter email
                  </button>
                </div>
                <div className="d-flex flex-wrap gap-2">
                  {enrollmentMode === 'existing' ? (
                    <select
                      className="form-select flex-grow-1"
                      aria-label="Choose a trainee to enroll"
                      value={selectedUserId}
                      onChange={(event) => setSelectedUserId(event.target.value)}
                      required
                      disabled={!candidates.length}
                    >
                      <option value="">{candidates.length ? 'Select a trainee' : 'No eligible trainees to enroll'}</option>
                      {candidates.map(({ user, batchEnrollment }) => (
                        <option key={user._id} value={user._id}>
                          {getUserName(user)}
                          {batchEnrollment ? ' (reactivate enrollment)' : ''}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="email"
                      className="form-control flex-grow-1"
                      aria-label="Trainee email address"
                      placeholder="trainee@example.com"
                      value={manualEmail}
                      onChange={(event) => setManualEmail(event.target.value)}
                      required
                    />
                  )}
                  <button
                    className="btn btn-primary px-4"
                    type="submit"
                    disabled={saving || (enrollmentMode === 'existing' ? !selectedUserId : !manualEmail.trim())}
                  >
                    {saving ? 'Saving…' : 'Enroll trainee'}
                  </button>
                </div>
                <div className="form-text mt-2">
                  {enrollmentMode === 'existing'
                    ? 'Users already active in another batch are excluded to prevent conflicting assignments.'
                    : 'If the account does not exist yet, it will be prepared for this email. The trainee can then sign in with Google using the same email.'}
                </div>
              </form>
            </div>
          </section>

          <section className="bg-white border rounded-3 shadow-sm overflow-hidden">
            <div className="d-flex justify-content-between align-items-center p-3 border-bottom">
              <h5 className="fw-bold mb-0">{batches.find((batch) => getId(batch) === selectedBatchId)?.name || 'Batch'} roster</h5>
              <span className="badge text-bg-primary">{activeRoster.length} active</span>
            </div>
            {!activeRoster.length ? (
              <div className="p-5 text-center text-muted">Wala pang enrolled na trainee sa batch na ito.</div>
            ) : (
              <div className="table-responsive">
                <table className="table align-middle mb-0">
                  <thead className="table-light">
                    <tr><th className="ps-3">Trainee</th><th>Email</th><th>Enrolled</th><th className="text-end pe-3">Actions</th></tr>
                  </thead>
                  <tbody>
                    {activeRoster.map((enrollment) => (
                      <tr key={enrollment._id}>
                        <td className="ps-3 fw-semibold">{getUserName(enrollment.user)}</td>
                        <td>{enrollment.user?.email || '—'}</td>
                        <td>{enrollment.enrolledAt ? new Date(enrollment.enrolledAt).toLocaleDateString() : '—'}</td>
                        <td className="text-end pe-3">
                          <button
                            type="button"
                            className="btn btn-outline-danger btn-sm"
                            disabled={saving}
                            onClick={() => handleRemoveEnrollment(enrollment)}
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}
    </main>
  );
}
