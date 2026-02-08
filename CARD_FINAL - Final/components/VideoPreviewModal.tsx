
import React, { useState, useEffect } from 'react';
import { X, Play, Pause, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { GeneratedVideo } from '../types';

interface VideoPreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    video: GeneratedVideo | null;
}

const VideoPreviewModal: React.FC<VideoPreviewModalProps> = ({ isOpen, onClose, video }) => {
    const [currentFrameIndex, setCurrentFrameIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(true);

    if (!isOpen || !video) return null;

    const totalFrames = video.frames.length;

    useEffect(() => {
        let interval: ReturnType<typeof setInterval>;
        if (isPlaying) {
            interval = setInterval(() => {
                setCurrentFrameIndex((prev) => {
                    if (prev >= totalFrames - 1) {
                        return 0; // Loop back to start
                    }
                    return prev + 1;
                });
            }, 3000); // 3 seconds per frame
        }
        return () => clearInterval(interval);
    }, [isPlaying, totalFrames]);

    const handleNext = () => {
        setCurrentFrameIndex((prev) => (prev + 1) % totalFrames);
        setIsPlaying(false); // Pause on manual interaction
    };

    const handlePrev = () => {
        setCurrentFrameIndex((prev) => (prev - 1 + totalFrames) % totalFrames);
        setIsPlaying(false);
    };

    const currentFrame = video.frames[currentFrameIndex];



    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">

            {/* Modal Container - 50% width on large screens as requested */}
            <div className="bg-slate-900 rounded-2xl shadow-2xl border border-slate-800 w-full max-w-lg lg:w-[50vw] overflow-hidden flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                        <Play size={18} className="text-indigo-500" />
                        Video Preview
                    </h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Content - The "Screen" */}
                <div className="relative flex-1 bg-black aspect-video flex items-center justify-center overflow-hidden group">

                    {video.gifUrl ? (
                        <div className="w-full h-full flex items-center justify-center bg-black animate-in fade-in duration-500">
                            <img
                                src={video.gifUrl}
                                alt="Generated GIF"
                                className="max-w-full max-h-full object-contain shadow-2xl"
                            />
                        </div>
                    ) : (
                        <>
                            {/* Direct Render of Current Frame - Simplified for Stability */}
                            {currentFrame && (
                                <div className="absolute inset-0 w-full h-full flex items-center justify-center animate-in fade-in duration-300" key={currentFrame.id}>
                                    <img
                                        src={currentFrame.imageUrl}
                                        alt={`Frame ${currentFrameIndex + 1}`}
                                        className="w-full h-full object-contain"
                                    />

                                    {/* Text Overlay */}
                                    {currentFrame.textOverlay && (
                                        <div className="absolute bottom-8 left-0 right-0 text-center px-4">
                                            <div className="inline-block bg-black/60 backdrop-blur-md px-6 py-3 rounded-xl text-white font-medium text-lg shadow-lg">
                                                {currentFrame.textOverlay}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Controls Overlay (Hidden when playing, shown on hover/pause) */}
                            <div className={`absolute inset-0 flex items-center justify-between px-4 transition-opacity duration-300 ${isPlaying ? 'opacity-0 group-hover:opacity-100' : 'opacity-100'}`}>
                                <button onClick={handlePrev} className="p-2 rounded-full bg-black/50 hover:bg-white/20 text-white backdrop-blur-sm transition-all">
                                    <ChevronLeft size={24} />
                                </button>

                                <button
                                    onClick={() => setIsPlaying(!isPlaying)}
                                    className="p-4 rounded-full bg-indigo-600/90 hover:bg-indigo-500 text-white shadow-lg transform transition-all hover:scale-110 active:scale-95"
                                >
                                    {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" className="ml-1" />}
                                </button>

                                <button onClick={handleNext} className="p-2 rounded-full bg-black/50 hover:bg-white/20 text-white backdrop-blur-sm transition-all">
                                    <ChevronRight size={24} />
                                </button>
                            </div>

                            {/* Progress Indicator */}
                            <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-md px-3 py-1 rounded-full text-xs font-mono text-white/80 border border-white/10">
                                {currentFrameIndex + 1} / {totalFrames}
                            </div>
                        </>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="p-4 bg-slate-900 border-t border-slate-800 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-slate-300 hover:text-white font-medium transition-colors"
                    >
                        Close Preview
                    </button>

                    {video.gifUrl ? (
                        <a
                            href={video.gifUrl}
                            download={`greeting_card_${video.id}.gif`}
                            className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium shadow-lg shadow-indigo-900/20 flex items-center gap-2 transition-all no-underline"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" x2="12" y1="15" y2="3" /></svg>
                            Download GIF
                        </a>
                    ) : (
                        <button
                            onClick={onClose}
                            className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium shadow-lg shadow-indigo-900/20 flex items-center gap-2 transition-all"
                        >
                            <Check size={18} />
                            Done
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default VideoPreviewModal;
