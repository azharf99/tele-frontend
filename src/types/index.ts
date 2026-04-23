export type Role = 'Admin' | 'Siswa';

export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
}

export interface BidRule {
  ID: number; // Backend returns uppercase ID
  target_group_id: number;
  topic_id: number;
  keyword: string;
  bid_message: string;
  is_active: boolean;
  has_bidded: boolean;
  stop_keywords: string; // Comma-separated
}

export interface TelegramGroup {
  id: string; // Large integers should be handled as strings or BigInt
  parent_id?: string;
  title: string;
  type: 'group' | 'supergroup' | 'channel' | 'user' | 'topic';
  created_at?: string;
  updated_at?: string;
}

export interface TopicInfo {
  id: number;
  title: string;
}

export type BotStatus = 'IDLE' | 'WAITING_OTP' | 'RUNNING';

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
}
