
import React from 'react';
import { Play } from 'lucide-react';
import { GeneratedVideo } from '../types';

interface VideoGalleryProps {
    videos: GeneratedVideo[];
    onPlay: (video: GeneratedVideo) => void;
}

const VideoGallery: React.FC<VideoGalleryProps> = ({ videos, onPlay }) => {
    if (videos.length === 0) {
        return (
            <div className="text-center py-12">
                <div className="bg-slate-800/50 p-6 rounded-full inline-block mb-4">
                    <Play size={32} className="text-slate-600 ml-1" />
                </div>
                <p className="text-slate-400">No videos generated yet.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {videos.map((video) => (
                <div
                    key={video.id}
                    className="group relative bg-slate-800 rounded-xl overflow-hidden shadow-lg border border-slate-700 hover:border-indigo-500 transition-all cursor-pointer"
                    onClick={() => onPlay(video)}
                >
                    {/* Thumbnail (First Frame) */}
                    <div className="aspect-video relative">
                        <img
                            src={video.frames[0]?.imageUrl}
                            alt="Video Thumbnail"
                            className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="bg-indigo-600/90 text-white p-3 rounded-full shadow-lg group-hover:scale-110 transition-transform">
                                <Play size={24} fill="currentColor" className="ml-1" />
                            </div>
                        </div>
                        <div className="absolute bottom-2 right-2 bg-black/60 px-2 py-1 rounded text-xs text-white">
                            {video.frames.length} Slides
                        </div>
                    </div>

                    <div className="p-4">
                        <h4 className="font-semibold text-white mb-1">Generated Video</h4>
                        <p className="text-xs text-slate-400">
                            {new Date(video.createdAt).toLocaleDateString()} • {new Date(video.createdAt).toLocaleTimeString()}
                        </p>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default VideoGallery;
