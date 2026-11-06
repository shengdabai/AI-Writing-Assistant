import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Edit3, 
  BookOpen, 
  History, 
  User, 
  Menu, 
  X, 
  LogOut,
  Bell,
  Settings
} from 'lucide-react';
import { useAppStore } from '../stores/useAppStore';

interface LayoutProps {
  children: React.ReactNode;
}

/**
 * 主布局组件
 * 包含侧边栏导航和顶部工具栏
 */
const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAppStore();

  const navigation = [
    { name: '工作台', href: '/workspace', icon: Edit3 },
    { name: '模板库', href: '/templates', icon: BookOpen },
    { name: '历史记录', href: '/history', icon: History },
    { name: '用户中心', href: '/profile', icon: User },
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* 移动端侧边栏遮罩 */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* 侧边栏 */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <Edit3 className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">AI写作助手</span>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1 rounded-md hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* 导航菜单 */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`
                    flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors
                    ${isActive 
                      ? 'bg-primary-50 text-primary-700 border-r-2 border-primary-600' 
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }
                  `}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* 用户信息 */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-primary-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.name || '用户'}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {user?.plan === 'premium' ? '高级用户' : '免费用户'}
                </p>
              </div>
            </div>
            
            <div className="flex space-x-2">
              <button className="flex-1 flex items-center justify-center px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-md transition-colors">
                <Settings className="w-4 h-4 mr-2" />
                设置
              </button>
              <button 
                onClick={handleLogout}
                className="flex-1 flex items-center justify-center px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-md transition-colors"
              >
                <LogOut className="w-4 h-4 mr-2" />
                退出
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 主内容区域 */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* 顶部工具栏 */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between h-16 px-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-md hover:bg-gray-100"
              >
                <Menu className="w-5 h-5" />
              </button>
              
              <div className="hidden lg:block">
                <h1 className="text-xl font-semibold text-gray-900">
                  {navigation.find(item => item.href === location.pathname)?.name || 'AI写作助手'}
                </h1>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* 通知按钮 */}
              <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
                <Bell className="w-5 h-5" />
              </button>
              
              {/* 用户菜单 */}
              <div className="flex items-center space-x-3">
                <div className="hidden md:block text-right">
                  <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                  <p className="text-xs text-gray-500">
                    今日已生成 {user?.usageCount || 0} 次
                  </p>
                </div>
                <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-primary-600" />
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* 页面内容 */}
        <main className="flex-1 overflow-auto">
          <div className="h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;