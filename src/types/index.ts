export type Role = 'Admin' | 'Siswa';

export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
}

export type AccountStatus =
  | 'STOPPED'
  | 'CONNECTING'
  | 'WAITING_OTP'
  | 'WAITING_2FA'
  | 'RUNNING'
  | 'ERROR';

export interface TelegramAccount {
  id: number;
  name: string;
  phone_number: string;
  app_id: number;
  session_file: string;
  is_enabled: boolean;
  enable_b2b: boolean;
  is_default_b2b: boolean;
  enable_ai_gateway: boolean;
  ai_system_prompt: string;
  enable_class_auction: boolean;
  status: AccountStatus;
  last_error?: string;
  telegram_user_id?: number;
  telegram_username?: string;
  has_2fa_password: boolean;
  has_custom_app_hash: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface TelegramGroup {
  account_id: number;
  id: number | string;
  parent_id?: number | string;
  title: string;
  type: 'group' | 'supergroup' | 'channel' | 'user' | 'topic';
  created_at?: string;
  updated_at?: string;
}

export interface TopicInfo {
  id: number;
  title: string;
}

export type AuctionType = 'NEW' | 'OTR' | 'CU' | 'FR';
export type ClassFormat = 'PRIVATE' | 'GROUP';
export type Gender = 'ANY' | 'MALE' | 'FEMALE';
export type Language = 'ANY' | 'INDONESIA' | 'BILINGUAL' | 'FULL_ENGLISH';
export type ScheduleLogic = 'SINGLE' | 'AND' | 'OR' | '';
export type ParseConfidence = 'HIGH' | 'MEDIUM' | 'LOW';
export type AuctionDecision = 'BID_SENT' | 'DRY_RUN_MATCH' | 'SKIPPED' | 'IGNORED' | 'ERROR';
export type AuctionOutcome = 'PENDING' | 'WON' | 'LOST';
export type DateOverrideKind = 'BLOCK' | 'EXTRA';

export interface CourseMetadata {
  code: string;
  name: string;
  aliases: string[];
}

export interface AuctionCatalog {
  courses: CourseMetadata[];
  auction_types: AuctionType[];
  formats: ClassFormat[];
  languages: Language[];
  genders: ('MALE' | 'FEMALE')[];
}

export interface ClassAuctionProfile {
  id: number;
  account_id: number;
  is_active: boolean;
  dry_run: boolean;
  tutor_gender: 'MALE' | 'FEMALE';
  allowed_courses: string[];
  generic_dg_matches_any: boolean;
  allowed_languages: string[];
  allowed_auction_types: string[];
  allowed_formats: string[];
  private_duration_min: number;
  group_duration_min: number;
  allow_gender_nego: boolean;
  respect_no_nego: boolean;
  default_reply: string;
  gender_nego_reply: string;
  reply_overrides: Record<string, string>;
  include_matched_slot_on_or: boolean;
  min_delay_ms: number;
  max_delay_ms: number;
  slot_cooldown_sec: number;
  auto_mark_won_on_bid: boolean;
  enable_ai_fallback: boolean;
  ignore_replies: boolean;
  stop_keywords: string;
  notify_saved_messages: boolean;
}

export interface WatchedTarget {
  id: number;
  account_id: number;
  group_id: number;
  topic_id: number;
  label: string;
  default_auction_type: AuctionType | '';
  is_active: boolean;
}

export interface WeeklyAvailability {
  id?: number;
  account_id?: number;
  day_of_week: number; // 0=Sunday .. 6=Saturday
  start_minute: number; // 0..1439
  end_minute: number; // 1..1440
  is_active: boolean;
}

export interface DateAvailabilityOverride {
  id: number;
  account_id: number;
  date: string; // YYYY-MM-DD
  kind: DateOverrideKind;
  start_minute: number;
  end_minute: number;
  reason: string;
}

export interface ScheduleSlot {
  day_of_week: number;
  start_minute: number;
  specific_date?: string;
  raw_text?: string;
}

export interface ParsedAuction {
  is_auction_post: boolean;
  has_stop_keyword: boolean;
  stop_keyword_found?: string;
  course?: string;
  is_generic_dg?: boolean;
  auction_type?: AuctionType;
  class_format?: ClassFormat;
  duration_min: number;
  schedules: ScheduleSlot[];
  schedule_logic?: ScheduleLogic;
  required_gender: Gender;
  language: Language;
  no_nego: boolean;
  lead_url?: string;
  confidence: ParseConfidence;
  notes?: string[];
}

export interface SimulateResult {
  parser_source: string;
  parse_duration: string;
  parse_micros: number;
  parsed: ParsedAuction;
  would_bid: boolean;
  decision: AuctionDecision;
  skip_reason?: string;
  reply_text?: string;
  needs_gender_nego: boolean;
  matched_slots?: ScheduleSlot[];
}

export interface AuctionLog {
  id: number;
  account_id: number;
  group_id: number;
  topic_id: number;
  message_id: number;
  raw_text: string;
  parser_source: string;
  parse_confidence: ParseConfidence;
  parsed?: ParsedAuction;
  decision: AuctionDecision;
  skip_reason?: string;
  reply_text?: string;
  matched_slots?: ScheduleSlot[];
  latency_ms: number;
  outcome: AuctionOutcome;
  created_at: string;
}

export interface AuctionLogPage {
  items: AuctionLog[];
  total: number;
}

export interface AuctionStats {
  total_bids_sent: number;
  total_dry_run: number;
  total_skipped: number;
  total_won: number;
  bids_today: number;
  avg_latency_ms: number;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
}
