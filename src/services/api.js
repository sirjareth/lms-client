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

  // Sessions & Activities
  getSessionsByBatch: async (batchId) => {
    const res = await fetch(`${API_URL}/sessions/batch/${batchId}`, {
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
