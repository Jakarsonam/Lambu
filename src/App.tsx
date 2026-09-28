/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import restaurantImg from './assets/images/seniors_restaurant_1790584984164.jpg';
import { TabType, GalleryItem } from './types';
import { Navbar } from './components/Navbar';
import { SeniorsShowcase } from './components/SeniorsShowcase';
import { ImageStudio } from './components/ImageStudio';
import { VeoVideoAnimator } from './components/VeoVideoAnimator';
import { GalleryView } from './components/GalleryView';
import { BhutaneseMusicPlayer } from './components/BhutaneseMusicPlayer';
import { sharedMusicEngine, BHUTANESE_TRACKS } from './utils/bhutaneseAudio';
import { Coffee, Heart, Sparkles, Film, MapPin, Phone, Shield, Music, Play, Pause, Volume2 } from 'lucide-react';

const INITIAL_GALLERY_ITEM: GalleryItem = {
  id: 'phunsto-lumbu-seniors-masterpiece',
  type: 'image',
  url: restaurantImg,
  prompt: 'Seniors chilling out in Phunsto Lumbu Restaurant with caption Perfect for Seniors in evening',
  timestamp: Date.now() - 3600000,
  aspectRatio: '16:9',
  model: 'gemini-3.1-flash-image',
  title: 'Perfect for Seniors in evening',
};

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('restaurant');
  const [studioBaseImageUrl, setStudioBaseImageUrl] = useState<string | null>(null);
  const [animatorImageUrl, setAnimatorImageUrl] = useState<string | null>(null);
  const [isMusicPlaying, setIsMusicPlaying] = useState<boolean>(false);

  // Gallery storage
  const [gallery, setGallery] = useState<GalleryItem[]>(() => {
    try {
      const saved = localStorage.getItem('phunsto_lumbu_gallery');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Could not read gallery from localStorage:', e);
    }
    return [INITIAL_GALLERY_ITEM];
  });

  // Track music engine state
  useEffect(() => {
    const interval = setInterval(() => {
      const playing = sharedMusicEngine.getIsPlaying();
      if (playing !== isMusicPlaying) {
        setIsMusicPlaying(playing);
      }
    }, 500);
    return () => clearInterval(interval);
  }, [isMusicPlaying]);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('phunsto_lumbu_gallery', JSON.stringify(gallery));
    } catch (e) {
      console.warn('Could not save gallery to localStorage:', e);
    }
  }, [gallery]);

  const handleToggleGlobalMusic = () => {
    const defaultTrack = sharedMusicEngine.getCurrentTrack() || BHUTANESE_TRACKS[0];
    const newState = sharedMusicEngine.togglePlay(defaultTrack);
    setIsMusicPlaying(newState);
  };

  const handleAnimateInVeo = (imageUrl: string) => {
    setAnimatorImageUrl(imageUrl);
    setActiveTab('video-animator');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleEditInStudio = (imageUrl: string) => {
    setStudioBaseImageUrl(imageUrl);
    setActiveTab('image-studio');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSaveToGallery = (item: GalleryItem) => {
    setGallery((prev) => [item, ...prev]);
  };

  const handleClearGallery = () => {
    setGallery([INITIAL_GALLERY_ITEM]);
  };

  return (
    <div className="min-h-screen bg-[#0f0e0d] text-amber-50 flex flex-col font-sans selection:bg-amber-600/30 selection:text-amber-200">
      {/* Top Banner Notice */}
      <div className="bg-gradient-to-r from-amber-950 via-amber-900/60 to-amber-950 border-b border-amber-800/30 py-2 px-4 text-center text-xs text-amber-200/90 flex flex-wrap items-center justify-center gap-2">
        <Heart className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
        <span>
          Phunsto Lumbu Himalayan Sanctuary • Daily Senior Hours: 5:00 PM – 9:00 PM • Complimentary Himalayan Butter Tea
        </span>
        <button
          onClick={handleToggleGlobalMusic}
          className="ml-2 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-semibold border border-amber-400/30 transition-colors"
        >
          <Music className="w-3 h-3 text-amber-400" />
          <span>{isMusicPlaying ? 'Pause Bhutanese Music' : 'Play Bhutanese Music'}</span>
        </button>
      </div>

      {/* Main Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        galleryCount={gallery.length}
        isMusicPlaying={isMusicPlaying}
        onToggleMusic={handleToggleGlobalMusic}
      />

      {/* Main Content Body */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
        {activeTab === 'restaurant' && (
          <SeniorsShowcase
            onAnimateInVeo={handleAnimateInVeo}
            onEditInStudio={handleEditInStudio}
            onOpenMusic={() => {
              setActiveTab('music');
              handleToggleGlobalMusic();
            }}
          />
        )}

        {activeTab === 'music' && (
          <BhutaneseMusicPlayer
            onSaveToGallery={handleSaveToGallery}
            autoPlayOnMount={false}
          />
        )}

        {activeTab === 'image-studio' && (
          <ImageStudio
            initialBaseImageUrl={studioBaseImageUrl}
            onAnimateInVeo={handleAnimateInVeo}
            onSaveToGallery={handleSaveToGallery}
          />
        )}

        {activeTab === 'video-animator' && (
          <VeoVideoAnimator
            initialImageUrl={animatorImageUrl}
            onSaveToGallery={handleSaveToGallery}
          />
        )}

        {activeTab === 'gallery' && (
          <GalleryView
            items={gallery}
            onAnimateInVeo={handleAnimateInVeo}
            onEditInStudio={handleEditInStudio}
            onClearGallery={handleClearGallery}
          />
        )}
      </main>

      {/* Persistent Mini Music Player Bar (When music is playing and user is browsing other tabs) */}
      {isMusicPlaying && activeTab !== 'music' && (
        <aside
          aria-label="Now playing"
          className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40 bg-[#17130f]/95 backdrop-blur-md border border-amber-500/40 rounded-2xl p-3 shadow-2xl flex items-center gap-3 max-w-sm transition-all animate-in fade-in"
        >
          <div
            onClick={() => setActiveTab('music')}
            className="w-10 h-10 rounded-xl bg-amber-600/20 border border-amber-500/30 flex items-center justify-center text-amber-400 cursor-pointer"
          >
            <Music className="w-5 h-5 animate-pulse" />
          </div>

          <div
            onClick={() => setActiveTab('music')}
            className="cursor-pointer min-w-0 pr-2"
          >
            <p className="text-[11px] font-bold text-amber-200 uppercase tracking-wide truncate">
              Playing Bhutanese Folk
            </p>
            <p className="text-[10px] text-amber-400/80 truncate">
              {sharedMusicEngine.getCurrentTrack()?.title || 'Traditional Dranyen Lute'}
            </p>
          </div>

          <button
            onClick={handleToggleGlobalMusic}
            className="p-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 transition-colors shrink-0"
            title="Pause Music"
          >
            <Pause className="w-4 h-4 fill-current" />
          </button>
        </aside>
      )}

      {/* Footer */}
      <footer className="mt-16 border-t border-amber-950/80 bg-[#120f0d] py-12 text-amber-300/70 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Coffee className="w-5 h-5 text-amber-400" />
              <h4 className="font-serif-title text-base font-bold text-amber-100">
                Phunsto Lumbu Restaurant
              </h4>
            </div>
            <p className="text-amber-400/60 leading-relaxed text-xs">
              An authentic Himalayan haven of warmth, handcrafted teas, and gentle evening hospitality tailored for beloved seniors.
            </p>
            <div className="flex items-center gap-1.5 text-amber-400 font-medium text-[11px]">
              <MapPin className="w-3.5 h-3.5" />
              <span>Himalayan Mountain Way • Heritage District</span>
            </div>
          </div>

          <div className="space-y-2">
            <h5 className="font-semibold text-amber-200 uppercase tracking-wider text-[11px]">
              Senior Evening Hours
            </h5>
            <p className="text-amber-300/80">Everyday: 5:00 PM – 9:00 PM</p>
            <p className="text-amber-400/60">Acoustic volume kept under 55dB for hearing ease</p>
            <p className="text-amber-400/60">Wheelchair & walker step-free access verified</p>
          </div>

          <div className="space-y-2">
            <h5 className="font-semibold text-amber-200 uppercase tracking-wider text-[11px]">
              AI Studio Models
            </h5>
            <ul className="space-y-1.5">
              <li className="flex items-center gap-1.5 text-amber-300/80">
                <Music className="w-3.5 h-3.5 text-amber-400" />
                <span>Music: lyria-3-clip-preview & lyria-3-pro-preview</span>
              </li>
              <li className="flex items-center gap-1.5 text-amber-300/80">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Image: gemini-3.1-flash-image-preview</span>
              </li>
              <li className="flex items-center gap-1.5 text-amber-300/80">
                <Film className="w-3.5 h-3.5 text-amber-400" />
                <span>Video: veo-3.1-fast-generate-preview</span>
              </li>
            </ul>
          </div>

          <div className="space-y-2">
            <h5 className="font-semibold text-amber-200 uppercase tracking-wider text-[11px]">
              Hospitality Guarantee
            </h5>
            <div className="flex items-start gap-2">
              <Shield className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <p className="text-amber-400/60 leading-relaxed">
                Dedicated senior hosts assist with seating, coat care, and personalized tea infusions on every visit.
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 pt-8 border-t border-amber-950/50 flex flex-col sm:flex-row items-center justify-between text-amber-500/50 text-[11px]">
          <p>© {new Date().getFullYear()} Phunsto Lumbu Restaurant & AI Studio. All rights reserved.</p>
          <p className="mt-2 sm:mt-0 font-serif-title italic">"Perfect for Seniors in evening • Authentic Bhutanese Melodies"</p>
        </div>
      </footer>
    </div>
  );
}
