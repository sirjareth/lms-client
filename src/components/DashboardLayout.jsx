import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

export default function DashboardLayout() {
  const [activeBatch, setActiveBatch] = useState(null);

  return (
    <div className="d-flex min-vh-100" style={{ backgroundColor: '#f8fafc' }}>
      {/* Sidebar on the Left */}
      <Sidebar batch={activeBatch} />

      {/* Main Content Area on the Right */}
      <div className="flex-grow-1 d-flex flex-column overflow-auto">
        {/* Pass setActiveBatch via Outlet context so children can update the sidebar */}
        <Outlet context={{ setActiveBatch }} />
      </div>
    </div>
  );
}
