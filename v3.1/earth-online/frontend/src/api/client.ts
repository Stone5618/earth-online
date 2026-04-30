/**
 * Earth Online API Client
 * JWT-based API client with enhanced error handling.
 * Security: Relies on JWT Bearer token + CORS (no CSRF needed for stateless API).
 */

const API_BASE = import.meta.env.VITE_API_BASE || "/api/v1";

export interface TokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
}

export interface ServerData {
  id: number;
  name: string;
  description: string;
  difficulty: number;
  culture_tags: string[];
}

export interface CharacterData {
  id: number;
  name: string;
  server_id: number;
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
  family_tier: string;
  birth_server: string;
  birth_talent: string;
  occupation: string;
  education_level: string;
  education_year: number;
  career_years: number;
  is_alive: boolean;
  is_active: boolean;
}

export interface EventResponse {
  event: {
    title: string;
    description: string;
    category: string;
    options: Array<{ index: number; text: string; hint: string }>;
  } | null;
  character: Record<string, number>;
  is_dead: boolean;
  death_reason?: string;
}

// --- User Profile ---
export interface UserProfile {
  id: number;
  username: string;
  display_name: string | null;
  avatar_color: string;
  bio: string | null;
  created_at: string;
}

export interface UserProfileUpdate {
  display_name?: string;
  avatar_color?: string;
  bio?: string;
}

// --- Game Saves ---
export interface GameSave {
  id: number;
  slot: number;
  character_name: string | null;
  age: number | null;
  char_id: number | null;
  created_at: string;
  updated_at: string | null;
}

export interface GameSaveRequest {
  slot: number;
  save_data: Record<string, unknown>;
  character_name?: string;
  age?: number;
  char_id?: number;
}

export type ApiErrorType =
  | "network"
  | "timeout"
  | "auth"
  | "validation"
  | "rate_limit"
  | "server"
  | "unknown";

export interface ApiError {
  type: ApiErrorType;
  message: string;
  statusCode?: number;
  originalError?: unknown;
}

export interface ApiResult<T> {
  data: T | null;
  error: ApiError | null;
}

class ApiClient {
  private token: string | null = null;
  private ready: boolean = false;
  private maxRetries: number = 2;

  constructor() {
    try {
      this.token = localStorage.getItem("earth-online-token");
      this.ready = true;
    } catch { /* localStorage unavailable */ }
  }

  private get headers(): Record<string, string> {
    const h: Record<string, string> = { "Content-Type": "application/json" };
    if (this.token) h["Authorization"] = `Bearer ${this.token}`;
    return h;
  }

  private createError(type: ApiErrorType, message: string, statusCode?: number, originalError?: unknown): ApiError {
    return { type, message, statusCode, originalError };
  }

  private async requestWithRetry<T>(method: string, path: string, body?: unknown, retryCount: number = 0): Promise<ApiResult<T>> {
    try {
      const res = await fetch(`${API_BASE}${path}`, {
        method,
        headers: this.headers,
        body: body ? JSON.stringify(body) : undefined,
        credentials: "include",
        signal: AbortSignal.timeout(15000),
      });

      if (!res.ok) {
        return this.handleErrorResponse(res);
      }

      const contentType = res.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        return { data: await res.json() as T, error: null };
      }
      return { data: null, error: null };
    } catch (error) {
      console.error('[API Error]', method, path, {
        error,
        errorConstructor: error?.constructor?.name,
        errorMessage: error instanceof Error ? error.message : String(error),
        errorName: error instanceof Error ? error.name : undefined,
        isTypeError: error instanceof TypeError,
        isDOMException: error instanceof DOMException,
      });

      if (error instanceof DOMException && error.name === "TimeoutError") {
        if (retryCount < this.maxRetries) {
          await new Promise(r => setTimeout(r, 1000 * (retryCount + 1)));
          return this.requestWithRetry<T>(method, path, body, retryCount + 1);
        }
        return { data: null, error: this.createError("timeout", "请求超时", undefined, error) };
      }

      if (error instanceof TypeError) {
        const isNetworkError = error.message.includes("Failed to fetch") ||
          error.message.includes("NetworkError") ||
          error.message.includes("network error") ||
          error.message.toLowerCase().includes("fetch") ||
          error.name === "TypeError";
        if (isNetworkError) {
          return { data: null, error: this.createError("network", "网络连接失败", undefined, error) };
        }
      }

      return { data: null, error: this.createError("unknown", "未知错误", undefined, error) };
    }
  }

  private async handleErrorResponse<T>(res: Response): Promise<ApiResult<T>> {
    let errorMessage = "请求失败";
    let errorType: ApiErrorType = "server";

    try {
      const json = await res.json();
      errorMessage = json.detail || errorMessage;
    } catch {
      errorMessage = await res.text().catch(() => errorMessage);
    }

    switch (res.status) {
      case 401:
        errorType = "auth";
        this.token = null;
        localStorage.removeItem("earth-online-token");
        break;
      case 400:
        errorType = "validation";
        break;
      case 429:
        errorType = "rate_limit";
        break;
      default:
        errorType = "server";
    }

    return { data: null, error: this.createError(errorType, errorMessage, res.status) };
  }

  async ping(): Promise<{ success: boolean; error?: ApiError | null }> {
    const result = await this.requestWithRetry<unknown>("GET", "/servers");
    return { success: result.data !== null, error: result.error };
  }

  async register(username: string, password: string): Promise<{ success: boolean; error?: ApiError | null }> {
    const result = await this.requestWithRetry<TokenResponse>("POST", "/auth/register", { username, password });
    if (result.data) {
      this.token = result.data.access_token;
      localStorage.setItem("earth-online-token", result.data.access_token);
      return { success: true };
    }
    return { success: false, error: result.error };
  }

  async login(username: string, password: string): Promise<{ success: boolean; error?: ApiError | null }> {
    const result = await this.requestWithRetry<TokenResponse>("POST", "/auth/login", { username, password });
    if (result.data) {
      this.token = result.data.access_token;
      localStorage.setItem("earth-online-token", result.data.access_token);
      return { success: true };
    }
    return { success: false, error: result.error };
  }

  logout(): void {
    this.token = null;
    localStorage.removeItem("earth-online-token");
    localStorage.removeItem("earth-online-username");
  }

  async getServers(): Promise<{ data: ServerData[]; error?: ApiError | null }> {
    const result = await this.requestWithRetry<ServerData[]>("GET", "/servers");
    return { data: result.data || [], error: result.error };
  }

  async createCharacter(serverId: number, name: string): Promise<{ data: CharacterData | null; error?: ApiError | null }> {
    const result = await this.requestWithRetry<CharacterData>("POST", "/characters", { server_id: serverId, name });
    return { data: result.data, error: result.error };
  }

  async getCharacter(id: number): Promise<{ data: CharacterData | null; error?: ApiError | null }> {
    const result = await this.requestWithRetry<CharacterData>("GET", `/characters/${id}`);
    return { data: result.data, error: result.error };
  }

  async getNextEvent(charId: number): Promise<{ data: EventResponse | null; error?: ApiError | null }> {
    const result = await this.requestWithRetry<EventResponse>("GET", `/game/next_event?char_id=${charId}`);
    return { data: result.data, error: result.error };
  }

  async makeChoice(charId: number, eventTitle: string, optionIndex: number): Promise<{ data: Record<string, unknown> | null; error?: ApiError | null }> {
    const result = await this.requestWithRetry<Record<string, unknown>>("POST", `/game/make_choice?char_id=${charId}`, {
      event_title: eventTitle,
      option_index: optionIndex,
    });
    return { data: result.data, error: result.error };
  }

  async submitScore(charId: number): Promise<{ success: boolean; error?: ApiError | null }> {
    const result = await this.requestWithRetry<unknown>("POST", `/leaderboard/submit?char_id=${charId}`);
    return { success: result.data !== null, error: result.error };
  }

  async getLeaderboard(): Promise<{ data: Array<Record<string, unknown>>; error?: ApiError | null }> {
    const result = await this.requestWithRetry<Array<Record<string, unknown>>>("GET", "/leaderboard/top");
    return { data: result.data || [], error: result.error };
  }

  async reincarnate(charId: number): Promise<{ data: CharacterData | null; error?: ApiError | null }> {
    const result = await this.requestWithRetry<CharacterData>("POST", `/reincarnation/start?old_char_id=${charId}`);
    return { data: result.data, error: result.error };
  }

  async getInheritance(charId: number): Promise<{ data: Record<string, unknown> | null; error?: ApiError | null }> {
    const result = await this.requestWithRetry<Record<string, unknown>>("GET", `/reincarnation/inheritance?char_id=${charId}`);
    return { data: result.data, error: result.error };
  }

  // --- User Profile API ---
  async getProfile(): Promise<{ data: UserProfile | null; error?: ApiError | null }> {
    const result = await this.requestWithRetry<UserProfile>("GET", "/users/me");
    return result;
  }

  async updateProfile(profile: UserProfileUpdate): Promise<{ data: UserProfile | null; error?: ApiError | null }> {
    const result = await this.requestWithRetry<UserProfile>("PATCH", "/users/me", profile);
    return result;
  }

  async logoutUser(): Promise<{ success: boolean; error?: ApiError | null }> {
    const result = await this.requestWithRetry<unknown>("POST", "/users/logout");
    this.logout();
    return { success: result.data !== null, error: result.error };
  }

  // --- Game Save API ---
  async getSaves(): Promise<{ data: GameSave[]; error?: ApiError | null }> {
    const result = await this.requestWithRetry<GameSave[]>("GET", "/users/saves");
    return { data: result.data || [], error: result.error };
  }

  async getSave(slot: number): Promise<{ data: GameSave | null; error?: ApiError | null }> {
    const result = await this.requestWithRetry<GameSave>("GET", `/users/saves/${slot}`);
    return result;
  }

  async getSaveData(slot: number): Promise<{ data: Record<string, unknown> | null; error?: ApiError | null }> {
    const result = await this.requestWithRetry<Record<string, unknown>>("GET", `/users/saves/${slot}/data`);
    return result;
  }

  async saveGame(save: GameSaveRequest): Promise<{ data: GameSave | null; error?: ApiError | null }> {
    const result = await this.requestWithRetry<GameSave>("POST", "/users/saves", save);
    return result;
  }

  async deleteSave(slot: number): Promise<{ success: boolean; error?: ApiError | null }> {
    const result = await this.requestWithRetry<unknown>("DELETE", `/users/saves/${slot}`);
    return { success: result.data !== null, error: result.error };
  }

  get isLoggedIn(): boolean {
    return !!this.token;
  }
}

export { ApiClient };
export const api = new ApiClient();
export default api;
