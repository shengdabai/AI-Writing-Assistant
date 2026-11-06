import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Plus, 
  Eye, 
  Edit, 
  Star, 
  TrendingUp,
  FileText,
  BarChart3,
  Mail,
  Share2,
  Users
} from 'lucide-react';
import { useAppStore } from '../stores/useAppStore';
import { Template, ContentType } from '../types';
import { useNavigate } from 'react-router-dom';

/**
 * 模板库页面
 * 展示和管理写作模板
 */
const TemplatesPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<ContentType | 'all'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'usage' | 'created'>('usage');
  const [, setShowCreateModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  
  const navigate = useNavigate();
  const { templates, categories, loadTemplates, loadCategories } = useAppStore();

  useEffect(() => {
    loadTemplates();
    loadCategories();
  }, [loadTemplates, loadCategories]);

  const contentTypeIcons = {
    article: FileText,
    report: BarChart3,
    email: Mail,
    social: Share2
  };

  const contentTypeNames = {
    article: '文章写作',
    report: '商务报告',
    email: '邮件沟通',
    social: '社交媒体'
  };

  // 过滤和排序模板
  const filteredTemplates = templates
    .filter(template => {
      const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           template.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
      const matchesType = selectedType === 'all' || template.contentType === selectedType;
      
      return matchesSearch && matchesCategory && matchesType;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'usage':
          return b.usageCount - a.usageCount;
        case 'created':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        default:
          return 0;
      }
    });

  const handleUseTemplate = (template: Template) => {
    // 跳转到工作台并使用该模板
    navigate('/workspace', { state: { templateId: template.id } });
  };

  const handlePreviewTemplate = (template: Template) => {
    setSelectedTemplate(template);
  };

  const handleCreateTemplate = () => {
    setShowCreateModal(true);
  };

  const TemplateCard: React.FC<{ template: Template }> = ({ template }) => {
    const Icon = contentTypeIcons[template.contentType];
    
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow card-hover">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
              <Icon className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{template.name}</h3>
              <p className="text-sm text-gray-500">{contentTypeNames[template.contentType]}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-1">
            <button
              onClick={() => handlePreviewTemplate(template)}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <Eye className="w-4 h-4" />
            </button>
            <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
              <Edit className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        <p className="text-gray-600 mb-4 line-clamp-2">{template.description}</p>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <div className="flex items-center space-x-1">
              <Users className="w-4 h-4" />
              <span>{template.usageCount}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Star className="w-4 h-4" />
              <span>4.8</span>
            </div>
          </div>
          
          <button
            onClick={() => handleUseTemplate(template)}
            className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
          >
            使用模板
          </button>
        </div>
      </div>
    );
  };

  const PreviewModal: React.FC = () => {
    if (!selectedTemplate) return null;
    
    const Icon = contentTypeIcons[selectedTemplate.contentType];
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                  <Icon className="w-5 h-5 text-primary-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">{selectedTemplate.name}</h2>
                  <p className="text-sm text-gray-500">{contentTypeNames[selectedTemplate.contentType]}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedTemplate(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
          </div>
          
          <div className="p-6 overflow-y-auto max-h-[60vh]">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-2">模板描述</h3>
                <p className="text-gray-600">{selectedTemplate.description}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-2">提示词模板</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <code className="text-sm text-gray-800">{selectedTemplate.promptTemplate}</code>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-2">默认参数</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-xs text-gray-500">长度</span>
                    <p className="text-sm font-medium">{selectedTemplate.defaultParams.length}</p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500">语调</span>
                    <p className="text-sm font-medium">{selectedTemplate.defaultParams.tone}</p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500">受众</span>
                    <p className="text-sm font-medium">{selectedTemplate.defaultParams.audience}</p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500">使用次数</span>
                    <p className="text-sm font-medium">{selectedTemplate.usageCount}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
            <button
              onClick={() => setSelectedTemplate(null)}
              className="px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
            >
              关闭
            </button>
            <button
              onClick={() => {
                handleUseTemplate(selectedTemplate);
                setSelectedTemplate(null);
              }}
              className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
            >
              使用模板
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col">
      {/* 页面头部 */}
      <div className="bg-white border-b border-gray-200 px-6 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">模板库</h1>
            <p className="text-gray-600 mt-1">选择合适的模板，快速开始您的创作</p>
          </div>
          
          <button
            onClick={handleCreateTemplate}
            className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>创建模板</span>
          </button>
        </div>
        
        {/* 搜索和筛选 */}
        <div className="flex flex-col lg:flex-row gap-4">
          {/* 搜索框 */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索模板名称或描述..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          
          {/* 筛选器 */}
          <div className="flex flex-wrap gap-3">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="all">所有分类</option>
              {categories.map((category) => (
                <option key={category.id} value={category.name}>
                  {category.name}
                </option>
              ))}
            </select>
            
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value as ContentType | 'all')}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="all">所有类型</option>
              <option value="article">文章写作</option>
              <option value="report">商务报告</option>
              <option value="email">邮件沟通</option>
              <option value="social">社交媒体</option>
            </select>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'name' | 'usage' | 'created')}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="usage">按使用量排序</option>
              <option value="name">按名称排序</option>
              <option value="created">按创建时间排序</option>
            </select>
          </div>
        </div>
      </div>
      
      {/* 统计信息 */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>找到 {filteredTemplates.length} 个模板</span>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <TrendingUp className="w-4 h-4" />
              <span>热门模板</span>
            </div>
          </div>
        </div>
      </div>

      {/* 模板网格 */}
      <div className="flex-1 overflow-auto p-6">
        {filteredTemplates.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTemplates.map((template) => (
              <TemplateCard key={template.id} template={template} />
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">没有找到匹配的模板</h3>
              <p className="text-gray-500 mb-4">尝试调整搜索条件或创建新的模板</p>
              <button
                onClick={handleCreateTemplate}
                className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
              >
                创建模板
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* 预览模态框 */}
      <PreviewModal />
    </div>
  );
};

export default TemplatesPage;