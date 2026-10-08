import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const api = axios.create({ baseURL: API });

const ADMIN_KEY = "bbp_admin_token";
export const getAdminToken = () => localStorage.getItem(ADMIN_KEY);
export const setAdminToken = (t) => localStorage.setItem(ADMIN_KEY, t);
export const clearAdminToken = () => localStorage.removeItem(ADMIN_KEY);
const authHeader = () => {
  const t = getAdminToken();
  return t ? { Authorization: `Bearer ${t}` } : {};
};

// ---- Public ----
export const getSubjects = () => api.get("/subjects").then((r) => r.data);
export const getSubject = (id) => api.get(`/subjects/${id}`).then((r) => r.data);
export const getExam = (id) => api.get(`/subjects/${id}/exam`).then((r) => r.data);
export const submitExam = (payload) => api.post("/exam/submit", payload).then((r) => r.data);
export const getEssays = (id) => api.get(`/subjects/${id}/essays`).then((r) => r.data);
export const getResults = (cid) => api.get(`/results/${cid}`).then((r) => r.data);

// ---- Admin ----
export const adminLogin = (password) => api.post("/admin/login", { password }).then((r) => r.data);
export const adminGetSubjects = () => api.get("/admin/subjects", { headers: authHeader() }).then((r) => r.data);
export const adminCreateSubject = (data) => api.post("/admin/subjects", data, { headers: authHeader() }).then((r) => r.data);
export const adminUpdateSubject = (id, data) => api.put(`/admin/subjects/${id}`, data, { headers: authHeader() }).then((r) => r.data);
export const adminDeleteSubject = (id) => api.delete(`/admin/subjects/${id}`, { headers: authHeader() }).then((r) => r.data);
export const adminGetQuestions = (sid) => api.get("/admin/questions", { params: { subject_id: sid }, headers: authHeader() }).then((r) => r.data);
export const adminCreateQuestion = (data) => api.post("/admin/questions", data, { headers: authHeader() }).then((r) => r.data);
export const adminUpdateQuestion = (id, data) => api.put(`/admin/questions/${id}`, data, { headers: authHeader() }).then((r) => r.data);
export const adminDeleteQuestion = (id) => api.delete(`/admin/questions/${id}`, { headers: authHeader() }).then((r) => r.data);
export const adminBulkQuestions = (payload) => api.post("/admin/questions/bulk", payload, { headers: authHeader() }).then((r) => r.data);
export const adminGetEssays = (sid) => api.get("/admin/essays", { params: { subject_id: sid }, headers: authHeader() }).then((r) => r.data);
export const adminCreateEssay = (data) => api.post("/admin/essays", data, { headers: authHeader() }).then((r) => r.data);
export const adminUpdateEssay = (id, data) => api.put(`/admin/essays/${id}`, data, { headers: authHeader() }).then((r) => r.data);
export const adminDeleteEssay = (id) => api.delete(`/admin/essays/${id}`, { headers: authHeader() }).then((r) => r.data);
export const adminBulkEssays = (payload) => api.post("/admin/essays/bulk", payload, { headers: authHeader() }).then((r) => r.data);
export const adminGetResults = () => api.get("/admin/results", { headers: authHeader() }).then((r) => r.data);

export default api;
