// API Client for Swappy
// AI Server: http://localhost:3000
// Visa/Data Server: http://localhost:7002

const AI_BASE_URL = 'http://localhost:3000';
const DATA_BASE_URL = 'http://localhost:7002';

// ========== Helper Functions ==========
async function fetchJSON<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  return response.json();
}

// ========== AI Endpoints (existing) ==========
export const ai = {
  async visionFacts(imagesBase64: string[], description?: string) {
    return fetchJSON(`${AI_BASE_URL}/ai/vision-facts`, {
      method: 'POST',
      body: JSON.stringify({ imagesBase64, description }),
    });
  },

  async valuation(facts: any) {
    return fetchJSON(`${AI_BASE_URL}/ai/valuation`, {
      method: 'POST',
      body: JSON.stringify({ facts }),
    });
  },

  async unevenScore(sideA: number[], sideB: number[]) {
    return fetchJSON(`${AI_BASE_URL}/ai/uneven-score`, {
      method: 'POST',
      body: JSON.stringify({ sideA, sideB }),
    });
  },

  async moderateStream(msg: string): Promise<Response> {
    return fetch(`${AI_BASE_URL}/ai/moderate/stream?msg=${encodeURIComponent(msg)}`);
  },

  async meetupSuggestions(locationA: string, locationB: string, timePreference: string, preferences: string[]) {
    return fetchJSON(`${AI_BASE_URL}/ai/meetup-suggestions`, {
      method: 'POST',
      body: JSON.stringify({ locationA, locationB, timePreference, preferences }),
    });
  },
};

// ========== Data/Visa Server Endpoints ==========
export const api = {
  // User endpoints
  users: {
    async get(userId: string) {
      return fetchJSON(`${DATA_BASE_URL}/api/users/${userId}`);
    },

    async getPublic(userId: string) {
      return fetchJSON(`${DATA_BASE_URL}/api/users/${userId}/public`);
    },

    async getInventory(userId: string) {
      return fetchJSON(`${DATA_BASE_URL}/api/users/${userId}/inventory`);
    },

    async addToInventory(userId: string, item: any) {
      return fetchJSON(`${DATA_BASE_URL}/api/users/${userId}/inventory`, {
        method: 'POST',
        body: JSON.stringify(item),
      });
    },

    async updateInventoryItem(userId: string, itemId: string, updates: any) {
      return fetchJSON(`${DATA_BASE_URL}/api/users/${userId}/inventory/${itemId}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
    },

    async deleteInventoryItem(userId: string, itemId: string) {
      return fetchJSON(`${DATA_BASE_URL}/api/users/${userId}/inventory/${itemId}`, {
        method: 'DELETE',
      });
    },

    async getBadges(userId: string) {
      return fetchJSON(`${DATA_BASE_URL}/api/users/${userId}/badges`);
    },

    async getQuests(userId: string) {
      return fetchJSON(`${DATA_BASE_URL}/api/users/${userId}/quests`);
    },

    async awardXP(userId: string, xp: number, reason: string) {
      return fetchJSON(`${DATA_BASE_URL}/api/users/${userId}/xp`, {
        method: 'POST',
        body: JSON.stringify({ xp, reason }),
      });
    },
  },

  // Discover/Browse endpoints
  discover: {
    async browse(filters?: {
      category?: string;
      condition?: string;
      tradeValue?: 'great' | 'fair' | 'bad';
      distance?: string;
      sort?: string;
      search?: string;
    }) {
      const params = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value) params.append(key, value);
        });
      }
      const query = params.toString();
      return fetchJSON(`${DATA_BASE_URL}/api/discover${query ? `?${query}` : ''}`);
    },
  },

  // Trade endpoints
  trades: {
    async getDraft(userId: string) {
      return fetchJSON(`${DATA_BASE_URL}/api/trades/draft/${userId}`);
    },

    async saveDraft(trade: any) {
      return fetchJSON(`${DATA_BASE_URL}/api/trades/draft`, {
        method: 'POST',
        body: JSON.stringify(trade),
      });
    },

    async propose(trade: any) {
      return fetchJSON(`${DATA_BASE_URL}/api/trades/propose`, {
        method: 'POST',
        body: JSON.stringify(trade),
      });
    },

    async get(userId: string) {
      return fetchJSON(`${DATA_BASE_URL}/api/trades/${userId}`);
    },

    async accept(tradeId: string) {
      return fetchJSON(`${DATA_BASE_URL}/api/trades/${tradeId}/accept`, {
        method: 'PUT',
      });
    },

    async decline(tradeId: string) {
      return fetchJSON(`${DATA_BASE_URL}/api/trades/${tradeId}/decline`, {
        method: 'PUT',
      });
    },

    async complete(tradeId: string) {
      return fetchJSON(`${DATA_BASE_URL}/api/trades/${tradeId}/complete`, {
        method: 'PUT',
      });
    },
  },

  // Messages endpoints
  messages: {
    async getConversations(userId: string) {
      return fetchJSON(`${DATA_BASE_URL}/api/messages/${userId}`);
    },

    async send(conversationId: string, fromUserId: string, toUserId: string, text: string) {
      return fetchJSON(`${DATA_BASE_URL}/api/messages`, {
        method: 'POST',
        body: JSON.stringify({ conversationId, fromUserId, toUserId, text }),
      });
    },

    async markRead(conversationId: string) {
      return fetchJSON(`${DATA_BASE_URL}/api/messages/${conversationId}/read`, {
        method: 'PUT',
      });
    },
  },

  // Existing Visa endpoints
  listings: {
    async getAll() {
      return fetchJSON(`${DATA_BASE_URL}/api/listings`);
    },

    async create(listing: any) {
      return fetchJSON(`${DATA_BASE_URL}/api/listings`, {
        method: 'POST',
        body: JSON.stringify(listing),
      });
    },
  },

  merchants: {
    async search(location: string, radius: number) {
      return fetchJSON(`${DATA_BASE_URL}/api/merchants/search`, {
        method: 'POST',
        body: JSON.stringify({ location, radius }),
      });
    },
  },

  guardian: {
    async verify(userId: string, pan: string, expMonth: string, expYear: string) {
      return fetchJSON(`${DATA_BASE_URL}/api/users/${userId}/pav`, {
        method: 'POST',
        body: JSON.stringify({ pan, expMonth, expYear }),
      });
    },
  },
};

export { AI_BASE_URL, DATA_BASE_URL };
