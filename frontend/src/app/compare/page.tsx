'use client';

import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { api, resolveUrl } from '@/lib/api';
import Navbar from '@/components/Navbar';
import WavePlayer from '@/components/WavePlayer';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import {
  GitCompare,
  Heart,
  ArrowRight,
  Loader2,
  Layers,
} from 'lucide-react';

export default function ComparePage() {
  const { user, logout } = useAuth();
  
  // Selection states
  const [setupIdA, setSetupIdA] = useState('');
  const [setupIdB, setSetupIdB] = useState('');

  // Fetch all setups for dropdown selection
  const { data: setupsList, isLoading: setupsLoading } = useQuery({
    queryKey: ['setups-list-all'],
    queryFn: () => api.get('/setups'),
    enabled: !!user,
  });

  // Fetch setup details
  const { data: setupA, isLoading: loadingA } = useQuery({
    queryKey: ['setup-detail-a', setupIdA],
    queryFn: () => api.get(`/setups/${setupIdA}`),
    enabled: !!user && !!setupIdA,
  });

  const { data: setupB, isLoading: loadingB } = useQuery({
    queryKey: ['setup-detail-b', setupIdB],
    queryFn: () => api.get(`/setups/${setupIdB}`),
    enabled: !!user && !!setupIdB,
  });

  const getSoundProfileTags = (setup: Record<string, any> | null) => {
    if (!setup?.sound_tags || !Array.isArray(setup.sound_tags) || setup.sound_tags.length === 0) return 'None';
    return (setup.sound_tags as { tag: { tag: string } }[]).map((t) => t.tag.tag).join(', ');
  };

  const getFoamTypes = (setup: Record<string, any> | null) => {
    if (!setup?.foams || !Array.isArray(setup.foams) || setup.foams.length === 0) return 'None';
    return (setup.foams as { type: string }[]).map((f) => f.type).join(', ');
  };

  return (
    <div className="min-h-screen bg-[#fafafa] text-[#121212] flex flex-col font-geek">
      <Navbar user={user} onLogout={logout} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in flex flex-col gap-6">
        
        {/* Header */}
        <div className="border-b-2 border-slate-900 pb-4">
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight font-pixel uppercase flex items-center gap-2">
            <GitCompare className="w-6 h-6 text-slate-900" />
            <span>Compare Configurations</span>
          </h1>
          <p className="text-slate-500 mt-1 text-xs uppercase tracking-wider">
            [ COMPARATOR ENGINE: ACTIVE • SIDE-BY-SIDE ACOUSTICS ]
          </p>
        </div>

        {/* Setup Selection Selectors */}
        <div className="geek-card p-5 bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Setup A Selector */}
          <div className="space-y-1.5">
            <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider">
              Select Configuration A
            </label>
            <select
              value={setupIdA}
              onChange={(e) => setSetupIdA(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border-2 border-slate-900 focus:bg-white focus:ring-1 focus:ring-slate-900 outline-none text-xs text-slate-900 cursor-pointer font-geek uppercase tracking-wider"
            >
              <option value="">-- Choose Setup A --</option>
              {setupsList?.map((s: any) => (
                <option key={s.id} value={s.id}>
                  {s.keyboard?.name} ({s.name})
                </option>
              ))}
            </select>
          </div>

          {/* Setup B Selector */}
          <div className="space-y-1.5">
            <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider">
              Select Configuration B
            </label>
            <select
              value={setupIdB}
              onChange={(e) => setSetupIdB(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border-2 border-slate-900 focus:bg-white focus:ring-1 focus:ring-slate-900 outline-none text-xs text-slate-900 cursor-pointer font-geek uppercase tracking-wider"
            >
              <option value="">-- Choose Setup B --</option>
              {setupsList?.map((s: any) => (
                <option key={s.id} value={s.id}>
                  {s.keyboard?.name} ({s.name})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Side by side comparison sheets */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
          
          {/* Setup Column A */}
          <div className="flex flex-col">
            {loadingA ? (
              <div className="p-12 text-center flex flex-col items-center justify-center gap-3">
                <Loader2 className="w-6 h-6 text-slate-900 animate-spin" />
                <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">[ Loading Setup A... ]</span>
              </div>
            ) : setupA ? (
              <div className="geek-card p-6 bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex-1 flex flex-col justify-between gap-6">
                <div>
                  <div className="flex items-center justify-between gap-2 border-b-2 border-slate-900 pb-2">
                    <div>
                      <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block">
                        {setupA.keyboard?.brand} {setupA.keyboard?.name}
                      </span>
                      <h2 className="text-sm font-bold text-slate-950 uppercase font-pixel tracking-wider">
                        {setupA.name}
                      </h2>
                    </div>
                    {setupA.favourite && (
                      <Heart className="w-4.5 h-4.5 text-rose-500 fill-rose-500" />
                    )}
                  </div>

                  {/* Param Specification List */}
                  <div className="mt-4 border-2 border-slate-900 divide-y-2 divide-slate-900 divide-solid">
                    {/* Switch */}
                    <div className="p-3 grid grid-cols-3 gap-2 bg-slate-50 text-[11px] font-bold uppercase tracking-wider">
                      <span className="text-slate-500">Switch</span>
                      <span className="col-span-2 text-slate-900">
                        {setupA.switches?.[0]
                          ? `${setupA.switches[0].brand} ${setupA.switches[0].model} (${setupA.switches[0].lubed ? 'Lubed' : 'Stock'})`
                          : 'Generic'}
                      </span>
                    </div>

                    {/* Keycaps */}
                    <div className="p-3 grid grid-cols-3 gap-2 bg-white text-[11px] font-bold uppercase tracking-wider">
                      <span className="text-slate-500">Keycaps</span>
                      <span className="col-span-2 text-slate-900">
                        {setupA.keycaps?.[0]
                          ? `${setupA.keycaps[0].brand} ${setupA.keycaps[0].profile} (${setupA.keycaps[0].material})`
                          : 'Not Specified'}
                      </span>
                    </div>

                    {/* Plate */}
                    <div className="p-3 grid grid-cols-3 gap-2 bg-slate-50 text-[11px] font-bold uppercase tracking-wider">
                      <span className="text-slate-500">Plate</span>
                      <span className="col-span-2 text-slate-900">
                        {setupA.plates?.[0]?.material || 'Plateless'}
                      </span>
                    </div>

                    {/* Case Material */}
                    <div className="p-3 grid grid-cols-3 gap-2 bg-white text-[11px] font-bold uppercase tracking-wider">
                      <span className="text-slate-500">Case</span>
                      <span className="col-span-2 text-slate-900">
                        {setupA.case_material || 'N/A'}
                      </span>
                    </div>

                    {/* Foams */}
                    <div className="p-3 grid grid-cols-3 gap-2 bg-slate-50 text-[11px] font-bold uppercase tracking-wider">
                      <span className="text-slate-500">Dampeners</span>
                      <span className="col-span-2 text-slate-900">
                        {getFoamTypes(setupA)}
                      </span>
                    </div>

                    {/* Sound profile */}
                    <div className="p-3 grid grid-cols-3 gap-2 bg-white text-[11px] font-bold uppercase tracking-wider">
                      <span className="text-slate-500">Sound Profile</span>
                      <span className="col-span-2 text-emerald-700 font-pixel text-[9px] tracking-widest uppercase">
                        {getSoundProfileTags(setupA)}
                      </span>
                    </div>

                    {/* Feel */}
                    <div className="p-3 grid grid-cols-3 gap-2 bg-slate-50 text-[11px] font-bold uppercase tracking-wider">
                      <span className="text-slate-500">Typing Feel</span>
                      <span className="col-span-2 text-slate-900">
                        {setupA.typing_feel} / 10
                      </span>
                    </div>
                  </div>

                  {/* Audio visualization preview */}
                  <div className="mt-6 space-y-3">
                    <h3 className="text-[10px] font-bold text-slate-900 uppercase tracking-widest font-pixel border-b border-slate-900 border-dashed pb-1.5">
                      Sound Comparison
                    </h3>
                    {setupA.audio_files && setupA.audio_files.length > 0 ? (
                      <WavePlayer
                        url={setupA.audio_files[0].file_url}
                        filename={`Sound A`}
                        duration={setupA.audio_files[0].duration}
                        format={setupA.audio_files[0].format}
                        size={setupA.audio_files[0].size}
                      />
                    ) : (
                      <div className="p-6 text-center border-2 border-dashed border-slate-900 text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                        No audio recording uploaded.
                      </div>
                    )}
                  </div>
                </div>

                <Link
                  href={`/setups/${setupA.id}`}
                  className="geek-btn w-full py-2.5 text-center text-xs uppercase tracking-wider flex items-center justify-center gap-1.5"
                >
                  <span>Open Setup A Profile</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ) : (
              <div className="geek-card p-12 text-center flex flex-col items-center justify-center bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex-1 min-h-[300px]">
                <Layers className="w-8 h-8 text-slate-900 mb-4" />
                <h3 className="text-xs font-bold text-slate-900 uppercase font-pixel mb-1">No setup selected</h3>
                <p className="text-[10px] text-slate-500 uppercase tracking-wider max-w-xs leading-relaxed">
                  Choose a configuration setup from the dropdown list above to view specifications.
                </p>
              </div>
            )}
          </div>

          {/* Setup Column B */}
          <div className="flex flex-col">
            {loadingB ? (
              <div className="p-12 text-center flex flex-col items-center justify-center gap-3">
                <Loader2 className="w-6 h-6 text-slate-900 animate-spin" />
                <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">[ Loading Setup B... ]</span>
              </div>
            ) : setupB ? (
              <div className="geek-card p-6 bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex-1 flex flex-col justify-between gap-6">
                <div>
                  <div className="flex items-center justify-between gap-2 border-b-2 border-slate-900 pb-2">
                    <div>
                      <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block">
                        {setupB.keyboard?.brand} {setupB.keyboard?.name}
                      </span>
                      <h2 className="text-sm font-bold text-slate-950 uppercase font-pixel tracking-wider">
                        {setupB.name}
                      </h2>
                    </div>
                    {setupB.favourite && (
                      <Heart className="w-4.5 h-4.5 text-rose-500 fill-rose-500" />
                    )}
                  </div>

                  {/* Param Specification List */}
                  <div className="mt-4 border-2 border-slate-900 divide-y-2 divide-slate-900 divide-solid">
                    {/* Switch */}
                    <div className="p-3 grid grid-cols-3 gap-2 bg-slate-50 text-[11px] font-bold uppercase tracking-wider">
                      <span className="text-slate-500">Switch</span>
                      <span className="col-span-2 text-slate-900">
                        {setupB.switches?.[0]
                          ? `${setupB.switches[0].brand} ${setupB.switches[0].model} (${setupB.switches[0].lubed ? 'Lubed' : 'Stock'})`
                          : 'Generic'}
                      </span>
                    </div>

                    {/* Keycaps */}
                    <div className="p-3 grid grid-cols-3 gap-2 bg-white text-[11px] font-bold uppercase tracking-wider">
                      <span className="text-slate-500">Keycaps</span>
                      <span className="col-span-2 text-slate-900">
                        {setupB.keycaps?.[0]
                          ? `${setupB.keycaps[0].brand} ${setupB.keycaps[0].profile} (${setupB.keycaps[0].material})`
                          : 'Not Specified'}
                      </span>
                    </div>

                    {/* Plate */}
                    <div className="p-3 grid grid-cols-3 gap-2 bg-slate-50 text-[11px] font-bold uppercase tracking-wider">
                      <span className="text-slate-500">Plate</span>
                      <span className="col-span-2 text-slate-900">
                        {setupB.plates?.[0]?.material || 'Plateless'}
                      </span>
                    </div>

                    {/* Case Material */}
                    <div className="p-3 grid grid-cols-3 gap-2 bg-white text-[11px] font-bold uppercase tracking-wider">
                      <span className="text-slate-500">Case</span>
                      <span className="col-span-2 text-slate-900">
                        {setupB.case_material || 'N/A'}
                      </span>
                    </div>

                    {/* Foams */}
                    <div className="p-3 grid grid-cols-3 gap-2 bg-slate-50 text-[11px] font-bold uppercase tracking-wider">
                      <span className="text-slate-500">Dampeners</span>
                      <span className="col-span-2 text-slate-900">
                        {getFoamTypes(setupB)}
                      </span>
                    </div>

                    {/* Sound profile */}
                    <div className="p-3 grid grid-cols-3 gap-2 bg-white text-[11px] font-bold uppercase tracking-wider">
                      <span className="text-slate-500">Sound Profile</span>
                      <span className="col-span-2 text-emerald-700 font-pixel text-[9px] tracking-widest uppercase">
                        {getSoundProfileTags(setupB)}
                      </span>
                    </div>

                    {/* Feel */}
                    <div className="p-3 grid grid-cols-3 gap-2 bg-slate-50 text-[11px] font-bold uppercase tracking-wider">
                      <span className="text-slate-500">Typing Feel</span>
                      <span className="col-span-2 text-slate-900">
                        {setupB.typing_feel} / 10
                      </span>
                    </div>
                  </div>

                  {/* Audio visualization preview */}
                  <div className="mt-6 space-y-3">
                    <h3 className="text-[10px] font-bold text-slate-900 uppercase tracking-widest font-pixel border-b border-slate-900 border-dashed pb-1.5">
                      Sound Comparison
                    </h3>
                    {setupB.audio_files && setupB.audio_files.length > 0 ? (
                      <WavePlayer
                        url={setupB.audio_files[0].file_url}
                        filename={`Sound B`}
                        duration={setupB.audio_files[0].duration}
                        format={setupB.audio_files[0].format}
                        size={setupB.audio_files[0].size}
                      />
                    ) : (
                      <div className="p-6 text-center border-2 border-dashed border-slate-900 text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                        No audio recording uploaded.
                      </div>
                    )}
                  </div>
                </div>

                <Link
                  href={`/setups/${setupB.id}`}
                  className="geek-btn w-full py-2.5 text-center text-xs uppercase tracking-wider flex items-center justify-center gap-1.5"
                >
                  <span>Open Setup B Profile</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ) : (
              <div className="geek-card p-12 text-center flex flex-col items-center justify-center bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex-1 min-h-[300px]">
                <Layers className="w-8 h-8 text-slate-900 mb-4" />
                <h3 className="text-xs font-bold text-slate-900 uppercase font-pixel mb-1">No setup selected</h3>
                <p className="text-[10px] text-slate-500 uppercase tracking-wider max-w-xs leading-relaxed">
                  Choose a configuration setup from the dropdown list above to view specifications.
                </p>
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}
