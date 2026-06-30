'use client';

import React, { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { api, resolveUrl } from '@/lib/api';
import Navbar from '@/components/Navbar';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Keyboard as KeyboardIcon,
  Layers,
  Heart,
  Plus,
  ArrowLeft,
  ArrowRight,
  Calendar,
  Volume2,
  Image as ImageIcon,
  Edit2,
  Trash2,
  Sliders,
  Settings,
  Tag,
  Loader2,
  X,
} from 'lucide-react';

export default function KeyboardDetailPage() {
  const { user, logout } = useAuth();
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const id = params.id as string;

  // Edit Keyboard Modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editName, setEditName] = useState('');
  const [editBrand, setEditBrand] = useState('');
  const [editLayout, setEditLayout] = useState('');
  const [editColour, setEditColour] = useState('');
  const [editImageUrl, setEditImageUrl] = useState('');
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');

  // Fetch Keyboard detail
  const { data: keyboard, isLoading, error } = useQuery({
    queryKey: ['keyboard', id],
    queryFn: () => api.get(`/keyboards/${id}`),
    enabled: !!user && !!id,
  });

  // Open Edit Modal and fill default fields
  const openEditModal = () => {
    if (keyboard) {
      setEditName(keyboard.name);
      setEditBrand(keyboard.brand);
      setEditLayout(keyboard.layout);
      setEditColour(keyboard.colour);
      setEditImageUrl(keyboard.image_url || '');
      setIsEditModalOpen(true);
    }
  };

  // Edit keyboard submit handler
  const handleEditKeyboard = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditError('');
    setEditLoading(true);

    try {
      await api.put(`/keyboards/${id}`, {
        name: editName,
        brand: editBrand,
        layout: editLayout,
        colour: editColour,
        image_url: editImageUrl,
      });

      queryClient.invalidateQueries({ queryKey: ['keyboard', id] });
      queryClient.invalidateQueries({ queryKey: ['keyboards'] });
      setIsEditModalOpen(false);
    } catch (err: unknown) {
      setEditError(err instanceof Error ? err.message : 'Failed to update keyboard');
    } finally {
      setEditLoading(false);
    }
  };

  // Delete keyboard handler
  const handleDeleteKeyboard = async () => {
    if (window.confirm('Are you sure you want to delete this keyboard? All setups, audios and configurations will be permanently deleted.')) {
      try {
        await api.delete(`/keyboards/${id}`);
        queryClient.invalidateQueries({ queryKey: ['keyboards'] });
        queryClient.invalidateQueries({ queryKey: ['metrics'] });
        router.push('/dashboard');
      } catch (err: unknown) {
        alert(err instanceof Error ? err.message : 'Failed to delete keyboard');
      }
    }
  };

  // Toggle favorite on setup
  const toggleFavorite = async (setupId: string, currentFav: boolean) => {
    try {
      await api.put(`/setups/${setupId}`, {
        favourite: !currentFav,
      });
      queryClient.invalidateQueries({ queryKey: ['keyboard', id] });
      queryClient.invalidateQueries({ queryKey: ['metrics'] });
    } catch (err: unknown) {
      console.error('Failed to toggle favorite', err);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex items-center justify-center flex-col gap-3 font-geek text-[#121212]">
        <Loader2 className="w-8 h-8 text-slate-900 animate-spin" />
        <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">[ Loading keyboard profile... ]</span>
      </div>
    );
  }

  if (error || !keyboard) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex flex-col font-geek text-[#121212]">
        <Navbar user={user} onLogout={logout} />
        <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
          <h2 className="text-sm font-bold uppercase font-pixel mb-1 text-slate-900">Keyboard not found</h2>
          <p className="text-xs text-slate-500 uppercase tracking-wider">This entry may have been deleted or you lack permissions.</p>
          <Link href="/dashboard" className="mt-4 text-indigo-600 font-bold flex items-center gap-1 text-xs uppercase tracking-wider">
            <ArrowLeft className="w-4 h-4" /> Back to Inventory
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafafa] text-[#121212] flex flex-col font-geek">
      <Navbar user={user} onLogout={logout} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in space-y-6">
        {/* Back Link */}
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 uppercase tracking-wider transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Inventory</span>
        </Link>

        {/* Keyboard Profile Header Card */}
        <div className="geek-card p-6 sm:p-8 flex flex-col md:flex-row items-center gap-8 bg-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
          <div className="w-32 h-32 sm:w-40 sm:h-40 border-2 border-slate-900 bg-slate-50 flex items-center justify-center shrink-0 overflow-hidden relative shadow-[3px_3px_0px_0px_rgba(0,0,0,0.15)]">
            {keyboard.image_url ? (
              <img
                src={resolveUrl(keyboard.image_url)}
                alt={keyboard.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <KeyboardIcon className="w-14 h-14 text-slate-900" />
            )}
          </div>

          <div className="flex-1 min-w-0 text-center md:text-left">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">
              {keyboard.brand}
            </span>
            <h1 className="text-xl sm:text-3xl font-extrabold text-slate-900 uppercase font-pixel tracking-wider leading-none mb-4">
              {keyboard.name}
            </h1>
            
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 text-[10px] font-bold uppercase tracking-wider text-slate-700">
              <span className="px-3 py-1 border-2 border-slate-900 bg-white">
                Layout: {keyboard.layout}
              </span>
              <span className="px-3 py-1 border-2 border-slate-900 bg-white">
                Colour: {keyboard.colour}
              </span>
              <span className="px-3 py-1 border-2 border-slate-900 bg-white">
                Setups: {keyboard.setups?.length || 0}
              </span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-3 shrink-0 self-stretch md:self-auto justify-center">
            <button
              onClick={openEditModal}
              className="p-3 border-2 border-slate-900 bg-white hover:bg-slate-50 text-slate-900 transition-all cursor-pointer shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[0px_0px_0px_0px]"
              title="Edit Profile"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={handleDeleteKeyboard}
              className="p-3 border-2 border-red-700 bg-[#fee2e2] hover:bg-[#fecaca] text-red-700 transition-all cursor-pointer shadow-[2px_2px_0px_0px_rgba(185,28,28,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[0px_0px_0px_0px]"
              title="Delete Keyboard"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Setups Section */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b-2 border-slate-900 pb-3">
            <div>
              <h2 className="text-xs font-bold text-slate-950 uppercase tracking-widest font-pixel">Configuration Setups</h2>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider mt-0.5">
                Compare different combinations of switches, keycaps, plates and foams on this case.
              </p>
            </div>
            <Link
              href={`/setups/new?keyboard_id=${keyboard.id}`}
              className="geek-btn px-4 py-2.5 text-xs uppercase tracking-wider flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Create Setup</span>
            </Link>
          </div>

          {keyboard.setups && keyboard.setups.length > 0 ? (
            <div className="grid grid-cols-1 gap-5">
              {keyboard.setups.map((setup: any) => {
                const sw = setup.switches?.[0];
                const kc = setup.keycaps?.[0];
                const pl = setup.plates?.[0];
                const audioCount = setup.audio_files?.length || 0;
                const photoCount = setup.images?.length || 0;

                return (
                  <div
                    key={setup.id}
                    className="geek-card p-6 bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:border-emerald-500 transition-all group/setup"
                  >
                    {/* Setup Name / Favorites */}
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div>
                        <h3 className="text-sm font-bold text-slate-950 uppercase font-pixel tracking-wider group-hover/setup:text-indigo-600 transition-colors">
                          <Link href={`/setups/${setup.id}`}>{setup.name}</Link>
                        </h3>
                        {setup.description && (
                          <p className="text-[11px] text-slate-500 uppercase mt-1 tracking-wider leading-relaxed">
                            {setup.description}
                          </p>
                        )}
                      </div>

                      <button
                        onClick={() => toggleFavorite(setup.id, setup.favourite)}
                        className="p-1 text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
                        title={setup.favourite ? 'Remove from favourites' : 'Add to favourites'}
                      >
                        <Heart
                          className={`w-5 h-5 ${
                            setup.favourite ? 'text-rose-500 fill-rose-500' : ''
                          }`}
                        />
                      </button>
                    </div>

                    {/* Specifications Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 border-2 border-slate-900 bg-slate-50 text-[11px] font-bold uppercase tracking-wider mb-4">
                      <div>
                        <span className="text-[9px] text-slate-500 block mb-1">
                          Switch
                        </span>
                        <span className="text-slate-900">
                          {sw ? `${sw.brand} ${sw.model}` : 'Generic'}
                        </span>
                        {sw && (
                          <span className="block text-[9px] text-slate-500 font-medium lowercase mt-0.5">
                            {sw.lubed ? 'lubed' : 'unlubed'} • {sw.filmed ? 'filmed' : 'no film'}
                          </span>
                        )}
                      </div>

                      <div>
                        <span className="text-[9px] text-slate-500 block mb-1">
                          Keycap Profile
                        </span>
                        <span className="text-slate-900">
                          {kc ? `${kc.brand} ${kc.profile}` : 'Not Spec'}
                        </span>
                        {kc && (
                          <span className="block text-[9px] text-slate-500 mt-0.5">
                            {kc.material}
                          </span>
                        )}
                      </div>

                      <div>
                        <span className="text-[9px] text-slate-500 block mb-1">
                          Plate Material
                        </span>
                        <span className="text-slate-900">{pl?.material || 'No Plate'}</span>
                      </div>

                      <div>
                        <span className="text-[9px] text-slate-500 block mb-1">
                          Typing Feel
                        </span>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <Sliders className="w-3.5 h-3.5 text-slate-600" />
                          <span className="text-slate-900">{setup.typing_feel}</span>
                          <span className="text-[9px] text-slate-500">/ 10</span>
                        </div>
                      </div>
                    </div>

                    {/* Metadata bar */}
                    <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t-2 border-slate-900 border-dashed text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      <div className="flex flex-wrap items-center gap-4">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          {new Date(setup.created_at).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <Volume2 className="w-3.5 h-3.5 text-slate-400" />
                          {audioCount} audio logs
                        </span>
                        <span className="flex items-center gap-1">
                          <ImageIcon className="w-3.5 h-3.5 text-slate-400" />
                          {photoCount} photos
                        </span>
                      </div>

                      {/* Sound Tags */}
                      {setup.sound_tags && setup.sound_tags.length > 0 && (
                        <div className="flex items-center gap-1.5">
                          <Tag className="w-3 h-3 text-slate-400 shrink-0" />
                          <div className="flex flex-wrap gap-1">
                            {setup.sound_tags.map(({ tag: t }: any) => (
                              <span
                                key={t.id}
                                className="px-2 py-0.5 border border-emerald-400 bg-emerald-50 text-[9px] text-emerald-800 font-bold uppercase tracking-wider"
                              >
                                {t.tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      <Link
                        href={`/setups/${setup.id}`}
                        className="text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1 group/btn ml-auto cursor-pointer"
                      >
                        <span>Open Details [→]</span>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="geek-card p-12 text-center flex flex-col items-center justify-center bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <div className="w-10 h-10 bg-slate-100 border-2 border-slate-900 flex items-center justify-center mb-4">
                <Settings className="w-5 h-5 text-slate-900" />
              </div>
              <h3 className="text-xs font-bold text-slate-900 uppercase font-pixel mb-1">No configurations logged</h3>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider max-w-xs leading-relaxed">
                Log a setup configuration specifying the switches, plates, and keycaps used on this case.
              </p>
              <Link
                href={`/setups/new?keyboard_id=${keyboard.id}`}
                className="geek-btn mt-5 px-4 py-2 text-xs uppercase tracking-wider inline-block"
              >
                Create Setup
              </Link>
            </div>
          )}
        </div>
      </main>

      {/* EDIT KEYBOARD MODAL */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="geek-card w-full max-w-md rounded-none overflow-hidden animate-fade-in shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-white relative">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b-2 border-slate-900 flex items-center justify-between bg-slate-50">
              <h3 className="text-xs font-bold text-slate-900 uppercase font-pixel">Edit Keyboard Profile</h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-1 border-2 border-transparent hover:border-slate-900 hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleEditKeyboard} className="p-6 space-y-4">
              {editError && (
                <div className="p-3 border-2 border-red-500 bg-red-50 text-red-700 text-xs font-bold uppercase tracking-wider">
                  <span>{editError}</span>
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
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
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
                  value={editBrand}
                  onChange={(e) => setEditBrand(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border-2 border-slate-900 focus:bg-white focus:ring-1 focus:ring-slate-900 outline-none text-xs text-slate-900 placeholder:text-slate-400 transition-all font-geek"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Layout
                  </label>
                  <select
                    value={editLayout}
                    onChange={(e) => setEditLayout(e.target.value)}
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
                    value={editColour}
                    onChange={(e) => setEditColour(e.target.value)}
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
                  value={editImageUrl}
                  onChange={(e) => setEditImageUrl(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border-2 border-slate-900 focus:bg-white focus:ring-1 focus:ring-slate-900 outline-none text-xs text-slate-900 placeholder:text-slate-400 transition-all font-geek"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-4 border-t-2 border-slate-900 border-dashed">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="geek-btn-secondary flex-1 py-2.5 text-xs uppercase tracking-wider"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editLoading}
                  className="geek-btn flex-1 py-2.5 text-xs uppercase tracking-wider flex items-center justify-center gap-1.5"
                >
                  {editLoading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Save Changes</span>
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
