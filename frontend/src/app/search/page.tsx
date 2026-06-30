'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { api, resolveUrl } from '@/lib/api';
import Navbar from '@/components/Navbar';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import {
  Search,
  Filter,
  Volume2,
  Heart,
  Sliders,
  Tag,
  ArrowRight,
  Loader2,
  FileSearch,
} from 'lucide-react';

export default function SearchPage() {
  const { user, logout } = useAuth();
  
  // Search and filter state variables
  const [search, setSearch] = useState('');
  const [brand, setBrand] = useState('');
  const [plate, setPlate] = useState('');
  const [sw, setSw] = useState('');
  const [tag, setTag] = useState('');
  const [typingFeel, setTypingFeel] = useState('');
  const [favourite, setFavourite] = useState('');

  // Debounced states for search input
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 400);
    return () => clearTimeout(handler);
  }, [search]);

  // Build query string
  const queryParams = new URLSearchParams();
  if (debouncedSearch) queryParams.append('search', debouncedSearch);
  if (brand) queryParams.append('brand', brand);
  if (plate) queryParams.append('plate', plate);
  if (sw) queryParams.append('switch', sw);
  if (tag) queryParams.append('tag', tag);
  if (typingFeel) queryParams.append('typingFeel', typingFeel);
  if (favourite) queryParams.append('favourite', favourite);

  // Fetch setups based on query parameters
  const { data: setups, isLoading } = useQuery({
    queryKey: ['setups-search', queryParams.toString()],
    queryFn: () => api.get(`/setups?${queryParams.toString()}`),
    enabled: !!user,
  });

  const clearFilters = () => {
    setSearch('');
    setBrand('');
    setPlate('');
    setSw('');
    setTag('');
    setTypingFeel('');
    setFavourite('');
  };

  const getTypingFeelLabel = (val: number) => {
    if (val <= 3) return 'Soft';
    if (val <= 7) return 'Medium';
    return 'Firm';
  };

  return (
    <div className="min-h-screen bg-[#fafafa] text-[#121212] flex flex-col font-geek">
      <Navbar user={user} onLogout={logout} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in flex flex-col gap-6">
        
        {/* Header */}
        <div className="border-b-2 border-slate-900 pb-4">
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight font-pixel uppercase flex items-center gap-2">
            <Search className="w-6 h-6 text-slate-900" />
            <span>Search & Filter Library</span>
          </h1>
          <p className="text-slate-500 mt-1 text-xs uppercase tracking-wider">
            [ QUERY ENGINE: ACTIVE • MONOSPACED SPEC LOOKUP ]
          </p>
        </div>

        {/* Filters Panel & Search Results Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          
          {/* LEFT COLUMN: Filtering panel */}
          <div className="geek-card p-5 space-y-5 lg:sticky lg:top-20 bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <div className="flex items-center justify-between border-b-2 border-slate-900 pb-2.5">
              <h2 className="text-[10px] font-bold text-slate-900 uppercase tracking-widest flex items-center gap-1.5 font-pixel">
                <Filter className="w-3.5 h-3.5" />
                <span>Filters</span>
              </h2>
              <button
                onClick={clearFilters}
                className="text-[9px] font-bold text-slate-500 hover:text-slate-900 uppercase tracking-wider transition-colors cursor-pointer"
              >
                Clear All
              </button>
            </div>

            {/* Keyword Search */}
            <div className="space-y-1.5">
              <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider">
                Keyword Search
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Search className="w-3.5 h-3.5" />
                </div>
                <input
                  type="text"
                  placeholder="HMX / Plate / Keycap..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 bg-slate-50 border-2 border-slate-900 focus:bg-white focus:ring-1 focus:ring-slate-900 outline-none text-xs text-slate-900 placeholder:text-slate-400 font-geek"
                />
              </div>
            </div>

            {/* Brand Filter */}
            <div className="space-y-1.5">
              <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider">
                Brand / Maker
              </label>
              <input
                type="text"
                placeholder="e.g. Neo / Keychron"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border-2 border-slate-900 focus:bg-white focus:ring-1 focus:ring-slate-900 outline-none text-xs text-slate-900 placeholder:text-slate-400 font-geek"
              />
            </div>

            {/* Switch Filter */}
            <div className="space-y-1.5">
              <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider">
                Switch model
              </label>
              <input
                type="text"
                placeholder="e.g. Hyacinth / Black Ink"
                value={sw}
                onChange={(e) => setSw(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border-2 border-slate-900 focus:bg-white focus:ring-1 focus:ring-slate-900 outline-none text-xs text-slate-900 placeholder:text-slate-400 font-geek"
              />
            </div>

            {/* Plate Filter */}
            <div className="space-y-1.5">
              <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider">
                Plate Material
              </label>
              <select
                value={plate}
                onChange={(e) => setPlate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border-2 border-slate-900 focus:bg-white focus:ring-1 focus:ring-slate-900 outline-none text-xs text-slate-900 cursor-pointer font-geek"
              >
                <option value="">Any Plate</option>
                <option value="FR4">FR4</option>
                <option value="PC">Polycarbonate (PC)</option>
                <option value="POM">POM</option>
                <option value="Aluminum">Aluminum</option>
                <option value="Brass">Brass</option>
                <option value="Carbon Fiber">Carbon Fiber</option>
                <option value="Plateless">Plateless</option>
              </select>
            </div>

            {/* Sound Tag Filter */}
            <div className="space-y-1.5">
              <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider">
                Sound Profile
              </label>
              <select
                value={tag}
                onChange={(e) => setTag(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border-2 border-slate-900 focus:bg-white focus:ring-1 focus:ring-slate-900 outline-none text-xs text-slate-900 cursor-pointer font-geek"
              >
                <option value="">Any Profile</option>
                <option value="clacky">Clacky</option>
                <option value="thocky">Thocky</option>
                <option value="creamy">Creamy</option>
                <option value="marble">Marble</option>
                <option value="poppy">Poppy</option>
                <option value="muted">Muted</option>
                <option value="deep">Deep</option>
                <option value="loud">Loud</option>
              </select>
            </div>

            {/* Typing feel rating */}
            <div className="space-y-1.5">
              <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider">
                Typing Feel Rating
              </label>
              <select
                value={typingFeel}
                onChange={(e) => setTypingFeel(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border-2 border-slate-900 focus:bg-white focus:ring-1 focus:ring-slate-900 outline-none text-xs text-slate-900 cursor-pointer font-geek"
              >
                <option value="">Any Feeling</option>
                <option value="1">1 (Very Soft)</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
                <option value="5">5 (Medium)</option>
                <option value="6">6</option>
                <option value="7">7</option>
                <option value="8">8</option>
                <option value="9">9</option>
                <option value="10">10 (Very Firm)</option>
              </select>
            </div>

            {/* Favorite toggle */}
            <div className="space-y-1.5">
              <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider">
                Favourites
              </label>
              <select
                value={favourite}
                onChange={(e) => setFavourite(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border-2 border-slate-900 focus:bg-white focus:ring-1 focus:ring-slate-900 outline-none text-xs text-slate-900 cursor-pointer font-geek"
              >
                <option value="">All Setups</option>
                <option value="true">Favourites Only</option>
              </select>
            </div>
          </div>

          {/* RIGHT COLUMN: Results grid */}
          <div className="lg:col-span-3 space-y-4">
            {isLoading ? (
              <div className="p-12 text-center flex flex-col items-center justify-center gap-3">
                <Loader2 className="w-7 h-7 text-slate-900 animate-spin" />
                <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">[ Running search query... ]</span>
              </div>
            ) : setups && setups.length > 0 ? (
              <div className="space-y-4">
                {setups.map((setup: any) => {
                  const swConfig = setup.switches?.[0];
                  const kcConfig = setup.keycaps?.[0];
                  const plConfig = setup.plates?.[0];
                  
                  return (
                    <div
                      key={setup.id}
                      className="geek-card p-5 bg-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:border-emerald-500 transition-all"
                    >
                      {/* Title row */}
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div>
                          <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block mb-0.5">
                            {setup.keyboard?.brand} {setup.keyboard?.name}
                          </span>
                          <h3 className="text-sm font-bold text-slate-900 uppercase font-pixel tracking-wider hover:text-indigo-600 transition-colors">
                            <Link href={`/setups/${setup.id}`}>{setup.name}</Link>
                          </h3>
                        </div>

                        {setup.favourite && (
                          <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
                        )}
                      </div>

                      {/* Small parameters block */}
                      <div className="flex flex-wrap gap-x-6 gap-y-2 p-3 border-2 border-slate-900 bg-slate-50 text-[10px] font-bold uppercase tracking-wider mb-3">
                        {swConfig && (
                          <div>
                            <span className="text-[8px] text-slate-500 block">
                              Switch
                            </span>
                            <span>{swConfig.brand} {swConfig.model}</span>
                          </div>
                        )}
                        {kcConfig && (
                          <div>
                            <span className="text-[8px] text-slate-500 block">
                              Keycaps
                            </span>
                            <span>{kcConfig.profile} • {kcConfig.material}</span>
                          </div>
                        )}
                        {plConfig && (
                          <div>
                            <span className="text-[8px] text-slate-500 block">
                              Plate
                            </span>
                            <span>{plConfig.material}</span>
                          </div>
                        )}
                        <div>
                          <span className="text-[8px] text-slate-500 block">
                            Typing Feel
                          </span>
                          <span className="text-indigo-600">
                            {setup.typing_feel} <span className="text-[8px] text-slate-500 font-normal">/10</span>
                          </span>
                        </div>
                      </div>

                      {/* Sound profiles & audio preview indicators */}
                      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t-2 border-slate-900 border-dashed">
                        <div className="flex flex-wrap gap-1 items-center">
                          {setup.sound_tags && setup.sound_tags.length > 0 && (
                            <>
                              <Tag className="w-3 h-3 text-slate-400 shrink-0" />
                              {setup.sound_tags.map(({ tag: t }: any) => (
                                <span
                                  key={t.id}
                                  className="px-2 py-0.5 border border-emerald-400 bg-emerald-50 text-[9px] text-emerald-800 font-bold uppercase tracking-wider"
                                >
                                  {t.tag}
                                </span>
                              ))}
                            </>
                          )}
                        </div>

                        <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-wider text-slate-500 ml-auto">
                          {setup.audio_files?.length > 0 && (
                            <span className="flex items-center gap-1">
                              <Volume2 className="w-3.5 h-3.5 text-slate-400" />
                              <span>{setup.audio_files.length} audio logs</span>
                            </span>
                          )}
                          <Link
                            href={`/setups/${setup.id}`}
                            className="text-indigo-600 hover:text-indigo-800 flex items-center gap-1 group/btn cursor-pointer"
                          >
                            <span>Open [→]</span>
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="geek-card p-16 text-center flex flex-col items-center justify-center bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <div className="w-12 h-12 bg-slate-100 border-2 border-slate-900 flex items-center justify-center mb-4">
                  <FileSearch className="w-6 h-6 text-slate-900" />
                </div>
                <h3 className="text-xs font-bold text-slate-900 uppercase font-pixel mb-1">No configurations match query</h3>
                <p className="text-[10px] text-slate-500 uppercase tracking-wider max-w-xs leading-relaxed">
                  Try adjusting search terms or clearing selected filter elements.
                </p>
                <button
                  onClick={clearFilters}
                  className="geek-btn mt-5 px-4 py-2 text-xs uppercase tracking-wider"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
