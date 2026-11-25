import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

export function SortableSessionRow({ session, onEdit, onViewSubmissions }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: session._id.toString() });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    zIndex: isDragging ? 999 : 1,
    opacity: isDragging ? 0.6 : 1,
    backgroundColor: isDragging ? '#f8fafc' : 'white',
    position: 'relative'
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="d-flex align-items-center justify-content-between p-3 border-bottom text-dark"
    >
      <div className="d-flex align-items-center gap-3" style={{ flex: '2' }}>
        <div
          {...attributes}
          {...listeners}
          className="text-secondary p-1"
          style={{ cursor: 'grab', userSelect: 'none' }}
        >
          <i className="bi bi-grip-vertical fs-5"></i>
        </div>
        <div>
          <div className="fw-bold" style={{ color: '#0f172a' }}>{session.code} {session.title}</div>
          {session.activity && (
            <div className="small text-muted italic">Act: {session.activity.title}</div>
          )}
        </div>
      </div>

      <div style={{ flex: '1' }}>{session.stats?.submitted ?? 0}</div>
      <div className="text-success fw-semibold" style={{ flex: '1' }}>{session.stats?.passed ?? 0}</div>
      <div className="text-danger fw-semibold" style={{ flex: '1' }}>{session.stats?.failed ?? 0}</div>

      <div style={{ flex: '1.5' }}>
        <div className="d-flex align-items-center gap-2">
          <div className="progress flex-grow-1" style={{ height: '8px' }}>
            <div className="progress-bar bg-primary" style={{ width: `${session.stats?.passRateNum ?? 0}%` }}></div>
          </div>
          <span className="small fw-bold">{session.stats?.passRate ?? '0%'}</span>
        </div>
      </div>

      <div className="text-end" style={{ flex: '1.5' }}>
        <div className="d-flex justify-content-end gap-2">
          {session.activity ? (
            <button className="btn btn-outline-primary btn-sm px-3" onClick={() => onViewSubmissions(session.activity._id)}>
              Submissions
            </button>
          ) : (
            <button className="btn btn-outline-primary btn-sm px-3" disabled>No Activity</button>
          )}
          <button className="btn btn-outline-secondary btn-sm px-3" onClick={() => onEdit(session)}>
            Edit
          </button>
        </div>
      </div>
    </div>
  );
}
