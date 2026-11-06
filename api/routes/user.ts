import express from 'express';
import bcrypt from 'bcrypt';
import { 
  User, 
  ApiResponse, 
  UserUsageStats,
  Achievement
} from '../types/index.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

import { userRepository } from '../data/userRepository.js';

// 模拟成就数据
const achievements: Achievement[] = [
  {
    id: '1',
    name: '初次尝试',
    description: '完成第一次内容生成',
    icon: 'Trophy',
    condition: 'first_generation',
    reward_points: 10
  },
  {
    id: '2',
    name: '勤奋写手',
    description: '累计生成100篇内容',
    icon: 'Award',
    condition: 'generation_count_100',
    reward_points: 100
  },
  {
    id: '3',
    name: '多样创作',
    description: '使用所有内容类型',
    icon: 'Star',
    condition: 'all_content_types',
    reward_points: 50
  },
  {
    id: '4',
    name: '模板达人',
    description: '创建10个自定义模板',
    icon: 'BookOpen',
    condition: 'template_count_10',
    reward_points: 75
  },
  {
    id: '5',
    name: '连续创作',
    description: '连续7天使用应用',
    icon: 'Calendar',
    condition: 'daily_streak_7',
    reward_points: 30
  }
];

// 模拟用户成就数据
const userAchievements: { [userId: string]: string[] } = {
  'user1': ['1', '2', '3', '5'],
  'user2': ['1']
};

/**
 * 获取用户个人信息
 * GET /api/user/profile
 */
router.get('/profile', authMiddleware, (req: express.Request, res: express.Response) => {
  try {
    const userId = req.user!.id;
    const user = userRepository.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: '用户未找到'
      } as ApiResponse);
    }

    // 返回用户信息（不包含密码）
    const { password_hash, ...userProfile } = user;

    res.json({
      success: true,
      data: userProfile,
      message: '用户信息获取成功'
    } as ApiResponse<Omit<User, 'password_hash'>>);

  } catch (error) {
    console.error('获取用户信息错误:', error);
    res.status(500).json({
      success: false,
      message: '获取用户信息失败'
    } as ApiResponse);
  }
});

/**
 * 更新用户个人信息
 * PUT /api/user/profile
 */
router.put('/profile', authMiddleware, (req: express.Request, res: express.Response) => {
  try {
    const userId = req.user!.id;
    const { name, full_name, avatar_url } = req.body;
    const displayName = name ?? full_name;
    if ((displayName !== undefined && (typeof displayName !== "string" || !displayName.trim())) || (avatar_url !== undefined && typeof avatar_url !== "string")) return res.status(400).json({ success: false, message: "无效的个人信息" });

    const user = userRepository.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: '用户未找到'
      } as ApiResponse);
    }

    // 更新用户信息
    if (displayName !== undefined) {
      user.name = displayName.trim();
    }
    if (avatar_url !== undefined) {
      user.avatar_url = avatar_url;
    }
    user.updated_at = new Date().toISOString();

    const { password_hash, ...userProfile } = user;

    res.json({
      success: true,
      data: userProfile,
      message: '用户信息更新成功'
    } as ApiResponse<Omit<User, 'password_hash'>>);

  } catch (error) {
    console.error('更新用户信息错误:', error);
    res.status(500).json({
      success: false,
      message: '更新用户信息失败'
    } as ApiResponse);
  }
});

/**
 * 修改密码
 * PUT /api/user/password
 */
router.put('/password', authMiddleware, async (req: express.Request, res: express.Response) => {
  try {
    const userId = req.user!.id;
    const { current_password, new_password } = req.body;

    if (typeof current_password !== "string" || typeof new_password !== "string" || !current_password || !new_password) {
      return res.status(400).json({
        success: false,
        message: '请提供当前密码和新密码'
      } as ApiResponse);
    }

    if (new_password.length < 6 || Buffer.byteLength(new_password, 'utf8') > 72 || Buffer.byteLength(current_password, 'utf8') > 72) {
      return res.status(400).json({
        success: false,
        message: '新密码长度至少为6位，密码UTF-8编码不能超过72字节'
      } as ApiResponse);
    }

    const user = userRepository.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: '用户未找到'
      } as ApiResponse);
    }


    // 验证当前密码
    const isCurrentPasswordValid = await bcrypt.compare(current_password, user.password_hash);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: '当前密码不正确'
      } as ApiResponse);
    }

    // 生成新密码哈希
    const saltRounds = 10;
    const newPasswordHash = await bcrypt.hash(new_password, saltRounds);

    // 更新密码
    user.password_hash = newPasswordHash;
    user.updated_at = new Date().toISOString();

    res.json({
      success: true,
      message: '密码修改成功'
    } as ApiResponse);

  } catch (error) {
    console.error('修改密码错误:', error);
    res.status(500).json({
      success: false,
      message: '修改密码失败'
    } as ApiResponse);
  }
});

/**
 * 获取用户使用统计
 * GET /api/user/stats
 */
router.get('/stats', authMiddleware, (req: express.Request, res: express.Response) => {
  try {
    const userId = req.user!.id;
    const user = userRepository.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: '用户未找到'
      } as ApiResponse);
    }

    // 模拟统计数据
    const stats: UserUsageStats = {
      total_generations: user.usage_count,
      total_words: user.usage_count * 350, // 假设平均每次生成350字
      total_templates_used: Math.floor(user.usage_count * 0.8),
      total_templates_created: Math.floor(user.usage_count * 0.1),
      favorite_content_type: 'article',
      average_content_length: 350,
      daily_usage: [
        { date: '2024-01-14', count: 5 },
        { date: '2024-01-15', count: 8 },
        { date: '2024-01-16', count: 12 },
        { date: '2024-01-17', count: 6 },
        { date: '2024-01-18', count: 15 },
        { date: '2024-01-19', count: 9 },
        { date: '2024-01-20', count: 11 }
      ],
      content_type_distribution: {
        article: 45,
        email: 25,
        social: 20,
        report: 10
      },
      monthly_usage: [
        { month: '2023-11', count: 45 },
        { month: '2023-12', count: 67 },
        { month: '2024-01', count: 44 }
      ]
    };

    res.json({
      success: true,
      data: stats,
      message: '使用统计获取成功'
    } as ApiResponse<UserUsageStats>);

  } catch (error) {
    console.error('获取使用统计错误:', error);
    res.status(500).json({
      success: false,
      message: '获取使用统计失败'
    } as ApiResponse);
  }
});

/**
 * 获取用户成就
 * GET /api/user/achievements
 */
router.get('/achievements', authMiddleware, (req: express.Request, res: express.Response) => {
  try {
    const userId = req.user!.id;
    const userAchievementIds = userAchievements[userId] || [];

    // 获取用户已获得的成就
    const earnedAchievements = achievements.filter(achievement => 
      userAchievementIds.includes(achievement.id)
    ).map(achievement => ({
      ...achievement,
      earned: true,
      earned_at: '2024-01-15T10:00:00Z' // 模拟获得时间
    }));

    // 获取未获得的成就
    const availableAchievements = achievements.filter(achievement => 
      !userAchievementIds.includes(achievement.id)
    ).map(achievement => ({
      ...achievement,
      earned: false,
      earned_at: null
    }));

    const allAchievements = [...earnedAchievements, ...availableAchievements];

    // 计算总积分
    const totalPoints = earnedAchievements.reduce((sum, achievement) => 
      sum + achievement.reward_points, 0
    );

    res.json({
      success: true,
      data: {
        achievements: allAchievements,
        total_points: totalPoints,
        earned_count: earnedAchievements.length,
        total_count: achievements.length
      },
      message: '成就信息获取成功'
    } as ApiResponse);

  } catch (error) {
    console.error('获取成就信息错误:', error);
    res.status(500).json({
      success: false,
      message: '获取成就信息失败'
    } as ApiResponse);
  }
});

/**
 * 获取用户订阅信息
 * GET /api/user/subscription
 */
router.get('/subscription', authMiddleware, (req: express.Request, res: express.Response) => {
  try {
    const userId = req.user!.id;
    const user = userRepository.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: '用户未找到'
      } as ApiResponse);
    }

    const usageLimit = user.plan === 'premium' ? null : 10;
    const subscriptionInfo = {
      plan: user.plan, expires_at: null, usage_limit: usageLimit,
      usage_count: user.usage_count,
      usage_remaining: usageLimit === null ? null : Math.max(0, usageLimit - user.usage_count),
      usage_percentage: usageLimit === null ? 0 : Math.round(user.usage_count / usageLimit * 100),
      is_active: user.plan === 'premium', days_remaining: null
    };

    res.json({
      success: true,
      data: subscriptionInfo,
      message: '订阅信息获取成功'
    } as ApiResponse);

  } catch (error) {
    console.error('获取订阅信息错误:', error);
    res.status(500).json({
      success: false,
      message: '获取订阅信息失败'
    } as ApiResponse);
  }
});

/**
 * 更新用户订阅
 * PUT /api/user/subscription
 */
router.put('/subscription', authMiddleware, (_req: express.Request, res: express.Response) => {
  res.status(403).json({ success: false, message: '订阅只能由已验证的服务端支付流程更新；当前原型尚未接入。' });
});

/**
 * 删除用户账户
 * DELETE /api/user/account
 */
router.delete('/account', authMiddleware, async (req: express.Request, res: express.Response) => {
  try {
    const userId = req.user!.id;
    const { password } = req.body;

    if (typeof password !== "string" || !password || Buffer.byteLength(password, 'utf8') > 72) {
      return res.status(400).json({
        success: false,
        message: '请提供密码以确认删除操作'
      } as ApiResponse);
    }

    const user = userRepository.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: '用户未找到'
      } as ApiResponse);
    }


    // 验证密码
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(400).json({
        success: false,
        message: '密码不正确'
      } as ApiResponse);
    }

    // 删除用户（在实际应用中，可能需要软删除或数据备份）
    userRepository.delete(userId);
    
    // 清理用户相关数据
    delete userAchievements[userId];

    res.json({
      success: true,
      message: '账户删除成功'
    } as ApiResponse);

  } catch (error) {
    console.error('删除账户错误:', error);
    res.status(500).json({
      success: false,
      message: '删除账户失败'
    } as ApiResponse);
  }
});

/**
 * 获取用户设置
 * GET /api/user/settings
 */
router.get('/settings', authMiddleware, (_req: express.Request, res: express.Response) => {
  try {
    // 模拟用户设置数据
    const settings = {
      language: 'zh',
      theme: 'light',
      notifications: {
        email: true,
        push: false,
        marketing: true
      },
      privacy: {
        profile_public: false,
        usage_stats_public: false
      },
      preferences: {
        default_content_type: 'article',
        default_length: 'medium',
        default_tone: 'professional',
        auto_save: true
      }
    };

    res.json({
      success: true,
      data: settings,
      message: '用户设置获取成功'
    } as ApiResponse);

  } catch (error) {
    console.error('获取用户设置错误:', error);
    res.status(500).json({
      success: false,
      message: '获取用户设置失败'
    } as ApiResponse);
  }
});

/**
 * 更新用户设置
 * PUT /api/user/settings
 */
router.put('/settings', authMiddleware, (req: express.Request, res: express.Response) => {
  try {
    const settings = req.body;

    // 在实际应用中，这里会保存到数据库
    // 这里只是模拟返回更新后的设置

    res.json({
      success: true,
      data: settings,
      message: '用户设置更新成功'
    } as ApiResponse);

  } catch (error) {
    console.error('更新用户设置错误:', error);
    res.status(500).json({
      success: false,
      message: '更新用户设置失败'
    } as ApiResponse);
  }
});

export { router as userRoutes };