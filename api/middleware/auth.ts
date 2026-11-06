import express from 'express';
import jwt from 'jsonwebtoken';
import { ApiResponse, JWTPayload } from '../types/index.js';

import { authConfig } from '../config/auth.js';
import { userRepository } from '../data/userRepository.js';
const JWT_SECRET = authConfig.secret;

/**
 * JWT认证中间件
 * 验证请求头中的JWT令牌并设置用户信息
 */
export const authMiddleware = (
  req: express.Request, 
  res: express.Response, 
  next: express.NextFunction
) => {
  try {
    // 从请求头获取令牌
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: '未提供认证令牌'
      } as ApiResponse);
    }

    const token = authHeader.substring(7); // 移除 'Bearer ' 前缀

    // 验证JWT令牌
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    
    // 查找用户
    const user = userRepository.findById(decoded.user_id);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: '用户不存在'
      } as ApiResponse);
    }

    // 将用户信息添加到请求对象
    const { password_hash, ...publicUser } = user;
    req.user = publicUser;
    
    next();
    
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({
        success: false,
        message: '无效的认证令牌'
      } as ApiResponse);
    }
    
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({
        success: false,
        message: '认证令牌已过期'
      } as ApiResponse);
    }
    
    console.error('认证中间件错误:', error);
    return res.status(500).json({
      success: false,
      message: '服务器内部错误'
    } as ApiResponse);
  }
};

/**
 * 可选认证中间件
 * 如果提供了令牌则验证，否则继续执行
 */
export const optionalAuthMiddleware = (
  req: express.Request, 
  res: express.Response, 
  next: express.NextFunction
) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    // 没有提供令牌，继续执行
    return next();
  }

  // 有令牌，使用标准认证中间件
  authMiddleware(req, res, next);
};

/**
 * 管理员权限中间件
 * 验证用户是否具有管理员权限
 */
export const adminMiddleware = (
  req: express.Request, 
  res: express.Response, 
  _next: express.NextFunction
) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: '需要认证'
    } as ApiResponse);
  }

  // 检查是否为管理员 (这里简化处理，实际应该有专门的角色字段)
  // No trusted administrator role exists in this prototype. Email is not authorization.
  {
    return res.status(403).json({
      success: false,
      message: '需要管理员权限'
    } as ApiResponse);
  }

};

/**
 * 高级用户权限中间件
 * 验证用户是否为高级用户
 */
export const premiumMiddleware = (
  req: express.Request, 
  res: express.Response, 
  next: express.NextFunction
) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: '需要认证'
    } as ApiResponse);
  }

  if (req.user.plan !== 'premium') {
    return res.status(403).json({
      success: false,
      message: '需要高级用户权限'
    } as ApiResponse);
  }

  next();
};

/**
 * 使用限制中间件
 * 检查用户的使用限制
 */
export const rateLimitMiddleware = (
  req: express.Request, 
  res: express.Response, 
  next: express.NextFunction
) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: '需要认证'
    } as ApiResponse);
  }

  // 高级用户无限制
  if (req.user.plan === 'premium') {
    return next();
  }

  // 免费用户检查每日限制
  const dailyUsage = req.user.usage_count || 0;
  
  if (dailyUsage >= 10) {
    return res.status(429).json({
      success: false,
      message: '免费用户每日使用次数已达上限，请升级到高级版'
    } as ApiResponse);
  }

  next();
};