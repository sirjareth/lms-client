import { useState, useEffect } from 'react';
import { api } from '../services/api';
import NewSessionModal from '../components/NewSessionModal';
import EditSessionModal from '../components/EditSessionModal';
import SubmissionsModal from '../components/SubmissionsModal';
import { SortableSessionRow } from '../components/SortableSessionRow';

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

export default function TrainerDashboard() {
  const [batches, setBatches] = useState([]);
  const [selectedBatchId, setSelectedBatchId] = useState('');
  const [dashboardData, setDashboardData] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNewSessionModal, setShowNewSessionModal] = useState(false);
  const [editingSession, setEditingSession] = useState(null);
  const [viewingSubmissions, setViewingSubmissions] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

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
      const res = await api.getTrainerDashboardData(batchId);
      setDashboardData(res);
      // The API returns each item as { session, activity, stats }, while the
      // row component expects the session fields at the top level.
      setSessions((res.sessionStats || []).map(({ session, activity, ...stats }) => ({
        ...session,
        ...stats,
        activity: activity ? { ...activity, _id: activity._id || activity.id } : null,
      })));

    } catch (err) {
      console.error(err);
    }
  };

  const handleBatchSelect = (e) => {
    const batchId = e.target.value;
    setSelectedBatchId(batchId);
    fetchBatchDetails(batchId);
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const activeIdStr = active.id.toString();
      const overIdStr = over.id.toString();

      setSessions((items) => {
        const oldIndex = items.findIndex((item) => item._id.toString() === activeIdStr);
        const newIndex = items.findIndex((item) => item._id.toString() === overIdStr);

        if (oldIndex === -1 || newIndex === -1) return items;

        const newItems = arrayMove(items, oldIndex, newIndex);

        // Update Backend
        const sessionIds = newItems.map((item) => item._id);
        api.reorderSessions(selectedBatchId, sessionIds)
          .then(() => console.log("Reorder saved successfully"))
          .catch((err) => {
             console.error("Failed to reorder:", err);
             fetchBatchDetails(selectedBatchId); // Revert
          });

        return [...newItems];
      });
    }
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
          <i className="bi bi-plus-lg me-1"></i> New Session & Activity
        </button>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-md-3">
          <div className="bg-white p-4 rounded-3 border shadow-sm">
            <h2 className="fw-bold mb-1" style={{ color: '#0f172a' }}>
              {dashboardData?.summary?.totalStudents || 0}
            </h2>
            <div className="text-muted small">Students</div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="bg-white p-4 rounded-3 border shadow-sm">
            <h2 className="fw-bold mb-1" style={{ color: '#d97706' }}>
              {dashboardData?.summary?.checkingNow || 0}
            </h2>
            <div className="text-muted small">Checking now</div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="bg-white p-4 rounded-3 border shadow-sm">
            <h2 className="fw-bold mb-1" style={{ color: '#dc2626' }}>
              {dashboardData?.summary?.failedAttemptsTotal || 0}
            </h2>
            <div className="text-muted small">Failed attempts</div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="bg-white p-4 rounded-3 border shadow-sm">
            <h2 className="fw-bold mb-1" style={{ color: '#16a34a' }}>
              {dashboardData?.summary?.avgPassRateBatch || 0}%
            </h2>
            <div className="text-muted small">Avg pass rate</div>
          </div>
        </div>
      </div>

      <div className="bg-kodigo-navy text-white p-3 rounded-top d-flex justify-content-between align-items-center mb-0">
        <h6 className="mb-0 fw-bold">Sessions & Activities</h6>
      </div>

      <div className="bg-white border rounded-bottom border-top-0 mb-4 overflow-hidden">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <div className="table-light border-bottom d-flex align-items-center p-3 small text-muted text-uppercase fw-bold">
            <div className="px-2" style={{ flex: '2' }}>Session / Activity</div>
            <div style={{ flex: '1' }}>Submitted</div>
            <div style={{ flex: '1' }}>Passed</div>
            <div style={{ flex: '1' }}>Failed</div>
            <div style={{ flex: '1.5' }}>Pass rate</div>
            <div className="text-end px-2" style={{ flex: '1.5' }}>Actions</div>
          </div>

          {sessions.length === 0 ? (
            <div className="p-5 text-center text-muted">No sessions for this batch.</div>
          ) : (
            <SortableContext
              items={sessions.map((session) => session._id.toString())}
              strategy={verticalListSortingStrategy}
            >
              {sessions.map((session) => (
                <SortableSessionRow
                  key={session._id}
                  session={session}
                  onEdit={setEditingSession}
                  onViewSubmissions={setViewingSubmissions}
                />
              ))}
            </SortableContext>
          )}
        </DndContext>
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

      {editingSession && (
        <EditSessionModal
          session={editingSession}
          onClose={() => setEditingSession(null)}
          onSuccess={() => {
            setEditingSession(null);
            fetchBatchDetails(selectedBatchId);
          }}
        />
      )}

      {viewingSubmissions && (
        <SubmissionsModal
          activityId={viewingSubmissions}
          onClose={() => setViewingSubmissions(null)}
        />
      )}
    </div>
  );
}
