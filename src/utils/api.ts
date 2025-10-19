// src/utils/api.ts
const AI_BASE_URL =
  (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_AI_URL) ||
  'http://localhost:3000';

const DATA_BASE_URL =
  (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_API_URL) ||
  'http://localhost:7010';

async function fetchJSON<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(options?.headers || {}) }
  });
  if (!response.ok) {
    let err: any = { status: response.status, message: response.statusText };
    try { err = await response.json(); } catch {}
    throw err;
  }
  return response.json() as Promise<T>;
}

// auth token helpers
const tokenKey = 'token';
export function setToken(t: string) { try { localStorage.setItem(tokenKey, t); } catch {} }
export function getToken(): string | null { try { return localStorage.getItem(tokenKey); } catch { return null; } }
export function clearToken() { try { localStorage.removeItem(tokenKey); } catch {} }

function withAuth(init: RequestInit = {}): RequestInit {
  const t = getToken();
  if (!t) return init;
  const headers = new Headers(init.headers || {});
  headers.set('authorization', `Bearer ${t}`);
  return { ...init, headers };
}

export const api = {
  ai: {
    valuation(prompt: string) {
      return fetchJSON(`${AI_BASE_URL}/ai/valuation`, { method: 'POST', body: JSON.stringify({ prompt }) });
    },
    moderationStream(msg: string) {
      return fetchJSON(`${AI_BASE_URL}/ai/moderate/stream?msg=${encodeURIComponent(msg)}`);
    },
    visionFacts(imgBase64: string) {
      return fetchJSON(`${AI_BASE_URL}/ai/vision-facts`, { method: 'POST', body: JSON.stringify({ image: imgBase64 }) });
    },
  },

  auth: {
    register(payload: { email: string; password: string; age: number; guardianName: string; guardianEmail: string; }) {
      return fetchJSON<{ ok: boolean; user: any; token: string }>(`${DATA_BASE_URL}/api/auth/register`, {
        method: 'POST', body: JSON.stringify(payload)
      });
    },
    login(payload: { email: string; password: string; }) {
      return fetchJSON<{ ok: boolean; user: any; token: string }>(`${DATA_BASE_URL}/api/auth/login`, {
        method: 'POST', body: JSON.stringify(payload)
      });
    },
    forgot(email: string) {
      return fetchJSON<{ ok: boolean }>(`${DATA_BASE_URL}/api/auth/forgot`, {
        method: 'POST', body: JSON.stringify({ email })
      });
    },
    reset(token: string, newPassword: string) {
      return fetchJSON<{ ok: boolean }>(`${DATA_BASE_URL}/api/auth/reset`, {
        method: 'POST', body: JSON.stringify({ token, newPassword })
      });
    },
    me() {
      return fetchJSON<{ ok: boolean; user?: any }>(`${DATA_BASE_URL}/api/auth/me`, withAuth());
    },
  },

  users: {
    get(id: string) {
      return fetchJSON(`${DATA_BASE_URL}/api/users/${id}`, withAuth());
    },
  },
};

export { AI_BASE_URL, DATA_BASE_URL };
