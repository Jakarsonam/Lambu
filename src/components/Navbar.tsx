import React from 'react';
import { TabType } from '../types';
import { Sparkles, Film, Image as ImageIcon, Coffee, HeartHandshake, Layers, Music, Play, Pause } from 'lucide-react';
import { sharedMusicEngine } from '../utils/bhutaneseAudio';

interface NavbarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  galleryCount: number;
  isMusicPlaying?: boolean;
  onToggleMusic?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  galleryCount,
  isMusicPlaying = false,
  onToggleMusic,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-[#13110e]/90 border-b border-amber-900/30 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Identity */}
          <div
            onClick={() => setActiveTab('restaurant')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-600 to-amber-800 p-0.5 shadow-lg shadow-amber-950/50 flex items-center justify-center transform group-hover:scale-105 transition-all">
              <div className="w-full h-full bg-[#1b1712] rounded-[10px] flex items-center justify-center">
                <Coffee className="w-5 h-5 text-amber-400 group-hover:text-amber-300 transition-colors" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-serif-title text-xl sm:text-2xl font-bold tracking-wide text-amber-100 group-hover:text-white transition-colors">
                  Phunsto Lumbu
                </h1>
                <span className="px-2 py-0.5 text-[10px] tracking-wider uppercase font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/20 rounded-full">
                  Retreat & Lounge
                </span>
              </div>
              <p className="text-xs text-amber-400/70 font-medium">
                Traditional Himalayan Dining & Creative AI Studio
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            <button
              onClick={() => setActiveTab('restaurant')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'restaurant'
                  ? 'bg-amber-600/20 text-amber-200 border border-amber-500/40 shadow-sm shadow-amber-900/40'
                  : 'text-amber-300/70 hover:text-amber-200 hover:bg-white/5'
              }`}
            >
              <HeartHandshake className="w-4 h-4 text-amber-400" />
              <span>Seniors Evening</span>
            </button>

            <button
              onClick={() => setActiveTab('music')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'music'
                  ? 'bg-amber-600/20 text-amber-200 border border-amber-500/40 shadow-sm shadow-amber-900/40'
                  : 'text-amber-300/70 hover:text-amber-200 hover:bg-white/5'
              }`}
            >
              <Music className={`w-4 h-4 ${isMusicPlaying ? 'text-amber-400 animate-bounce' : 'text-amber-400'}`} />
              <span>Bhutanese Music</span>
              <span className="text-[10px] px-1.5 py-0.5 bg-amber-500/20 text-amber-300 rounded font-mono">
                Lyria
              </span>
            </button>

            <button
              onClick={() => setActiveTab('image-studio')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'image-studio'
                  ? 'bg-amber-600/20 text-amber-200 border border-amber-500/40 shadow-sm shadow-amber-900/40'
                  : 'text-amber-300/70 hover:text-amber-200 hover:bg-white/5'
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Create & Edit Images</span>
              <span className="text-[10px] px-1.5 py-0.5 bg-amber-500/20 text-amber-300 rounded font-mono">
                Gemini
              </span>
            </button>

            <button
              onClick={() => setActiveTab('video-animator')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'video-animator'
                  ? 'bg-amber-600/20 text-amber-200 border border-amber-500/40 shadow-sm shadow-amber-900/40'
                  : 'text-amber-300/70 hover:text-amber-200 hover:bg-white/5'
              }`}
            >
              <Film className="w-4 h-4 text-amber-400" />
              <span>Animate to Video</span>
              <span className="text-[10px] px-1.5 py-0.5 bg-amber-500/20 text-amber-300 rounded font-mono">
                Veo
              </span>
            </button>

            <button
              onClick={() => setActiveTab('gallery')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'gallery'
                  ? 'bg-amber-600/20 text-amber-200 border border-amber-500/40 shadow-sm shadow-amber-900/40'
                  : 'text-amber-300/70 hover:text-amber-200 hover:bg-white/5'
              }`}
            >
              <Layers className="w-4 h-4 text-amber-400" />
              <span>Gallery</span>
              {galleryCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-amber-600 text-white text-[11px] font-bold flex items-center justify-center">
                  {galleryCount}
                </span>
              )}
            </button>
          </nav>

          {/* Quick Play Bhutanese Music Button in Header */}
          <div className="flex items-center gap-2">
            <button
              onClick={onToggleMusic}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all ${
                isMusicPlaying
                  ? 'bg-amber-500 text-neutral-950 border-amber-400 shadow-md shadow-amber-500/30'
                  : 'bg-amber-950/30 text-amber-300 border-amber-600/30 hover:bg-amber-900/40'
              }`}
              title={isMusicPlaying ? 'Pause Bhutanese Music' : 'Play Bhutanese Music'}
            >
              {isMusicPlaying ? (
                <>
                  <Pause className="w-3.5 h-3.5 fill-current" />
                  <span className="hidden sm:inline">Playing Music</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                  <span className="hidden sm:inline">Play Bhutanese Music</span>
                </>
              )}
            </button>

            <button
              onClick={() => setActiveTab('gallery')}
              className="md:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 text-amber-300 text-xs border border-white/10"
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>{galleryCount}</span>
            </button>
          </div>
        </div>

        {/* Mobile Submenu Bar */}
        <div className="flex md:hidden items-center justify-around py-2.5 border-t border-amber-950/40 text-xs overflow-x-auto gap-1">
          <button
            onClick={() => setActiveTab('restaurant')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap ${
              activeTab === 'restaurant'
                ? 'bg-amber-600/30 text-amber-200 font-semibold'
                : 'text-amber-400/70'
            }`}
          >
            Seniors Evening
          </button>
          <button
            onClick={() => setActiveTab('music')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap ${
              activeTab === 'music'
                ? 'bg-amber-600/30 text-amber-200 font-semibold'
                : 'text-amber-400/70'
            }`}
          >
            Bhutanese Music
          </button>
          <button
            onClick={() => setActiveTab('image-studio')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap ${
              activeTab === 'image-studio'
                ? 'bg-amber-600/30 text-amber-200 font-semibold'
                : 'text-amber-400/70'
            }`}
          >
            Create / Edit
          </button>
          <button
            onClick={() => setActiveTab('video-animator')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap ${
              activeTab === 'video-animator'
                ? 'bg-amber-600/30 text-amber-200 font-semibold'
                : 'text-amber-400/70'
            }`}
          >
            Veo Animate
          </button>
          <button
            onClick={() => setActiveTab('gallery')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap ${
              activeTab === 'gallery'
                ? 'bg-amber-600/30 text-amber-200 font-semibold'
                : 'text-amber-400/70'
            }`}
          >
            Gallery ({galleryCount})
          </button>
        </div>
      </div>
    </header>
  );
};
