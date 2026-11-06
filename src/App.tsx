import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useAppStore } from './stores/useAppStore';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import WorkspacePage from './pages/WorkspacePage';
import TemplatesPage from './pages/TemplatesPage';
import HistoryPage from './pages/HistoryPage';
import ProfilePage from './pages/ProfilePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import PricingPage from './pages/PricingPage';

/**
 * 主应用组件
 * 配置路由和全局状态管理
 */
function App() {
  useAppStore();

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          {/* 公开路由 */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/pricing" element={<PricingPage />} />
          
          {/* 需要认证的路由 */}
          <Route path="/workspace" element={
            <Layout>
              <WorkspacePage />
            </Layout>
          } />
          <Route path="/templates" element={
            <Layout>
              <TemplatesPage />
            </Layout>
          } />
          <Route path="/history" element={
            <Layout>
              <HistoryPage />
            </Layout>
          } />
          <Route path="/profile" element={
            <Layout>
              <ProfilePage />
            </Layout>
          } />
          
          {/* 404页面 */}
          <Route path="*" element={
            <div className="min-h-screen flex items-center justify-center">
              <div className="text-center">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
                <p className="text-gray-600 mb-8">页面未找到</p>
                <a 
                  href="/" 
                  className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors"
                >
                  返回首页
                </a>
              </div>
            </div>
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;