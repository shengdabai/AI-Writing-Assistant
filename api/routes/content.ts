import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import Anthropic from '@anthropic-ai/sdk';
import {
  GenerateContentRequest,
  GenerateContentResponse,
  ApiResponse,
  Generation,
  ContentType,
  GenerationParams
} from '../types/index.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// 初始化 Anthropic 客户端
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

// 模拟生成记录存储
const generations: Generation[] = [];

/**
 * AI内容生成 - 使用 Anthropic Claude API
 * @param type 内容类型
 * @param prompt 用户提示
 * @param params 生成参数
 * @returns 生成的内容
 */
const generateAIContent = async (
  type: ContentType,
  prompt: string,
  params: GenerationParams
): Promise<string> => {
  const typeNames: Record<ContentType, string> = {
    article: '文章',
    report: '报告',
    email: '邮件',
    social: '社交媒体文案'
  };

  const toneDescriptions: Record<string, string> = {
    formal: '正式严谨',
    casual: '轻松随意',
    professional: '专业权威',
    friendly: '友好亲切'
  };

  const lengthDescriptions: Record<string, string> = {
    short: '简短精炼(500字以内)',
    medium: '适中详细(1000-1500字)',
    long: '深入全面(2000字以上)'
  };

  // 构建系统提示
  const systemPrompt = `你是一个专业的中文写作助手。请根据用户的要求生成高质量的${typeNames[type]}内容。
要求：
- 使用${toneDescriptions[params.tone]}的语调
- 面向${params.audience}读者
- 内容长度为${lengthDescriptions[params.length]}
- 使用Markdown格式
- 内容要有深度和实用性，避免空洞的套话`;

  // 无 API Key 时的降级方案
  if (!process.env.ANTHROPIC_API_KEY) {
    return `[AI写作助手]\n\n当前未配置 ANTHROPIC_API_KEY，请先设置环境变量。\n\n**类型**: ${typeNames[type]}\n**主题**: ${prompt}\n**语调**: ${toneDescriptions[params.tone]}\n**受众**: ${params.audience}\n\n请在 .env 文件中设置 ANTHROPIC_API_KEY 以启用真正的 AI 生成。`;
  }

  const userPrompt = `请为我生成一篇关于"${prompt}"的${typeNames[type]}。\n\n具体要求：\n- 语调：${toneDescriptions[params.tone]}\n- 目标受众：${params.audience}\n- 长度：${lengthDescriptions[params.length]}\n\n请直接输出内容，不要包含解释或说明。`;

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4096,
    system: systemPrompt,
    messages: [{ role: 'user', content: userPrompt }],
  });

  const content = message.content
    .filter((block): block is Anthropic.TextBlock => block.type === 'text')
    .map((block) => block.text)
    .join('\n\n');

  return content || '内容生成失败，请重试';
};

/**
 * 生成内容
 * POST /api/content/generate
 */
router.post('/generate', authMiddleware, async (req: express.Request, res: express.Response) => {
  try {
    const { type, template_id, prompt, parameters }: GenerateContentRequest = req.body;
    const userId = req.user!.id;

    // 输入验证
    if (!type || !prompt || !parameters) {
      return res.status(400).json({
        success: false,
        message: '请提供完整的生成参数'
      } as ApiResponse);
    }

    // 验证内容类型
    const validTypes: ContentType[] = ['article', 'report', 'email', 'social'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        message: '无效的内容类型'
      } as ApiResponse);
    }

    // 检查用户使用限制（免费用户每日限制）
    if (req.user!.plan === 'free') {
      const today = new Date().toDateString();
      const todayGenerations = generations.filter(
        g => g.user_id === userId && new Date(g.created_at).toDateString() === today
      );

      if (todayGenerations.length >= 10) {
        return res.status(429).json({
          success: false,
          message: '免费用户每日生成次数已达上限，请升级到高级版获得无限生成'
        } as ApiResponse);
      }
    }

    // 生成内容
    const generatedContent = await generateAIContent(type, prompt, parameters);
    const wordCount = generatedContent.length;

    // 创建生成记录
    const generation: Generation = {
      id: uuidv4(),
      user_id: userId,
      template_id,
      content_type: type,
      prompt,
      generated_content: generatedContent,
      parameters,
      word_count: wordCount,
      is_favorite: false,
      created_at: new Date().toISOString()
    };

    generations.push(generation);

    // 返回生成结果
    res.json({
      success: true,
      data: {
        content: generatedContent,
        word_count: wordCount,
        generation_id: generation.id
      } as GenerateContentResponse,
      message: '内容生成成功'
    } as ApiResponse<GenerateContentResponse>);

  } catch (error) {
    console.error('内容生成错误:', error);
    res.status(500).json({
      success: false,
      message: '内容生成失败，请重试'
    } as ApiResponse);
  }
});

/**
 * 重新生成内容
 * POST /api/content/regenerate/:id
 */
router.post('/regenerate/:id', authMiddleware, async (req: express.Request, res: express.Response) => {
  try {
    const generationId = req.params.id;
    const userId = req.user!.id;

    // 查找原始生成记录
    const originalGeneration = generations.find(
      g => g.id === generationId && g.user_id === userId
    );

    if (!originalGeneration) {
      return res.status(404).json({
        success: false,
        message: '生成记录未找到'
      } as ApiResponse);
    }

    // 检查用户使用限制
    if (req.user!.plan === 'free') {
      const today = new Date().toDateString();
      const todayGenerations = generations.filter(
        g => g.user_id === userId && new Date(g.created_at).toDateString() === today
      );

      if (todayGenerations.length >= 10) {
        return res.status(429).json({
          success: false,
          message: '免费用户每日生成次数已达上限'
        } as ApiResponse);
      }
    }

    // 重新生成内容
    const generatedContent = await generateAIContent(
      originalGeneration.content_type,
      originalGeneration.prompt,
      originalGeneration.parameters
    );
    const wordCount = generatedContent.length;

    // 创建新的生成记录
    const newGeneration: Generation = {
      ...originalGeneration,
      id: uuidv4(),
      generated_content: generatedContent,
      word_count: wordCount,
      created_at: new Date().toISOString()
    };

    generations.push(newGeneration);

    res.json({
      success: true,
      data: {
        content: generatedContent,
        word_count: wordCount,
        generation_id: newGeneration.id
      } as GenerateContentResponse,
      message: '内容重新生成成功'
    } as ApiResponse<GenerateContentResponse>);

  } catch (error) {
    console.error('内容重新生成错误:', error);
    res.status(500).json({
      success: false,
      message: '内容重新生成失败，请重试'
    } as ApiResponse);
  }
});

/**
 * 获取生成统计
 * GET /api/content/stats
 */
router.get('/stats', authMiddleware, (req: express.Request, res: express.Response) => {
  try {
    const userId = req.user!.id;
    const userGenerations = generations.filter(g => g.user_id === userId);

    // 计算统计数据
    const totalGenerations = userGenerations.length;
    const totalWords = userGenerations.reduce((sum, g) => sum + g.word_count, 0);
    const favoriteCount = userGenerations.filter(g => g.is_favorite).length;

    // 按类型统计
    const typeStats = {
      article: userGenerations.filter(g => g.content_type === 'article').length,
      report: userGenerations.filter(g => g.content_type === 'report').length,
      email: userGenerations.filter(g => g.content_type === 'email').length,
      social: userGenerations.filter(g => g.content_type === 'social').length
    };

    // 最常用类型
    const mostUsedType = Object.entries(typeStats).reduce((a, b) =>
      typeStats[a[0] as ContentType] > typeStats[b[0] as ContentType] ? a : b
    )[0] as ContentType;

    // 每日使用统计（最近7天）
    const dailyUsage = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateString = date.toISOString().split('T')[0];

      const count = userGenerations.filter(g =>
        g.created_at.split('T')[0] === dateString
      ).length;

      dailyUsage.push({
        date: dateString,
        count
      });
    }

    // 类型分布
    const typeDistribution = Object.entries(typeStats).map(([type, count]) => ({
      type: type as ContentType,
      count,
      percentage: totalGenerations > 0 ? Math.round((count / totalGenerations) * 100) : 0
    }));

    res.json({
      success: true,
      data: {
        total_generations: totalGenerations,
        total_words: totalWords,
        favorite_count: favoriteCount,
        most_used_type: mostUsedType,
        daily_usage: dailyUsage,
        type_distribution: typeDistribution
      },
      message: '统计数据获取成功'
    } as ApiResponse);

  } catch (error) {
    console.error('获取统计数据错误:', error);
    res.status(500).json({
      success: false,
      message: '获取统计数据失败'
    } as ApiResponse);
  }
});

export { router as contentRoutes };
