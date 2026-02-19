import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json"
  }
});

// Attach token automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/* ==========================
   AUTH
========================== */

export const registerApi = (data) => api.post("/auth/register", data);
export const loginApi = (data) => api.post("/auth/login", data);
export const googleLoginApi = (data) => api.post("/auth/google", data);

/* ==========================
   TESTS
========================== */

export const getPublishedTestsApi = () => api.get("/tests");
export const getTestByIdApi = (testId) =>
  api.get(`/tests/${testId}`);

export const createTestApi = (data) => api.post("/tests", data);
export const addQuestionApi = (testId, data) =>
  api.post(`/tests/${testId}/questions`, data);
export const publishTestApi = (testId) =>
  api.patch(`/tests/${testId}/publish`);

/* ==========================
   SUBMISSIONS
========================== */

export const runCodeApi = (data) =>
  api.post("/submissions/run", data);

export const submitCodeApi = (data) =>
  api.post("/submissions/run", data);

export const mySubmissionsApi = () =>
  api.get("/submissions/my");

export const testSubmissionsApi = (testId) =>
  api.get(`/submissions/test/${testId}`);

export default api;
