import express from 'express';
import { 
  GenerationRecord, 
  ApiResponse, 
  HistoryQueryParams
} from '../types/index.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

export function escapeCsv(str: string): string {
  const safe = /^(?:[\t\r]|\s*[=+\-@])/.test(str) ? "'" + str : str;
  return `"${safe.replace(/"/g, '""')}"`;
}

// 模拟历史记录数据
const historyRecords: GenerationRecord[] = [
  {
    id: '1',
    user_id: 'user1',
    content_type: 'article',
    title: '人工智能的发展趋势',
    input_text: '请分析人工智能在未来十年的发展趋势',
    generated_content: '人工智能作为21世纪最重要的技术革命之一，正在深刻改变着我们的生活和工作方式。在未来十年，AI技术将在以下几个方面实现重大突破：\n\n1. **机器学习算法的优化**\n深度学习、强化学习等算法将更加成熟，模型的准确性和效率将显著提升。\n\n2. **自然语言处理的进步**\nGPT等大语言模型将变得更加智能，能够更好地理解和生成人类语言。\n\n3. **计算机视觉的应用扩展**\n图像识别、视频分析等技术将在医疗、安防、自动驾驶等领域得到广泛应用。\n\n4. **边缘计算与AI的结合**\nAI模型将更多地部署在边缘设备上，实现实时、低延迟的智能处理。\n\n5. **AI伦理和安全的重视**\n随着AI技术的普及，相关的伦理规范和安全标准将更加完善。\n\n总的来说，未来十年将是AI技术快速发展和广泛应用的黄金时期。',
    parameters: {
      length: 'long',
      tone: 'professional',
      audience: 'general',
      language: 'zh'
    },
    template_id: '1',
    created_at: '2024-01-20T14:30:00Z',
    updated_at: '2024-01-20T14:30:00Z'
  },
  {
    id: '2',
    user_id: 'user1',
    content_type: 'email',
    title: '产品发布邮件',
    input_text: '新产品AI写作助手即将发布，需要给用户发送邮件',
    generated_content: '亲爱的用户，\n\n我们很高兴地宣布，全新的AI写作助手即将正式发布！\n\n🚀 **产品亮点**\n• 智能内容生成，支持多种文体\n• 专业模板库，覆盖各种场景\n• 个性化定制，满足不同需求\n• 简洁易用的界面设计\n\n📅 **发布时间**\n2024年2月1日正式上线\n\n🎁 **限时优惠**\n前1000名注册用户可享受6个月免费使用权限\n\n立即访问我们的官网了解更多详情，或点击下方按钮预约体验。\n\n[立即预约] [了解详情]\n\n感谢您的支持！\n\nAI写作助手团队',
    parameters: {
      length: 'medium',
      tone: 'friendly',
      audience: 'marketing',
      language: 'zh'
    },
    template_id: '4',
    created_at: '2024-01-19T16:45:00Z',
    updated_at: '2024-01-19T16:45:00Z'
  },
  {
    id: '3',
    user_id: 'user1',
    content_type: 'social',
    title: '社交媒体推广文案',
    input_text: '为AI写作助手创作一条微博推广文案',
    generated_content: '✨ 写作灵感枯竭？AI写作助手来拯救你！\n\n📝 一键生成高质量内容\n🎯 多种模板任你选择\n⚡ 秒速完成写作任务\n💡 激发无限创意灵感\n\n无论是工作报告、营销文案还是个人博客，AI写作助手都能帮你轻松搞定！\n\n现在注册即享6个月免费体验 👉 链接在评论区\n\n#AI写作 #内容创作 #效率工具 #人工智能',
    parameters: {
      length: 'short',
      tone: 'casual',
      audience: 'general',
      language: 'zh'
    },
    template_id: '6',
    created_at: '2024-01-18T10:20:00Z',
    updated_at: '2024-01-18T10:20:00Z'
  },
  {
    id: '4',
    user_id: 'user1',
    content_type: 'report',
    title: '市场分析报告',
    input_text: '分析AI写作工具市场的现状和前景',
    generated_content: '# AI写作工具市场分析报告\n\n## 执行摘要\n\nAI写作工具市场正处于快速增长期，预计2024-2029年复合年增长率将达到25.8%。市场驱动因素包括内容需求激增、写作效率要求提升以及AI技术的不断成熟。\n\n## 市场现状\n\n### 市场规模\n- 2023年全球AI写作工具市场规模约为8.5亿美元\n- 预计2029年将达到32.1亿美元\n- 中国市场占全球市场份额的18%\n\n### 主要参与者\n1. **OpenAI (ChatGPT)**\n   - 市场份额：35%\n   - 优势：技术领先、用户基数大\n\n2. **Jasper AI**\n   - 市场份额：15%\n   - 优势：专业营销文案生成\n\n3. **Copy.ai**\n   - 市场份额：12%\n   - 优势：模板丰富、易用性强\n\n## 市场趋势\n\n### 技术发展趋势\n- 大语言模型性能持续提升\n- 多模态内容生成能力增强\n- 个性化定制需求增长\n\n### 应用场景扩展\n- 企业内容营销\n- 教育培训材料\n- 新闻媒体写作\n- 电商产品描述\n\n## 竞争分析\n\n### SWOT分析\n\n**优势 (Strengths)**\n- AI技术快速发展\n- 内容需求持续增长\n- 用户接受度提高\n\n**劣势 (Weaknesses)**\n- 内容质量参差不齐\n- 版权和原创性争议\n- 技术门槛较高\n\n**机会 (Opportunities)**\n- 垂直领域专业化\n- 多语言市场拓展\n- 企业级服务需求\n\n**威胁 (Threats)**\n- 监管政策不确定性\n- 技术同质化竞争\n- 用户隐私安全担忧\n\n## 战略建议\n\n1. **产品差异化**\n   - 专注特定垂直领域\n   - 提供个性化定制服务\n   - 增强多语言支持\n\n2. **技术创新**\n   - 投资研发先进算法\n   - 优化用户体验设计\n   - 加强数据安全保护\n\n3. **市场拓展**\n   - 深耕企业级市场\n   - 拓展国际市场\n   - 建立合作伙伴生态\n\n## 结论\n\nAI写作工具市场前景广阔，但竞争激烈。成功的关键在于技术创新、产品差异化和用户体验优化。建议企业专注于特定细分市场，提供高质量的专业化服务。',
    parameters: {
      length: 'long',
      tone: 'professional',
      audience: 'professional',
      language: 'zh'
    },
    template_id: '3',
    created_at: '2024-01-17T09:15:00Z',
    updated_at: '2024-01-17T09:15:00Z'
  },
  {
    id: '5',
    user_id: 'user1',
    content_type: 'article',
    title: '远程工作的优势与挑战',
    input_text: '写一篇关于远程工作利弊的文章',
    generated_content: '# 远程工作：机遇与挑战并存的新时代工作模式\n\n随着数字化技术的快速发展和全球疫情的催化，远程工作已从一种边缘的工作方式转变为主流趋势。越来越多的企业和员工开始拥抱这种灵活的工作模式，但同时也面临着前所未有的挑战。\n\n## 远程工作的显著优势\n\n### 1. 工作生活平衡的改善\n远程工作最直接的好处是员工可以更好地平衡工作与生活。无需通勤意味着更多的时间可以用于家庭、健康和个人兴趣。这种灵活性特别对有家庭责任的员工具有吸引力。\n\n### 2. 成本节约\n对于员工而言，远程工作可以节省交通费、餐饮费和职业装费用。对于企业来说，可以减少办公空间租金、水电费和办公设备的支出。\n\n### 3. 人才获取范围扩大\n地理位置不再是限制因素，企业可以从全球范围内招聘最优秀的人才，而不必局限于特定城市或地区。\n\n### 4. 生产力提升\n许多研究表明，在合适的环境下，远程工作者的生产力往往高于办公室工作者。减少了办公室干扰，员工可以更专注于工作任务。\n\n## 面临的主要挑战\n\n### 1. 沟通协作困难\n缺乏面对面交流可能导致信息传递不准确、团队协作效率降低。非语言沟通的缺失也可能影响团队关系的建立。\n\n### 2. 工作与生活边界模糊\n在家工作可能导致工作时间延长，难以真正"下班"。这种边界模糊可能增加员工的压力和倦怠感。\n\n### 3. 技术依赖性增强\n远程工作高度依赖网络和技术设备。技术故障可能严重影响工作效率，同时也增加了网络安全风险。\n\n### 4. 职业发展机会减少\n远程工作者可能错过一些非正式的学习和晋升机会，如走廊对话、临时会议等，这些往往对职业发展很重要。\n\n## 成功实施远程工作的关键策略\n\n### 建立清晰的沟通机制\n- 定期举行视频会议\n- 使用协作工具保持团队连接\n- 建立明确的沟通协议和响应时间\n\n### 创造合适的工作环境\n- 设立专门的工作空间\n- 投资必要的技术设备\n- 确保网络连接稳定\n\n### 保持工作生活平衡\n- 设定明确的工作时间\n- 建立日常工作仪式\n- 定期休息和运动\n\n## 未来展望\n\n远程工作不仅仅是疫情期间的临时措施，而是未来工作方式的重要组成部分。混合工作模式（部分时间远程，部分时间办公室）可能成为最受欢迎的选择，既保持了远程工作的灵活性，又维持了面对面协作的优势。\n\n成功的远程工作需要企业、管理者和员工的共同努力。只有通过持续的学习、适应和改进，我们才能充分发挥远程工作的潜力，创造更加灵活、高效和人性化的工作环境。\n\n远程工作的未来是光明的，但需要我们以开放的心态拥抱变化，积极应对挑战，共同构建新时代的工作文化。',
    parameters: {
      length: 'long',
      tone: 'professional',
      audience: 'general',
      language: 'zh'
    },
    template_id: '2',
    created_at: '2024-01-16T13:25:00Z',
    updated_at: '2024-01-16T13:25:00Z'
  }
];

/**
 * 获取用户的历史记录列表
 * GET /api/history
 */
router.get('/', authMiddleware, (req: express.Request, res: express.Response) => {
  try {
    const userId = req.user!.id;
    const {
      page = 1,
      limit = 20,
      content_type,
      search,
      start_date,
      end_date,
      sort_by = 'created_at',
      sort_order = 'desc'
    }: HistoryQueryParams = req.query as any;

    // 获取用户的历史记录
    let userRecords = historyRecords.filter(record => record.user_id === userId);

    // 筛选条件
    if (content_type) {
      userRecords = userRecords.filter(record => record.content_type === content_type);
    }

    if (search) {
      const searchTerm = search.toLowerCase();
      userRecords = userRecords.filter(record => 
        record.title.toLowerCase().includes(searchTerm) ||
        record.input_text.toLowerCase().includes(searchTerm) ||
        record.generated_content.toLowerCase().includes(searchTerm)
      );
    }

    if (start_date) {
      userRecords = userRecords.filter(record => 
        new Date(record.created_at) >= new Date(start_date)
      );
    }

    if (end_date) {
      userRecords = userRecords.filter(record => 
        new Date(record.created_at) <= new Date(end_date)
      );
    }

    // 排序
    userRecords.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sort_by) {
        case 'title':
          aValue = a.title;
          bValue = b.title;
          break;
        case 'content_type':
          aValue = a.content_type;
          bValue = b.content_type;
          break;
        case 'created_at':
        default:
          aValue = new Date(a.created_at);
          bValue = new Date(b.created_at);
          break;
      }

      if (sort_order === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    // 分页
    const pageNum = Math.max(1, Number.isSafeInteger(Number(page)) ? Number(page) : 1);
    const limitNum = Math.min(100, Math.max(1, Number.isSafeInteger(Number(limit)) ? Number(limit) : 20));
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = startIndex + limitNum;
    
    const paginatedRecords = userRecords.slice(startIndex, endIndex);
    const totalPages = Math.ceil(userRecords.length / limitNum);

    res.json({
      success: true,
      data: paginatedRecords,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: userRecords.length,
        total_pages: totalPages
      },
      message: '历史记录获取成功'
    } as ApiResponse<GenerationRecord[]> & { pagination: any });

  } catch (error) {
    console.error('获取历史记录错误:', error);
    res.status(500).json({
      success: false,
      message: '获取历史记录失败'
    } as ApiResponse);
  }
});

/**
 * 更新历史记录标题
 * PUT /api/history/:id
 */
router.put('/:id', authMiddleware, (req: express.Request, res: express.Response) => {
  try {
    const recordId = req.params.id;
    const userId = req.user!.id;
    const { title } = req.body;

    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: '请提供有效的标题'
      } as ApiResponse);
    }

    const recordIndex = historyRecords.findIndex(r => r.id === recordId && r.user_id === userId);

    if (recordIndex === -1) {
      return res.status(404).json({
        success: false,
        message: '历史记录未找到'
      } as ApiResponse);
    }

    // 更新标题
    historyRecords[recordIndex] = {
      ...historyRecords[recordIndex],
      title: title.trim(),
      updated_at: new Date().toISOString()
    };

    res.json({
      success: true,
      data: historyRecords[recordIndex],
      message: '历史记录更新成功'
    } as ApiResponse<GenerationRecord>);

  } catch (error) {
    console.error('更新历史记录错误:', error);
    res.status(500).json({
      success: false,
      message: '更新历史记录失败'
    } as ApiResponse);
  }
});

/**
 * 删除单个历史记录
 * DELETE /api/history/:id
 */
router.delete('/:id', authMiddleware, (req: express.Request, res: express.Response) => {
  try {
    const recordId = req.params.id;
    const userId = req.user!.id;

    const recordIndex = historyRecords.findIndex(r => r.id === recordId && r.user_id === userId);

    if (recordIndex === -1) {
      return res.status(404).json({
        success: false,
        message: '历史记录未找到'
      } as ApiResponse);
    }

    // 删除记录
    historyRecords.splice(recordIndex, 1);

    res.json({
      success: true,
      message: '历史记录删除成功'
    } as ApiResponse);

  } catch (error) {
    console.error('删除历史记录错误:', error);
    res.status(500).json({
      success: false,
      message: '删除历史记录失败'
    } as ApiResponse);
  }
});

/**
 * 批量删除历史记录
 * DELETE /api/history
 */
router.delete('/', authMiddleware, (req: express.Request, res: express.Response) => {
  try {
    const userId = req.user!.id;
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: '请提供要删除的记录ID列表'
      } as ApiResponse);
    }

    // 验证所有ID都属于当前用户
    const userRecordIds = historyRecords
      .filter(r => r.user_id === userId)
      .map(r => r.id);
    
    const invalidIds = ids.filter(id => !userRecordIds.includes(id));
    if (invalidIds.length > 0) {
      return res.status(400).json({
        success: false,
        message: `无效的记录ID: ${invalidIds.join(', ')}`
      } as ApiResponse);
    }

    // 删除记录
    let deletedCount = 0;
    for (let i = historyRecords.length - 1; i >= 0; i--) {
      const record = historyRecords[i];
      if (record.user_id === userId && ids.includes(record.id)) {
        historyRecords.splice(i, 1);
        deletedCount++;
      }
    }

    res.json({
      success: true,
      data: { deleted_count: deletedCount },
      message: `成功删除 ${deletedCount} 条历史记录`
    } as ApiResponse);

  } catch (error) {
    console.error('批量删除历史记录错误:', error);
    res.status(500).json({
      success: false,
      message: '批量删除历史记录失败'
    } as ApiResponse);
  }
});

/**
 * 获取历史记录统计信息
 * GET /api/history/stats
 */
router.get('/stats', authMiddleware, (req: express.Request, res: express.Response) => {
  try {
    const userId = req.user!.id;
    const userRecords = historyRecords.filter(record => record.user_id === userId);

    // 按内容类型统计
    const contentTypeStats: { [key: string]: number } = {};
    userRecords.forEach(record => {
      contentTypeStats[record.content_type] = (contentTypeStats[record.content_type] || 0) + 1;
    });

    // 按日期统计（最近30天）
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentRecords = userRecords.filter(record => 
      new Date(record.created_at) >= thirtyDaysAgo
    );

    const dailyStats: { [key: string]: number } = {};
    recentRecords.forEach(record => {
      const date = new Date(record.created_at).toISOString().split('T')[0];
      dailyStats[date] = (dailyStats[date] || 0) + 1;
    });

    // 总字数统计
    const totalWords = userRecords.reduce((sum, record) => {
      return sum + record.generated_content.length;
    }, 0);

    const stats = {
      total_records: userRecords.length,
      total_words: totalWords,
      content_type_distribution: contentTypeStats,
      daily_generation_count: dailyStats,
      recent_records_count: recentRecords.length
    };

    res.json({
      success: true,
      data: stats,
      message: '统计信息获取成功'
    } as ApiResponse);

  } catch (error) {
    console.error('获取统计信息错误:', error);
    res.status(500).json({
      success: false,
      message: '获取统计信息失败'
    } as ApiResponse);
  }
});

/**
 * 导出历史记录
 * GET /api/history/export
 */
router.get('/export', authMiddleware, (req: express.Request, res: express.Response) => {
  try {
    const userId = req.user!.id;
    const { format = 'json', content_type, start_date, end_date } = req.query;

    let userRecords = historyRecords.filter(record => record.user_id === userId);

    // 应用筛选条件
    if (content_type) {
      userRecords = userRecords.filter(record => record.content_type === content_type);
    }

    if (start_date) {
      userRecords = userRecords.filter(record => 
        new Date(record.created_at) >= new Date(start_date as string)
      );
    }

    if (end_date) {
      userRecords = userRecords.filter(record => 
        new Date(record.created_at) <= new Date(end_date as string)
      );
    }

    // 按创建时间排序
    userRecords.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    if (format === 'csv') {
      // CSV格式导出
      const csvHeader = 'ID,标题,内容类型,输入文本,生成内容,创建时间\n';
      const csvRows = userRecords.map(record => {
        return [
          record.id,
          escapeCsv(record.title),
          record.content_type,
          escapeCsv(record.input_text),
          escapeCsv(record.generated_content),
          record.created_at
        ].join(',');
      }).join('\n');
      
      const csvContent = csvHeader + csvRows;
      
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', 'attachment; filename="history_export.csv"');
      res.send('\uFEFF' + csvContent); // 添加BOM以支持中文
    } else {
      // JSON格式导出
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', 'attachment; filename="history_export.json"');
      res.json({
        export_date: new Date().toISOString(),
        total_records: userRecords.length,
        records: userRecords
      });
    }

  } catch (error) {
    console.error('导出历史记录错误:', error);
    res.status(500).json({
      success: false,
      message: '导出历史记录失败'
    } as ApiResponse);
  }
});

/**
 * 获取单个历史记录详情
 * GET /api/history/:id
 */
router.get('/:id', authMiddleware, (req: express.Request, res: express.Response) => {
  try {
    const recordId = req.params.id;
    const userId = req.user!.id;

    const record = historyRecords.find(r => r.id === recordId && r.user_id === userId);

    if (!record) {
      return res.status(404).json({
        success: false,
        message: '历史记录未找到'
      } as ApiResponse);
    }

    res.json({
      success: true,
      data: record,
      message: '历史记录详情获取成功'
    } as ApiResponse<GenerationRecord>);

  } catch (error) {
    console.error('获取历史记录详情错误:', error);
    res.status(500).json({
      success: false,
      message: '获取历史记录详情失败'
    } as ApiResponse);
  }
});

export { router as historyRoutes };
