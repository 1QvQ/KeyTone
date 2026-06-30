'use client';

import React, { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { api, resolveUrl } from '@/lib/api';
import Navbar from '@/components/Navbar';
import WavePlayer from '@/components/WavePlayer';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Keyboard as KeyboardIcon,
  Layers,
  Heart,
  ArrowLeft,
  Calendar,
  Volume2,
  Image as ImageIcon,
  Trash2,
  Sliders,
  Tag,
  Upload,
  Loader2,
  FileAudio,
} from 'lucide-react';

export default function SetupDetailPage() {
  const { user, logout } = useAuth();
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const id = params.id as string;

  // Upload state
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioUploading, setAudioUploading] = useState(false);
  const [audioError, setAudioError] = useState('');

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageCaption, setImageCaption] = useState('');
  const [imageUploading, setImageUploading] = useState(false);
  const [imageError, setImageError] = useState('');

  // Fetch Setup detail
  const { data: setup, isLoading, error } = useQuery({
    queryKey: ['setup', id],
    queryFn: () => api.get(`/setups/${id}`),
    enabled: !!user && !!id,
  });

  const handleDeleteSetup = async () => {
    if (window.confirm('Are you sure you want to delete this configuration setup?')) {
      try {
        await api.delete(`/setups/${id}`);
        queryClient.invalidateQueries({ queryKey: ['keyboard', setup.keyboard_id] });
        queryClient.invalidateQueries({ queryKey: ['metrics'] });
        router.push(`/keyboards/${setup.keyboard_id}`);
      } catch (err: unknown) {
        alert(err instanceof Error ? err.message : 'Failed to delete setup');
      }
    }
  };

  const toggleFavorite = async () => {
    try {
      await api.put(`/setups/${id}`, {
        favourite: !setup.favourite,
      });
      queryClient.invalidateQueries({ queryKey: ['setup', id] });
      queryClient.invalidateQueries({ queryKey: ['metrics'] });
    } catch (err: unknown) {
      console.error('Failed to toggle favorite', err);
    }
  };

  // Upload Audio
  const handleAudioUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!audioFile) return;

    setAudioUploading(true);
    setAudioError('');

    try {
      // Get duration client side
      const getDuration = (): Promise<number> => {
        return new Promise((resolve) => {
          const audio = new Audio();
          const objectUrl = URL.createObjectURL(audioFile);
          audio.src = objectUrl;
          audio.addEventListener('loadedmetadata', () => {
            resolve(audio.duration);
            URL.revokeObjectURL(objectUrl);
          });
          audio.addEventListener('error', () => {
            resolve(0);
            URL.revokeObjectURL(objectUrl);
          });
        });
      };

      const duration = await getDuration();

      const formData = new FormData();
      formData.append('file', audioFile);
      formData.append('setup_id', id);
      if (duration) {
        formData.append('duration', duration.toString());
      }

      await api.post('/files/audio/upload', formData);

      setAudioFile(null);
      queryClient.invalidateQueries({ queryKey: ['setup', id] });
      queryClient.invalidateQueries({ queryKey: ['metrics'] });
    } catch (err: unknown) {
      setAudioError(err instanceof Error ? err.message : 'Failed to upload audio');
    } finally {
      setAudioUploading(false);
    }
  };

  // Upload Image
  const handleImageUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageFile) return;

    setImageUploading(true);
    setImageError('');

    try {
      const formData = new FormData();
      formData.append('file', imageFile);
      formData.append('setup_id', id);
      formData.append('caption', imageCaption);

      await api.post('/files/image/upload', formData);

      setImageFile(null);
      setImageCaption('');
      queryClient.invalidateQueries({ queryKey: ['setup', id] });
    } catch (err: unknown) {
      setImageError(err instanceof Error ? err.message : 'Failed to upload image');
    } finally {
      setImageUploading(false);
    }
  };

  // Delete Audio file
  const handleDeleteAudio = async (audioId: string) => {
    if (window.confirm('Delete this typing audio recording?')) {
      try {
        await api.delete(`/files/audio/${audioId}`);
        queryClient.invalidateQueries({ queryKey: ['setup', id] });
        queryClient.invalidateQueries({ queryKey: ['metrics'] });
      } catch (err: unknown) {
        alert(err instanceof Error ? err.message : 'Failed to delete audio');
      }
    }
  };

  // Delete Image
  const handleDeleteImage = async (imageId: string) => {
    if (window.confirm('Delete this setup photograph?')) {
      try {
        await api.delete(`/files/image/${imageId}`);
        queryClient.invalidateQueries({ queryKey: ['setup', id] });
      } catch (err: unknown) {
        alert(err instanceof Error ? err.message : 'Failed to delete image');
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex items-center justify-center flex-col gap-3 font-geek text-[#121212]">
        <Loader2 className="w-8 h-8 text-slate-900 animate-spin" />
        <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">[ Loading setup profile... ]</span>
      </div>
    );
  }

  if (error || !setup) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex flex-col font-geek text-[#121212]">
        <Navbar user={user} onLogout={logout} />
        <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
          <h2 className="text-sm font-bold uppercase font-pixel mb-1 text-slate-900">Setup not found</h2>
          <p className="text-xs text-slate-500 uppercase tracking-wider">This setup configuration may have been deleted.</p>
          <Link href="/dashboard" className="mt-4 text-indigo-600 font-bold flex items-center gap-1 text-xs uppercase tracking-wider">
            <ArrowLeft className="w-4 h-4" /> Back to Inventory
          </Link>
        </div>
      </div>
    );
  }

  const sw = setup.switches?.[0];
  const kc = setup.keycaps?.[0];
  const pl = setup.plates?.[0];

  return (
    <div className="min-h-screen bg-[#fafafa] text-[#121212] flex flex-col font-geek">
      <Navbar user={user} onLogout={logout} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in space-y-6">
        {/* Back Link */}
        <Link
          href={`/keyboards/${setup.keyboard_id}`}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 uppercase tracking-wider transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to {setup.keyboard?.name} Profile</span>
        </Link>

        {/* Setup Info Header */}
        <div className="geek-card p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 bg-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
          <div>
            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
              <span>{setup.keyboard?.brand} {setup.keyboard?.name}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 uppercase font-pixel tracking-wider leading-tight">
              {setup.name}
            </h1>
            {setup.description && (
              <p className="text-slate-600 mt-2 text-xs uppercase tracking-wider leading-relaxed">
                {setup.description}
              </p>
            )}
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              href={`/setups/${setup.id}/edit`}
              className="px-3 py-2 border-2 border-slate-900 bg-white hover:bg-slate-50 text-slate-900 transition-all cursor-pointer shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[0px_0px_0px_0px] text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5"
              title="Edit Setup"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Edit Setup</span>
            </Link>
            <button
              onClick={toggleFavorite}
              className={`p-3 border-2 border-slate-900 bg-white hover:bg-slate-50 transition-all cursor-pointer shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[0px_0px_0px_0px] ${
                setup.favourite ? 'text-rose-600 border-rose-600 shadow-[2px_2px_0px_0px_rgba(225,29,72,1)] bg-rose-50' : 'text-slate-600'
              }`}
              title={setup.favourite ? 'Remove Favourite' : 'Mark Favourite'}
            >
              <Heart className={`w-4.5 h-4.5 ${setup.favourite ? 'fill-rose-500' : ''}`} />
            </button>
            <button
              onClick={handleDeleteSetup}
              className="p-3 border-2 border-red-700 bg-[#fee2e2] hover:bg-[#fecaca] text-red-700 transition-all cursor-pointer shadow-[2px_2px_0px_0px_rgba(185,28,28,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[0px_0px_0px_0px]"
              title="Delete Setup"
            >
              <Trash2 className="w-4.5 h-4.5" />
            </button>
          </div>
        </div>

        {/* Specs and Media Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Columns 1 & 2: Specs & Notes */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Specs Sheet */}
            <div className="geek-card p-6 bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] space-y-6">
              <h2 className="text-xs font-bold text-slate-900 uppercase font-pixel tracking-widest border-b-2 border-slate-900 pb-2">
                Hardware Specifications
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                
                {/* Switches */}
                <div className="space-y-2 border-l-2 border-slate-900 pl-4">
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block">
                    Switches
                  </span>
                  <div className="text-xs font-bold text-slate-950 uppercase tracking-wider">
                    {sw ? `${sw.brand} ${sw.model}` : 'Not Specified'}
                  </div>
                  {sw && (
                    <div className="text-[10px] text-slate-600 uppercase tracking-wider space-y-1">
                      <p>Spring: {sw.spring || 'Default'}</p>
                      <p>Mods: {sw.lubed ? 'Lubed' : 'Factory Stock'} • {sw.filmed ? 'Filmed' : 'No Film'}</p>
                    </div>
                  )}
                </div>

                {/* Keycaps */}
                <div className="space-y-2 border-l-2 border-slate-900 pl-4">
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block">
                    Keycaps
                  </span>
                  <div className="text-xs font-bold text-slate-950 uppercase tracking-wider">
                    {kc ? `${kc.brand} ${kc.profile}` : 'Not Specified'}
                  </div>
                  {kc && (
                    <div className="text-[10px] text-slate-600 uppercase tracking-wider">
                      <p>Material: {kc.material}</p>
                    </div>
                  )}
                </div>

                {/* Plates */}
                <div className="space-y-2 border-l-2 border-slate-900 pl-4">
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block">
                    Plate
                  </span>
                  <div className="text-xs font-bold text-slate-950 uppercase tracking-wider">
                    {pl?.material || 'Plateless'}
                  </div>
                </div>

                {/* Dampeners / Foams */}
                <div className="space-y-2 border-l-2 border-slate-900 pl-4">
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block">
                    Dampeners & Foams
                  </span>
                  {setup.foams && setup.foams.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {setup.foams.map((f: any) => (
                        <span
                          key={f.id}
                          className="px-2.5 py-0.5 border border-slate-900 bg-slate-50 text-[9px] text-slate-700 font-bold uppercase tracking-wider"
                        >
                          {f.type}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">None configured</span>
                  )}
                </div>
              </div>

              {/* Typing feel and Sound tag slider indicators */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6 border-t-2 border-slate-900 border-dashed">
                <div>
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block mb-2">
                    Typing Feel
                  </span>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 bg-slate-100 border-2 border-slate-900 h-3 relative overflow-hidden">
                      <div
                        className="bg-slate-900 h-full"
                        style={{ width: `${setup.typing_feel * 10}%` }}
                      />
                    </div>
                    <span className="text-xs font-bold text-slate-900 font-pixel">
                      {setup.typing_feel} <span className="text-[9px] text-slate-500 font-geek">/10</span>
                    </span>
                  </div>
                </div>

                <div>
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block mb-2">
                    Sound Tags
                  </span>
                  {setup.sound_tags && setup.sound_tags.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {setup.sound_tags.map(({ tag: t }: any) => (
                        <span
                          key={t.id}
                          className="px-2.5 py-0.5 border border-emerald-400 bg-emerald-50 text-[9px] text-emerald-800 font-bold uppercase tracking-wider"
                        >
                          {t.tag}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">No tags</span>
                  )}
                </div>
              </div>
            </div>

            {/* Notes Section */}
            {setup.notes && (
              <div className="geek-card p-6 bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] space-y-3">
                <h2 className="text-xs font-bold text-slate-900 uppercase font-pixel tracking-widest border-b-2 border-slate-900 pb-2">
                  Personal Setup Notes
                </h2>
                <p className="text-xs text-slate-600 whitespace-pre-wrap leading-relaxed">
                  {setup.notes}
                </p>
              </div>
            )}
          </div>

          {/* Column 3: Audio & Image Media Libraries */}
          <div className="space-y-6">
            
            {/* Audio Testing Files */}
            <div className="geek-card p-6 bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] space-y-4">
              <h2 className="text-xs font-bold text-slate-900 uppercase font-pixel tracking-widest border-b-2 border-slate-900 pb-2">
                Acoustic Library
              </h2>

              {setup.audio_files && setup.audio_files.length > 0 ? (
                <div className="space-y-3">
                  {setup.audio_files.map((audio: any) => (
                    <WavePlayer
                      key={audio.id}
                      url={audio.file_url}
                      filename={`Audio log`}
                      duration={audio.duration}
                      format={audio.format}
                      size={audio.size}
                      onDelete={() => handleDeleteAudio(audio.id)}
                    />
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center border-2 border-dashed border-slate-900 flex flex-col items-center justify-center gap-2">
                  <FileAudio className="w-8 h-8 text-slate-900" />
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">No sound records</span>
                </div>
              )}

              {/* Upload audio form */}
              <form onSubmit={handleAudioUpload} className="pt-4 border-t-2 border-slate-900 border-dashed space-y-3">
                {audioError && (
                  <div className="p-2 border-2 border-red-500 bg-red-50 text-red-700 text-xs font-bold uppercase tracking-wider">
                    {audioError}
                  </div>
                )}
                <div>
                  <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Upload Typing Test
                  </label>
                  <input
                    type="file"
                    accept="audio/*"
                    required
                    onChange={(e) => setAudioFile(e.target.files?.[0] || null)}
                    className="w-full text-xs text-slate-500 file:mr-4 file:py-1.5 file:px-3 file:border-2 file:border-slate-900 file:text-xs file:font-bold file:bg-white file:text-slate-900 hover:file:bg-slate-50 cursor-pointer uppercase tracking-wider"
                  />
                </div>
                {audioFile && (
                  <button
                    type="submit"
                    disabled={audioUploading}
                    className="geek-btn w-full py-2 text-xs uppercase tracking-wider"
                  >
                    {audioUploading ? (
                      <span className="flex items-center justify-center gap-1.5 animate-pulse">
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Uploading...</span>
                      </span>
                    ) : (
                      <span>Upload Audio Log</span>
                    )}
                  </button>
                )}
              </form>
            </div>

            {/* Images Gallery */}
            <div className="geek-card p-6 bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] space-y-4">
              <h2 className="text-xs font-bold text-slate-900 uppercase font-pixel tracking-widest border-b-2 border-slate-900 pb-2">
                Setup Photos
              </h2>

              {setup.images && setup.images.length > 0 ? (
                <div className="grid grid-cols-2 gap-3">
                  {setup.images.map((img: any) => (
                    <div
                      key={img.id}
                      className="group/img border-2 border-slate-900 overflow-hidden aspect-square relative bg-slate-50"
                    >
                      <img
                        src={resolveUrl(img.image_url)}
                        alt={img.caption || 'Setup photo'}
                        className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-300"
                      />
                      <button
                        onClick={() => handleDeleteImage(img.id)}
                        className="absolute top-2 right-2 p-1.5 border-2 border-red-700 bg-white hover:bg-red-50 text-red-700 opacity-0 group-hover/img:opacity-100 transition-opacity cursor-pointer shadow-[1.5px_1.5px_0px_0px_rgba(185,28,28,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[0px_0px_0px_0px]"
                        title="Delete Photo"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      {img.caption && (
                        <div className="absolute inset-x-0 bottom-0 bg-slate-900/90 border-t-2 border-slate-900 p-2 text-[9px] text-white font-bold uppercase tracking-wider truncate">
                          {img.caption}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center border-2 border-dashed border-slate-900 flex flex-col items-center justify-center gap-2">
                  <ImageIcon className="w-8 h-8 text-slate-900" />
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">No photos</span>
                </div>
              )}

              {/* Upload image form */}
              <form onSubmit={handleImageUpload} className="pt-4 border-t-2 border-slate-900 border-dashed space-y-3">
                {imageError && (
                  <div className="p-2 border-2 border-red-500 bg-red-50 text-red-700 text-xs font-bold uppercase tracking-wider">
                    {imageError}
                  </div>
                )}
                <div className="space-y-2">
                  <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider">
                    Add Setup Photo
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    required
                    onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                    className="w-full text-xs text-slate-500 file:mr-4 file:py-1.5 file:px-3 file:border-2 file:border-slate-900 file:text-xs file:font-bold file:bg-white file:text-slate-900 hover:file:bg-slate-50 cursor-pointer uppercase tracking-wider"
                  />
                  {imageFile && (
                    <input
                      type="text"
                      placeholder="Caption (e.g. Front / Internals)"
                      value={imageCaption}
                      onChange={(e) => setImageCaption(e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-50 border-2 border-slate-900 focus:bg-white focus:ring-1 focus:ring-slate-900 outline-none text-xs text-slate-900 placeholder:text-slate-400 font-geek uppercase tracking-wider"
                    />
                  )}
                </div>
                {imageFile && (
                  <button
                    type="submit"
                    disabled={imageUploading}
                    className="geek-btn w-full py-2 text-xs uppercase tracking-wider"
                  >
                    {imageUploading ? (
                      <span className="flex items-center justify-center gap-1.5 animate-pulse">
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Uploading...</span>
                      </span>
                    ) : (
                      <span>Upload Photo</span>
                    )}
                  </button>
                )}
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
