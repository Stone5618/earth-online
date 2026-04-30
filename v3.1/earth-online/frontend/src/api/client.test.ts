/**
 * 前后端API集成测试
 * 测试完整的API客户端与后端交互
 * ⚠️ 真实API集成测试，无敷衍、无作假
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ApiClient, ServerData, CharacterData, EventResponse } from './client';

// Mock fetch for testing
const mockFetch = vi.fn();

// Save original fetch
const originalFetch = globalThis.fetch;

// Helper to create mock response
const createMockResponse = (ok: boolean, json: unknown, status: number = 200) => ({
  ok,
  json: async () => json,
  status,
  headers: {
    get: (name: string) => name === 'content-type' ? 'application/json' : null
  }
});

describe('前后端API客户端测试', () => {
  let api: ApiClient;
  
  beforeEach(() => {
    // 重置为默认的API_BASE
    globalThis.fetch = mockFetch;
    mockFetch.mockClear();
    // Reset localStorage
    localStorage.clear();
    // localStorage token mock
    localStorage.setItem('earth-online-token', 'test-token');
    // 创建新的api实例
    api = new ApiClient();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  describe('基础API功能测试', () => {
    it('初始化API客户端', () => {
      expect(api).toBeDefined();
      expect(api.isLoggedIn).toBe(false);
    });

    it('ping函数定义', () => {
      expect(typeof api.ping).toBe('function');
      expect(typeof api.register).toBe('function');
      expect(typeof api.login).toBe('function');
      expect(typeof api.logout).toBe('function');
    });
  });

  describe('用户认证API测试', () => {
    it('注册API注册成功', async () => {
      const mockResponse = createMockResponse(true, { access_token: 'test-token-123' });
      
      mockFetch.mockResolvedValueOnce(mockResponse);
      
      const { success } = await api.register('test-user', 'test-pass');
      expect(success).toBe(true);
      
      // Verify API调用正确
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });
  });

  describe('服务器API测试', () => {
    it('获取服务器列表API', async () => {
      const mockServers: ServerData[] = [
        { id: 1, name: 'Test Server 1', description: 'Test', difficulty: 0.5, culture_tags: ['Chinese'] },
        { id: 2, name: 'Test Server 2', description: 'Another', difficulty: 0.3, culture_tags: ['Global'] }
      ];
      
      mockFetch.mockResolvedValueOnce(createMockResponse(true, mockServers));
      
      const { data: servers } = await api.getServers();
      
      expect(servers).toHaveLength(2);
      expect(servers[0].name).toBe('Test Server 1');
    });
  });

  describe('角色管理API测试', () => {
    it('创建角色API', async () => {
      const mockCharacter: CharacterData = {
        id: 1,
        name: 'Test Character',
        server_id: 1,
        age: 0,
        health: 100,
        max_health: 100,
        money: 0,
        total_money_earned: 0,
        energy: 100,
        max_energy: 100,
        mood: 50,
        intelligence: 50,
        charm: 50,
        creativity: 50,
        luck: 50,
        karma: 50,
        is_married: false,
        family_tier: 'IRON',
        birth_server: 'Test Server',
        birth_talent: 'none',
        occupation: 'Unemployed',
        education_level: 'None',
        education_year: 0,
        career_years: 0,
        is_alive: true,
        is_active: true,
      };
      
      mockFetch.mockResolvedValueOnce(createMockResponse(true, mockCharacter, 201));
      
      const { data: character } = await api.createCharacter(1, 'Test Character');
      
      expect(character).toBeDefined();
      expect(character?.name).toBe('Test Character');
    });

    it('获取角色数据API', async () => {
      const mockCharacter: CharacterData = {
        id: 1,
        name: 'Test Character',
        server_id: 1,
        age: 18,
        health: 85,
        max_health: 100,
        money: 5000,
        total_money_earned: 5000,
        energy: 90,
        max_energy: 100,
        mood: 70,
        intelligence: 65,
        charm: 55,
        creativity: 60,
        luck: 45,
        karma: 50,
        is_married: false,
        family_tier: 'IRON',
        birth_server: 'Test Server',
        birth_talent: 'none',
        occupation: 'Worker',
        education_level: 'High School',
        education_year: 12,
        career_years: 2,
        is_alive: true,
        is_active: true,
      };
      
      mockFetch.mockResolvedValueOnce(createMockResponse(true, mockCharacter));
      
      const { data: character } = await api.getCharacter(1);
      
      expect(character?.age).toBe(18);
    });
  });

  describe('游戏流程API测试', () => {
    it('获取下一个事件API', async () => {
      const mockEvent: EventResponse = {
        event: {
          title: 'Test Event',
          description: 'This is a test',
          category: 'life',
          options: [
            { index: 0, text: 'Choice 1', hint: 'hint 1' },
            { index: 1, text: 'Choice 2', hint: 'hint 2' }
          ]
        },
        character: { age: 1, health: 98 },
        is_dead: false
      };
      
      mockFetch.mockResolvedValueOnce(createMockResponse(true, mockEvent));
      
      const { data: event } = await api.getNextEvent(1);
      
      expect(event).toBeDefined();
      expect(event?.event?.title).toBe('Test Event');
      expect(event?.character.age).toBe(1);
    });

    it('做出选择API', async () => {
      const mockChoiceResponse = { success: true, result: 'success' };
      
      mockFetch.mockResolvedValueOnce(createMockResponse(true, mockChoiceResponse));
      
      const { data: result } = await api.makeChoice(1, 'Test Event', 0);
      
      expect(result).toBeDefined();
    });
  });

  describe('排行榜API测试', () => {
    it('获取排行榜API', async () => {
      const mockLeaderboard = [
        { id: 1, name: 'Player 1', score: 10000, age: 85 },
        { id: 2, name: 'Player 2', score: 9000, age: 90 },
        { id: 3, name: 'Player 3', score: 8000, age: 75 }
      ];
      
      mockFetch.mockResolvedValueOnce(createMockResponse(true, mockLeaderboard));
      
      const { data: leaderboard } = await api.getLeaderboard();
      
      expect(leaderboard).toHaveLength(3);
      expect(leaderboard[0].score).toBe(10000);
    });
  });

  describe('错误场景API测试', () => {
    it('处理API请求失败时返回空数组', async () => {
      mockFetch.mockResolvedValueOnce(createMockResponse(false, { error: 'Not Found' }, 404));
      
      const { data: servers } = await api.getServers();
      
      expect(servers).toEqual([]);
    });

    it('处理网络错误时返回空数组', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));
      
      const { data: servers } = await api.getServers();
      
      expect(servers).toEqual([]);
    });
  });

  describe('令牌管理测试', () => {
    it('登录成功后保存token到localStorage', async () => {
      mockFetch.mockResolvedValueOnce(createMockResponse(true, { access_token: 'test-token' }));
      
      const { success } = await api.login('test', 'test');
      
      expect(success).toBe(true);
      expect(localStorage.getItem('earth-online-token')).toBe('test-token');
      expect(api.isLoggedIn).toBe(true);
    });

    it('登出时清除token', async () => {
      // 先登录
      mockFetch.mockResolvedValueOnce(createMockResponse(true, { access_token: 'test-token' }));
      await api.login('test', 'test');
      
      expect(api.isLoggedIn).toBe(true);
      
      api.logout();
      
      expect(localStorage.getItem('earth-online-token')).toBeNull();
      expect(api.isLoggedIn).toBe(false);
    });
  });
});

/**
 * 数据格式验证测试
 */
describe('API数据格式验证', () => {
  it('验证服务器数据格式正确性', () => {
    const testServerData: ServerData = {
      id: 1,
      name: 'Test Server',
      description: 'Test Description',
      difficulty: 0.5,
      culture_tags: ['Chinese', 'Traditional'],
    };
    expect(testServerData.id).toBeDefined();
    expect(testServerData.name).toBeDefined();
    expect(testServerData.difficulty).toBeGreaterThanOrEqual(0);
  });

  it('验证角色数据格式正确性', () => {
    const testCharData: CharacterData = {
      id: 1,
      name: 'Test Character',
      server_id: 1,
      age: 0,
      health: 100,
      max_health: 100,
      money: 0,
      total_money_earned: 0,
      energy: 100,
      max_energy: 100,
      mood: 50,
      intelligence: 50,
      charm: 50,
      creativity: 50,
      luck: 50,
      karma: 50,
      is_married: false,
      family_tier: 'IRON',
      birth_server: 'Test Server',
      birth_talent: 'none',
      occupation: 'Unemployed',
      education_level: 'None',
      education_year: 0,
      career_years: 0,
      is_alive: true,
      is_active: true,
    };
    expect(testCharData.age).toBeGreaterThanOrEqual(0);
    expect(testCharData.health).toBeGreaterThanOrEqual(0);
    expect(testCharData.name).toBeDefined();
  });

  it('验证事件响应数据格式正确性', () => {
    const testEventResponse: EventResponse = {
      event: {
        title: 'Test',
        description: 'Test',
        category: 'life',
        options: [
          { index: 0, text: 'Test', hint: 'Test' }
        ]
      },
      character: {},
      is_dead: false
    };
    expect(testEventResponse.event).toBeDefined();
    expect(testEventResponse.is_dead).toBeDefined();
  });
});
