import React, { useState, useEffect } from 'react';
import { 
  User, 
  Settings, 
  Crown, 
  TrendingUp, 
  FileText, 
  Heart, 
  Calendar,
  Award,
  BarChart3,
  Activity,
  Target,
  Star,
  Trophy,
  Medal,
  Gift
} from 'lucide-react';
import { useAppStore } from '../stores/useAppStore';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Cell,
  LineChart,
  Line,
  Pie
} from 'recharts';

/**
 * 用户中心页面
 * 展示用户信息、使用统计和成就
 */
const ProfilePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'stats' | 'achievements' | 'settings'>('overview');
  // const [timeRange] = useState<'7d' | '30d' | '90d'>('30d');
  
  const { 
    user, 
    usageStats, 
    achievements, 
    loadUsageStats, 
    loadAchievements 
  } = useAppStore();

  useEffect(() => {
    loadUsageStats();
    loadAchievements();
  }, [loadUsageStats, loadAchievements]);

  const tabs = [
    { id: 'overview', name: '概览', icon: BarChart3 },
    { id: 'stats', name: '统计', icon: TrendingUp },
    { id: 'achievements', name: '成就', icon: Award },
    { id: 'settings', name: '设置', icon: Settings }
  ];

  const COLORS = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b'];

  const OverviewTab: React.FC = () => {
    if (!user || !usageStats) return null;
    
    const stats = [
      {
        name: '总生成次数',
        value: usageStats.totalGenerations,
        icon: FileText,
        color: 'bg-blue-500',
        change: '+12%'
      },
      {
        name: '总字数',
        value: usageStats.totalWords.toLocaleString(),
        icon: Activity,
        color: 'bg-green-500',
        change: '+8%'
      },
      {
        name: '收藏内容',
        value: usageStats.favoriteCount,
        icon: Heart,
        color: 'bg-red-500',
        change: '+5%'
      },
      {
        name: '使用天数',
        value: usageStats.dailyUsage.length,
        icon: Calendar,
        color: 'bg-purple-500',
        change: '+2%'
      }
    ];
    
    return (
      <div className="space-y-6">
        {/* 用户信息卡片 */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                <User className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">{user.name}</h2>
                <p className="text-primary-100">{user.email}</p>
                <div className="flex items-center space-x-2 mt-2">
                  <Crown className="w-4 h-4" />
                  <span className="text-sm">
                    {user.plan === 'premium' ? '高级用户' : '免费用户'}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-3xl font-bold">{user.usageCount}</div>
              <div className="text-primary-100 text-sm">今日使用次数</div>
            </div>
          </div>
        </div>
        
        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="bg-white rounded-lg p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-sm text-green-600 font-medium">{stat.change}</span>
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</div>
                <div className="text-sm text-gray-500">{stat.name}</div>
              </div>
            );
          })}
        </div>
        
        {/* 最近活动 */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">最近7天使用情况</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={usageStats.dailyUsage}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(value) => new Date(value).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })}
                />
                <YAxis />
                <Tooltip 
                  labelFormatter={(value) => new Date(value).toLocaleDateString('zh-CN')}
                  formatter={(value) => [value, '生成次数']}
                />
                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    );
  };

  const StatsTab: React.FC = () => {
    if (!usageStats) return null;
    
    return (
      <div className="space-y-6">
        {/* 内容类型分布 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">内容类型分布</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={usageStats.typeDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="count"
                  >
                    {usageStats.typeDistribution.map((_entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value, name) => [value, `${name}次`]} />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
            
            <div className="mt-4 space-y-2">
              {usageStats.typeDistribution.map((item, index) => (
                <div key={item.type} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="text-sm text-gray-600">
                      {item.type === 'article' ? '文章写作' : 
                       item.type === 'report' ? '商务报告' :
                       item.type === 'email' ? '邮件沟通' : '社交媒体'}
                    </span>
                  </div>
                  <div className="text-sm font-medium text-gray-900">
                    {item.count} ({item.percentage}%)
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">使用趋势</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={usageStats.dailyUsage}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(value) => new Date(value).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })}
                  />
                  <YAxis />
                  <Tooltip 
                    labelFormatter={(value) => new Date(value).toLocaleDateString('zh-CN')}
                    formatter={(value) => [value, '生成次数']}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="count" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
        
        {/* 详细统计 */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">详细统计</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary-600 mb-2">
                {Math.round(usageStats.totalWords / usageStats.totalGenerations)}
              </div>
              <div className="text-sm text-gray-500">平均每次生成字数</div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {Math.round((usageStats.favoriteCount / usageStats.totalGenerations) * 100)}%
              </div>
              <div className="text-sm text-gray-500">内容收藏率</div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">
                {Math.round(usageStats.totalGenerations / usageStats.dailyUsage.length)}
              </div>
              <div className="text-sm text-gray-500">日均生成次数</div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const AchievementsTab: React.FC = () => {
    const unlockedAchievements = achievements.filter(a => a.unlockedAt);
    const lockedAchievements = achievements.filter(a => !a.unlockedAt);
    
    const AchievementCard: React.FC<{ achievement: any; isUnlocked: boolean }> = ({ 
      achievement, 
      isUnlocked 
    }) => {
      const iconMap: { [key: string]: any } = {
        Star: Star,
        Trophy: Trophy,
        Heart: Heart,
        Medal: Medal,
        Gift: Gift,
        Target: Target
      };
      
      const Icon = iconMap[achievement.icon] || Star;
      
      return (
        <div className={`rounded-lg p-6 border-2 transition-all ${
          isUnlocked 
            ? 'border-yellow-200 bg-yellow-50' 
            : 'border-gray-200 bg-gray-50'
        }`}>
          <div className="flex items-center space-x-4">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
              isUnlocked 
                ? 'bg-yellow-100 text-yellow-600' 
                : 'bg-gray-200 text-gray-400'
            }`}>
              <Icon className="w-6 h-6" />
            </div>
            
            <div className="flex-1">
              <h3 className={`font-semibold ${
                isUnlocked ? 'text-gray-900' : 'text-gray-500'
              }`}>
                {achievement.name}
              </h3>
              <p className={`text-sm ${
                isUnlocked ? 'text-gray-600' : 'text-gray-400'
              }`}>
                {achievement.description}
              </p>
              {isUnlocked && achievement.unlockedAt && (
                <p className="text-xs text-yellow-600 mt-1">
                  获得于 {new Date(achievement.unlockedAt).toLocaleDateString('zh-CN')}
                </p>
              )}
            </div>
            
            {isUnlocked && (
              <div className="text-yellow-500">
                <Trophy className="w-6 h-6" />
              </div>
            )}
          </div>
        </div>
      );
    };
    
    return (
      <div className="space-y-6">
        {/* 成就概览 */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">成就概览</h3>
            <div className="text-sm text-gray-500">
              {unlockedAchievements.length} / {achievements.length} 已解锁
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-600 mb-2">
                {unlockedAchievements.length}
              </div>
              <div className="text-sm text-gray-500">已获得成就</div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {Math.round((unlockedAchievements.length / achievements.length) * 100)}%
              </div>
              <div className="text-sm text-gray-500">完成度</div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {lockedAchievements.length}
              </div>
              <div className="text-sm text-gray-500">待解锁</div>
            </div>
          </div>
        </div>
        
        {/* 已获得成就 */}
        {unlockedAchievements.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">已获得成就</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {unlockedAchievements.map((achievement) => (
                <AchievementCard 
                  key={achievement.id} 
                  achievement={achievement} 
                  isUnlocked={true} 
                />
              ))}
            </div>
          </div>
        )}
        
        {/* 待解锁成就 */}
        {lockedAchievements.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">待解锁成就</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {lockedAchievements.map((achievement) => (
                <AchievementCard 
                  key={achievement.id} 
                  achievement={achievement} 
                  isUnlocked={false} 
                />
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const SettingsTab: React.FC = () => {
    const [settings, setSettings] = useState({
      notifications: true,
      emailUpdates: false,
      autoSave: true,
      theme: 'light'
    });
    
    return (
      <div className="space-y-6">
        {/* 账户设置 */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">账户设置</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                用户名
              </label>
              <input
                type="text"
                defaultValue={user?.name}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                邮箱地址
              </label>
              <input
                type="email"
                defaultValue={user?.email}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                密码
              </label>
              <button className="text-primary-600 hover:text-primary-700 text-sm">
                修改密码
              </button>
            </div>
          </div>
        </div>
        
        {/* 偏好设置 */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">偏好设置</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-gray-900">桌面通知</div>
                <div className="text-sm text-gray-500">接收生成完成通知</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.notifications}
                  onChange={(e) => setSettings(prev => ({ ...prev, notifications: e.target.checked }))}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-gray-900">邮件更新</div>
                <div className="text-sm text-gray-500">接收产品更新和优惠信息</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.emailUpdates}
                  onChange={(e) => setSettings(prev => ({ ...prev, emailUpdates: e.target.checked }))}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-gray-900">自动保存</div>
                <div className="text-sm text-gray-500">自动保存生成的内容</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.autoSave}
                  onChange={(e) => setSettings(prev => ({ ...prev, autoSave: e.target.checked }))}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
            </div>
          </div>
        </div>
        
        {/* 订阅管理 */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">订阅管理</h3>
          <div className="flex items-center justify-between p-4 bg-primary-50 rounded-lg">
            <div>
              <div className="font-medium text-gray-900">当前套餐</div>
              <div className="text-sm text-gray-500">
                {user?.plan === 'premium' ? '高级用户 - 无限生成' : '免费用户 - 每日限量'}
              </div>
            </div>
            <button className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors">
              {user?.plan === 'premium' ? '管理订阅' : '升级套餐'}
            </button>
          </div>
        </div>
        
        {/* 保存按钮 */}
        <div className="flex justify-end">
          <button className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors">
            保存设置
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col">
      {/* 标签导航 */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-6">
          <nav className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>
      
      {/* 内容区域 */}
      <div className="flex-1 overflow-auto p-6">
        {activeTab === 'overview' && <OverviewTab />}
        {activeTab === 'stats' && <StatsTab />}
        {activeTab === 'achievements' && <AchievementsTab />}
        {activeTab === 'settings' && <SettingsTab />}
      </div>
    </div>
  );
};

export default ProfilePage;