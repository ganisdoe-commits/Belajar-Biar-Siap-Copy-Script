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

api.interceptors.response.use(
  (r) => r,
  (err) => {
    const url = err.config?.url || "";
    if (err.response?.status === 401 && url.startsWith("/admin") && url !== "/admin/login") {
      clearAdminToken();
      window.location.href = "/admin/login";
    }
    return Promise.reject(err);
  }
);

export function apiErrorMessage(err, fallback = "Terjadi kesalahan. Silakan coba lagi.") {
  const detail = err?.response?.data?.detail;
  if (!detail) return fallback;
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) return detail.map((e) => e?.msg || JSON.stringify(e)).join(" ");
  return detail.msg || fallback;
}

// ---- Public ----
export const getReport = (cid) => api.get(`/report/${cid}`).then((r) => r.data);
export const getSubjects = () => api.get("/subjects").then((r) => r.data);
export const getSubject = (id) => api.get(`/subjects/${id}`).then((r) => r.data);
export const getExam = (id) => api.get(`/subjects/${id}/exam`).then((r) => r.data);
export const startExam = (payload) => api.post("/exam/start", payload).then((r) => r.data);
export const saveExam = (sid, payload) => api.post(`/exam/session/${sid}/save`, payload, { timeout: 15000 }).then((r) => r.data);
export const getClientInfo = () => api.get("/client-info").then((r) => r.data);
export const getSubjectRegulations = (sid) => api.get(`/subjects/${sid}/regulations`).then((r) => r.data);
export const regulationFileUrl = (rid) => `${process.env.REACT_APP_BACKEND_URL}/api/regulations/${rid}/file`;
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
export const adminChangePassword = (data) => api.post("/admin/change-password", data, { headers: authHeader() }).then((r) => r.data);
export const adminImportPreview = (file, onProgress) => {
  const fd = new FormData();
  fd.append("file", file);
  return api
    .post("/admin/import/preview", fd, {
      headers: authHeader(),
      onUploadProgress: (e) => onProgress && e.total && onProgress(Math.round((e.loaded / e.total) * 100)),
    })
    .then((r) => r.data);
};
export const adminImportCommit = (data) => api.post("/admin/import/commit", data, { headers: authHeader() }).then((r) => r.data);

export default api;

// ---- Admin: Peraturan (unggah bertahap per potongan) ----
export const adminListRegulations = () => api.get("/admin/regulations", { headers: authHeader() }).then((r) => r.data);
export const adminUpdateRegulation = (id, data) => api.put(`/admin/regulations/${id}`, data, { headers: authHeader() }).then((r) => r.data);
export const adminDeleteRegulation = (id) => api.delete(`/admin/regulations/${id}`, { headers: authHeader() }).then((r) => r.data);
export async function adminUploadRegulation(file, title, subjectIds, onProgress) {
  const init = await api.post("/admin/regulations/upload/init", { filename: file.name, size: file.size }, { headers: authHeader() }).then((r) => r.data);
  for (let i = 0; i < init.total_chunks; i++) {
    const fd = new FormData();
    fd.append("upload_id", init.upload_id);
    fd.append("index", String(i));
    fd.append("chunk", file.slice(i * init.chunk_size, (i + 1) * init.chunk_size), `${i}.part`);
    await api.post("/admin/regulations/upload/chunk", fd, { headers: authHeader() });
    onProgress && onProgress(Math.round(((i + 1) / init.total_chunks) * 100));
  }
  return api.post("/admin/regulations/upload/complete", { upload_id: init.upload_id, title, subject_ids: subjectIds }, { headers: authHeader() }).then((r) => r.data);
}
