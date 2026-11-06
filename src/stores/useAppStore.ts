import { create } from 'zustand';
import { 
  User, 
  Generation, 
  Template, 
  Category, 
  UsageStats, 
  Achievement,
  ContentType,
  GenerationParams,
  SearchFilters
} from '../types';

interface AppStore {
  // 用户状态
  user: User | null;
  isAuthenticated: boolean;
  
  // 内容生成状态
  currentGeneration: Generation | null;
  isGenerating: boolean;
  
  // 数据状态
  templates: Template[];
  categories: Category[];
  history: Generation[];
  usageStats: UsageStats | null;
  achievements: Achievement[];
  
  // UI状态
  isLoading: boolean;
  error: string | null;
  searchFilters: SearchFilters;
  
  // 用户操作
  setUser: (user: User | null) => void;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  
  // 内容生成操作
  generateContent: (type: ContentType, prompt: string, params: GenerationParams, templateId?: string) => Promise<Generation | null>;
  setCurrentGeneration: (generation: Generation | null) => void;
  
  // 数据操作
  loadTemplates: () => Promise<void>;
  loadCategories: () => Promise<void>;
  loadHistory: () => Promise<void>;
  loadUsageStats: () => Promise<void>;
  loadAchievements: () => Promise<void>;
  
  // 历史记录操作
  toggleFavorite: (generationId: string) => Promise<void>;
  deleteGeneration: (generationId: string) => Promise<void>;
  
  // 搜索和过滤
  setSearchFilters: (filters: SearchFilters) => void;
  getFilteredHistory: () => Generation[];
  
  // UI操作
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

// 模拟数据
const mockCategories: Category[] = [
  { id: '1', name: '文章写作', description: '新闻文章、博客文章、学术文章等', icon: 'FileText', sortOrder: 1 },
  { id: '2', name: '商务报告', description: '商业分析、项目报告、总结报告等', icon: 'BarChart3', sortOrder: 2 },
  { id: '3', name: '邮件沟通', description: '商务邮件、营销邮件、客服邮件等', icon: 'Mail', sortOrder: 3 },
  { id: '4', name: '社交媒体', description: '微博文案、朋友圈、广告文案等', icon: 'Share2', sortOrder: 4 },
];

const mockTemplates: Template[] = [
  {
    id: '1',
    name: '新闻文章模板',
    description: '适用于新闻报道和时事分析',
    category: '文章写作',
    contentType: 'article',
    promptTemplate: '请写一篇关于{topic}的新闻文章，要求客观、准确、有新闻价值。',
    defaultParams: {
      length: 'medium',
      tone: 'formal',
      audience: 'general',
      language: 'zh'
    },
    isPublic: true,
    usageCount: 156,
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z'
  },
  {
    id: '2',
    name: '商业报告模板',
    description: '专业的商业分析报告格式',
    category: '商务报告',
    contentType: 'report',
    promptTemplate: '请撰写一份关于{topic}的商业分析报告，包含市场分析、竞争分析和建议。',
    defaultParams: {
      length: 'long',
      tone: 'professional',
      audience: 'professional',
      language: 'zh'
    },
    isPublic: true,
    usageCount: 89,
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z'
  },
  {
    id: '3',
    name: '营销邮件模板',
    description: '高转化率的营销邮件写作',
    category: '邮件沟通',
    contentType: 'email',
    promptTemplate: '请写一封关于{product}的营销邮件，要有吸引力的标题和明确的行动号召。',
    defaultParams: {
      length: 'medium',
      tone: 'friendly',
      audience: 'marketing',
      language: 'zh'
    },
    isPublic: true,
    usageCount: 234,
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z'
  },
  {
    id: '4',
    name: '社交媒体文案',
    description: '吸引眼球的社交媒体内容',
    category: '社交媒体',
    contentType: 'social',
    promptTemplate: '请为{brand}创作一条社交媒体文案，要求有趣、有互动性。',
    defaultParams: {
      length: 'short',
      tone: 'casual',
      audience: 'general',
      language: 'zh'
    },
    isPublic: true,
    usageCount: 312,
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z'
  }
];

const mockUser: User = {
  id: '1',
  email: 'demo@example.com',
  name: '演示用户',
  plan: 'premium',
  usageCount: 45,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-15T10:00:00Z'
};

const mockUsageStats: UsageStats = {
  totalGenerations: 45,
  totalWords: 12580,
  favoriteCount: 8,
  mostUsedType: 'article',
  dailyUsage: [
    { date: '2024-01-10', count: 3 },
    { date: '2024-01-11', count: 5 },
    { date: '2024-01-12', count: 2 },
    { date: '2024-01-13', count: 7 },
    { date: '2024-01-14', count: 4 },
    { date: '2024-01-15', count: 6 },
    { date: '2024-01-16', count: 3 }
  ],
  typeDistribution: [
    { type: 'article', count: 18, percentage: 40 },
    { type: 'email', count: 12, percentage: 27 },
    { type: 'social', count: 10, percentage: 22 },
    { type: 'report', count: 5, percentage: 11 }
  ]
};

const mockAchievements: Achievement[] = [
  {
    id: '1',
    name: '初次尝试',
    description: '完成第一次内容生成',
    icon: 'Star',
    condition: 'first_generation',
    unlockedAt: '2024-01-01T10:00:00Z'
  },
  {
    id: '2',
    name: '多产作家',
    description: '累计生成50篇内容',
    icon: 'Trophy',
    condition: 'total_50_generations',
    unlockedAt: undefined
  },
  {
    id: '3',
    name: '收藏家',
    description: '收藏10篇优质内容',
    icon: 'Heart',
    condition: 'favorite_10_contents',
    unlockedAt: '2024-01-10T15:30:00Z'
  }
];

export const useAppStore = create<AppStore>((set, get) => ({
  // 初始状态
  user: mockUser,
  isAuthenticated: true,
  currentGeneration: null,
  isGenerating: false,
  templates: mockTemplates,
  categories: mockCategories,
  history: [],
  usageStats: mockUsageStats,
  achievements: mockAchievements,
  isLoading: false,
  error: null,
  searchFilters: {},

  // 用户操作
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  
  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      // 模拟登录API调用
      await new Promise(resolve => setTimeout(resolve, 1000));
      if (email === 'demo@example.com' && password === 'password') {
        set({ user: mockUser, isAuthenticated: true, isLoading: false });
        return true;
      } else {
        set({ error: '邮箱或密码错误', isLoading: false });
        return false;
      }
    } catch (error) {
      set({ error: '登录失败，请重试', isLoading: false });
      return false;
    }
  },
  
  logout: () => set({ user: null, isAuthenticated: false }),

  // 内容生成操作
  generateContent: async (type, prompt, params, templateId) => {
    set({ isGenerating: true, error: null });
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockContent = `这是根据您的要求生成的${type === 'article' ? '文章' : type === 'report' ? '报告' : type === 'email' ? '邮件' : '社交媒体文案'}内容。\n\n${prompt}\n\n这里是AI生成的详细内容，包含了您指定的参数设置：语调${params.tone}，目标受众${params.audience}，长度${params.length}。内容经过精心设计，符合您的需求和期望。`;
      
      const generation: Generation = {
        id: Date.now().toString(),
        userId: get().user?.id || '1',
        templateId,
        contentType: type,
        prompt,
        generatedContent: mockContent,
        parameters: params,
        wordCount: mockContent.length,
        isFavorite: false,
        createdAt: new Date().toISOString()
      };
      
      set(state => ({
        currentGeneration: generation,
        history: [generation, ...state.history],
        isGenerating: false
      }));
      
      return generation;
    } catch (error) {
      set({ error: '内容生成失败，请重试', isGenerating: false });
      return null;
    }
  },
  
  setCurrentGeneration: (generation) => set({ currentGeneration: generation }),

  // 数据加载操作
  loadTemplates: async () => {
    set({ isLoading: true });
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      set({ templates: mockTemplates, isLoading: false });
    } catch (error) {
      set({ error: '加载模板失败', isLoading: false });
    }
  },
  
  loadCategories: async () => {
    set({ categories: mockCategories });
  },
  
  loadHistory: async () => {
    set({ isLoading: true });
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      // 模拟历史记录
      const mockHistory: Generation[] = [
        {
          id: '1',
          userId: '1',
          templateId: '1',
          contentType: 'article',
          prompt: '人工智能的发展趋势',
          generatedContent: '人工智能正在快速发展，预计在未来几年将在多个领域产生重大影响...',
          parameters: { length: 'medium', tone: 'formal', audience: 'general', language: 'zh' },
          wordCount: 580,
          isFavorite: true,
          createdAt: '2024-01-15T14:30:00Z'
        },
        {
          id: '2',
          userId: '1',
          templateId: '3',
          contentType: 'email',
          prompt: '新产品发布邮件',
          generatedContent: '亲爱的客户，我们很高兴向您介绍我们的最新产品...',
          parameters: { length: 'medium', tone: 'friendly', audience: 'marketing', language: 'zh' },
          wordCount: 320,
          isFavorite: false,
          createdAt: '2024-01-14T16:20:00Z'
        }
      ];
      set({ history: mockHistory, isLoading: false });
    } catch (error) {
      set({ error: '加载历史记录失败', isLoading: false });
    }
  },
  
  loadUsageStats: async () => {
    set({ usageStats: mockUsageStats });
  },
  
  loadAchievements: async () => {
    set({ achievements: mockAchievements });
  },

  // 历史记录操作
  toggleFavorite: async (generationId) => {
    try {
      set(state => ({
        history: state.history.map(item => 
          item.id === generationId 
            ? { ...item, isFavorite: !item.isFavorite }
            : item
        )
      }));
    } catch (error) {
      set({ error: '操作失败' });
    }
  },
  
  deleteGeneration: async (generationId) => {
    try {
      set(state => ({
        history: state.history.filter(item => item.id !== generationId)
      }));
    } catch (error) {
      set({ error: '删除失败' });
    }
  },

  // 搜索和过滤
  setSearchFilters: (filters) => set({ searchFilters: filters }),
  
  getFilteredHistory: () => {
    const { history, searchFilters } = get();
    let filtered = [...history];
    
    if (searchFilters.query) {
      const query = searchFilters.query.toLowerCase();
      filtered = filtered.filter(item => 
        item.prompt.toLowerCase().includes(query) ||
        item.generatedContent.toLowerCase().includes(query)
      );
    }
    
    if (searchFilters.contentType) {
      filtered = filtered.filter(item => item.contentType === searchFilters.contentType);
    }
    
    if (searchFilters.isFavorite !== undefined) {
      filtered = filtered.filter(item => item.isFavorite === searchFilters.isFavorite);
    }
    
    return filtered;
  },

  // UI操作
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null })
}));

export default useAppStore;