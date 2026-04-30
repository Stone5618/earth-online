export interface MarriageCandidate {
  id: string;
  name: string;
  age: number;
  traits: string[];
  compatibility: number;
  avatar?: string;
}

export interface SpouseInfo {
  id: string;
  name: string;
  relationship_years: number;
  intimacy: number;
  mood: 'happy' | 'neutral' | 'sad';
  avatar?: string;
}

export interface ChildInfo {
  id: string;
  name: string;
  age: number;
  traits: string[];
  relationship: 'good' | 'neutral' | 'poor';
  gender: 'male' | 'female';
  born_at: number;
}

export interface FamilySummary {
  is_married: boolean;
  spouse: SpouseInfo | null;
  children: ChildInfo[];
  children_count: number;
  spouse_name: string | null;
  family_events: FamilyEvent[];
}

export interface FamilyEvent {
  id: string;
  type: 'marriage' | 'childbirth' | 'divorce' | 'death' | 'interaction';
  title: string;
  description: string;
  age: number;
  timestamp: string;
}

export interface FamilyAction {
  type: 'marry' | 'divorce' | 'interact' | 'childbirth' | 'view_spouse' | 'view_child' | 'view_tree';
  payload?: Record<string, unknown>;
}

export interface MarriageProposalData {
  candidate: MarriageCandidate;
  proposal_text: string;
  compatibility_reason: string;
}

export interface ChildbirthData {
  name: string;
  gender: 'male' | 'female';
  born_at: number;
  traits: string[];
}

export interface WeddingCeremonyData {
  spouse: SpouseInfo;
  ceremony_type: 'simple' | 'grand' | 'private';
  guest_count: number;
  ceremony_text: string;
}
