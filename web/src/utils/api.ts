// web/src/utils/api.ts
const AI_BASE_URL =
  (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_AI_URL) ||
  'http://localhost:3000';

const DATA_BASE_URL =
  (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_API_URL) ||
  'http://localhost:7002';

async function fetchJSON<T>(url: string, options?: RequestInit): Promise<T> {
  try {
    // Convert headers to plain object if they're a Headers instance
    const headersObj: Record<string, string> = { 'Content-Type': 'application/json' };
    if (options?.headers) {
      if (options.headers instanceof Headers) {
        options.headers.forEach((value, key) => {
          headersObj[key] = value;
        });
      } else if (Array.isArray(options.headers)) {
        options.headers.forEach(([key, value]) => {
          headersObj[key] = value;
        });
      } else {
        Object.assign(headersObj, options.headers);
      }
    }
    
    const response = await fetch(url, {
      ...options,
      headers: headersObj
    });
    if (!response.ok) {
      let err: any = { status: response.status, message: response.statusText };
      try { err = await response.json(); } catch {}

      // REMOVED: Automatic 401 redirect that was causing login loops
      // If you get a 401, the error is thrown and calling code handles it
      // This prevents infinite redirect loops when server is down

      throw err;
    }
    return response.json() as Promise<T>;
  } catch (err: any) {
    // Network errors just get logged and re-thrown
    if (err.status === undefined) {
      console.error('Network error:', err);
    }
    throw err;
  }
}

// auth token helpers
const tokenKey = 'swappy_token';
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

export const ai = {
  valuation(facts: any) {
    return fetchJSON<any>(`${AI_BASE_URL}/ai/valuation`, {
      method: 'POST',
      body: JSON.stringify({ facts })
    });
  },
  unevenScore(myValues: number[], theirValues: number[]) {
    return fetchJSON<any>(`${AI_BASE_URL}/ai/uneven-score`, {
      method: 'POST',
      body: JSON.stringify({ sideA: myValues, sideB: theirValues })
    });
  },
  moderateStream(msg: string) {
    return fetch(`${AI_BASE_URL}/ai/moderate/stream?msg=${encodeURIComponent(msg)}`);
  },
  visionFacts(imagesBase64: string[], description?: string) {
    return fetchJSON<any>(`${AI_BASE_URL}/ai/vision-facts`, {
      method: 'POST',
      body: JSON.stringify({ imagesBase64, description })
    });
  },
  meetupSuggestions(params: {
    locationA: string;
    locationB: string;
    timeWindow: string;
    travelMode?: 'driving' | 'walking';
    maxMinutesA?: number;
    maxMinutesB?: number;
    indoorPreferred?: boolean;
    wheelchairAccess?: boolean;
    parkingNeeded?: boolean;
    ageContextUnder18?: boolean;
  }) {
    return fetchJSON<any>(`${AI_BASE_URL}/ai/meetup-suggestions`, {
      method: 'POST',
      body: JSON.stringify({
        locationA: params.locationA,
        locationB: params.locationB,
        timeWindow: params.timeWindow || 'today 3-7pm',
        travelMode: params.travelMode || 'driving',
        maxMinutesA: params.maxMinutesA || 30,
        maxMinutesB: params.maxMinutesB || 30,
        indoorPreferred: params.indoorPreferred,
        wheelchairAccess: params.wheelchairAccess,
        parkingNeeded: params.parkingNeeded,
        ageContextUnder18: params.ageContextUnder18,
      })
    });
  },
};

export const api = {
  auth: {
    register(payload: {
      email: string;
      password: string;
      age: number;
      guardianName: string;
      guardianEmail: string;
      location?: string;
      timeWindow?: string;
      travelMode?: string;
      maxMinutes?: number;
      indoorPreferred?: boolean;
      wheelchairAccess?: boolean;
      parkingNeeded?: boolean;
      categoryInterests?: string[];
    }) {
      return fetchJSON<{ ok: boolean; user: any; token: string }>(`${DATA_BASE_URL}/api/auth/register`, {
        method: 'POST',
        body: JSON.stringify(payload)
      });
    },
    login(payload: { email: string; password: string }) {
      return fetchJSON<{ ok: boolean; user: any; token: string }>(`${DATA_BASE_URL}/api/auth/login`, {
        method: 'POST',
        body: JSON.stringify(payload)
      });
    },
    forgot(email: string) {
      return fetchJSON<{ ok: boolean }>(`${DATA_BASE_URL}/api/auth/forgot`, {
        method: 'POST',
        body: JSON.stringify({ email })
      });
    },
    reset(token: string, newPassword: string) {
      return fetchJSON<{ ok: boolean }>(`${DATA_BASE_URL}/api/auth/reset`, {
        method: 'POST',
        body: JSON.stringify({ token, newPassword })
      });
    },
    me() {
      return fetchJSON<{ ok: boolean; user?: any }>(`${DATA_BASE_URL}/api/auth/me`, withAuth());
    },
  },

  users: {
    get(id: string) {
      return fetchJSON<any>(`${DATA_BASE_URL}/api/users/${id}`, withAuth());
    },
    getInventory(id: string) {
      return fetchJSON<any>(`${DATA_BASE_URL}/api/users/${id}/inventory`, withAuth());
    },
    addInventoryItem(id: string, item: any) {
      return fetchJSON<any>(`${DATA_BASE_URL}/api/users/${id}/inventory`, {
        ...withAuth(),
        method: 'POST',
        body: JSON.stringify(item)
      });
    },
    updateInventoryItem(userId: string, itemId: string, updates: any) {
      return fetchJSON<any>(`${DATA_BASE_URL}/api/users/${userId}/inventory/${itemId}`, {
        ...withAuth(),
        method: 'PUT',
        body: JSON.stringify(updates)
      });
    },
    deleteInventoryItem(userId: string, itemId: string) {
      return fetchJSON<any>(`${DATA_BASE_URL}/api/users/${userId}/inventory/${itemId}`, {
        ...withAuth(),
        method: 'DELETE'
      });
    },
    updateProfile(id: string, updates: any) {
      return fetchJSON<any>(`${DATA_BASE_URL}/api/users/${id}`, {
        ...withAuth(),
        method: 'PUT',
        body: JSON.stringify(updates)
      });
    },
  },

  discover: {
    browse(filters: any) {
      // Mock for now - returns empty
      return Promise.resolve({ items: [] });
    },
  },

  trades: {
    getDraft(userId: string) {
      // Mock for now
      return Promise.resolve(null);
    },
    saveDraft(draft: any) {
      // Mock for now
      return Promise.resolve({ ok: true });
    },
    propose(trade: any) {
      // Mock for now
      return Promise.resolve({ ok: true });
    },
  },

  messages: {
    getConversations(userId: string) {
      // Mock for now
      return Promise.resolve({ conversations: [] });
    },
    send(convId: string, fromId: string, toId: string, text: string) {
      // Mock for now
      return Promise.resolve({ ok: true });
    },
  },
};

export { AI_BASE_URL, DATA_BASE_URL };
