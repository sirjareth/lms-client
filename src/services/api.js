const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

const getHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export const api = {
  // Auth
  googleLoginUrl: `${API_URL}/users/google`,

  completeGoogleLogin: async () => {
    const res = await fetch(`${API_URL}/users/google/session`, {
      credentials: 'include',
    });
    return res.json();
  },

  logoutGoogleSession: async () => {
    const res = await fetch(`${API_URL}/users/logout`, {
      method: 'POST',
      credentials: 'include',
    });
    return res.ok;
  },

  login: async (credentials) => {
    const res = await fetch(`${API_URL}/users/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    return res.json();
  },

  register: async (userData) => {
    const res = await fetch(`${API_URL}/users/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    return res.json();
  },

  getProfile: async () => {
    const res = await fetch(`${API_URL}/users/details`, {
      headers: getHeaders(),
    });
    return res.json();
  },

  // Batches
  getBatches: async () => {
    const res = await fetch(`${API_URL}/batches`, {
      headers: getHeaders(),
    });
    return res.json();
  },

  getBatchById: async (id) => {
    const res = await fetch(`${API_URL}/batches/${id}`, {
      headers: getHeaders(),
    });
    return res.json();
  },

  createBatch: async (batchData) => {
    const res = await fetch(`${API_URL}/batches`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(batchData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || data.error?.message || 'Could not create batch.');
    return data;
  },

  updateBatch: async (batchId, batchData) => {
    const res = await fetch(`${API_URL}/batches/${batchId}`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(batchData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || data.error?.message || 'Could not update batch.');
    return data;
  },

  archiveBatch: async (batchId) => {
    const res = await fetch(`${API_URL}/batches/${batchId}/archive`, {
      method: 'PATCH',
      headers: getHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || data.error?.message || 'Could not archive batch.');
    return data;
  },

  getAllUsers: async () => {
    const res = await fetch(`${API_URL}/users`, { headers: getHeaders() });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Could not load users.');
    return data;
  },

  // Enrollments
  getMyEnrollments: async () => {
    const res = await fetch(`${API_URL}/enrollments/my-enrollments`, {
      headers: getHeaders(),
    });
    return res.json();
  },

  getBatchRoster: async (batchId) => {
    const res = await fetch(`${API_URL}/enrollments/batch/${batchId}`, {
      headers: getHeaders(),
    });
    return res.json();
  },

  getAllEnrollments: async () => {
    const res = await fetch(`${API_URL}/enrollments`, { headers: getHeaders() });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Could not load enrollments.');
    return data;
  },

  createEnrollment: async (userId, batchId) => {
    const res = await fetch(`${API_URL}/enrollments`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ userId, batchId, status: 'active' }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Could not enroll trainee.');
    return data;
  },

  enrollByEmail: async (email, batchId) => {
    const res = await fetch(`${API_URL}/enrollments/by-email`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ email, batchId }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || data.error?.message || 'Could not enroll this email.');
    return data;
  },

  updateEnrollmentStatus: async (enrollmentId, status) => {
    const res = await fetch(`${API_URL}/enrollments/${enrollmentId}/status`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ status }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Could not update enrollment.');
    return data;
  },

  // Dashboard
  getTrainerDashboardData: async (batchId) => {
    const res = await fetch(`${API_URL}/dashboard/batch/${batchId}/trainer`, {
      headers: getHeaders(),
    });
    return res.json();
  },

  // Sessions & Activities
  getSessionsByBatch: async (batchId) => {
    const res = await fetch(`${API_URL}/sessions/batch/${batchId}`, {
      headers: getHeaders(),
    });
    return res.json();
  },

  createSession: async (data) => {
    const res = await fetch(`${API_URL}/sessions`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  createActivity: async (data) => {
    const res = await fetch(`${API_URL}/activities`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  updateSession: async (sessionId, data) => {
    const res = await fetch(`${API_URL}/sessions/${sessionId}`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  reorderSessions: async (batchId, sessionIds) => {
    const res = await fetch(`${API_URL}/sessions/batch/${batchId}/reorder`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ sessionIds }),
    });
    return res.json();
  },

  deleteSession: async (sessionId) => {
    const res = await fetch(`${API_URL}/sessions/${sessionId}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return res.json();
  },

  updateActivity: async (activityId, data) => {
    const res = await fetch(`${API_URL}/activities/${activityId}`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  deleteActivity: async (activityId) => {
    const res = await fetch(`${API_URL}/activities/${activityId}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return res.json();
  },

  // Submissions
  submitActivity: async (activityId, githubUrl) => {
    const res = await fetch(`${API_URL}/submissions`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ activityId, githubUrl }),
    });
    return res.json();
  },

  getMySubmissions: async () => {
    const res = await fetch(`${API_URL}/submissions/my-submissions`, {
      headers: getHeaders(),
    });
    return res.json();
  },

  getActivitySubmissions: async (activityId) => {
    const res = await fetch(`${API_URL}/submissions/activity/${activityId}`, {
      headers: getHeaders(),
    });
    return res.json();
  },

  getCheckResult: async (submissionId) => {
    const res = await fetch(`${API_URL}/submissions/${submissionId}/result`, {
      headers: getHeaders(),
    });
    return res.json();
  },

  // Manual Grading (Trainer/Admin)
  gradeSubmissionManually: async (submissionId, status) => {
    const res = await fetch(`${API_URL}/submissions/${submissionId}/grade`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ status }),
    });
    return res.json();
  },

  recheckSubmission: async (submissionId) => {
    const res = await fetch(`${API_URL}/submissions/${submissionId}/recheck`, {
      method: 'POST',
      headers: getHeaders(),
    });
    return res.json();
  },

  // Session Feedback
  submitSessionFeedback: async (sessionId, rating, remarks) => {
    const res = await fetch(`${API_URL}/sessions/${sessionId}/feedback`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ rating, remarks }),
    });
    return res.json();
  },
};
