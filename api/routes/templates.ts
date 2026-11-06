import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { 
  Template, 
  Category, 
  CreateTemplateRequest, 
  ApiResponse, 
  ContentType
} from '../types/index.js';
import { authMiddleware, optionalAuthMiddleware } from '../middleware/auth.js';
import { isGenerationParams } from '../validation.js';

const router = express.Router();

// 模拟分类数据
const categories: Category[] = [
  {
    id: '1',
    name: '文章写作',
    description: '新闻文章、博客文章、学术文章等',
    icon: 'FileText',
    sort_order: 1
  },
  {
    id: '2',
    name: '商务报告',
    description: '商业分析、项目报告、总结报告等',
    icon: 'BarChart3',
    sort_order: 2
  },
  {
    id: '3',
    name: '邮件沟通',
    description: '商务邮件、营销邮件、客服邮件等',
    icon: 'Mail',
    sort_order: 3
  },
  {
    id: '4',
    name: '社交媒体',
    description: '微博文案、朋友圈、广告文案等',
    icon: 'Share2',
    sort_order: 4
  }
];

// 模拟模板数据
const templates: Template[] = [
  {
    id: '1',
    user_id: undefined, // 系统模板
    category_id: '1',
    name: '新闻文章模板',
    description: '适用于新闻报道和时事分析的专业模板',
    prompt_template: '请写一篇关于{topic}的新闻文章，要求客观、准确、有新闻价值。文章应包含背景介绍、事件经过、影响分析和相关评论。',
    default_parameters: {
      length: 'medium',
      tone: 'formal',
      audience: 'general',
      language: 'zh'
    },
    is_public: true,
    usage_count: 156,
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z'
  },
  {
    id: '2',
    user_id: undefined,
    category_id: '1',
    name: '博客文章模板',
    description: '个人博客和技术文章的写作模板',
    prompt_template: '请写一篇关于{topic}的博客文章，语调轻松友好，包含个人见解和实用建议。',
    default_parameters: {
      length: 'medium',
      tone: 'casual',
      audience: 'general',
      language: 'zh'
    },
    is_public: true,
    usage_count: 203,
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z'
  },
  {
    id: '3',
    user_id: undefined,
    category_id: '2',
    name: '商业分析报告模板',
    description: '专业的商业分析报告格式模板',
    prompt_template: '请撰写一份关于{topic}的商业分析报告，包含市场分析、竞争分析、SWOT分析和战略建议。',
    default_parameters: {
      length: 'long',
      tone: 'professional',
      audience: 'professional',
      language: 'zh'
    },
    is_public: true,
    usage_count: 89,
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z'
  },
  {
    id: '4',
    user_id: undefined,
    category_id: '3',
    name: '营销邮件模板',
    description: '高转化率的营销邮件写作模板',
    prompt_template: '请写一封关于{product}的营销邮件，要有吸引力的标题、清晰的价值主张和明确的行动号召。',
    default_parameters: {
      length: 'medium',
      tone: 'friendly',
      audience: 'marketing',
      language: 'zh'
    },
    is_public: true,
    usage_count: 234,
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z'
  },
  {
    id: '5',
    user_id: undefined,
    category_id: '3',
    name: '商务邮件模板',
    description: '正式商务沟通邮件模板',
    prompt_template: '请写一封关于{topic}的正式商务邮件，语调专业礼貌，结构清晰。',
    default_parameters: {
      length: 'medium',
      tone: 'formal',
      audience: 'professional',
      language: 'zh'
    },
    is_public: true,
    usage_count: 167,
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z'
  },
  {
    id: '6',
    user_id: undefined,
    category_id: '4',
    name: '社交媒体文案模板',
    description: '吸引眼球的社交媒体内容模板',
    prompt_template: '请为{brand}创作一条社交媒体文案，要求有趣、有互动性，能够引起用户关注和分享。',
    default_parameters: {
      length: 'short',
      tone: 'casual',
      audience: 'general',
      language: 'zh'
    },
    is_public: true,
    usage_count: 312,
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z'
  }
];

/**
 * 获取所有分类
 * GET /api/templates/categories
 */
router.get('/categories', (_req: express.Request, res: express.Response) => {
  try {
    res.json({
      success: true,
      data: categories.sort((a, b) => a.sort_order - b.sort_order),
      message: '分类获取成功'
    } as ApiResponse<Category[]>);
  } catch (error) {
    console.error('获取分类错误:', error);
    res.status(500).json({
      success: false,
      message: '获取分类失败'
    } as ApiResponse);
  }
});

/**
 * 获取模板列表
 * GET /api/templates
 */
router.get('/', optionalAuthMiddleware, (req: express.Request, res: express.Response) => {
  try {
    const {
      page = 1,
      limit = 20,
      category_id,
      content_type,
      search,
      is_public,
      sort_by = 'usage_count'
    } = req.query;

    let filteredTemplates = [...templates];

    // 筛选条件
    if (category_id) {
      filteredTemplates = filteredTemplates.filter(t => t.category_id === category_id);
    }

    if (content_type) {
      // 根据内容类型筛选（需要映射分类到内容类型）
      const typeToCategory: { [key in ContentType]: string } = {
        article: '1',
        report: '2', 
        email: '3',
        social: '4'
      };
      const categoryId = typeToCategory[content_type as ContentType];
      if (categoryId) {
        filteredTemplates = filteredTemplates.filter(t => t.category_id === categoryId);
      }
    }

    if (search) {
      const searchTerm = (search as string).toLowerCase();
      filteredTemplates = filteredTemplates.filter(t => 
        t.name.toLowerCase().includes(searchTerm) ||
        t.description.toLowerCase().includes(searchTerm)
      );
    }

    if (is_public !== undefined) {
      filteredTemplates = filteredTemplates.filter(t => t.is_public === (is_public === 'true'));
    }

    // Apply visibility to the filtered set; do not re-add unfiltered owned templates.
    filteredTemplates = filteredTemplates.filter(t => t.is_public || (req.user && t.user_id === req.user.id));

    // 排序
    switch (sort_by) {
      case 'name':
        filteredTemplates.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'created_at':
        filteredTemplates.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      case 'usage_count':
      default:
        filteredTemplates.sort((a, b) => b.usage_count - a.usage_count);
        break;
    }

    // 分页
    const pageNum = Math.max(1, Number.isSafeInteger(Number(page)) ? Number(page) : 1);
    const limitNum = Math.min(100, Math.max(1, Number.isSafeInteger(Number(limit)) ? Number(limit) : 20));
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = startIndex + limitNum;
    
    const paginatedTemplates = filteredTemplates.slice(startIndex, endIndex);
    const totalPages = Math.ceil(filteredTemplates.length / limitNum);

    // 添加分类信息
    const templatesWithCategory = paginatedTemplates.map(template => {
      const category = categories.find(c => c.id === template.category_id);
      return {
        ...template,
        category: category ? category.name : '未知分类'
      };
    });

    res.json({
      success: true,
      data: templatesWithCategory,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: filteredTemplates.length,
        total_pages: totalPages
      },
      message: '模板获取成功'
    } as ApiResponse<any> & { pagination: any });

  } catch (error) {
    console.error('获取模板列表错误:', error);
    res.status(500).json({
      success: false,
      message: '获取模板列表失败'
    } as ApiResponse);
  }
});

/**
 * 获取单个模板详情
 * GET /api/templates/:id
 */
router.get('/:id', optionalAuthMiddleware, (req: express.Request, res: express.Response) => {
  try {
    const templateId = req.params.id;
    const template = templates.find(t => t.id === templateId);

    if (!template) {
      return res.status(404).json({
        success: false,
        message: '模板未找到'
      } as ApiResponse);
    }

    // 检查访问权限
    if (!template.is_public && (!req.user || template.user_id !== req.user.id)) {
      return res.status(403).json({
        success: false,
        message: '无权访问此模板'
      } as ApiResponse);
    }

    // 添加分类信息
    const category = categories.find(c => c.id === template.category_id);
    const templateWithCategory = {
      ...template,
      category: category ? category.name : '未知分类'
    };

    res.json({
      success: true,
      data: templateWithCategory,
      message: '模板详情获取成功'
    } as ApiResponse);

  } catch (error) {
    console.error('获取模板详情错误:', error);
    res.status(500).json({
      success: false,
      message: '获取模板详情失败'
    } as ApiResponse);
  }
});

/**
 * 创建新模板
 * POST /api/templates
 */
router.post('/', authMiddleware, (req: express.Request, res: express.Response) => {
  try {
    const {
      name,
      description,
      category_id,
      prompt_template,
      default_parameters,
      is_public = false
    }: CreateTemplateRequest = req.body ?? {};

    const userId = req.user!.id;

    // 输入验证
    if (![name, description, category_id, prompt_template].every(value => typeof value === 'string' && value.trim())
      || typeof is_public !== 'boolean' || !isGenerationParams(default_parameters)) {
      return res.status(400).json({
        success: false,
        message: '请提供完整的模板信息'
      } as ApiResponse);
    }

    // 验证分类是否存在
    const category = categories.find(c => c.id === category_id);
    if (!category) {
      return res.status(400).json({
        success: false,
        message: '无效的分类ID'
      } as ApiResponse);
    }

    // 创建新模板
    const newTemplate: Template = {
      id: uuidv4(),
      user_id: userId,
      category_id,
      name: name.trim(),
      description: description.trim(),
      prompt_template: prompt_template.trim(),
      default_parameters,
      is_public: is_public || false,
      usage_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    templates.push(newTemplate);

    res.status(201).json({
      success: true,
      data: newTemplate,
      message: '模板创建成功'
    } as ApiResponse<Template>);

  } catch (error) {
    console.error('创建模板错误:', error);
    res.status(500).json({
      success: false,
      message: '创建模板失败'
    } as ApiResponse);
  }
});

/**
 * 更新模板
 * PUT /api/templates/:id
 */
router.put('/:id', authMiddleware, (req: express.Request, res: express.Response) => {
  try {
    const templateId = req.params.id;
    const userId = req.user!.id;
    const body = req.body;
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return res.status(400).json({ success: false, message: '无效的模板信息' });
    }
    // Never trust a TypeScript annotation to strip client-supplied identity fields.
    const updateData: Partial<CreateTemplateRequest> = {};
    for (const key of ['name', 'description', 'category_id', 'prompt_template'] as const) {
      if (body[key] !== undefined) {
        if (typeof body[key] !== 'string' || !body[key].trim()) {
          return res.status(400).json({ success: false, message: '无效的模板文本' });
        }
        updateData[key] = body[key].trim();
      }
    }
    if (body.is_public !== undefined) {
      if (typeof body.is_public !== 'boolean') {
        return res.status(400).json({ success: false, message: '无效的公开设置' });
      }
      updateData.is_public = body.is_public;
    }
    if (body.default_parameters !== undefined) {
      if (!isGenerationParams(body.default_parameters)) {
        return res.status(400).json({ success: false, message: '无效的默认生成参数' });
      }
      updateData.default_parameters = body.default_parameters;
    }

    const templateIndex = templates.findIndex(t => t.id === templateId);
    if (templateIndex === -1) {
      return res.status(404).json({
        success: false,
        message: '模板未找到'
      } as ApiResponse);
    }

    const template = templates[templateIndex];

    // 检查权限（只有模板创建者可以修改）
    if (template.user_id !== userId) {
      return res.status(403).json({
        success: false,
        message: '无权修改此模板'
      } as ApiResponse);
    }

    // 验证分类ID（如果提供）
    if (updateData.category_id) {
      const category = categories.find(c => c.id === updateData.category_id);
      if (!category) {
        return res.status(400).json({
          success: false,
          message: '无效的分类ID'
        } as ApiResponse);
      }
    }

    // 更新模板
    const updatedTemplate = {
      ...template,
      ...updateData,
      updated_at: new Date().toISOString()
    };

    templates[templateIndex] = updatedTemplate;

    res.json({
      success: true,
      data: updatedTemplate,
      message: '模板更新成功'
    } as ApiResponse<Template>);

  } catch (error) {
    console.error('更新模板错误:', error);
    res.status(500).json({
      success: false,
      message: '更新模板失败'
    } as ApiResponse);
  }
});

/**
 * 删除模板
 * DELETE /api/templates/:id
 */
router.delete('/:id', authMiddleware, (req: express.Request, res: express.Response) => {
  try {
    const templateId = req.params.id;
    const userId = req.user!.id;

    const templateIndex = templates.findIndex(t => t.id === templateId);
    if (templateIndex === -1) {
      return res.status(404).json({
        success: false,
        message: '模板未找到'
      } as ApiResponse);
    }

    const template = templates[templateIndex];

    // 检查权限（只有模板创建者可以删除）
    if (template.user_id !== userId) {
      return res.status(403).json({
        success: false,
        message: '无权删除此模板'
      } as ApiResponse);
    }

    // 删除模板
    templates.splice(templateIndex, 1);

    res.json({
      success: true,
      message: '模板删除成功'
    } as ApiResponse);

  } catch (error) {
    console.error('删除模板错误:', error);
    res.status(500).json({
      success: false,
      message: '删除模板失败'
    } as ApiResponse);
  }
});

/**
 * 使用模板（增加使用次数）
 * POST /api/templates/:id/use
 */
router.post('/:id/use', optionalAuthMiddleware, (req: express.Request, res: express.Response) => {
  try {
    const templateId = req.params.id;
    const template = templates.find(t => t.id === templateId);

    if (!template) {
      return res.status(404).json({
        success: false,
        message: '模板未找到'
      } as ApiResponse);
    }

    // 检查访问权限
    if (!template.is_public && (!req.user || template.user_id !== req.user.id)) {
      return res.status(403).json({
        success: false,
        message: '无权使用此模板'
      } as ApiResponse);
      }

    // 增加使用次数
    template.usage_count += 1;

    res.json({
      success: true,
      data: { usage_count: template.usage_count },
      message: '模板使用次数已更新'
    } as ApiResponse);

  } catch (error) {
    console.error('更新模板使用次数错误:', error);
    res.status(500).json({
      success: false,
      message: '更新模板使用次数失败'
    } as ApiResponse);
  }
});

export { router as templateRoutes };