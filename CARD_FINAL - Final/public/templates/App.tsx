import React, { useState, useEffect } from 'react';
import { Layout, Palette, FileSpreadsheet, PlusCircle, History, Sparkles, Video, Image as ImageIcon } from 'lucide-react';
import { TEMPLATES } from './constants';
import { CardData, GeneratedCard, CardSize, GeneratedVideo, VideoFrame } from './types';
import SingleGenerator from './components/SingleGenerator';
import BulkGenerator from './components/BulkGenerator';
import VideoGenerator from './components/VideoGenerator';
import VideoGallery from './components/VideoGallery';
import VideoPreviewModal from './components/VideoPreviewModal';
import TemplateGallery from './components/TemplateGallery';
import PreviewGrid from './components/PreviewGrid';
import { generateCardsLocally } from './services/canvasGenerator';

import AISuggestionPanel from './components/AISuggestionPanel';
import { InteractiveCard } from './components/InteractiveCard';
import { generatePreviewCard } from './services/canvasGenerator';
import { SearchTemplatePage } from './components/SearchTemplatePage';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'single' | 'bulk' | 'video' | 'history' | 'templates'>('single');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(TEMPLATES[0].id);
  const [generatedCards, setGeneratedCards] = useState<GeneratedCard[]>([]);
  const [generatedVideos, setGeneratedVideos] = useState<GeneratedVideo[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  // Video Preview State
  const [previewVideo, setPreviewVideo] = useState<GeneratedVideo | null>(null);
  const [isVideoPreviewOpen, setIsVideoPreviewOpen] = useState(false);

  // AI Suggestion State
  const [suggestedTemplates, setSuggestedTemplates] = useState<typeof TEMPLATES>([]);
  const [isSuggestionPanelOpen, setIsSuggestionPanelOpen] = useState(false);
  const [hasUserClosedPanel, setHasUserClosedPanel] = useState(false);

  // Live Preview State
  const [livePreviewCard, setLivePreviewCard] = useState<GeneratedCard | null>(null);

  const handleGenerateSingle = async (data: Omit<CardData, 'templateId'>) => {
    setIsGenerating(true);
    try {
      const fullData: CardData = { ...data, templateId: selectedTemplateId };
      const newCards = await generateCardsLocally([fullData]);
      setGeneratedCards(prev => [...newCards, ...prev]);
      setActiveTab('history');
      setIsSuggestionPanelOpen(false); // Close suggestions on generate
    } catch (err) {
      console.error("Failed to generate card:", err);
      alert("Error generating card. Check console for details.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateBulk = async (dataList: Omit<CardData, 'templateId'>[]) => {
    setIsGenerating(true);
    try {
      const fullDataList: CardData[] = dataList.map(d => ({ ...d, templateId: selectedTemplateId }));
      const newCards = await generateCardsLocally(fullDataList);
      setGeneratedCards(prev => [...newCards, ...prev]);
      setActiveTab('history');
    } catch (err) {
      console.error("Bulk generation failed:", err);
      alert("Error during bulk generation.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateVideo = (frames: VideoFrame[], gifUrl: string) => {
    setIsGenerating(true);
    try {
      // Create new video object with GIF URL
      const newVideo: GeneratedVideo = {
        id: Math.random().toString(36).substr(2, 9),
        frames: frames,
        gifUrl: gifUrl,
        createdAt: new Date(),
      };

      setGeneratedVideos(prev => [newVideo, ...prev]);
      setPreviewVideo(newVideo);
      setIsVideoPreviewOpen(true);
      // Don't switch tab immediately, let user preview first
    } catch (err) {
      console.error("Video generation failed:", err);
      alert("Error generating video.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDataChange = (data: { recipientName: string; occasion: string; message: string; senderName: string }) => {
    // 1. Gather text
    const textPoints = [data.occasion, data.message].join(' ').toLowerCase();

    // Update Live Preview (Debounced slightly ideally, but for now direct)
    const fullData: CardData = { ...data, templateId: selectedTemplateId };
    const preview = generatePreviewCard(fullData);
    setLivePreviewCard(preview);

    if (!textPoints.trim()) {
      setSuggestedTemplates([]);
      return;
    }

    // 2. Score templates
    const scores = TEMPLATES.map(tpl => {
      let score = 0;

      // Tag matching
      tpl.tags?.forEach(tag => {
        if (textPoints.includes(tag.toLowerCase())) {
          score += 2; // Direct tag match
        }
      });

      // Name matching (loose)
      if (textPoints.includes(tpl.name.toLowerCase())) {
        score += 3;
      }

      // Keyword heuristics
      if (data.occasion.toLowerCase().includes('birthday') && tpl.tags?.includes('birthday')) score += 5;
      if (data.occasion.toLowerCase().includes('wedding') && tpl.tags?.includes('wedding')) score += 5;
      if (data.occasion.toLowerCase().includes('love') && tpl.tags?.includes('love')) score += 5;

      return { tpl, score };
    });

    // 3. Filter and Sort
    const topSuggestions = scores
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .map(item => item.tpl)
      .slice(0, 6); // Top 6

    setSuggestedTemplates(topSuggestions);

    // 4. Auto-open panel logic
    // Only open if sufficient data is entered and user hasn't closed it manually
    const hasEnoughData = data.recipientName.length > 2 && data.occasion.length > 3;
    if (hasEnoughData && topSuggestions.length > 0 && !hasUserClosedPanel && !isSuggestionPanelOpen) {
      setIsSuggestionPanelOpen(true);
    }
  };

  // Update preview when template changes if we have data
  useEffect(() => {
    if (livePreviewCard) {
      const updatedData = { ...livePreviewCard.data, templateId: selectedTemplateId };
      const preview = generatePreviewCard(updatedData);
      setLivePreviewCard(preview);
    }
  }, [selectedTemplateId]);

  const clearHistory = () => {
    if (confirm("Clear all generated content?")) {
      setGeneratedCards([]);
      setGeneratedVideos([]);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 relative">
      {/* Video Preview Modal */}
      <VideoPreviewModal
        isOpen={isVideoPreviewOpen}
        onClose={() => setIsVideoPreviewOpen(false)}
        video={previewVideo}
      />

      {/* AI Panel */}
      <AISuggestionPanel
        isOpen={isSuggestionPanelOpen}
        onClose={() => {
          setIsSuggestionPanelOpen(false);
          setHasUserClosedPanel(true);
        }}
        suggestions={suggestedTemplates}
        selectedId={selectedTemplateId}
        onSelect={(id) => setSelectedTemplateId(id)}
      />

      {/* Header */}
      <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/images/logo.png" alt="Creovate" className="w-10 h-10 rounded-lg object-cover" />
            <h1 className="text-xl font-bold tracking-tight text-slate-100">Creovate AI</h1>
          </div>
          <nav className="flex items-center gap-1 bg-slate-800 p-1 rounded-lg overflow-x-auto">
            <button
              onClick={() => setActiveTab('templates')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all whitespace-nowrap ${activeTab === 'templates' ? 'bg-slate-700 text-indigo-300 shadow-sm' : 'text-slate-300 hover:text-white'}`}
            >
              Templates
            </button>
            <div className="w-px h-6 bg-slate-700 mx-1"></div>
            <button
              onClick={() => setActiveTab('single')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-1.5 whitespace-nowrap ${activeTab === 'single' ? 'bg-slate-700 text-indigo-300 shadow-sm' : 'text-slate-300 hover:text-white'}`}
            >
              <ImageIcon size={14} />
              Single
            </button>
            <button
              onClick={() => setActiveTab('bulk')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-1.5 whitespace-nowrap ${activeTab === 'bulk' ? 'bg-slate-700 text-indigo-300 shadow-sm' : 'text-slate-300 hover:text-white'}`}
            >
              <FileSpreadsheet size={14} />
              Bulk
            </button>
            <div className="w-px h-6 bg-slate-700 mx-1"></div>
            <button
              onClick={() => setActiveTab('video')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-1.5 whitespace-nowrap ${activeTab === 'video' ? 'bg-slate-700 text-purple-300 shadow-sm' : 'text-slate-300 hover:text-white'}`}
            >
              <Video size={14} />
              Video
            </button>

            <div className="w-px h-6 bg-slate-700 mx-1"></div>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all whitespace-nowrap ${activeTab === 'history' ? 'bg-slate-700 text-indigo-300 shadow-sm' : 'text-slate-300 hover:text-white'}`}
            >
              Gallery ({generatedCards.length + generatedVideos.length})
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className={`flex-1 max-w-7xl mx-auto w-full p-4 lg:p-8 flex flex-col gap-8 transition-all duration-300 ${isSuggestionPanelOpen ? 'mr-[28%] max-w-[72%]' : ''}`}>

        {/* TEMPLATE SEARCH PAGE */}
        {activeTab === 'templates' && (
          <SearchTemplatePage onSelect={(id) => {
            setSelectedTemplateId(id);
            setActiveTab('single');
          }} />
        )}

        {/* HOME PAGE: Generator (Single/Bulk/Video) */}
        {(activeTab === 'single' || activeTab === 'bulk' || activeTab === 'video') && (
          <>
            {/* Templates: Only for Photo Modes */}
            {(activeTab === 'single' || activeTab === 'bulk') && (
              <section className="bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-800">
                <div className="flex items-center gap-2 mb-4">
                  <Layout className="text-indigo-600" size={20} />
                  <h2 className="text-lg font-bold">1. Select Template</h2>
                  <div className="ml-auto text-sm text-slate-400">Choose a template for your photos</div>
                </div>
                <TemplateGallery
                  selectedId={selectedTemplateId}
                  onSelect={setSelectedTemplateId}
                />
              </section>
            )}

            {/* Main Generator Section */}
            <section className="flex flex-col lg:flex-row gap-6">
              {/* Left Column: Inputs */}
              <div className={`bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-800 transition-all ${activeTab === 'video' ? 'w-full' :
                activeTab === 'single' ? 'lg:w-1/2' : 'w-full'
                }`}>
                <div className="flex items-center gap-2 mb-4">
                  {activeTab === 'single' && <PlusCircle className="text-indigo-600" size={20} />}
                  {activeTab === 'bulk' && <FileSpreadsheet className="text-indigo-600" size={20} />}
                  {activeTab === 'video' && <Video className="text-purple-600" size={20} />}

                  <h2 className="text-lg font-bold">
                    {activeTab === 'video' ? 'Create Video Sequence' : '2. Card Information'}
                  </h2>
                </div>

                {activeTab === 'single' && (
                  <SingleGenerator
                    onGenerate={handleGenerateSingle}
                    isGenerating={isGenerating}
                    onDataChange={handleDataChange}
                    selectedTemplate={TEMPLATES.find(t => t.id === selectedTemplateId)}
                  />
                )}
                {activeTab === 'bulk' && (
                  <BulkGenerator onGenerate={handleGenerateBulk} isGenerating={isGenerating} />
                )}
                {activeTab === 'video' && (
                  <VideoGenerator onGenerate={handleGenerateVideo} isGenerating={isGenerating} />
                )}
              </div>

              {/* Right Column: Live Preview (Only in Single Mode) */}
              {activeTab === 'single' && (
                <div className="bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-800 lg:w-1/2 flex flex-col">
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="text-indigo-600" size={20} />
                    <h2 className="text-lg font-bold">Live Preview</h2>
                  </div>

                  <div className="flex-1 flex items-center justify-center bg-slate-950/50 rounded-xl border-2 border-dashed border-slate-800 min-h-[400px]">
                    {livePreviewCard ? (
                      <div className="w-full h-full p-4 flex items-center justify-center">
                        <InteractiveCard card={livePreviewCard} />
                      </div>
                    ) : (
                      <div className="text-center text-slate-500">
                        <Layout size={48} className="mx-auto mb-2 opacity-20" />
                        <p>Start typing to see your card preview here</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </section>
          </>
        )}

        {/* GALLERY PAGE: Generated History Breakdown */}
        {activeTab === 'history' && (
          <section className="bg-slate-900/50 backdrop-blur-sm p-8 rounded-3xl shadow-2xl border border-slate-800/50 min-h-[80vh]">
            <div className="flex items-center justify-between mb-8">
              <div className="flex flex-col gap-1">
                <h2 className="text-3xl font-bold flex items-center gap-3 text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
                  <History className="text-indigo-500" size={32} />
                  Gallery
                </h2>
                <p className="text-slate-400 text-sm pl-11">Your collection of generated masterpieces</p>
              </div>

              {(generatedCards.length > 0 || generatedVideos.length > 0) && (
                <div className="flex gap-3">
                  <button
                    onClick={() => setActiveTab('single')}
                    className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors text-sm font-medium shadow-lg shadow-indigo-900/20"
                  >
                    Create New
                  </button>
                  <button
                    onClick={clearHistory}
                    className="px-4 py-2 rounded-lg border border-red-900/50 text-red-400 hover:bg-red-900/20 transition-colors text-sm font-medium"
                  >
                    Clear All
                  </button>
                </div>
              )}
            </div>

            {generatedCards.length === 0 && generatedVideos.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 bg-slate-800/30 border-2 border-dashed border-slate-700/50 rounded-3xl text-center">
                <div className="bg-slate-800 p-4 rounded-full mb-4">
                  <Sparkles className="text-indigo-500 w-8 h-8" />
                </div>
                <h3 className="text-xl font-semibold text-slate-200 mb-2">No creations yet</h3>
                <p className="text-slate-400 mb-6 max-w-md">The gallery is waiting. Head back to the generator to start designing.</p>
                <div className="flex gap-4">
                  <button
                    onClick={() => setActiveTab('single')}
                    className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-all shadow-lg hover:shadow-indigo-500/25"
                  >
                    Create Card
                  </button>
                  <button
                    onClick={() => setActiveTab('video')}
                    className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-medium transition-all shadow-lg hover:shadow-purple-500/25"
                  >
                    Create Video
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-12">
                {/* Photo Gallery Division */}
                {generatedCards.length > 0 && (
                  <div>
                    <h3 className="text-xl font-bold text-slate-200 mb-4 flex items-center gap-2">
                      <ImageIcon className="text-indigo-400" />
                      Photos
                    </h3>
                    <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800/50">
                      <PreviewGrid
                        cards={generatedCards}
                        onUpdate={(updatedCard) => {
                          setGeneratedCards(prev => prev.map(c => c.id === updatedCard.id ? updatedCard : c));
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* Video Gallery Division */}
                {generatedVideos.length > 0 && (
                  <div>
                    <h3 className="text-xl font-bold text-slate-200 mb-4 flex items-center gap-2">
                      <Video className="text-purple-400" />
                      Videos
                    </h3>
                    <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800/50">
                      <VideoGallery
                        videos={generatedVideos}
                        onPlay={(video) => {
                          setPreviewVideo(video);
                          setIsVideoPreviewOpen(true);
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </section>
        )}
      </main>

    </div>
  );
};

export default App;
