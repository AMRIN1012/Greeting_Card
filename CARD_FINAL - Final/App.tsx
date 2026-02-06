
import React, { useState } from 'react';
import { Layout, Palette, FileSpreadsheet, PlusCircle, History } from 'lucide-react';
import { TEMPLATES } from './constants';
import { CardData, GeneratedCard, CardSize } from './types';
import SingleGenerator from './components/SingleGenerator';
import BulkGenerator from './components/BulkGenerator';
import TemplateGallery from './components/TemplateGallery';
import PreviewGrid from './components/PreviewGrid';
import { generateCardsLocally } from './services/canvasGenerator';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'single' | 'bulk' | 'history'>('single');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(TEMPLATES[0].id);
  const [generatedCards, setGeneratedCards] = useState<GeneratedCard[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateSingle = async (data: Omit<CardData, 'templateId'>) => {
    setIsGenerating(true);
    try {
      const fullData: CardData = { ...data, templateId: selectedTemplateId };
      const newCards = await generateCardsLocally([fullData]);
      setGeneratedCards(prev => [...newCards, ...prev]);
      setActiveTab('history');
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

  const clearHistory = () => {
    if (confirm("Clear all generated cards?")) {
      setGeneratedCards([]);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      {/* Header */}
      <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/images/logo.png" alt="Creovate" className="w-10 h-10 rounded-lg object-cover" />
            <h1 className="text-xl font-bold tracking-tight text-slate-100">Creovate AI</h1>
          </div>
          <nav className="flex items-center gap-1 bg-slate-800 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('single')}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === 'single' ? 'bg-slate-800 text-indigo-300 shadow-sm' : 'text-slate-300 hover:text-white'}`}
            >
              Single
            </button>
            <button
              onClick={() => setActiveTab('bulk')}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === 'bulk' ? 'bg-slate-800 text-indigo-300 shadow-sm' : 'text-slate-300 hover:text-white'}`}
            >
              Bulk
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === 'history' ? 'bg-slate-800 text-indigo-300 shadow-sm' : 'text-slate-300 hover:text-white'}`}
            >
              Gallery ({generatedCards.length})
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 lg:p-8 flex flex-col gap-8">
        {/* Templates: Full-width horizontal gallery */}
        <section className="bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-800">
          <div className="flex items-center gap-2 mb-4">
            <Layout className="text-indigo-600" size={20} />
            <h2 className="text-lg font-bold">1. Select Template</h2>
            <div className="ml-auto text-sm text-slate-400">Choose a template from the row below</div>
          </div>
          <TemplateGallery
            selectedId={selectedTemplateId}
            onSelect={setSelectedTemplateId}
          />
        </section>

        {/* Card Information: Input fields */}
        <section className="bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-800">
          <div className="flex items-center gap-2 mb-4">
            {activeTab === 'single' ? <PlusCircle className="text-indigo-600" size={20} /> : <FileSpreadsheet className="text-indigo-600" size={20} />}
            <h2 className="text-lg font-bold">2. Card Information</h2>
            <div className="ml-auto flex items-center gap-2">
              <button
                onClick={() => setActiveTab('single')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-all ${activeTab === 'single' ? 'bg-slate-800 text-indigo-300' : 'text-slate-300 hover:text-white'}`}
              >
                Single
              </button>
              <button
                onClick={() => setActiveTab('bulk')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-all ${activeTab === 'bulk' ? 'bg-slate-800 text-indigo-300' : 'text-slate-300 hover:text-white'}`}
              >
                Bulk
              </button>
            </div>
          </div>

          {activeTab === 'single' && (
            <SingleGenerator onGenerate={handleGenerateSingle} isGenerating={isGenerating} />
          )}
          {activeTab === 'bulk' && (
            <BulkGenerator onGenerate={handleGenerateBulk} isGenerating={isGenerating} />
          )}
        </section>

        {/* Generated History: always below inputs */}
        <section className="bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <History className="text-indigo-600" />
              Generated History
            </h2>
            {generatedCards.length > 0 && (
              <button
                onClick={clearHistory}
                className="text-sm text-red-400 hover:text-red-500 font-medium"
              >
                Clear All
              </button>
            )}
          </div>

          {generatedCards.length === 0 ? (
            <div className="bg-slate-800 border-2 border-dashed border-slate-700 rounded-3xl p-12 text-center">
              <p className="text-slate-400">No cards generated yet. Use the form above to create cards.</p>
            </div>
          ) : (
            <PreviewGrid
              cards={generatedCards}
              onUpdate={(updatedCard) => {
                setGeneratedCards(prev => prev.map(c => c.id === updatedCard.id ? updatedCard : c));
              }}
            />
          )}
        </section>
      </main>

    </div>
  );
};

export default App;
