'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { api, resolveUrl } from '@/lib/api';
import Navbar from '@/components/Navbar';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Keyboard as KeyboardIcon,
  Layers,
  Music,
  Heart,
  Plus,
  ArrowRight,
  FolderOpen,
  Volume2,
  Calendar,
  X,
  Loader2,
} from 'lucide-react';

export default function DashboardPage() {
  const { user, loading: authLoading, logout } = useAuth();
  const queryClient = useQueryClient();
  const router = useRouter();

  // Create Keyboard Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [kbName, setKbName] = useState('');
  const [kbBrand, setKbBrand] = useState('');
  const [kbLayout, setKbLayout] = useState('65%');
  const [kbColour, setKbColour] = useState('');
  const [kbImageUrl, setKbImageUrl] = useState('');
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState('');

  // Fetch metrics
  const { data: metrics, isLoading: metricsLoading } = useQuery({
    queryKey: ['metrics'],
    queryFn: () => api.get('/setups/metrics'),
    enabled: !!user,
  });

  // Fetch keyboards
  const { data: keyboards, isLoading: keyboardsLoading } = useQuery({
    queryKey: ['keyboards'],
    queryFn: () => api.get('/keyboards'),
    enabled: !!user,
  });

  // Submit Keyboard form
  const handleCreateKeyboard = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError('');
    setCreateLoading(true);

    try {
      await api.post('/keyboards', {
        name: kbName,
        brand: kbBrand,
        layout: kbLayout,
        colour: kbColour,
        image_url: kbImageUrl,
      });

      queryClient.invalidateQueries({ queryKey: ['keyboards'] });
      queryClient.invalidateQueries({ queryKey: ['metrics'] });
      
      // Reset form
      setKbName('');
      setKbBrand('');
      setKbLayout('65%');
      setKbColour('');
      setKbImageUrl('');
      setIsModalOpen(false);
    } catch (err: unknown) {
      setCreateError(err instanceof Error ? err.message : 'Failed to create keyboard');
    } finally {
      setCreateLoading(false);
    }
  };

  if (authLoading || metricsLoading || keyboardsLoading) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex items-center justify-center flex-col gap-3 font-geek text-[#121212]">
        <Loader2 className="w-8 h-8 text-slate-900 animate-spin" />
        <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">[ Loading Workspace... ]</span>
      </div>
    );
  }

  const stats = metrics?.stats || { keyboards: 0, setups: 0, audioFiles: 0, favorites: 0 };
  const recentSetups = metrics?.recentSetups || [];

  return (
    <div className="min-h-screen bg-[#fafafa] text-[#121212] flex flex-col font-geek">
      <Navbar user={user} onLogout={logout} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in space-y-8">
        
        {/* Welcome Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b-2 border-slate-900 pb-6">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-wide font-pixel uppercase text-slate-900">
              Welcome Back, {user?.username}
            </h1>
            <p className="text-slate-500 mt-1 text-xs uppercase tracking-wider">
              [ SYSTEM STATUS: ONLINE • INVENTORY LOGGER ]
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="geek-btn px-5 py-3 text-xs uppercase tracking-wider flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Keyboard</span>
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Keyboards', value: stats.keyboards, icon: KeyboardIcon, color: 'text-slate-900 bg-slate-100' },
            { label: 'Setups (Configs)', value: stats.setups, icon: Layers, color: 'text-slate-900 bg-slate-100' },
            { label: 'Sound Library', value: stats.audioFiles, icon: Music, color: 'text-emerald-600 bg-emerald-50' },
            { label: 'Favourites', value: stats.favorites, icon: Heart, color: 'text-rose-600 bg-rose-50' },
          ].map((item, index) => {
            const Icon = item.icon;
            return (
              <div key={index} className="geek-card p-5 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-1">
                    {item.label}
                  </span>
                  <span className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight font-pixel">
                    {item.value}
                  </span>
                </div>
                <div className={`w-9 h-9 border-2 border-slate-900 flex items-center justify-center ${item.color} shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]`}>
                  <Icon className="w-4.5 h-4.5" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Content sections */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Keyboards List (Left side 2 cols) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between border-b-2 border-slate-900 pb-2">
              <h2 className="text-xs font-bold text-slate-950 uppercase tracking-widest font-pixel">
                My Keyboard Inventory
              </h2>
              <span className="text-xs font-bold text-slate-500 tracking-wider">
                [{keyboards?.length || 0} ITEMS]
              </span>
            </div>

            {keyboards && keyboards.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {keyboards.map((kb: unknown) => {
                  const k = kb as Record<string, unknown>;
                  return (
                  <div
                    key={k.id as string}
                    className="geek-card flex flex-col justify-between group shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                  >
                    {/* Keyboard Visual Card */}
                    <div className="h-36 bg-slate-50 flex items-center justify-center p-4 border-b-2 border-slate-900 relative">
                      {k.image_url ? (
                        <img
                          src={resolveUrl(k.image_url as string)}
                          alt={k.name as string}
                          className="w-full h-full object-cover border-2 border-slate-900"
                        />
                      ) : (
                        <div className="flex flex-col items-center gap-1">
                          <div className="w-9 h-9 bg-white border-2 border-slate-900 flex items-center justify-center text-slate-900 group-hover:scale-105 transition-transform shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                            <KeyboardIcon className="w-4.5 h-4.5 text-slate-900" />
                          </div>
                          <span className="text-[10px] text-gray-500 font-bold tracking-widest uppercase mt-1">
                            {k.layout as string} Layout
                          </span>
                        </div>
                      )}
                      <div className="absolute top-3 right-3 px-2 py-0.5 border-2 border-slate-900 bg-white text-[9px] text-slate-900 font-bold uppercase tracking-wider shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)]">
                        {k.layout as string}
                      </div>
                    </div>

                    <div className="p-5 flex-1 flex flex-col justify-between gap-4 bg-white">
                      <div>
                        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block mb-0.5">
                          {k.brand as string}
                        </span>
                        <h3 className="text-sm font-bold text-slate-900 uppercase font-pixel tracking-wider leading-tight">
                          {k.name as string}
                        </h3>
                        <p className="text-[10px] text-slate-500 uppercase mt-1 font-bold">
                          Colour: {k.colour as string}
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-slate-900 border-dashed text-xs">
                        <span className="text-[10px] text-slate-600 font-bold">
                          {(k._count as Record<string, unknown>)?.setups || 0} SETUPS logged
                        </span>
                        <Link
                          href={`/keyboards/${k.id as string}`}
                          className="flex items-center gap-1 text-[10px] text-indigo-600 hover:text-indigo-800 font-bold uppercase tracking-wider group/link cursor-pointer"
                        >
                          <span>Manage [→]</span>
                        </Link>
                      </div>
                    </div>
                  </div>
                );})}
              </div>
            ) : (
              <div className="geek-card p-12 text-center flex flex-col items-center justify-center bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <div className="w-10 h-10 bg-slate-100 border-2 border-slate-900 flex items-center justify-center mb-4">
                  <FolderOpen className="w-5 h-5 text-slate-900" />
                </div>
                <h3 className="text-xs font-bold text-slate-900 uppercase font-pixel mb-1">No Keyboards logged</h3>
                <p className="text-[10px] text-slate-500 uppercase tracking-wider max-w-xs leading-relaxed">
                  Start by adding your mechanical keyboard frame parameters to begin customisation logging.
                </p>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="geek-btn mt-5 px-4 py-2 text-xs uppercase tracking-wider"
                >
                  Create Keyboard
                </button>
              </div>
            )}
          </div>

          {/* Recent Setups & Activity (Right side 1 col) */}
          <div className="space-y-4">
            <h2 className="text-xs font-bold text-slate-950 uppercase tracking-widest font-pixel border-b-2 border-slate-900 pb-2">
              Recent Activity logs
            </h2>

            {recentSetups.length > 0 ? (
              <div className="space-y-3.5">
                {recentSetups.map((setup: unknown) => {
                  const s = setup as Record<string, unknown>;
                  return (
                  <div
                    key={s.id as string}
                    className="geek-card p-4 flex items-start gap-4 hover:border-emerald-500/80 transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] bg-white"
                  >
                    <div className="w-8 h-8 border-2 border-slate-900 bg-slate-50 flex items-center justify-center shrink-0">
                      {(s.audio_files as Record<string, unknown>[] | undefined)?.length > 0 ? (
                        <Volume2 className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Layers className="w-4 h-4 text-slate-600" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/setups/${s.id as string}`}
                        className="text-xs font-bold text-slate-900 hover:text-indigo-600 transition-colors uppercase truncate block"
                      >
                        {s.name as string}
                      </Link>
                      <span className="text-[10px] text-slate-500 uppercase tracking-wider block truncate mt-0.5">
                        {(s.keyboard as Record<string, unknown>)?.brand as string} {(s.keyboard as Record<string, unknown>)?.name as string}
                      </span>
                      {(s.switches as Record<string, unknown>[] | undefined)?.length > 0 && (
                        <span className="inline-block mt-1.5 px-2 py-0.5 border border-slate-900 bg-slate-50 text-[9px] text-slate-700 font-bold uppercase tracking-wider">
                          {((s.switches as Record<string, unknown>[])[0]).brand as string} {((s.switches as Record<string, unknown>[])[0]).model as string}
                        </span>
                      )}
                    </div>

                    <div className="text-right shrink-0 flex flex-col items-end gap-1.5 text-[9px] font-bold text-slate-500 uppercase">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(s.created_at as string).toLocaleDateString()}
                      </span>
                      {s.favourite && (
                        <Heart className="w-3 h-3 text-rose-500 fill-rose-500" />
                      )}
                    </div>
                  </div>
                );})}
              </div>
            ) : (
              <div className="geek-card p-6 text-center text-slate-500 text-xs font-bold uppercase tracking-wider bg-white">
                No active setups recorded.
              </div>
            )}
          </div>
        </div>
      </main>

      {/* CREATE KEYBOARD MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="geek-card w-full max-w-md rounded-none overflow-hidden animate-fade-in shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-white relative">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b-2 border-slate-900 flex items-center justify-between bg-slate-50">
              <h3 className="text-xs font-bold text-slate-900 uppercase font-pixel">Add New Keyboard</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 border-2 border-transparent hover:border-slate-900 hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleCreateKeyboard} className="p-6 space-y-4">
              {createError && (
                <div className="p-3 border-2 border-red-500 bg-red-50 text-red-700 text-xs font-bold uppercase tracking-wider">
                  <span>{createError}</span>
                </div>
              )}

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Keyboard Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="Neo65 / Q1 Pro / Zoom75"
                  value={kbName}
                  onChange={(e) => setKbName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border-2 border-slate-900 focus:bg-white focus:ring-1 focus:ring-slate-900 outline-none text-xs text-slate-900 placeholder:text-slate-400 transition-all font-geek"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Brand / Maker
                </label>
                <input
                  type="text"
                  required
                  placeholder="Qwertykeys / Keychron / Meletrix"
                  value={kbBrand}
                  onChange={(e) => setKbBrand(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border-2 border-slate-900 focus:bg-white focus:ring-1 focus:ring-slate-900 outline-none text-xs text-slate-900 placeholder:text-slate-400 transition-all font-geek"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Layout
                  </label>
                  <select
                    value={kbLayout}
                    onChange={(e) => setKbLayout(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border-2 border-slate-900 focus:bg-white focus:ring-1 focus:ring-slate-900 outline-none text-xs text-slate-900 cursor-pointer font-geek"
                  >
                    <option value="60%">60%</option>
                    <option value="65%">65%</option>
                    <option value="75%">75%</option>
                    <option value="TKL">TKL</option>
                    <option value="Alice">Alice</option>
                    <option value="Full Size">Full Size</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Colour / Finish
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Anodized Navy"
                    value={kbColour}
                    onChange={(e) => setKbColour(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border-2 border-slate-900 focus:bg-white focus:ring-1 focus:ring-slate-900 outline-none text-xs text-slate-900 placeholder:text-slate-400 transition-all font-geek"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Image URL (Optional)
                </label>
                <input
                  type="text"
                  placeholder="https://example.com/keyboard.jpg"
                  value={kbImageUrl}
                  onChange={(e) => setKbImageUrl(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border-2 border-slate-900 focus:bg-white focus:ring-1 focus:ring-slate-900 outline-none text-xs text-slate-900 placeholder:text-slate-400 transition-all font-geek"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-4 border-t-2 border-slate-900 border-dashed">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="geek-btn-secondary flex-1 py-2.5 text-xs uppercase tracking-wider"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createLoading}
                  className="geek-btn flex-1 py-2.5 text-xs uppercase tracking-wider flex items-center justify-center gap-1.5"
                >
                  {createLoading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Creating...</span>
                    </>
                  ) : (
                    <span>Create Keyboard</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
