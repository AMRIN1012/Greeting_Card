import React, { useState, useMemo } from 'react';
import { Search, Filter, X } from 'lucide-react';
import { TEMPLATES } from '../constants';

interface Props {
    onSelect: (id: string) => void;
}

const POPULAR_TAGS = ['All', 'Birthday', 'Wedding', 'Engagement', 'Love', 'Certificate', 'Islamic', 'Detailed', 'Party', 'Simple', 'Luxury', 'Nature', 'Professional'];

export const SearchTemplatePage: React.FC<Props> = ({ onSelect }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTag, setActiveTag] = useState('All');

    const filteredTemplates = useMemo(() => {
        return TEMPLATES.filter(tpl => {
            // Search Logic
            const q = searchQuery.toLowerCase();
            const matchesSearch = !q ||
                tpl.name.toLowerCase().includes(q) ||
                tpl.tags?.some(tag => tag.toLowerCase().includes(q));

            // Tag Logic
            const matchesTag = activeTag === 'All' || tpl.tags?.some(tag => tag.toLowerCase() === activeTag.toLowerCase());

            return matchesSearch && matchesTag;
        });
    }, [searchQuery, activeTag]);

    return (
        <div className="flex flex-col gap-6 h-full p-6 animate-in fade-in duration-500">
            {/* Search & Filter Header */}
            <div className="flex flex-col gap-6 bg-slate-900 p-8 rounded-3xl border border-slate-800 shadow-2xl relative overflow-hidden">
                {/* Decorative Background */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

                <div className="relative z-10">
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400 mb-2">Find the Perfect Template</h1>
                    <p className="text-slate-400">Explore our collection of professionally designed templates for any occasion.</p>
                </div>

                <div className="relative z-10 flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search by occasion, style, or color..."
                            className="w-full bg-slate-950/50 border border-slate-700 rounded-xl py-3.5 pl-12 pr-10 text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent placeholder:text-slate-500 transition-all shadow-inner"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1 hover:bg-slate-800 rounded-full transition-colors"
                            >
                                <X size={16} />
                            </button>
                        )}
                    </div>

                    {/* Tag Filters for Desktop (Horizontal) */}
                    <div className="hidden md:flex items-center gap-2 overflow-x-auto no-scrollbar mask-gradient">
                        {POPULAR_TAGS.map(tag => (
                            <button
                                key={tag}
                                onClick={() => setActiveTag(tag)}
                                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap border ${activeTag === tag
                                    ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/25 scale-105'
                                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700 hover:text-slate-200 hover:border-slate-600'
                                    }`}
                            >
                                {tag}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Tag Filters for Mobile (Wrap) */}
                <div className="flex md:hidden flex-wrap gap-2">
                    {POPULAR_TAGS.map(tag => (
                        <button
                            key={tag}
                            onClick={() => setActiveTag(tag)}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all border ${activeTag === tag
                                ? 'bg-indigo-600 border-indigo-500 text-white'
                                : 'bg-slate-800 border-slate-700 text-slate-400'
                                }`}
                        >
                            {tag}
                        </button>
                    ))}
                </div>
            </div>

            {/* Results Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {filteredTemplates.map(tpl => (
                    <button
                        key={tpl.id}
                        onClick={() => onSelect(tpl.id)}
                        className="group relative aspect-square rounded-2xl overflow-hidden border border-slate-800 bg-slate-900 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-indigo-500/20 hover:border-indigo-500/50 flex flex-col"
                    >
                        {/* Image Container */}
                        <div className="flex-1 w-full h-full relative overflow-hidden bg-slate-950">
                            <div className="absolute inset-0 bg-slate-800 animate-pulse" /> {/* Loading placeholder style */}
                            <img
                                src={tpl.bgUrl}
                                alt={tpl.name}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                loading="lazy"
                            />

                            {/* Hover Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-5">
                                <span className="inline-block px-3 py-1 bg-indigo-600 text-white text-xs font-bold rounded-full mb-2 self-start transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                                    Select
                                </span>
                            </div>
                        </div>

                        {/* Always Visible Footer */}
                        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent pointer-events-none group-hover:opacity-0 transition-opacity">
                            <h3 className="font-bold text-white text-sm drop-shadow-md">{tpl.name}</h3>
                        </div>

                        {/* Full Details on Hover (Replacing footer) */}
                        <div className="absolute bottom-0 left-0 right-0 p-4 bg-slate-900/95 backdrop-blur-sm border-t border-slate-800 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                            <h3 className="font-bold text-white text-sm mb-1">{tpl.name}</h3>
                            <div className="flex flex-wrap gap-1">
                                {tpl.tags?.slice(0, 3).map(tag => (
                                    <span key={tag} className="text-[10px] text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </button>
                ))}
            </div>

            {filteredTemplates.length === 0 && (
                <div className="flex-1 flex flex-col items-center justify-center py-20 bg-slate-900/50 rounded-3xl border border-dashed border-slate-800">
                    <div className="bg-slate-800 p-4 rounded-full mb-4">
                        <Filter className="text-slate-500 w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-semibold text-slate-200 mb-2">No templates found</h3>
                    <p className="text-slate-400 mb-6 text-center max-w-md">We couldn't find any templates matching "{searchQuery}" or the selected category.</p>
                    <div className="flex gap-4">
                        <button
                            onClick={() => { setSearchQuery(''); setActiveTag('All'); }}
                            className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
                        >
                            Clear Filters
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
