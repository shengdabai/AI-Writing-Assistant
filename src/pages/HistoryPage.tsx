import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Heart, 
  Eye, 
  Edit, 
  Trash2, 
  Download, 
  Copy,
  FileText,
  BarChart3,
  Mail,
  Share2,
  Clock,
  MoreVertical
} from 'lucide-react';
import { useAppStore } from '../stores/useAppStore';
import { Generation, ContentType, SearchFilters } from '../types';
import { useNavigate } from 'react-router-dom';

/**
 * 历史记录页面
 * 展示和管理生成的内容历史
 */
const HistoryPage: React.FC = () => {
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [selectedGeneration, setSelectedGeneration] = useState<Generation | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  
  const navigate = useNavigate();
  const { 
    searchFilters, 
    loadHistory, 
    setSearchFilters, 
    getFilteredHistory,
    toggleFavorite,
    deleteGeneration
  } = useAppStore();

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

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

  const contentTypeColors = {
    article: 'bg-blue-100 text-blue-800',
    report: 'bg-green-100 text-green-800',
    email: 'bg-purple-100 text-purple-800',
    social: 'bg-pink-100 text-pink-800'
  };

  const filteredHistory = getFilteredHistory();

  const handleSearch = (query: string) => {
    setSearchFilters({ ...searchFilters, query });
  };

  const handleFilterChange = (filters: Partial<SearchFilters>) => {
    setSearchFilters({ ...searchFilters, ...filters });
  };

  const handleSelectItem = (id: string) => {
    setSelectedItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedItems.length === filteredHistory.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(filteredHistory.map(item => item.id));
    }
  };

  const handleBatchDelete = async () => {
    if (window.confirm(`确定要删除选中的 ${selectedItems.length} 项记录吗？`)) {
      for (const id of selectedItems) {
        await deleteGeneration(id);
      }
      setSelectedItems([]);
    }
  };

  const handleToggleFavorite = async (id: string, event: React.MouseEvent) => {
    event.stopPropagation();
    await toggleFavorite(id);
  };

  const handleDelete = async (id: string, event: React.MouseEvent) => {
    event.stopPropagation();
    if (window.confirm('确定要删除这条记录吗？')) {
      await deleteGeneration(id);
    }
  };

  const handleEdit = (generation: Generation) => {
    // 跳转到工作台并加载该内容
    navigate('/workspace', { state: { generation } });
  };

  const handleCopy = async (content: string, event: React.MouseEvent) => {
    event.stopPropagation();
    try {
      await navigator.clipboard.writeText(content);
      // 这里可以添加成功提示
    } catch (error) {
      console.error('复制失败:', error);
    }
  };

  const handleExport = (generation: Generation) => {
    const blob = new Blob([generation.generatedContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `history-${generation.id}.txt`;
    try {
      document.body.append(link);
      link.click();
    } finally {
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      return '今天';
    } else if (diffDays === 2) {
      return '昨天';
    } else if (diffDays <= 7) {
      return `${diffDays - 1}天前`;
    } else {
      return date.toLocaleDateString('zh-CN');
    }
  };

  const HistoryItem: React.FC<{ generation: Generation; isSelected: boolean }> = ({ 
    generation, 
    isSelected 
  }) => {
    const Icon = contentTypeIcons[generation.contentType];
    
    return (
      <div 
        className={`bg-white rounded-lg border p-4 cursor-pointer transition-all hover:shadow-md ${
          isSelected ? 'border-primary-500 bg-primary-50' : 'border-gray-200'
        }`}
        onClick={() => setSelectedGeneration(generation)}
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-3 flex-1">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => handleSelectItem(generation.id)}
              onClick={(e) => e.stopPropagation()}
              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
              <Icon className="w-5 h-5 text-gray-600" />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  contentTypeColors[generation.contentType]
                }`}>
                  {contentTypeNames[generation.contentType]}
                </span>
                {generation.isFavorite && (
                  <Heart className="w-4 h-4 text-red-500 fill-current" />
                )}
              </div>
              
              <h3 className="font-medium text-gray-900 truncate">
                {generation.prompt}
              </h3>
              
              <p className="text-sm text-gray-500 line-clamp-2 mt-1">
                {generation.generatedContent}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-1 ml-4">
            <button
              onClick={(e) => handleToggleFavorite(generation.id, e)}
              className={`p-2 rounded-lg transition-colors ${
                generation.isFavorite
                  ? 'text-red-600 bg-red-50 hover:bg-red-100'
                  : 'text-gray-400 hover:text-red-500 hover:bg-gray-50'
              }`}
            >
              <Heart className={`w-4 h-4 ${generation.isFavorite ? 'fill-current' : ''}`} />
            </button>
            
            <button
              onClick={(e) => handleCopy(generation.generatedContent, e)}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <Copy className="w-4 h-4" />
            </button>
            
            <div className="relative group">
              <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
                <MoreVertical className="w-4 h-4" />
              </button>
              
              <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 min-w-[120px]">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEdit(generation);
                  }}
                  className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center space-x-2"
                >
                  <Edit className="w-4 h-4" />
                  <span>编辑</span>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedGeneration(generation);
                  }}
                  className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center space-x-2"
                >
                  <Eye className="w-4 h-4" />
                  <span>查看</span>
                </button>
                <button
                  onClick={(e) => handleDelete(generation.id, e)}
                  className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-50 text-red-600 flex items-center space-x-2"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>删除</span>
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <Clock className="w-3 h-3" />
              <span>{formatDate(generation.createdAt)}</span>
            </div>
            <span>{generation.wordCount} 字</span>
          </div>
          
          <div className="flex items-center space-x-2">
            {generation.parameters.tone && (
              <span className="px-2 py-1 bg-gray-100 rounded text-xs">
                {generation.parameters.tone}
              </span>
            )}
          </div>
        </div>
      </div>
    );
  };

  const DetailModal: React.FC = () => {
    if (!selectedGeneration) return null;
    
    const Icon = contentTypeIcons[selectedGeneration.contentType];
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                  <Icon className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    {selectedGeneration.prompt}
                  </h2>
                  <p className="text-sm text-gray-500">
                    {contentTypeNames[selectedGeneration.contentType]} • {formatDate(selectedGeneration.createdAt)}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={(event) => handleToggleFavorite(selectedGeneration.id, event)}
                  className={`p-2 rounded-lg transition-colors ${
                    selectedGeneration.isFavorite
                      ? 'text-red-600 bg-red-50 hover:bg-red-100'
                      : 'text-gray-400 hover:text-red-500 hover:bg-gray-50'
                  }`}
                >
                  <Heart className={`w-5 h-5 ${selectedGeneration.isFavorite ? 'fill-current' : ''}`} />
                </button>
                
                <button
                  onClick={() => setSelectedGeneration(null)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>
            </div>
          </div>
          
          <div className="p-6 overflow-y-auto max-h-[70vh]">
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-2">生成内容</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-800 leading-relaxed whitespace-pre-line">
                    {selectedGeneration.generatedContent}
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <span className="text-xs text-gray-500">字数统计</span>
                  <p className="text-sm font-medium">{selectedGeneration.wordCount} 字</p>
                </div>
                <div>
                  <span className="text-xs text-gray-500">语调风格</span>
                  <p className="text-sm font-medium">{selectedGeneration.parameters.tone}</p>
                </div>
                <div>
                  <span className="text-xs text-gray-500">目标受众</span>
                  <p className="text-sm font-medium">{selectedGeneration.parameters.audience}</p>
                </div>
                <div>
                  <span className="text-xs text-gray-500">内容长度</span>
                  <p className="text-sm font-medium">{selectedGeneration.parameters.length}</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="p-6 border-t border-gray-200 flex justify-between">
            <div className="flex space-x-3">
              <button
                onClick={(event) => handleCopy(selectedGeneration.generatedContent, event)}
                className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <Copy className="w-4 h-4" />
                <span>复制</span>
              </button>
              
              <button onClick={() => handleExport(selectedGeneration)} className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
                <Download className="w-4 h-4" />
                <span>导出</span>
              </button>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => setSelectedGeneration(null)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
              >
                关闭
              </button>
              
              <button
                onClick={() => {
                  handleEdit(selectedGeneration);
                  setSelectedGeneration(null);
                }}
                className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
              >
                编辑内容
              </button>
            </div>
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
            <h1 className="text-2xl font-bold text-gray-900">历史记录</h1>
            <p className="text-gray-600 mt-1">管理您的所有生成内容</p>
          </div>
          
          {selectedItems.length > 0 && (
            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-600">
                已选择 {selectedItems.length} 项
              </span>
              <button
                onClick={handleBatchDelete}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
              >
                <Trash2 className="w-4 h-4" />
                <span>批量删除</span>
              </button>
            </div>
          )}
        </div>
        
        {/* 搜索和筛选 */}
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={searchFilters.query || ''}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="搜索内容或提示词..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          
          <div className="flex gap-3">
            <select
              value={searchFilters.contentType || 'all'}
              onChange={(e) => handleFilterChange({ 
                contentType: e.target.value === 'all' ? undefined : e.target.value as ContentType 
              })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="all">所有类型</option>
              <option value="article">文章写作</option>
              <option value="report">商务报告</option>
              <option value="email">邮件沟通</option>
              <option value="social">社交媒体</option>
            </select>
            
            <select
              value={searchFilters.isFavorite === undefined ? 'all' : searchFilters.isFavorite ? 'favorite' : 'normal'}
              onChange={(e) => handleFilterChange({ 
                isFavorite: e.target.value === 'all' ? undefined : e.target.value === 'favorite' 
              })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="all">全部内容</option>
              <option value="favorite">收藏内容</option>
              <option value="normal">普通内容</option>
            </select>
          </div>
        </div>
      </div>
      
      {/* 工具栏 */}
      <div className="bg-white border-b border-gray-200 px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={selectedItems.length === filteredHistory.length && filteredHistory.length > 0}
                onChange={handleSelectAll}
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="ml-2 text-sm text-gray-600">全选</span>
            </label>
            
            <span className="text-sm text-gray-600">
              共 {filteredHistory.length} 条记录
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode(viewMode === 'list' ? 'grid' : 'list')}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
            >
              {viewMode === 'list' ? '网格视图' : '列表视图'}
            </button>
          </div>
        </div>
      </div>

      {/* 内容列表 */}
      <div className="flex-1 overflow-auto p-6">
        {filteredHistory.length > 0 ? (
          <div className="space-y-4">
            {filteredHistory.map((generation) => (
              <HistoryItem
                key={generation.id}
                generation={generation}
                isSelected={selectedItems.includes(generation.id)}
              />
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Clock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">暂无历史记录</h3>
              <p className="text-gray-500 mb-4">开始创作您的第一个内容吧</p>
              <button
                onClick={() => navigate('/workspace')}
                className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
              >
                开始创作
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* 详情模态框 */}
      <DetailModal />
    </div>
  );
};

export default HistoryPage;
