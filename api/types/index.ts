// 后端API类型定义

// 用户相关类型
export interface User {
  id: string;
  email: string;
  password_hash: string;
  name: string;
  avatar_url?: string;
  plan: 'free' | 'premium';
  usage_count: number;
  created_at: string;
  updated_at: string;
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
  user_id?: string;
  category_id: string;
  name: string;
  description: string;
  prompt_template: string;
  default_parameters: GenerationParams;
  is_public: boolean;
  usage_count: number;
  created_at: string;
  updated_at: string;
}

// 生成记录接口
export interface Generation {
  id: string;
  user_id: string;
  template_id?: string;
  content_type: ContentType;
  prompt: string;
  generated_content: string;
  parameters: GenerationParams;
  word_count: number;
  is_favorite: boolean;
  created_at: string;
}

// Historical records expose editable titles in addition to generated content.
export interface GenerationRecord extends Omit<Generation, 'prompt' | 'word_count' | 'is_favorite'> {
  title: string;
  input_text: string;
  updated_at: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  condition: string;
  reward_points: number;
}

// 分类接口
export interface Category {
  id: string;
  name: string;
  description: string;
  icon: string;
  sort_order: number;
}

// API请求/响应接口
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// 认证相关
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  user: Omit<User, 'password_hash'>;
  token: string;
}

// 内容生成请求
export interface GenerateContentRequest {
  type: ContentType;
  template_id?: string;
  prompt: string;
  parameters: GenerationParams;
}

export interface GenerateContentResponse {
  content: string;
  word_count: number;
  generation_id: string;
}

// 模板请求
export interface CreateTemplateRequest {
  name: string;
  description: string;
  category_id: string;
  content_type: ContentType;
  prompt_template: string;
  default_parameters: GenerationParams;
  is_public?: boolean;
}

export interface UpdateTemplateRequest extends Partial<CreateTemplateRequest> {
  id: string;
}

// 历史记录查询
export interface HistoryQuery {
  page?: number;
  limit?: number;
  content_type?: ContentType;
  is_favorite?: boolean;
  search?: string;
  start_date?: string;
  end_date?: string;
}

export interface HistoryQueryParams extends Omit<HistoryQuery, 'page' | 'limit'> {
  page?: string | number;
  limit?: string | number;
  sort_by?: 'title' | 'content_type' | 'created_at';
  sort_order?: 'asc' | 'desc';
}

// The profile endpoint currently returns prototype statistics, distinct from content stats.
export interface UserUsageStats {
  total_generations: number;
  total_words: number;
  total_templates_used: number;
  total_templates_created: number;
  favorite_content_type: ContentType;
  average_content_length: number;
  daily_usage: Array<{ date: string; count: number }>;
  content_type_distribution: Record<ContentType, number>;
  monthly_usage: Array<{ month: string; count: number }>;
}

// 分页响应
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

// 使用统计
export interface UsageStats {
  total_generations: number;
  total_words: number;
  favorite_count: number;
  most_used_type: ContentType;
  daily_usage: Array<{
    date: string;
    count: number;
  }>;
  type_distribution: Array<{
    type: ContentType;
    count: number;
    percentage: number;
  }>;
}

// JWT载荷
export interface JWTPayload {
  user_id: string;
  email: string;
  plan: string;
  iat: number;
  exp: number;
}

// 中间件扩展Request类型
declare global {
  namespace Express {
    interface Request {
      user?: Omit<User, 'password_hash'>;
    }
  }
}

// 错误类型
export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

// 数据库连接配置
export interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  ssl?: boolean;
}

// AI服务配置
export interface AIServiceConfig {
  provider: 'openai' | 'claude' | 'local';
  api_key?: string;
  base_url?: string;
  model: string;
  max_tokens: number;
  temperature: number;
}