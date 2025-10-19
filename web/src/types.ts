// ========== AI Feature Types (existing) ==========
export type Facts = {
  category: string;
  brand: string;
  model: string;
  year_or_edition: string;
  condition: 'new' | 'ln' | 'good' | 'fair' | 'poor';
  attributes: string[];
  notes: string;
};

export type ValuationResponse = {
  estimate: { low: number; mid: number; high: number };
  explanation: string;
};

export type FairnessResponse = {
  A: number;
  B: number;
  diff: number;
  fairness: number;
  warn: boolean;
};

export type ModerationResult = {
  tags: string[];
  action: 'allow' | 'warn' | 'block';
  tip: string;
};

export type MeetupSuggestion = {
  name: string;
  address: string;
  coordinates: { lat: number; lng: number };
  open_hours: string;
  distance_userA: string;
  eta_userA: number;
  distance_userB: string;
  eta_userB: number;
  fairness_score: number;
  safety_score: number;
  overall_score: number;
  why_safe: string[];
  notes_for_meet: string;
  indoor: boolean;
  staff_present: boolean;
  cctv_likely: boolean;
  well_lit: boolean;
  parking_available: boolean;
  wheelchair_access: boolean;
  quick_share_text: string;
};

export type MeetupResponse = {
  suggestions: MeetupSuggestion[];
  disclaimer: string;
};

// ========== User & Profile Types ==========
export type User = {
  id: string;
  username: string;
  avatar: string;
  level: number;
  xp: number;
  xpToNextLevel: number;
  hasGuardian: boolean;
  guardianNote?: string;
  createdAt: string;
};

export type UserProfile = User & {
  badges: Badge[];
  stats: {
    totalTrades: number;
    fairTrades: number;
    inventorySize: number;
    messagesExchanged: number;
  };
};

// ========== Inventory & Items ==========
export type InventoryItem = {
  id: string;
  userId: string;
  images: string[]; // URLs or base64
  title: string;
  description?: string;
  facts: Facts;
  valuation: ValuationResponse;
  category: string;
  condition: 'new' | 'ln' | 'good' | 'fair' | 'poor';
  addedAt: string;
};

// ========== Trade Types ==========
export type TradeRating = 'great' | 'fair' | 'bad';

export type TradeOffer = {
  items: InventoryItem[];
  totalValue: number; // sum of MID values
};

export type Trade = {
  id: string;
  fromUserId: string;
  toUserId: string;
  fromUser: User;
  toUser: User;
  offerA: TradeOffer; // from user's offer
  offerB: TradeOffer; // to user's offer
  status: 'draft' | 'proposed' | 'accepted' | 'declined' | 'completed' | 'canceled';
  fairness: FairnessResponse;
  rating?: TradeRating;
  proposedAt?: string;
  completedAt?: string;
  xpAwarded?: number;
};

// ========== Messages ==========
export type Message = {
  id: string;
  conversationId: string;
  fromUserId: string;
  toUserId: string;
  text: string;
  moderation?: ModerationResult;
  sentAt: string;
  read: boolean;
};

export type Conversation = {
  id: string;
  participants: User[];
  lastMessage?: Message;
  unreadCount: number;
  trade?: Trade; // associated trade if any
};

// ========== Gamification Types ==========
export type Level = {
  level: number;
  name: string;
  xpRequired: number;
};

export type Badge = {
  id: string;
  name: string;
  description: string;
  icon: string;
  earnedAt?: string;
};

export type Quest = {
  id: string;
  title: string;
  description: string;
  xpReward: number;
  progress: number;
  target: number;
  completed: boolean;
  expiresAt: string;
};

export type XPEvent = {
  action: string;
  xpAwarded: number;
  reason: string;
  timestamp: string;
};
