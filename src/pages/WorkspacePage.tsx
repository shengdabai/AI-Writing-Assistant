import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  BarChart3, 
  Mail, 
  Share2,
  Settings,
  Download,
  Copy,
  RefreshCw,
  Heart,
  Wand2
} from 'lucide-react';
import { useAppStore } from '../stores/useAppStore';
import { ContentType, GenerationParams } from '../types';

/**
 * 写作工作台页面
 * 主要的内容生成界面，支持多种内容类型
 */
const WorkspacePage: React.FC = () => {
  const [selectedType, setSelectedType] = useState<ContentType>('article');
  const [prompt, setPrompt] = useState('');
  const [parameters, setParameters] = useState<GenerationParams>({
    length: 'medium',
    tone: 'professional',
    audience: 'general',
    language: 'zh'
  });
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [generatedContent, setGeneratedContent] = useState('');
  const [wordCount, setWordCount] = useState(0);
  const [showSettings, setShowSettings] = useState(false);

  const { 
    templates, 
    isGenerating, 
    currentGeneration,
    generateContent,
    toggleFavorite
  } = useAppStore();

  const contentTypes = [
    {
      type: 'article' as ContentType,
      name: '文章写作',
      icon: FileText,
      description: '新闻文章、博客文章、学术论文',
      color: 'bg-blue-500'
    },
    {
      type: 'report' as ContentType,
      name: '商务报告',
      icon: BarChart3,
      description: '商业分析、项目报告、数据总结',
      color: 'bg-green-500'
    },
    {
      type: 'email' as ContentType,
      name: '邮件沟通',
      icon: Mail,
      description: '商务邮件、营销邮件、客服回复',
      color: 'bg-purple-500'
    },
    {
      type: 'social' as ContentType,
      name: '社交媒体',
      icon: Share2,
      description: '微博文案、朋友圈、广告创意',
      color: 'bg-pink-500'
    }
  ];

  const lengthOptions = [
    { value: 'short', label: '简短 (100-300字)', description: '适合摘要、简介' },
    { value: 'medium', label: '中等 (300-800字)', description: '适合文章、报告' },
    { value: 'long', label: '详细 (800-1500字)', description: '适合深度分析' }
  ];

  const toneOptions = [
    { value: 'formal', label: '正式', description: '严谨、专业的语调' },
    { value: 'casual', label: '轻松', description: '友好、随意的语调' },
    { value: 'professional', label: '专业', description: '权威、可信的语调' },
    { value: 'friendly', label: '友好', description: '亲切、温暖的语调' }
  ];

  const audienceOptions = [
    { value: 'general', label: '大众', description: '普通读者群体' },
    { value: 'professional', label: '专业人士', description: '行业专家、从业者' },
    { value: 'academic', label: '学术', description: '研究人员、学者' },
    { value: 'marketing', label: '营销', description: '潜在客户、消费者' }
  ];

  // 获取当前类型的模板
  const currentTypeTemplates = templates.filter(t => t.contentType === selectedType);

  // 更新字数统计
  useEffect(() => {
    setWordCount(generatedContent.length);
  }, [generatedContent]);

  // 当选择模板时，更新参数
  useEffect(() => {
    if (selectedTemplate) {
      const template = templates.find(t => t.id === selectedTemplate);
      if (template) {
        setParameters(template.defaultParams);
      }
    }
  }, [selectedTemplate, templates]);

  // 当有新生成内容时，更新显示
  useEffect(() => {
    if (currentGeneration) {
      setGeneratedContent(currentGeneration.generatedContent);
      setSelectedType(currentGeneration.contentType);
      setPrompt(currentGeneration.prompt);
      setParameters(currentGeneration.parameters);
    }
  }, [currentGeneration]);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    
    const result = await generateContent(
      selectedType,
      prompt,
      parameters,
      selectedTemplate || undefined
    );
    
    if (result) {
      setGeneratedContent(result.generatedContent);
    }
  };

  const handleRegenerate = () => {
    if (generatedContent) {
      handleGenerate();
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generatedContent);
      // 这里可以添加成功提示
    } catch (error) {
      console.error('复制失败:', error);
    }
  };

  // const handleSave = async () => {
  //   if (currentGeneration) {
  //     // 保存到历史记录的逻辑已在store中处理
  //     console.log('内容已保存');
  //   }
  // };

  const handleToggleFavorite = async () => {
    if (currentGeneration) {
      await toggleFavorite(currentGeneration.id);
    }
  };

  const handleExport = (format: 'txt' | 'docx' | 'pdf') => {
    // 导出功能实现
    const blob = new Blob([generatedContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ai-generated-content.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="h-full flex">
      {/* 左侧参数设置面板 */}
      <div className={`bg-white border-r border-gray-200 transition-all duration-300 ${
        showSettings ? 'w-80' : 'w-16'
      }`}>
        <div className="p-4">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="w-full flex items-center justify-center p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <Settings className="w-5 h-5" />
            {showSettings && <span className="ml-2">设置</span>}
          </button>
        </div>

        {showSettings && (
          <div className="px-4 pb-4 space-y-6 overflow-y-auto max-h-[calc(100vh-120px)]">
            {/* 内容类型选择 */}
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-3">内容类型</h3>
              <div className="grid grid-cols-2 gap-2">
                {contentTypes.map((type) => {
                  const Icon = type.icon;
                  return (
                    <button
                      key={type.type}
                      onClick={() => setSelectedType(type.type)}
                      className={`p-3 rounded-lg border-2 transition-colors ${
                        selectedType === type.type
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <Icon className={`w-5 h-5 mx-auto mb-1 ${
                        selectedType === type.type ? 'text-primary-600' : 'text-gray-600'
                      }`} />
                      <div className="text-xs font-medium text-gray-900">
                        {type.name}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 模板选择 */}
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-3">选择模板</h3>
              <select
                value={selectedTemplate}
                onChange={(e) => setSelectedTemplate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">自定义内容</option>
                {currentTypeTemplates.map((template) => (
                  <option key={template.id} value={template.id}>
                    {template.name}
                  </option>
                ))}
              </select>
            </div>

            {/* 长度设置 */}
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-3">内容长度</h3>
              <div className="space-y-2">
                {lengthOptions.map((option) => (
                  <label key={option.value} className="flex items-center">
                    <input
                      type="radio"
                      name="length"
                      value={option.value}
                      checked={parameters.length === option.value}
                      onChange={(e) => setParameters(prev => ({ ...prev, length: e.target.value as any }))}
                      className="mr-2"
                    />
                    <div>
                      <div className="text-sm font-medium">{option.label}</div>
                      <div className="text-xs text-gray-500">{option.description}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* 语调设置 */}
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-3">语调风格</h3>
              <div className="grid grid-cols-2 gap-2">
                {toneOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setParameters(prev => ({ ...prev, tone: option.value as any }))}
                    className={`p-2 text-sm rounded-lg border transition-colors ${
                      parameters.tone === option.value
                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 目标受众 */}
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-3">目标受众</h3>
              <select
                value={parameters.audience}
                onChange={(e) => setParameters(prev => ({ ...prev, audience: e.target.value as any }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                {audienceOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* 主内容区域 */}
      <div className="flex-1 flex flex-col">
        {/* 顶部工具栏 */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h2 className="text-lg font-semibold text-gray-900">
                {contentTypes.find(t => t.type === selectedType)?.name}
              </h2>
              {generatedContent && (
                <span className="text-sm text-gray-500">
                  {wordCount} 字
                </span>
              )}
            </div>
            
            {generatedContent && (
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleToggleFavorite}
                  className={`p-2 rounded-lg transition-colors ${
                    currentGeneration?.isFavorite
                      ? 'text-red-600 bg-red-50 hover:bg-red-100'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Heart className={`w-5 h-5 ${
                    currentGeneration?.isFavorite ? 'fill-current' : ''
                  }`} />
                </button>
                <button
                  onClick={handleCopy}
                  className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <Copy className="w-5 h-5" />
                </button>
                <button
                  onClick={handleRegenerate}
                  disabled={isGenerating}
                  className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`w-5 h-5 ${isGenerating ? 'animate-spin' : ''}`} />
                </button>
                <div className="relative group">
                  <button className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
                    <Download className="w-5 h-5" />
                  </button>
                  <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                    <button
                      onClick={() => handleExport('txt')}
                      className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-50"
                    >
                      导出为 TXT
                    </button>
                    <button
                      onClick={() => handleExport('docx')}
                      className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-50"
                    >
                      导出为 DOCX
                    </button>
                    <button
                      onClick={() => handleExport('pdf')}
                      className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-50"
                    >
                      导出为 PDF
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 内容区域 */}
        <div className="flex-1 p-6">
          <div className="h-full flex flex-col space-y-6">
            {/* 输入区域 */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <label className="block text-sm font-medium text-gray-900 mb-2">
                描述您的需求
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={`请描述您想要生成的${contentTypes.find(t => t.type === selectedType)?.name}内容...`}
                className="w-full h-24 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
              />
              
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-gray-500">
                  {selectedTemplate && (
                    <span>使用模板: {templates.find(t => t.id === selectedTemplate)?.name}</span>
                  )}
                </div>
                <button
                  onClick={handleGenerate}
                  disabled={!prompt.trim() || isGenerating}
                  className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                >
                  {isGenerating ? (
                    <>
                      <div className="spinner" />
                      <span>生成中...</span>
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-4 h-4" />
                      <span>生成内容</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* 生成结果区域 */}
            <div className="flex-1 bg-white rounded-lg border border-gray-200">
              {generatedContent ? (
                <div className="h-full flex flex-col">
                  <div className="p-4 border-b border-gray-200">
                    <h3 className="text-sm font-medium text-gray-900">生成结果</h3>
                  </div>
                  <div className="flex-1 p-4">
                    <textarea
                      value={generatedContent}
                      onChange={(e) => setGeneratedContent(e.target.value)}
                      className="w-full h-full border-none focus:outline-none resize-none text-gray-900 leading-relaxed"
                      placeholder="生成的内容将显示在这里..."
                    />
                  </div>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <Wand2 className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg font-medium mb-2">开始您的创作之旅</p>
                    <p className="text-sm">输入您的需求，让AI为您生成精彩内容</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkspacePage;