import React, { useState } from 'react';
import { GalleryItem } from '../types';
import {
  Film,
  Image as ImageIcon,
  Download,
  Sparkles,
  Layers,
  Clock,
  Play,
  Pause,
  Trash2,
  Music
} from 'lucide-react';

interface GalleryViewProps {
  items: GalleryItem[];
  onAnimateInVeo: (url: string) => void;
  onEditInStudio: (url: string) => void;
  onClearGallery: () => void;
}

export const GalleryView: React.FC<GalleryViewProps> = ({
  items,
  onAnimateInVeo,
  onEditInStudio,
  onClearGallery,
}) => {
  const [filter, setFilter] = useState<'all' | 'image' | 'video' | 'music'>('all');
  const [activeMediaModal, setActiveMediaModal] = useState<GalleryItem | null>(null);
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);

  const filteredItems = items.filter((item) => {
    if (filter === 'all') return true;
    return item.type === filter;
  });

  const toggleAudio = (id: string, url: string) => {
    if (playingAudioId === id) {
      setPlayingAudioId(null);
    } else {
      setPlayingAudioId(id);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-8">
      {/* Title & Filter */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-6 border-b border-amber-950/60">
        <div>
          <h2 className="font-serif-title text-2xl sm:text-3xl font-bold text-amber-100">
            Creative Gallery & Media Vault
          </h2>
          <p className="text-amber-300/70 text-xs sm:text-sm mt-1">
            Browse and export all synthesized images, Veo videos, and Bhutanese music tracks.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="inline-flex p-1 rounded-xl bg-[#16130f] border border-amber-900/40 text-xs">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                filter === 'all' ? 'bg-amber-600 text-white font-semibold' : 'text-amber-400/70'
              }`}
            >
              All ({items.length})
            </button>
            <button
              onClick={() => setFilter('image')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                filter === 'image' ? 'bg-amber-600 text-white font-semibold' : 'text-amber-400/70'
              }`}
            >
              Images ({items.filter((i) => i.type === 'image').length})
            </button>
            <button
              onClick={() => setFilter('video')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                filter === 'video' ? 'bg-amber-600 text-white font-semibold' : 'text-amber-400/70'
              }`}
            >
              Videos ({items.filter((i) => i.type === 'video').length})
            </button>
            <button
              onClick={() => setFilter('music')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                filter === 'music' ? 'bg-amber-600 text-white font-semibold' : 'text-amber-400/70'
              }`}
            >
              Music ({items.filter((i) => i.type === 'music').length})
            </button>
          </div>

          {items.length > 0 && (
            <button
              onClick={onClearGallery}
              className="p-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-amber-400/60 hover:text-red-400 border border-amber-950/60 transition-colors"
              title="Clear Gallery"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Grid of Items */}
      {filteredItems.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-amber-900/40 bg-[#16130f]/60 p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-xl bg-amber-600/10 flex items-center justify-center text-amber-400 mx-auto">
            <Layers className="w-6 h-6" />
          </div>
          <h3 className="font-serif-title text-lg font-bold text-amber-100">
            No media in this view yet
          </h3>
          <p className="text-xs text-amber-400/60 max-w-sm mx-auto">
            Generate images, animate videos with Veo, or compose Bhutanese music with Lyria to see them stored here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="group bg-[#16130f] border border-amber-900/40 hover:border-amber-600/50 rounded-2xl overflow-hidden shadow-xl transition-all flex flex-col justify-between"
            >
              {/* Media Preview */}
              <div className="relative aspect-[16/9] bg-black overflow-hidden flex items-center justify-center">
                {item.type === 'video' ? (
                  <div className="relative w-full h-full flex items-center justify-center">
                    <video
                      src={item.url}
                      className="w-full h-full object-cover"
                      muted
                      loop
                      playsInline
                      onMouseOver={(e) => (e.target as HTMLVideoElement).play().catch(() => {})}
                      onMouseOut={(e) => (e.target as HTMLVideoElement).pause()}
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:opacity-0 transition-opacity pointer-events-none">
                      <div className="w-10 h-10 rounded-full bg-amber-600/80 text-white flex items-center justify-center shadow-lg">
                        <Play className="w-5 h-5 ml-0.5" />
                      </div>
                    </div>
                  </div>
                ) : item.type === 'music' ? (
                  <div className="w-full h-full bg-gradient-to-br from-[#1a140f] via-[#120e0a] to-[#201811] p-4 flex flex-col items-center justify-center text-center space-y-2">
                    <div className="w-12 h-12 rounded-full bg-amber-600/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                      <Music className="w-6 h-6 animate-pulse" />
                    </div>
                    <audio
                      src={item.url}
                      controls
                      className="w-full max-w-[200px] h-8 mt-2 opacity-80"
                    />
                  </div>
                ) : (
                  <img
                    src={item.url}
                    alt={item.prompt}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                )}

                {/* Badge */}
                <div className="absolute top-2.5 left-2.5">
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide shadow-md ${
                      item.type === 'video'
                        ? 'bg-amber-500 text-black'
                        : item.type === 'music'
                        ? 'bg-amber-600 text-white'
                        : 'bg-black/75 text-amber-300 border border-white/10'
                    }`}
                  >
                    {item.type === 'video' ? (
                      <Film className="w-3 h-3" />
                    ) : item.type === 'music' ? (
                      <Music className="w-3 h-3" />
                    ) : (
                      <ImageIcon className="w-3 h-3" />
                    )}
                    <span>
                      {item.type === 'video'
                        ? 'Veo Video'
                        : item.type === 'music'
                        ? 'Lyria Music'
                        : 'Gemini Image'}
                    </span>
                  </span>
                </div>
              </div>

              {/* Content / Prompt description */}
              <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                <div>
                  <p className="text-xs font-medium text-amber-100 line-clamp-2">
                    {item.prompt}
                  </p>
                  <div className="flex items-center justify-between text-[10px] text-amber-400/60 mt-2 font-mono">
                    <span>{new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    <span>{item.model}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-2 border-t border-amber-950/60">
                  {item.type === 'image' && (
                    <>
                      <button
                        onClick={() => onAnimateInVeo(item.url)}
                        className="flex-1 py-1.5 px-2 rounded-lg bg-amber-600/20 hover:bg-amber-600 text-amber-200 hover:text-white text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <Film className="w-3 h-3" />
                        <span>Animate</span>
                      </button>
                      <button
                        onClick={() => onEditInStudio(item.url)}
                        className="py-1.5 px-2.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-amber-300 text-xs font-medium border border-amber-500/20 transition-colors"
                        title="Edit with Gemini"
                      >
                        <Sparkles className="w-3 h-3" />
                      </button>
                    </>
                  )}

                  {item.type === 'video' && (
                    <button
                      onClick={() => setActiveMediaModal(item)}
                      className="flex-1 py-1.5 px-2 rounded-lg bg-amber-600/20 hover:bg-amber-600 text-amber-200 hover:text-white text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Play className="w-3 h-3" />
                      <span>Play Full Video</span>
                    </button>
                  )}

                  {item.type === 'music' && (
                    <button
                      onClick={() => setActiveMediaModal(item)}
                      className="flex-1 py-1.5 px-2 rounded-lg bg-amber-600/20 hover:bg-amber-600 text-amber-200 hover:text-white text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Play className="w-3 h-3" />
                      <span>Play Track</span>
                    </button>
                  )}

                  <a
                    href={item.url}
                    download={
                      item.type === 'video'
                        ? `veo-${item.id}.mp4`
                        : item.type === 'music'
                        ? `lyria-${item.id}.mp3`
                        : `gemini-${item.id}.png`
                    }
                    className="p-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-amber-300 text-xs border border-amber-500/20 transition-colors"
                    title="Download"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Video / Music Modal Player */}
      {activeMediaModal && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-3xl w-full bg-[#16130f] border border-amber-600/40 rounded-2xl overflow-hidden shadow-2xl p-4 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-amber-950/60">
              <span className="text-xs font-bold text-amber-200">
                {activeMediaModal.type === 'music' ? 'Lyria Bhutanese Music Player' : 'Veo Generated Video'}
              </span>
              <button
                onClick={() => setActiveMediaModal(null)}
                className="text-amber-400 hover:text-white text-xs font-semibold px-2 py-1"
              >
                ✕ Close
              </button>
            </div>

            {activeMediaModal.type === 'music' ? (
              <div className="p-8 bg-neutral-950 rounded-xl flex flex-col items-center justify-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-amber-600/20 border-2 border-amber-500/40 flex items-center justify-center text-amber-400">
                  <Music className="w-8 h-8 animate-bounce" />
                </div>
                <audio
                  src={activeMediaModal.url}
                  controls
                  autoPlay
                  className="w-full max-w-md"
                />
              </div>
            ) : (
              <div className="aspect-[16/9] bg-black rounded-xl overflow-hidden">
                <video
                  src={activeMediaModal.url}
                  controls
                  autoPlay
                  loop
                  className="w-full h-full object-contain"
                />
              </div>
            )}

            <p className="text-xs text-amber-300/80 italic">
              "{activeMediaModal.prompt}"
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
