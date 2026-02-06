import React, { useState, useRef, useEffect } from 'react';
import { GeneratedCard, TextElement } from '../types';
import { DIMENSIONS, TEMPLATES } from '../constants';
import { Download, ExternalLink, Edit2, X, Type, Palette, AlignLeft, AlignCenter, AlignRight, Bold, Italic, Check, Image as ImageIcon, Layers } from 'lucide-react';
import { renderCardToDataUrl } from '../services/canvasGenerator';

interface Props {
    card: GeneratedCard;
    onUpdate?: (updatedCard: GeneratedCard) => void;
}

const FONT_OPTIONS = [
    { label: 'Modern', value: 'Inter' },
    { label: 'Elegant', value: '"Playfair Display", serif' },
    { label: 'Handwritten', value: '"Dancing Script", cursive' }
];

const COLORS = [
    '#000000', '#FFFFFF', '#1F2937', '#DC2626', '#EA580C',
    '#D97706', '#65A30D', '#059669', '#0891B2', '#2563EB',
    '#7C3AED', '#DB2777'
];

export const InteractiveCard: React.FC<Props> = ({ card, onUpdate }) => {
    // Current working state
    const [elements, setElements] = useState<TextElement[]>(card.textElements || []);
    const [currentBgUrl, setCurrentBgUrl] = useState(card.imageUrl);
    const [currentTemplateId, setCurrentTemplateId] = useState(card.data.templateId);

    const [isEditing, setIsEditing] = useState(false);
    const [activeId, setActiveId] = useState<string | null>(null);

    // Snapshot refs to support reverting changes
    const initialElementsRef = useRef(elements);
    const initialBgUrlRef = useRef(currentBgUrl);
    const initialTemplateIdRef = useRef(currentTemplateId);

    // Sync state when props change, BUT only if not currently editing (to avoid overwriting user edits in progress)
    // Actually, if parent updates card, we likely want to respect it, but typically parent only updates if we told it to.
    useEffect(() => {
        if (!isEditing) {
            if (card.textElements) setElements(card.textElements);
            if (card.imageUrl) setCurrentBgUrl(card.imageUrl);
            if (card.data.templateId) setCurrentTemplateId(card.data.templateId);
        }
    }, [card, isEditing]);

    const handleStartEditing = () => {
        // Snapshot current state before editing starts
        initialElementsRef.current = JSON.parse(JSON.stringify(elements));
        initialBgUrlRef.current = currentBgUrl;
        initialTemplateIdRef.current = currentTemplateId;

        setIsEditing(true);
        setActiveId(null);
    };

    const handleCancel = () => {
        // Revert to snapshot
        setElements(initialElementsRef.current);
        setCurrentBgUrl(initialBgUrlRef.current);
        setCurrentTemplateId(initialTemplateIdRef.current);
        setIsEditing(false);
    };

    const handleSave = () => {
        if (onUpdate) {
            onUpdate({
                ...card,
                textElements: elements,
                imageUrl: currentBgUrl,
                data: { ...card.data, templateId: currentTemplateId }
            });
        }
        setIsEditing(false);
    };

    const activeElement = elements.find(el => el.id === activeId);
    const isBackgroundSelected = activeId === 'CARD_BACKGROUND';

    const updateElement = (id: string, updates: Partial<TextElement>) => {
        setElements(prev => prev.map(el => el.id === id ? { ...el, ...updates } : el));
    };

    const updateBackground = (templateId: string) => {
        const template = TEMPLATES.find(t => t.id === templateId);
        if (template) {
            setCurrentBgUrl(template.bgUrl);
            setCurrentTemplateId(template.id);
        }
    };

    // --- Drag Logic ---
    const useDraggableElement = (
        containerBoundsRef: React.RefObject<HTMLDivElement | null>
    ) => {
        const dragRef = useRef<{ id: string; startX: number; startY: number; initialElX: number; initialElY: number } | null>(null);

        const handleMouseDown = (e: React.MouseEvent, id: string) => {
            e.preventDefault();
            e.stopPropagation(); // Stop propagation immediately

            // Only set active if we are in editing mode (or if we want to support selection in Grid View too?)
            // The prompt says "When entering Edit mode... position should not reset".
            // Dragging in Grid View updates 'elements' state.
            // If we drag in Grid View, that is a "change".
            // If we then click Edit, we snapshot THAT state.

            // Should clicking in Grid View select the element? 
            // Previous code reduced interactions in Grid View to just Drag.
            // In Edit Mode (Modal), clicking selects.

            if (isEditing) {
                setActiveId(id);
            }

            const el = elements.find(t => t.id === id);
            if (!el) return;

            dragRef.current = {
                id,
                startX: e.clientX,
                startY: e.clientY,
                initialElX: el.x,
                initialElY: el.y
            };

            const handleMouseMove = (ev: MouseEvent) => {
                if (!dragRef.current || !containerBoundsRef.current) return;

                const rect = containerBoundsRef.current.getBoundingClientRect();
                const dim = DIMENSIONS[card.size];
                const scale = rect.width / dim.width;

                if (scale === 0) return;

                const { id, startX, startY, initialElX, initialElY } = dragRef.current;
                const dx = (ev.clientX - startX) / scale;
                const dy = (ev.clientY - startY) / scale;

                const newX = initialElX + dx;
                const newY = initialElY + dy;

                setElements(prev => prev.map(t => {
                    if (t.id === id) {
                        return { ...t, x: newX, y: newY };
                    }
                    return t;
                }));
            };

            const handleMouseUp = () => {
                dragRef.current = null;
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
            };

            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
        };

        return { handleMouseDown };
    };

    const mainContainerRef = useRef<HTMLDivElement>(null);
    const modalContainerRef = useRef<HTMLDivElement>(null);

    const { handleMouseDown: handleMainDrag } = useDraggableElement(mainContainerRef);
    const { handleMouseDown: handleModalDrag } = useDraggableElement(modalContainerRef);

    const handleDownload = async (e: React.MouseEvent) => {
        e.stopPropagation();
        const url = await renderCardToDataUrl(currentBgUrl, elements, DIMENSIONS[card.size].width, DIMENSIONS[card.size].height);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Card_${card.data.recipientName}_${card.size}.png`;
        a.click();
    };

    const handleView = async (e: React.MouseEvent) => {
        e.stopPropagation();
        const url = await renderCardToDataUrl(currentBgUrl, elements, DIMENSIONS[card.size].width, DIMENSIONS[card.size].height);
        const w = window.open('about:blank');
        if (w) w.document.write(`<img src="${url}" style="max-width: 100%; height: auto;" />`);
    };

    const dim = DIMENSIONS[card.size];

    const renderCanvas = (
        containerRef: React.RefObject<HTMLDivElement | null>,
        mouseDownHandler: (e: React.MouseEvent, id: string) => void,
        mode: 'grid' | 'modal'
    ) => {
        const isModal = mode === 'modal';

        return (
            <div
                ref={containerRef}
                onClick={(e) => {
                    if (isEditing) {
                        e.stopPropagation();
                        setActiveId('CARD_BACKGROUND');
                    }
                }}
                style={{
                    aspectRatio: `${dim.width}/${dim.height}`,
                    // Fix: Explicitly drive size based on aspect ratio to prevent collapse
                    width: isModal ? (dim.width >= dim.height ? '100%' : 'auto') : '100%',
                    height: isModal ? (dim.width < dim.height ? '100%' : 'auto') : '100%',
                    maxWidth: '100%',
                    maxHeight: '100%',
                    display: isModal ? 'flex' : 'block',
                    alignItems: 'center',
                    justifyContent: 'center',
                    containerType: 'inline-size'
                }}
                className={`col-span-1 relative bg-slate-800 shadow-2xl select-none transition-all 
                    ${isEditing && isBackgroundSelected ? 'ring-2 ring-indigo-500 ring-offset-2 ring-offset-slate-900' : ''}
                    ${isModal ? 'mx-auto' : ''}
                `}
            >
                <img
                    src={currentBgUrl}
                    className="object-contain pointer-events-none"
                    style={{
                        width: '100%',
                        height: '100%',
                    }}
                    alt="Card Background"
                />

                <div className="absolute inset-0 w-full h-full">
                    {elements.map(el => {
                        const isActive = el.id === activeId && isEditing;
                        return (
                            <div
                                key={el.id}
                                onMouseDown={(e) => mouseDownHandler(e, el.id)}
                                onClick={(e) => e.stopPropagation()} // Stop click propagation to background
                                style={{
                                    position: 'absolute',
                                    left: `${(el.x / dim.width) * 100}%`,
                                    top: `${(el.y / dim.height) * 100}%`,
                                    fontFamily: el.fontFamily,
                                    fontSize: `max(12px, ${(el.fontSize / dim.width) * 100}cqw)`,
                                    color: el.fontColor,
                                    fontWeight: el.fontWeight,
                                    fontStyle: el.fontStyle || 'normal',
                                    textAlign: el.align as any,
                                    whiteSpace: 'pre',
                                    cursor: 'move',
                                    transform: el.align === 'center' ? 'translateX(-50%)' : 'none',
                                    zIndex: isActive ? 50 : 10,
                                    lineHeight: '1.38',
                                    textShadow: '0 1px 2px rgba(0,0,0,0.1)'
                                }}
                                className={`
                                    rounded px-1 transition-all
                                    ${mode === 'grid' && !isEditing ? 'hover:outline hover:outline-1 hover:outline-indigo-400 hover:bg-slate-900/10' : ''}
                                    ${isActive ? 'outline outline-2 outline-indigo-500 bg-indigo-500/10' : 'hover:outline hover:outline-1 hover:outline-indigo-300 hover:outline-dashed border-transparent'}
                                `}
                            >
                                {el.text}
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    return (
        <>
            {/* --- Main Card View --- */}
            <div className="bg-slate-900 rounded-2xl shadow-sm border border-slate-800 overflow-hidden group relative">
                {renderCanvas(mainContainerRef, handleMainDrag, 'grid')}

                {/* Actions Overlay */}
                <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                    <button onClick={handleStartEditing} className="bg-slate-800/90 text-indigo-400 p-2 rounded-full hover:bg-indigo-600 hover:text-white transition-all shadow-xl backdrop-blur-sm transform hover:scale-105" title="Edit Text">
                        <Edit2 size={20} />
                    </button>
                    <button onClick={handleDownload} className="bg-slate-800/90 text-slate-100 p-2 rounded-full hover:bg-indigo-600 hover:text-white transition-all shadow-xl backdrop-blur-sm transform hover:scale-105" title="Download PNG">
                        <Download size={20} />
                    </button>
                    <button onClick={handleView} className="bg-slate-800/90 text-slate-100 p-2 rounded-full hover:bg-indigo-600 hover:text-white transition-all shadow-xl backdrop-blur-sm transform hover:scale-105" title="View Full Resolution">
                        <ExternalLink size={20} />
                    </button>
                </div>

                {/* Footer Info */}
                <div className="p-4 flex items-center justify-between bg-slate-900 border-t border-slate-800">
                    <div>
                        <h3 className="font-bold text-slate-100 truncate max-w-[150px]">{card.data.recipientName}</h3>
                        <p className="text-xs text-slate-400">{card.data.occasion}</p>
                    </div>
                    <span className="px-2 py-1 bg-slate-800 text-[10px] font-black uppercase text-slate-300 rounded tracking-widest border border-slate-700">
                        {card.size}
                    </span>
                </div>
            </div>

            {/* --- Edit Modal --- */}
            {isEditing && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
                    <div className="bg-slate-900 w-full max-w-6xl h-[85vh] rounded-2xl border border-slate-700 flex overflow-hidden shadow-2xl relative">

                        {/* Left: Preview Area */}
                        <div
                            className="flex-1 bg-slate-950/50 flex items-center justify-center relative overflow-hidden bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-900 to-slate-950 p-6"
                            onClick={() => setActiveId('CARD_BACKGROUND')}
                        >
                            {renderCanvas(modalContainerRef, handleModalDrag, 'modal')}
                        </div>

                        {/* Right: Controls Panel */}
                        <div className="w-80 bg-slate-900 border-l border-slate-800 flex flex-col z-10">
                            {/* Header */}
                            <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-900">
                                <span className="font-bold text-slate-200 flex items-center gap-2">
                                    {activeId === 'CARD_BACKGROUND' ? <ImageIcon size={18} className="text-indigo-400" /> : <Type size={18} className="text-indigo-400" />}
                                    {activeId === 'CARD_BACKGROUND' ? 'Edit Background' : activeElement ? 'Edit Text' : 'Editor'}
                                </span>
                                <button onClick={handleCancel} className="text-slate-400 hover:text-white transition-colors" title="Cancel & Discard">
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Scrollable Content */}
                            <div className="flex-1 overflow-y-auto p-5 space-y-8 custom-scrollbar">

                                {activeElement && (
                                    <>
                                        {/* Style & Alignment */}
                                        <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
                                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Style & Align</label>
                                            <div className="flex gap-2">
                                                <div className="flex bg-slate-800 rounded-lg p-1 border border-slate-700">
                                                    <button
                                                        onClick={() => updateElement(activeElement.id, { fontWeight: activeElement.fontWeight === 'bold' ? 'normal' : 'bold' })}
                                                        className={`p-2 rounded ${activeElement.fontWeight === 'bold' || activeElement.fontWeight === '700' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
                                                        title="Bold"
                                                    >
                                                        <Bold size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => updateElement(activeElement.id, { fontStyle: activeElement.fontStyle === 'italic' ? 'normal' : 'italic' })}
                                                        className={`p-2 rounded ${activeElement.fontStyle === 'italic' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
                                                        title="Italic"
                                                    >
                                                        <Italic size={18} />
                                                    </button>
                                                </div>
                                                <div className="w-px bg-slate-700/50 mx-1"></div>
                                                <div className="flex bg-slate-800 rounded-lg p-1 border border-slate-700 flex-1 justify-between">
                                                    {(['left', 'center', 'right'] as const).map(align => (
                                                        <button
                                                            key={align}
                                                            onClick={() => updateElement(activeElement.id, { align })}
                                                            className={`p-2 rounded flex-1 flex justify-center ${activeElement.align === align ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
                                                        >
                                                            {align === 'left' && <AlignLeft size={18} />}
                                                            {align === 'center' && <AlignCenter size={18} />}
                                                            {align === 'right' && <AlignRight size={18} />}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Color */}
                                        <div className="space-y-4 animate-in slide-in-from-right-4 duration-300 delay-75">
                                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex justify-between">
                                                Color <span className="text-slate-600">{activeElement.fontColor}</span>
                                            </label>
                                            <div className="grid grid-cols-6 gap-2">
                                                {COLORS.map(c => (
                                                    <button
                                                        key={c}
                                                        onClick={() => updateElement(activeElement.id, { fontColor: c })}
                                                        className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${activeElement.fontColor === c ? 'border-indigo-400 scale-110 shadow-[0_0_10px_rgba(99,102,241,0.5)]' : 'border-transparent'}`}
                                                        style={{ backgroundColor: c }}
                                                    />
                                                ))}
                                                <label className="w-8 h-8 rounded-full border border-slate-600 flex items-center justify-center cursor-pointer hover:border-indigo-400 bg-gradient-to-br from-slate-700 to-slate-800">
                                                    <Palette size={14} className="text-slate-300" />
                                                    <input
                                                        type="color"
                                                        value={activeElement.fontColor}
                                                        onChange={(e) => updateElement(activeElement.id, { fontColor: e.target.value })}
                                                        className="opacity-0 absolute w-0 h-0"
                                                    />
                                                </label>
                                            </div>
                                        </div>

                                        {/* FontFamily */}
                                        <div className="space-y-4 animate-in slide-in-from-right-4 duration-300 delay-100">
                                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Font Family</label>
                                            <div className="space-y-2">
                                                {FONT_OPTIONS.map(font => (
                                                    <button
                                                        key={font.value}
                                                        onClick={() => updateElement(activeElement.id, { fontFamily: font.value })}
                                                        className={`w-full text-left px-4 py-3 rounded-xl border transition-all ${activeElement.fontFamily === font.value
                                                            ? 'border-indigo-500 bg-indigo-500/10 text-indigo-300'
                                                            : 'border-slate-800 bg-slate-800/50 text-slate-300 hover:bg-slate-800'}`}
                                                        style={{ fontFamily: font.value }}
                                                    >
                                                        {font.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Size */}
                                        <div className="space-y-4 animate-in slide-in-from-right-4 duration-300 delay-150">
                                            <div className="flex justify-between items-center">
                                                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Size</label>
                                                <span className="text-xs font-mono text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded">{activeElement.fontSize}px</span>
                                            </div>
                                            <input
                                                type="range"
                                                min="12"
                                                max="120"
                                                value={activeElement.fontSize}
                                                onChange={(e) => updateElement(activeElement.id, { fontSize: Number(e.target.value) })}
                                                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                                            />
                                        </div>
                                    </>
                                )}

                                {isBackgroundSelected && (
                                    <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                                        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                                            <h4 className="text-sm font-bold text-slate-200 mb-2 flex items-center gap-2">
                                                <Layers size={16} className="text-indigo-400" />
                                                Background Layer
                                            </h4>
                                            <p className="text-xs text-slate-400">
                                                Select a different template background for your card. Text positions will be preserved.
                                            </p>
                                        </div>

                                        <div className="space-y-3">
                                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Change Template</label>
                                            <div className="grid grid-cols-2 gap-3">
                                                {TEMPLATES.map(t => (
                                                    <button
                                                        key={t.id}
                                                        onClick={() => updateBackground(t.id)}
                                                        className={`
                                                            group relative aspect-square rounded-lg overflow-hidden border-2 transition-all
                                                            ${currentTemplateId === t.id ? 'border-indigo-500 ring-2 ring-indigo-500/20' : 'border-slate-800 hover:border-slate-600'}
                                                        `}
                                                    >
                                                        <img src={t.bgUrl} className="w-full h-full object-cover" alt={t.name} />
                                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <span className="text-[10px] font-bold text-white truncate w-full">{t.name}</span>
                                                        </div>
                                                        {currentTemplateId === t.id && (
                                                            <div className="absolute top-2 right-2 bg-indigo-600 text-white p-1 rounded-full shadow-lg">
                                                                <Check size={10} />
                                                            </div>
                                                        )}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {!activeElement && !isBackgroundSelected && (
                                    <div className="h-full flex flex-col items-center justify-center text-slate-500 text-center opacity-60">
                                        <div className="relative">
                                            <Edit2 size={48} className="mb-4 stroke-1" />
                                            <div className="absolute -bottom-2 -right-2 bg-indigo-500/20 p-2 rounded-full">
                                                <ImageIcon size={24} className="text-indigo-400" />
                                            </div>
                                        </div>
                                        <p className="text-sm">Click on any <strong className="text-slate-300">Text</strong><br />or the <strong className="text-slate-300">Background</strong><br />to edit.</p>
                                    </div>
                                )}
                            </div>

                            {/* Footer */}
                            <div className="p-5 border-t border-slate-800 bg-slate-900">
                                <button
                                    onClick={handleSave}
                                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-3 rounded-xl transition-all shadow-lg hover:shadow-indigo-500/25 active:scale-95 flex items-center justify-center gap-2"
                                >
                                    <Check size={18} />
                                    Done
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};
