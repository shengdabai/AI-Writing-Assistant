import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Edit3, 
  FileText, 
  Mail, 
  Share2, 
  BarChart3,
  Zap,
  Shield,
  Users,
  ArrowRight,
  Star,
  CheckCircle
} from 'lucide-react';
import { useAppStore } from '../stores/useAppStore';

/**
 * 首页组件
 * 展示产品介绍、功能特性和快速体验
 */
const HomePage: React.FC = () => {
  const [quickPrompt, setQuickPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [quickResult, setQuickResult] = useState('');
  const navigate = useNavigate();
  const { isAuthenticated } = useAppStore();

  const features = [
    {
      icon: FileText,
      title: '文章写作',
      description: '新闻文章、博客文章、学术论文等多种文章类型',
      color: 'bg-blue-500'
    },
    {
      icon: BarChart3,
      title: '商务报告',
      description: '商业分析、项目报告、数据总结等专业报告',
      color: 'bg-green-500'
    },
    {
      icon: Mail,
      title: '邮件沟通',
      description: '商务邮件、营销邮件、客服回复等各类邮件',
      color: 'bg-purple-500'
    },
    {
      icon: Share2,
      title: '社交媒体',
      description: '微博文案、朋友圈内容、广告创意等社交内容',
      color: 'bg-pink-500'
    }
  ];

  const benefits = [
    {
      icon: Zap,
      title: '高效快速',
      description: '几秒钟内生成高质量内容，大幅提升工作效率'
    },
    {
      icon: Shield,
      title: '质量保证',
      description: '基于先进AI技术，确保内容的专业性和准确性'
    },
    {
      icon: Users,
      title: '多场景适用',
      description: '适合各行各业，满足不同用户的写作需求'
    }
  ];

  const testimonials = [
    {
      name: '张经理',
      role: '市场营销',
      content: 'AI写作助手帮我节省了大量时间，生成的营销文案质量很高，转化率明显提升。',
      rating: 5
    },
    {
      name: '李编辑',
      role: '内容创作',
      content: '作为内容创作者，这个工具让我的创作效率翻倍，而且能提供很多新的创意角度。',
      rating: 5
    },
    {
      name: '王总监',
      role: '企业管理',
      content: '团队使用后，报告撰写效率大幅提升，内容质量也更加专业和规范。',
      rating: 5
    }
  ];

  const handleQuickGenerate = async () => {
    if (!quickPrompt.trim()) return;
    
    setIsGenerating(true);
    try {
      // 模拟快速生成
      await new Promise(resolve => setTimeout(resolve, 2000));
      const result = `基于您的输入"${quickPrompt}"，这里是AI生成的示例内容：\n\n这是一个关于${quickPrompt}的精彩内容。AI写作助手能够根据您的需求，快速生成高质量、有针对性的文案内容。无论是商务报告、营销文案还是社交媒体内容，我们都能为您提供专业的写作支持。\n\n想要体验更多功能？立即注册开始您的智能写作之旅！`;
      setQuickResult(result);
    } catch (error) {
      console.error('生成失败:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGetStarted = () => {
    if (isAuthenticated) {
      navigate('/workspace');
    } else {
      navigate('/register');
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* 导航栏 */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <Edit3 className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">AI写作助手</span>
            </div>
            
            <div className="flex items-center space-x-4">
              {isAuthenticated ? (
                <Link 
                  to="/workspace"
                  className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
                >
                  进入工作台
                </Link>
              ) : (
                <>
                  <Link 
                    to="/login"
                    className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md transition-colors"
                  >
                    登录
                  </Link>
                  <Link 
                    to="/register"
                    className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    免费注册
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* 英雄区域 */}
      <section className="gradient-bg text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 animate-fade-in">
            AI驱动的智能写作平台
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto animate-fade-in">
            让人工智能成为您的写作伙伴，快速生成高质量的文章、报告、邮件和社交媒体内容
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12 animate-fade-in">
            <button 
              onClick={handleGetStarted}
              className="bg-white text-primary-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-50 transition-colors flex items-center space-x-2"
            >
              <span>立即开始</span>
              <ArrowRight className="w-5 h-5" />
            </button>
            <Link 
              to="/pricing"
              className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-primary-600 transition-colors"
            >
              查看定价
            </Link>
          </div>
          
          {/* 快速体验区域 */}
          <div className="max-w-2xl mx-auto bg-white/10 backdrop-blur-sm rounded-xl p-6 animate-fade-in">
            <h3 className="text-lg font-semibold mb-4">快速体验 - 输入您的想法</h3>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={quickPrompt}
                onChange={(e) => setQuickPrompt(e.target.value)}
                placeholder="例如：写一篇关于人工智能发展的文章"
                className="flex-1 px-4 py-3 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white"
                onKeyPress={(e) => e.key === 'Enter' && handleQuickGenerate()}
              />
              <button
                onClick={handleQuickGenerate}
                disabled={isGenerating || !quickPrompt.trim()}
                className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center min-w-[100px]"
              >
                {isGenerating ? (
                  <div className="spinner" />
                ) : (
                  '生成'
                )}
              </button>
            </div>
            
            {quickResult && (
              <div className="mt-4 p-4 bg-white/20 rounded-lg text-left animate-fade-in">
                <h4 className="font-semibold mb-2">生成结果：</h4>
                <p className="text-sm leading-relaxed whitespace-pre-line">{quickResult}</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 功能特性 */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              四大核心功能
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              覆盖您日常工作中的各种写作需求，让AI成为您的专业写作助手
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow card-hover">
                  <div className={`w-12 h-12 ${feature.color} rounded-lg flex items-center justify-center mb-4`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 优势特点 */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              为什么选择我们
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              基于先进的AI技术，为您提供专业、高效、可靠的写作解决方案
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <div key={index} className="text-center">
                  <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-8 h-8 text-primary-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{benefit.title}</h3>
                  <p className="text-gray-600">{benefit.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 用户评价 */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              用户好评如潮
            </h2>
            <p className="text-xl text-gray-600">
              已有数万用户选择我们的AI写作助手
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-4 italic">"{testimonial.content}"</p>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center mr-3">
                    <span className="text-primary-600 font-semibold">
                      {testimonial.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{testimonial.name}</p>
                    <p className="text-sm text-gray-500">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA区域 */}
      <section className="py-20 gradient-bg text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            准备好开始您的智能写作之旅了吗？
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            立即注册，免费体验AI写作助手的强大功能
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={handleGetStarted}
              className="bg-white text-primary-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-50 transition-colors flex items-center justify-center space-x-2"
            >
              <span>免费开始使用</span>
              <ArrowRight className="w-5 h-5" />
            </button>
            <Link 
              to="/pricing"
              className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-primary-600 transition-colors"
            >
              查看定价方案
            </Link>
          </div>
        </div>
      </section>

      {/* 页脚 */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                  <Edit3 className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">AI写作助手</span>
              </div>
              <p className="text-gray-400 mb-4 max-w-md">
                基于先进AI技术的智能写作平台，帮助用户快速生成高质量内容，提升工作效率。
              </p>
              <div className="flex items-center space-x-2 text-sm text-gray-400">
                <CheckCircle className="w-4 h-4" />
                <span>已服务 10,000+ 用户</span>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">产品功能</h3>
              <ul className="space-y-2 text-gray-400">
                <li>文章写作</li>
                <li>商务报告</li>
                <li>邮件沟通</li>
                <li>社交媒体</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">帮助支持</h3>
              <ul className="space-y-2 text-gray-400">
                <li>使用指南</li>
                <li>常见问题</li>
                <li>联系客服</li>
                <li>意见反馈</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 AI写作助手. 保留所有权利.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;