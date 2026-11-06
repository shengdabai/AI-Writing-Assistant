import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { 
  LoginRequest, 
  RegisterRequest, 
  AuthResponse, 
  ApiResponse, 
  User 
} from '../types/index.js';

const router = express.Router();

import { authConfig } from '../config/auth.js';
import { userRepository } from '../data/userRepository.js';
const JWT_SECRET = authConfig.secret;
const JWT_EXPIRES_IN = authConfig.expiresIn;

/**
 * 生成JWT令牌
 * @param user 用户信息
 * @returns JWT令牌
 */
const generateToken = (user: User): string => {
  return jwt.sign(
    {
      user_id: user.id,
      email: user.email,
      plan: user.plan
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
};

/**
 * 验证邮箱格式
 * @param email 邮箱地址
 * @returns 是否有效
 */
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * 用户注册
 * POST /api/auth/register
 */
router.post('/register', async (req: express.Request, res: express.Response) => {
  try {
    const { name, email: suppliedEmail, password }: RegisterRequest = req.body;
    const email = typeof suppliedEmail === "string" ? suppliedEmail.trim().toLowerCase() : "";

    // 输入验证
    if (typeof name !== "string" || !name.trim() || !email || typeof password !== "string" || !password) {
      return res.status(400).json({
        success: false,
        message: '请提供完整的注册信息'
      } as ApiResponse);
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        message: '请提供有效的邮箱地址'
      } as ApiResponse);
    }

    if (password.length < 6 || Buffer.byteLength(password, 'utf8') > 72) {
      return res.status(400).json({
        success: false,
        message: '密码长度至少为6位，UTF-8编码不能超过72字节'
      } as ApiResponse);
    }

    // 检查邮箱是否已存在
    const existingUser = userRepository.findByEmail(email);
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: '该邮箱已被注册'
      } as ApiResponse);
    }

    // 创建新用户
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser: User = {
      id: uuidv4(),
      email,
      password_hash: hashedPassword,
      name,
      plan: 'free',
      usage_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    if (!userRepository.create(newUser)) {
      return res.status(409).json({ success: false, message: '该邮箱已被注册' });
    }

    // 生成JWT令牌
    const token = generateToken(newUser);

    // 返回用户信息（不包含密码）
    const { password_hash, ...userWithoutPassword } = newUser;
    
    res.status(201).json({
      success: true,
      data: {
        user: userWithoutPassword,
        token
      } as AuthResponse,
      message: '注册成功'
    } as ApiResponse<AuthResponse>);

  } catch (error) {
    console.error('注册错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    } as ApiResponse);
  }
});

/**
 * 用户登录
 * POST /api/auth/login
 */
router.post('/login', async (req: express.Request, res: express.Response) => {
  try {
    const { email, password }: LoginRequest = req.body;

    // 输入验证
    if (typeof email !== "string" || !email.trim() || typeof password !== "string" || !password) {
      return res.status(400).json({
        success: false,
        message: '请提供邮箱和密码'
      } as ApiResponse);
    }

    if (Buffer.byteLength(password, 'utf8') > 72) {
      return res.status(400).json({ success: false, message: '密码UTF-8编码不能超过72字节' });
    }

    // 查找用户
    const user = userRepository.findByEmail(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: '邮箱或密码错误'
      } as ApiResponse);
    }

    // 验证密码 (使用 bcrypt.compare)
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: '邮箱或密码错误'
      } as ApiResponse);
    }

    // 生成JWT令牌
    const token = generateToken(user);

    // 返回用户信息（不包含密码）
    const { password_hash, ...userWithoutPassword } = user;
    
    res.json({
      success: true,
      data: {
        user: userWithoutPassword,
        token
      } as AuthResponse,
      message: '登录成功'
    } as ApiResponse<AuthResponse>);

  } catch (error) {
    console.error('登录错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    } as ApiResponse);
  }
});

/**
 * 验证令牌
 * GET /api/auth/verify
 */
router.get('/verify', (req: express.Request, res: express.Response) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: '未提供认证令牌'
      } as ApiResponse);
    }

    // 验证JWT令牌
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const user = userRepository.findById(decoded.user_id);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: '用户不存在'
      } as ApiResponse);
    }

    // 返回用户信息（不包含密码）
    const { password_hash, ...userWithoutPassword } = user;
    
    res.json({
      success: true,
      data: { user: userWithoutPassword },
      message: '令牌有效'
    } as ApiResponse);

  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({
        success: false,
        message: '无效的认证令牌'
      } as ApiResponse);
    }
    
    console.error('令牌验证错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    } as ApiResponse);
  }
});

/**
 * 刷新令牌
 * POST /api/auth/refresh
 */
router.post('/refresh', (req: express.Request, res: express.Response) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: '未提供认证令牌'
      } as ApiResponse);
    }

    // 仅允许有效且未过期的访问令牌刷新
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const user = userRepository.findById(decoded.user_id);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: '用户不存在'
      } as ApiResponse);
    }

    // 生成新的JWT令牌
    const newToken = generateToken(user);
    
    res.json({
      success: true,
      data: { token: newToken },
      message: '令牌刷新成功'
    } as ApiResponse);

  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) return res.status(401).json({ success: false, message: '无效或过期的认证令牌' });
    console.error('令牌刷新错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    } as ApiResponse);
  }
});

/**
 * 用户登出
 * POST /api/auth/logout
 */
router.post('/logout', (_req: express.Request, res: express.Response) => {
  // 在实际应用中，可能需要将令牌加入黑名单
  res.json({
    success: true,
    message: '登出成功'
  } as ApiResponse);
});

export { router as authRoutes };