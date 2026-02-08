
import React, { useState, useRef } from 'react';
import { Upload, X, ArrowUp, ArrowDown, Play, Film, Clock, Download } from 'lucide-react';
import { VideoFrame } from '../types';
import GIF from 'gif.js';

interface VideoGeneratorProps {
    onGenerate: (frames: VideoFrame[], gifUrl: string) => void;
    isGenerating: boolean;
}

const VideoGenerator: React.FC<VideoGeneratorProps> = ({ onGenerate, isGenerating }) => {
    const [frames, setFrames] = useState<VideoFrame[]>([]);
    const [delay, setDelay] = useState(500); // ms
    const [isProcessing, setIsProcessing] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const fileList = Array.from(e.target.files) as File[];
            const newFrames: VideoFrame[] = fileList.map((file, index) => ({
                id: Math.random().toString(36).substr(2, 9),
                imageFile: file,
                imageUrl: URL.createObjectURL(file), // Create preview URL
                textOverlay: '',
                order: frames.length + index,
            }));
            setFrames(prev => [...prev, ...newFrames]);
        }
        // Reset inputs
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const updateFrameText = (id: string, text: string) => {
        setFrames(prev => prev.map(f => f.id === id ? { ...f, textOverlay: text } : f));
    };

    const removeFrame = (id: string) => {
        setFrames(prev => {
            const newFrames = prev.filter(f => f.id !== id);
            // Re-normalize order
            return newFrames.map((f, index) => ({ ...f, order: index }));
        });
    };

    const moveFrame = (index: number, direction: 'up' | 'down') => {
        if (direction === 'up' && index > 0) {
            const newFrames = [...frames];
            [newFrames[index], newFrames[index - 1]] = [newFrames[index - 1], newFrames[index]];
            // Update order
            newFrames.forEach((f, i) => f.order = i);
            setFrames(newFrames);
        } else if (direction === 'down' && index < frames.length - 1) {
            const newFrames = [...frames];
            [newFrames[index], newFrames[index + 1]] = [newFrames[index + 1], newFrames[index]];
            newFrames.forEach((f, i) => f.order = i);
            setFrames(newFrames);
        }
    };

    const generateGIF = async () => {
        if (frames.length < 2) {
            alert("Please select at least 2 images to create a GIF.");
            return;
        }

        setIsProcessing(true);

        try {
            // Fetch worker script to create a secure Blob URL (avoids cross-origin worker issues)
            const response = await fetch('https://unpkg.com/gif.js@0.2.0/dist/gif.worker.js');
            if (!response.ok) throw new Error('Failed to load GIF worker script');
            const workerBlob = await response.blob();
            const workerUrl = URL.createObjectURL(workerBlob);

            const gif = new GIF({
                workers: 2,
                quality: 10,
                workerScript: workerUrl,
            });

            // Process frames sequentially
            for (const frame of frames) {
                await new Promise<void>((resolve, reject) => {
                    const img = new Image();
                    img.crossOrigin = 'Anonymous';
                    img.src = frame.imageUrl;
                    img.onload = () => {
                        // Create a canvas to draw the image + text
                        const canvas = document.createElement('canvas');
                        canvas.width = img.width;
                        canvas.height = img.height;
                        const ctx = canvas.getContext('2d');
                        if (ctx) {
                            ctx.drawImage(img, 0, 0);

                            // Add Text Overlay if exists
                            if (frame.textOverlay) {
                                const fontSize = Math.max(24, Math.round(canvas.height * 0.05));
                                ctx.font = `bold ${fontSize}px sans-serif`;
                                ctx.fillStyle = 'white';
                                ctx.textAlign = 'center';
                                ctx.shadowColor = 'black';
                                ctx.shadowBlur = 4;
                                ctx.lineWidth = 3;
                                ctx.strokeText(frame.textOverlay, canvas.width / 2, canvas.height - fontSize * 1.5);
                                ctx.fillText(frame.textOverlay, canvas.width / 2, canvas.height - fontSize * 1.5);
                            }

                            gif.addFrame(canvas, { delay: delay });
                            resolve();
                        } else {
                            reject(new Error("Failed to get canvas context"));
                        }
                    };
                    img.onerror = () => reject(new Error("Failed to load image"));
                });
            }

            gif.on('finished', (blob: Blob) => {
                const url = URL.createObjectURL(blob);
                onGenerate(frames, url);
                setIsProcessing(false);
                // Clean up worker URL after a bit to ensure worker is done? 
                // Actually gif.js spawns workers. We can revoke after finished.
                setTimeout(() => URL.revokeObjectURL(workerUrl), 1000);
            });

            gif.render();

        } catch (error) {
            console.error("GIF Generation Failed:", error);
            alert("Failed to generate GIF. Please check your internet connection (needed for worker script) and console for details.");
            setIsProcessing(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* File Upload Area */}
            <div
                className="border-2 border-dashed border-slate-700 rounded-xl p-8 hover:border-indigo-500 hover:bg-slate-800/30 transition-all cursor-pointer text-center group"
                onClick={() => fileInputRef.current?.click()}
            >
                <div className="bg-slate-800 p-4 rounded-full w-16 h-16 mx-auto mb-4 group-hover:bg-indigo-900/30 transition-colors flex items-center justify-center">
                    <Upload className="text-indigo-400 w-8 h-8" />
                </div>
                <h3 className="text-lg font-semibold text-slate-200">Upload Images for GIF</h3>
                <p className="text-slate-400 text-sm mt-1">Select multiple images (JPG, PNG)</p>
                <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    multiple
                    accept="image/*"
                    onChange={handleFileChange}
                />
            </div>

            {/* Frame List */}
            {frames.length > 0 && (
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-slate-300 flex items-center gap-2">
                            <Film size={18} />
                            Sequence ({frames.length} frames)
                        </h3>

                        {/* Duration Control */}
                        <div className="flex items-center gap-3 bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700">
                            <Clock size={16} className="text-indigo-400" />
                            <span className="text-sm text-slate-300 whitespace-nowrap">Frame Delay: {delay}ms</span>
                            <input
                                type="range"
                                min="100"
                                max="2000"
                                step="100"
                                value={delay}
                                onChange={(e) => setDelay(Number(e.target.value))}
                                className="w-24 accent-indigo-500 h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer"
                            />
                        </div>
                    </div>

                    <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                        {frames.map((frame, index) => (
                            <div key={frame.id} className="bg-slate-800 p-3 rounded-lg flex items-center gap-4 animate-in fade-in slide-in-from-bottom-2">
                                <div className="relative group shrink-0">
                                    <img src={frame.imageUrl} alt="Frame" className="w-20 h-20 object-cover rounded-md border border-slate-700" />
                                    <div className="absolute top-0 left-0 bg-indigo-600 text-white text-xs px-1.5 py-0.5 rounded-br-md font-bold">
                                        {index === 0 ? 'Start' : index + 1}
                                    </div>
                                </div>

                                <div className="flex-1">
                                    <label className="text-xs text-slate-400 font-medium mb-1 block">Overlay Text</label>
                                    <input
                                        type="text"
                                        value={frame.textOverlay}
                                        onChange={(e) => updateFrameText(frame.id, e.target.value)}
                                        placeholder="Enter text..."
                                        className="w-full bg-slate-900 border border-slate-700 rounded-md px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                                    />
                                </div>

                                <div className="flex flex-col gap-1 items-center">
                                    <button
                                        onClick={() => moveFrame(index, 'up')}
                                        disabled={index === 0}
                                        className="p-1 text-slate-400 hover:text-indigo-300 disabled:opacity-30 transition-colors"
                                        title="Move Up"
                                    >
                                        <ArrowUp size={16} />
                                    </button>
                                    <button
                                        onClick={() => moveFrame(index, 'down')}
                                        disabled={index === frames.length - 1}
                                        className="p-1 text-slate-400 hover:text-indigo-300 disabled:opacity-30 transition-colors"
                                        title="Move Down"
                                    >
                                        <ArrowDown size={16} />
                                    </button>
                                </div>

                                <button
                                    onClick={() => removeFrame(frame.id)}
                                    className="p-2 text-slate-500 hover:text-red-400 transition-colors"
                                    title="Remove Frame"
                                >
                                    <X size={18} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Generate Action */}
            <div className="pt-4 border-t border-slate-800">
                <button
                    onClick={generateGIF}
                    disabled={frames.length < 2 || isGenerating || isProcessing}
                    className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg ${frames.length < 2 || isProcessing
                        ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                        : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-900/20 hover:scale-[1.01]'
                        }`}
                >
                    {isProcessing || isGenerating ? (
                        <>
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Generating GIF...
                        </>
                    ) : (
                        <>
                            <Play size={20} className="fill-current" />
                            Generate GIF Slideshow
                        </>
                    )}
                </button>
                {frames.length < 2 && (
                    <p className="text-center text-xs text-slate-500 mt-2">Add at least 2 images to enable generation</p>
                )}
            </div>
        </div>
    );
};

export default VideoGenerator;
