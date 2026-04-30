export interface AdminUser {
  id: number;
  username: string;
  is_superuser: boolean;
  role_name: string | null;
  role_display_name: string | null;
  permissions: string[];
}

export interface AdminRole {
  id: number;
  name: string;
  display_name: string;
  description: string | null;
  level: number;
  created_at: string | null;
  permissions?: string[];
  permission_count?: number;
  user_count?: number;
}

export interface AdminPermission {
  id: number;
  code: string;
  module: string;
  action: string;
  description: string | null;
}

export interface AdminUserDetail {
  id: number;
  username: string;
  is_active: boolean;
  is_superuser: boolean;
  is_locked: boolean;
  lock_reason: string | null;
  role_id: number | null;
  role_name: string | null;
  role_display_name: string | null;
  last_login_at: string | null;
  login_ip: string | null;
  created_at: string | null;
}

export interface AuditLog {
  id: number;
  user_id: number;
  action: string;
  table_name: string | null;
  record_id: number | null;
  old_values: Record<string, unknown> | null;
  new_values: Record<string, unknown> | null;
  ip_address: string | null;
  timestamp: string;
}

export interface DashboardStats {
  online_players: number;
  today_new_characters: number;
  today_events_triggered: number;
  active_sessions: number;
}

export interface DashboardTrends {
  seven_day_trends: Array<{ date: string; new_characters: number; events_triggered: number }>;
  category_distribution: Array<{ category: string; count: number }>;
  age_distribution: Array<{ age_group: string; count: number }>;
}

export interface EventTemplate {
  id: number;
  title: string;
  description: string | null;
  category: string;
  min_age: number;
  max_age: number;
  base_weight: number;
  difficulty_level: number;
  is_active: boolean;
  content: Record<string, any> | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface SystemConfig {
  id: number;
  key: string;
  value: string;
  category: string;
  description: string | null;
  is_active: boolean;
  created_at: string | null;
  updated_at: string | null;
}

export interface ErrorLog {
  id: number;
  level: string;
  message: string;
  stack_trace: string | null;
  request_path: string | null;
  request_method: string | null;
  user_id: number | null;
  ip_address: string | null;
  context: Record<string, unknown> | null;
  status: string;
  resolved_at: string | null;
  resolved_by: number | null;
  timestamp: string;
}

export interface Announcement {
  id: number;
  title: string;
  content: string;
  type: string;
  target_audience: string;
  status: string;
  scheduled_at: string | null;
  published_at: string | null;
  created_by: number | null;
  created_at: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category?: string;
  unlock_condition?: string;
  unlock_count?: number;
  unlock_rate?: number;
}

export interface LeaderboardRecord {
  id: number;
  player_id: number;
  player_name: string;
  score: number;
  rank: number;
  updated_at: string;
}

export interface CharacterStats {
  id: number;
  name: string;
  age: number;
  health: number;
  energy: number;
  mood: number;
  intelligence: number;
  charm: number;
  creativity: number;
  luck: number;
  money: number;
  career?: string;
  isAlive?: boolean;
  familyTier?: string;
}

export interface Character {
  id: number;
  user_id: number;
  server_id: number;
  name: string;
  is_alive: boolean;
  is_active: boolean;
  age: number;
  health: number;
  max_health: number;
  money: number;
  total_money_earned: number;
  energy: number;
  max_energy: number;
  mood: number;
  intelligence: number;
  charm: number;
  creativity: number;
  luck: number;
  karma: number;
  is_married: boolean;
  spouse_name: string | null;
  spouse_quality: number;
  appearance: number;
  physical_fitness: number;
  immune_system: number;
  nervous_system: number;
  sensory: number;
  knowledge_tree: Record<string, unknown>;
  meta_cognition: number;
  emotional_stability: number;
  self_esteem: number;
  trauma: number;
  value_vector: Record<string, unknown>;
  social_capital: number;
  reputation: number;
  class_position: number;
  total_assets: number;
  time_budget: number;
  attention: number;
  gene_potentials: Record<string, unknown>;
  family_tier: string;
  birth_server: string;
  birth_talent: string;
  occupation: string;
  flags: Record<string, unknown>;
  causality_stack: unknown[];
  recent_event_categories: string[];
  recent_event_titles: string[];
  trait_memory: unknown[];
  event_chains: Record<string, unknown>;
  spouse_id: number | null;
  children_ids: unknown[];
  death_age: number | null;
  death_reason: string | null;
  final_title: string | null;
  final_comment: string | null;
  education_level: string;
  education_year: number;
  career_years: number;
  career_level: string;
  career_title: string;
  house_level: number;
  car_level: number;
  house_name: string | null;
  car_name: string | null;
  debts: unknown[];
  family_name: string | null;
  family_reputation: number;
  children_data: unknown[];
  last_time_allocation: unknown | null;
  created_at: string;
  updated_at: string;
}

export interface Activity {
  id: number;
  title: string;
  description: string;
  type: string;
  status: string;
  start_date: string;
  end_date: string;
  participant_count: number;
  reward?: string;
}

export interface SystemStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  uptime: string;
  cpu_usage: number;
  memory_usage: number;
  disk_usage: number;
  active_connections: number;
  response_time_ms: number;
  database_status: string;
  cache_status: string;
  api_version: string;
}

export interface ExportTask {
  id: number;
  type: string;
  format: string;
  status: string;
  created_by: number;
  created_at: string;
  completed_at: string | null;
  file_path: string | null;
}

export type ErrorLogLevel = 'ERROR' | 'WARNING' | 'CRITICAL' | 'INFO';
export type ErrorLogStatus = 'open' | 'investigating' | 'resolved' | 'ignored';
export type AnnouncementStatus = 'draft' | 'scheduled' | 'published' | 'archived';
export type AnnouncementType = 'info' | 'warning' | 'maintenance' | 'event';
export type ActivityStatus = 'draft' | 'upcoming' | 'active' | 'ended';
