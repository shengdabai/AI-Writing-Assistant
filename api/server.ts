import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { authRoutes } from './routes/auth.js';
import { contentRoutes } from './routes/content.js';
import { templateRoutes } from './routes/templates.js';
import { historyRoutes } from './routes/history.js';
import { userRoutes } from './routes/user.js';

/**
 * Express服务器配置
 * 提供AI写作助手的后端API服务
 */
const app = express();
const PORT = process.env.PORT || 3001;

// 中间件配置
app.use(helmet()); // 安全头部
app.use(cors()); // 跨域支持
app.use(morgan('combined')); // 请求日志
app.use(express.json({ limit: '10mb' })); // JSON解析
app.use(express.urlencoded({ extended: true })); // URL编码解析

// 健康检查端点
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'AI写作助手API',
    version: '1.0.0'
  });
});

// API路由
app.use('/api/auth', authRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/templates', templateRoutes);
app.use('/api/history', historyRoutes);
app.use('/api/user', userRoutes);

// 404处理
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API端点未找到',
    path: req.originalUrl
  });
});

// 全局错误处理
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('服务器错误:', err);
  
  res.status(err.status || 500).json({
    success: false,
    message: err.message || '服务器内部错误',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 启动服务器（仅在非Vercel环境下）
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`🚀 AI写作助手API服务器运行在端口 ${PORT}`);
    console.log(`📖 API文档: http://localhost:${PORT}/api/health`);
    console.log(`🌍 环境: ${process.env.NODE_ENV || 'development'}`);
  });
}

// 导出app实例用于Vercel
export { app };
export default app;