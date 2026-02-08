import React from 'react';
import { X, Sparkles } from 'lucide-react';
import { Template } from '../types';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    suggestions: Template[];
    onSelect: (id: string) => void;
    selectedId: string;
}

const AISuggestionPanel: React.FC<Props> = ({ isOpen, onClose, suggestions, onSelect, selectedId }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-y-0 right-0 w-[28%] min-w-[300px] bg-slate-900 border-l border-slate-700 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col font-sans">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-slate-900 to-slate-800">
                <h2 className="text-xl font-bold flex items-center gap-2 text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
                    <Sparkles className="text-indigo-400" size={20} />
                    Smart Suggestions
                </h2>
                <button
                    onClick={onClose}
                    className="p-2 hover:bg-slate-700/50 rounded-full transition-colors text-slate-400 hover:text-white"
                    aria-label="Close suggestions"
                >
                    <X size={20} />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar">
                <div className="text-xs text-slate-400 uppercase font-semibold tracking-wider mb-2">
                    Recommended for you
                </div>

                {suggestions.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-48 text-center text-slate-500 px-4">
                        <Sparkles size={32} className="mb-3 opacity-20" />
                        <p className="text-sm">Complete form details to see personalized template suggestions.</p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-4">
                        {suggestions.map((tpl) => (
                            <div
                                key={tpl.id}
                                onClick={() => onSelect(tpl.id)}
                                className={`group cursor-pointer relative rounded-xl overflow-hidden border-2 transition-all duration-300 w-full aspect-[4/3] shadow-lg ${selectedId === tpl.id
                                        ? 'border-indigo-500 ring-4 ring-indigo-500/20 scale-[1.02]'
                                        : 'border-slate-700 hover:border-indigo-400/50 hover:shadow-indigo-500/20 hover:-translate-y-1'
                                    }`}
                            >
                                <img
                                    src={tpl.bgUrl}
                                    alt={tpl.name}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                />

                                {/* Gradient Overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity" />

                                {/* Content */}
                                <div className="absolute bottom-0 left-0 right-0 p-4 transform translate-y-1 group-hover:translate-y-0 transition-transform">
                                    <h3 className="text-white font-bold text-lg leading-tight mb-1">{tpl.name}</h3>
                                    <div className="flex gap-2 flex-wrap">
                                        {tpl.tags?.slice(0, 3).map((tag, i) => (
                                            <span key={i} className="text-[10px] uppercase font-bold tracking-wider bg-white/20 backdrop-blur-sm text-white px-2 py-0.5 rounded-full">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {/* Selection Indicator */}
                                {selectedId === tpl.id && (
                                    <div className="absolute top-3 right-3 bg-indigo-500 text-white p-1.5 rounded-full shadow-lg animate-bounce-subtle">
                                        <Sparkles size={14} fill="white" />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="p-4 bg-slate-900 border-t border-slate-800 text-center">
                <p className="text-xs text-slate-500 flex items-center justify-center gap-1">
                    Powered by <span className="font-bold text-indigo-400">Creovate AI</span>
                </p>
            </div>
        </div>
    );
};

export default AISuggestionPanel;
