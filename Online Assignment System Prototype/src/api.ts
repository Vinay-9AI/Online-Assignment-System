/// <reference types="vite/client" />
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000';

type AuthResponse = { token: string; user: { id: string; name: string; email: string; role: string } };

async function request(path: string, opts: RequestInit = {}) {
  const res = await fetch(API_BASE + path, opts);
  if (!res.ok) {
    const text = await res.text();
    let body: any = text;
    try { body = JSON.parse(text); } catch {}
    throw { status: res.status, body };
  }
  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) return res.json();
  return res.text();
}

export const api = {
  register: (payload: { name: string; email: string; password: string; role: 'student' | 'teacher' }) =>
    request('/api/auth/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }),
  login: (payload: { email: string; password: string }) =>
    request('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }) as Promise<AuthResponse>,
  getCourses: (token?: string) => request('/api/courses', { headers: token ? { Authorization: 'Bearer ' + token } : {} }),
  createCourse: (token: string, payload: { title: string; description?: string }) =>
    request('/api/courses', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token }, body: JSON.stringify(payload) }),
  createAssignment: (token: string, payload: { courseId: string; title: string; description?: string; dueDate?: string }) =>
    request('/api/assignments', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token }, body: JSON.stringify(payload) }),
  // submissions: multipart form for file upload
  submitAssignment: (token: string, assignmentId: string, file: File) => {
    const form = new FormData();
    form.append('file', file);
    return request(`/api/submissions/${assignmentId}/submit`, { method: 'POST', headers: { Authorization: 'Bearer ' + token }, body: form });
  }
  ,
  // teacher actions
  getAssignments: (courseId: string, token?: string) => request(`/api/assignments/${courseId}`, { headers: token ? { Authorization: 'Bearer ' + token } : {} }),
  getSubmissions: (assignmentId: string, token: string) => request(`/api/submissions/${assignmentId}`, { headers: { Authorization: 'Bearer ' + token } }),
  downloadSubmission: async (id: string, token: string) => {
    const res = await fetch(API_BASE + `/api/submissions/${id}/download`, { headers: { Authorization: 'Bearer ' + token } });
    if (!res.ok) throw new Error('Download failed');
    return res.blob();
  },
  gradeSubmission: (id: string, token: string, payload: { grade: number; feedback?: string }) =>
    request(`/api/submissions/${id}/grade`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token }, body: JSON.stringify(payload) }),
  assignStudents: (courseId: string, token: string, studentIds: string[]) =>
    request(`/api/courses/${courseId}/assign-students`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token }, body: JSON.stringify({ studentIds }) }),
  getAllUsers: (token: string) => request('/api/courses/all-users', { headers: { Authorization: 'Bearer ' + token } }),
  deleteCourse: (courseId: string, token: string) => request(`/api/courses/${courseId}`, { method: 'DELETE', headers: { Authorization: 'Bearer ' + token } }),
  // student: list own submissions
  getStudentSubmissions: (token: string) => request('/api/submissions/student/me', { headers: { Authorization: 'Bearer ' + token } }),
};

export default api;
