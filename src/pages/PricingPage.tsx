import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Edit3, 
  Check, 
  X, 
  Star, 
  ArrowRight,
  Shield,
  Users,
  Headphones
} from 'lucide-react';
import { useAppStore } from '../stores/useAppStore';

/**
 * 定价页面
 * 展示订阅套餐和定价信息
 */
const PricingPage: React.FC = () => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [, setSelectedPlan] = useState<string>('');
  
  const navigate = useNavigate();
  const { isAuthenticated } = useAppStore();

  const plans = [
    {
      id: 'free',
      name: '免费版',
      description: '适合个人用户体验',
      price: { monthly: 0, yearly: 0 },
      popular: false,
      features: [
        { name: '每日10次内容生成', included: true },
        { name: '基础模板库访问', included: true },
        { name: '历史记录保存', included: true },
        { name: '基础导出功能', included: true },
        { name: '社区支持', included: true },
        { name: '高级模板', included: false },
        { name: '无限生成', included: false },
        { name: '优先客服支持', included: false },
        { name: 'API访问', included: false },
        { name: '团队协作', included: false }
      ],
      buttonText: '免费开始',
      buttonStyle: 'border border-gray-300 text-gray-700 hover:bg-gray-50'
    },
    {
      id: 'premium',
      name: '高级版',
      description: '适合专业用户和小团队',
      price: { monthly: 29, yearly: 290 },
      popular: true,
      features: [
        { name: '无限内容生成', included: true },
        { name: '全部模板库访问', included: true },
        { name: '高级模板和定制', included: true },
        { name: '多格式导出', included: true },
        { name: '优先客服支持', included: true },
        { name: '数据分析报告', included: true },
        { name: '批量操作', included: true },
        { name: 'API访问 (1000次/月)', included: true },
        { name: '团队协作 (5人)', included: false },
        { name: '企业级安全', included: false }
      ],
      buttonText: '立即升级',
      buttonStyle: 'bg-primary-600 text-white hover:bg-primary-700'
    },
    {
      id: 'enterprise',
      name: '企业版',
      description: '适合大型团队和企业',
      price: { monthly: 99, yearly: 990 },
      popular: false,
      features: [
        { name: '无限内容生成', included: true },
        { name: '全部功能访问', included: true },
        { name: '自定义模板开发', included: true },
        { name: '企业级安全保障', included: true },
        { name: '专属客户经理', included: true },
        { name: '团队协作 (无限)', included: true },
        { name: 'API访问 (无限)', included: true },
        { name: '数据私有化部署', included: true },
        { name: '定制化培训', included: true },
        { name: 'SLA保障', included: true }
      ],
      buttonText: '联系销售',
      buttonStyle: 'border border-primary-600 text-primary-600 hover:bg-primary-50'
    }
  ];

  const faqs = [
    {
      question: '如何选择适合的套餐？',
      answer: '免费版适合个人体验，高级版适合专业用户和小团队，企业版适合大型团队。您可以随时升级或降级套餐。'
    },
    {
      question: '是否支持退款？',
      answer: '我们提供7天无理由退款保障。如果您对服务不满意，可以在购买后7天内申请全额退款。'
    },
    {
      question: '年付套餐有什么优惠？',
      answer: '选择年付可享受2个月免费，相当于83折优惠。年付用户还可获得优先技术支持。'
    },
    {
      question: '企业版包含哪些定制服务？',
      answer: '企业版包含专属客户经理、定制化培训、私有化部署、SLA保障等企业级服务。'
    },
    {
      question: '如何升级或取消订阅？',
      answer: '您可以在用户中心随时管理订阅，升级立即生效，取消订阅在当前周期结束后生效。'
    }
  ];

  const handleSelectPlan = (planId: string) => {
    if (planId === 'free') {
      if (isAuthenticated) {
        navigate('/workspace');
      } else {
        navigate('/register');
      }
    } else if (planId === 'enterprise') {
      // 联系销售逻辑
      window.open('mailto:sales@example.com?subject=企业版咨询');
    } else {
      // 跳转到支付页面
      setSelectedPlan(planId);
      // 这里应该集成支付系统
      console.log('跳转到支付页面:', planId, billingCycle);
    }
  };

  const formatPrice = (price: number) => {
    return price === 0 ? '免费' : `¥${price}`;
  };

  const getYearlySavings = (monthlyPrice: number) => {
    if (monthlyPrice === 0) return 0;
    const yearlyPrice = monthlyPrice * 10; // 年付相当于10个月价格
    const monthlySavings = (monthlyPrice * 12 - yearlyPrice) / 12;
    return Math.round(monthlySavings);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 导航栏 */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <Edit3 className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">AI写作助手</span>
            </Link>
            
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

      {/* 页面头部 */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            选择适合您的套餐
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            从免费体验到企业级解决方案，我们为不同需求的用户提供灵活的定价选择
          </p>
          
          {/* 计费周期切换 */}
          <div className="flex items-center justify-center space-x-4 mb-8">
            <span className={`text-sm ${billingCycle === 'monthly' ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
              按月付费
            </span>
            <button
              onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
              className="relative inline-flex h-6 w-11 items-center rounded-full bg-primary-600 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  billingCycle === 'yearly' ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
            <span className={`text-sm ${billingCycle === 'yearly' ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
              按年付费
            </span>
            {billingCycle === 'yearly' && (
              <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
                节省17%
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 定价卡片 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan) => {
            const price = plan.price[billingCycle];
            const savings = billingCycle === 'yearly' ? getYearlySavings(plan.price.monthly) : 0;
            
            return (
              <div
                key={plan.id}
                className={`relative bg-white rounded-2xl shadow-lg border-2 transition-all hover:shadow-xl ${
                  plan.popular ? 'border-primary-500' : 'border-gray-200'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-primary-600 text-white px-4 py-1 rounded-full text-sm font-medium flex items-center space-x-1">
                      <Star className="w-4 h-4" />
                      <span>最受欢迎</span>
                    </div>
                  </div>
                )}
                
                <div className="p-8">
                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                    <p className="text-gray-600 mb-4">{plan.description}</p>
                    
                    <div className="mb-4">
                      <span className="text-4xl font-bold text-gray-900">
                        {formatPrice(price)}
                      </span>
                      {price > 0 && (
                        <span className="text-gray-500 ml-1">
                          /{billingCycle === 'monthly' ? '月' : '年'}
                        </span>
                      )}
                    </div>
                    
                    {savings > 0 && (
                      <div className="text-sm text-green-600 font-medium">
                        年付节省 ¥{savings}/月
                      </div>
                    )}
                  </div>
                  
                  <ul className="space-y-4 mb-8">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start space-x-3">
                        <div className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center mt-0.5 ${
                          feature.included ? 'bg-green-100' : 'bg-gray-100'
                        }`}>
                          {feature.included ? (
                            <Check className="w-3 h-3 text-green-600" />
                          ) : (
                            <X className="w-3 h-3 text-gray-400" />
                          )}
                        </div>
                        <span className={`text-sm ${
                          feature.included ? 'text-gray-900' : 'text-gray-500'
                        }`}>
                          {feature.name}
                        </span>
                      </li>
                    ))}
                  </ul>
                  
                  <button
                    onClick={() => handleSelectPlan(plan.id)}
                    className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${plan.buttonStyle}`}
                  >
                    {plan.buttonText}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 功能对比表 */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">功能详细对比</h2>
            <p className="text-gray-600">了解各套餐的具体功能差异</p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-4 px-6 font-medium text-gray-900">功能</th>
                  <th className="text-center py-4 px-6 font-medium text-gray-900">免费版</th>
                  <th className="text-center py-4 px-6 font-medium text-gray-900">高级版</th>
                  <th className="text-center py-4 px-6 font-medium text-gray-900">企业版</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { name: '每日生成次数', free: '10次', premium: '无限', enterprise: '无限' },
                  { name: '模板库访问', free: '基础', premium: '全部', enterprise: '全部+定制' },
                  { name: '导出格式', free: 'TXT', premium: 'TXT/DOCX/PDF', enterprise: '全格式+定制' },
                  { name: '历史记录', free: '30天', premium: '永久', enterprise: '永久' },
                  { name: '客服支持', free: '社区', premium: '优先邮件', enterprise: '专属经理' },
                  { name: 'API访问', free: '×', premium: '1000次/月', enterprise: '无限' },
                  { name: '团队协作', free: '×', premium: '5人', enterprise: '无限' },
                  { name: '数据安全', free: '标准', premium: '加强', enterprise: '企业级' }
                ].map((row, index) => (
                  <tr key={index} className="border-b border-gray-100">
                    <td className="py-4 px-6 text-gray-900">{row.name}</td>
                    <td className="py-4 px-6 text-center text-gray-600">{row.free}</td>
                    <td className="py-4 px-6 text-center text-gray-600">{row.premium}</td>
                    <td className="py-4 px-6 text-center text-gray-600">{row.enterprise}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 企业级特性 */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">企业级特性</h2>
            <p className="text-gray-600">为企业用户提供专业的解决方案</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">企业级安全</h3>
              <p className="text-gray-600">数据加密传输，私有化部署，符合企业安全标准</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">团队协作</h3>
              <p className="text-gray-600">无限团队成员，权限管理，协作工作流</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Headphones className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">专属支持</h3>
              <p className="text-gray-600">专属客户经理，定制化培训，SLA保障</p>
            </div>
          </div>
        </div>
      </div>

      {/* 常见问题 */}
      <div className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">常见问题</h2>
            <p className="text-gray-600">解答您关心的问题</p>
          </div>
          
          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{faq.question}</h3>
                <p className="text-gray-600">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA区域 */}
      <div className="py-16 gradient-bg text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">准备开始您的AI写作之旅？</h2>
          <p className="text-xl mb-8 text-blue-100">
            立即注册，体验智能写作的强大功能
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/register"
              className="bg-white text-primary-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-50 transition-colors flex items-center justify-center space-x-2"
            >
              <span>免费开始使用</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
            
            <button 
              onClick={() => window.open('mailto:sales@example.com?subject=企业版咨询')}
              className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-primary-600 transition-colors"
            >
              联系销售团队
            </button>
          </div>
        </div>
      </div>

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
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">产品</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/" className="hover:text-white transition-colors">功能特性</Link></li>
                <li><Link to="/pricing" className="hover:text-white transition-colors">定价方案</Link></li>
                <li><a href="#" className="hover:text-white transition-colors">API文档</a></li>
                <li><a href="#" className="hover:text-white transition-colors">更新日志</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">支持</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">帮助中心</a></li>
                <li><a href="#" className="hover:text-white transition-colors">联系我们</a></li>
                <li><a href="#" className="hover:text-white transition-colors">隐私政策</a></li>
                <li><a href="#" className="hover:text-white transition-colors">服务条款</a></li>
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

export default PricingPage;