// 用户相关类型
export interface User {
  id: string;
  email: string;
  name: string;
  plan: 'free' | 'premium';
  usageCount: number;
  createdAt: string;
  updatedAt: string;
}

// 内容类型枚举
export type ContentType = 'article' | 'report' | 'email' | 'social';

// 生成参数接口
export interface GenerationParams {
  length: 'short' | 'medium' | 'long';
  tone: 'formal' | 'casual' | 'professional' | 'friendly';
  audience: 'general' | 'professional' | 'academic' | 'marketing';
  keywords?: string[];
  language: 'zh' | 'en';
}

// 模板接口
export interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  contentType: ContentType;
  promptTemplate: string;
  defaultParams: GenerationParams;
  isPublic: boolean;
  usageCount: number;
  createdAt: string;
  updatedAt: string;
}

// 生成记录接口
export interface Generation {
  id: string;
  userId: string;
  templateId?: string;
  contentType: ContentType;
  prompt: string;
  generatedContent: string;
  parameters: GenerationParams;
  wordCount: number;
  isFavorite: boolean;
  createdAt: string;
}

// 分类接口
export interface Category {
  id: string;
  name: string;
  description: string;
  icon: string;
  sortOrder: number;
}

// API响应接口
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// 生成内容请求接口
export interface GenerateContentRequest {
  type: ContentType;
  templateId?: string;
  prompt: string;
  parameters: GenerationParams;
}

// 生成内容响应接口
export interface GenerateContentResponse {
  content: string;
  wordCount: number;
  generationId: string;
}

// 使用统计接口
export interface UsageStats {
  totalGenerations: number;
  totalWords: number;
  favoriteCount: number;
  mostUsedType: ContentType;
  dailyUsage: Array<{
    date: string;
    count: number;
  }>;
  typeDistribution: Array<{
    type: ContentType;
    count: number;
    percentage: number;
  }>;
}

// 成就接口
export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  condition: string;
  unlockedAt?: string;
}

// 应用状态接口
export interface AppState {
  user: User | null;
  isAuthenticated: boolean;
  currentGeneration: Generation | null;
  templates: Template[];
  categories: Category[];
  history: Generation[];
  usageStats: UsageStats | null;
  achievements: Achievement[];
  isLoading: boolean;
  error: string | null;
}

// 路由参数接口
export interface RouteParams {
  id?: string;
  type?: ContentType;
}

// 搜索过滤器接口
export interface SearchFilters {
  query?: string;
  contentType?: ContentType;
  category?: string;
  dateRange?: {
    start: string;
    end: string;
  };
  isFavorite?: boolean;
}

// 分页接口
export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// 导出选项接口
export interface ExportOptions {
  format: 'txt' | 'docx' | 'pdf';
  includeMetadata: boolean;
  selectedIds?: string[];
}