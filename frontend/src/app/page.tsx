'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Keyboard, Music, GitCompare, ArrowRight, Volume2 } from 'lucide-react';
import { KeySwitchIcon } from '../components/icons/KeySwitchIcon';

export default function LandingPage() {
  const [soundType, setSoundType] = useState<'thock' | 'clack'>('thock');
  const [activeKey, setActiveKey] = useState<string | null>(null);

  // Web Audio Synth for typing clicks
  const playSynthSound = (type: 'thock' | 'clack') => {
    if (typeof window === 'undefined') return;
    const AudioContext = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContext) return;

    try {
      const ctx = new AudioContext();

      // Create short white noise click
      const bufferSize = ctx.sampleRate * 0.08; // 80ms duration
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      // Lowpass/Bandpass filter
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';

      // Sine wave for the deep bottom-out tone
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();

      if (type === 'thock') {
        filter.frequency.setValueAtTime(320, ctx.currentTime);
        filter.Q.setValueAtTime(8, ctx.currentTime);
        osc.frequency.setValueAtTime(125, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(85, ctx.currentTime + 0.06);
        oscGain.gain.setValueAtTime(0.5, ctx.currentTime);
        oscGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.07);
      } else { // clack
        filter.frequency.setValueAtTime(1400, ctx.currentTime);
        filter.Q.setValueAtTime(4, ctx.currentTime);
        osc.frequency.setValueAtTime(350, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(220, ctx.currentTime + 0.04);
        oscGain.gain.setValueAtTime(0.7, ctx.currentTime);
        oscGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
      }

      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(type === 'thock' ? 0.03 : 0.12, ctx.currentTime);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + (type === 'thock' ? 0.07 : 0.04));

      osc.type = 'sine';

      noise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(ctx.destination);

      osc.connect(oscGain);
      oscGain.connect(ctx.destination);

      noise.start();
      osc.start();
      noise.stop(ctx.currentTime + 0.08);
      osc.stop(ctx.currentTime + 0.08);
    } catch (e) {
      console.warn('Audio Context failed to initialize', e);
    }
  };

  const handleKeyPress = (key: string) => {
    setActiveKey(key);
    playSynthSound(soundType);
    setTimeout(() => setActiveKey(null), 100);
  };

  const row1 = ['ESC', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', 'BS'];
  const row2 = ['TAB', 'Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', '\\'];
  const row3 = ['CAPS', 'A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', ';', 'ENT'];
  const row4 = ['LSHFT', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', ',', '.', '/', 'RSHFT'];

  return (
    <div className="min-h-screen bg-[#fafafa] text-[#121212] flex flex-col relative overflow-hidden font-geek">
      {/* Background grid matrix lines */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

      {/* Header */}
      <header className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between z-10 border-b-2 border-slate-900 bg-white">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-white flex items-center justify-center border-2 border-slate-900 shadow-[2px_2px_0px_0px_rgba(18,18,18,1)]">
            <KeySwitchIcon className="w-4.5 h-4.5" />
          </div>
          <span className="text-base font-pixel tracking-wide uppercase">KeyTone</span>
        </div>

        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="text-xs font-bold uppercase tracking-wider text-slate-600 hover:text-slate-900 transition-colors"
          >
            Sign In
          </Link>
          <Link
            href="/register"
            className="geek-btn px-4 py-2 text-xs uppercase tracking-wider"
          >
            Get Started
          </Link>
        </div>
      </header>

      {/* Main Hero Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-center py-12 md:py-20 z-10 gap-16">

        {/* Two column Grid on desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

          {/* Left Column: Heading and info */}
          <div className="lg:col-span-5 space-y-6 text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border-2 border-emerald-500 text-xs font-bold text-emerald-800 uppercase tracking-wider">
              <span>[ SYSTEM STATUS: READY ]</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-slate-900 leading-tight font-pixel uppercase">
              Keyboard Sound{' '}
              <span className="bg-slate-900 text-white px-2 py-0.5 block w-fit mt-1">
                Library
              </span>
            </h1>

            <p className="text-slate-600 text-sm leading-relaxed max-w-md">
              Log setups, upload recordings, and visual acoustics. Compare different switch combinations and mod settings side-by-side using local audio visualizers.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
              <Link
                href="/register"
                className="w-full sm:w-auto px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold transition-all shadow-[4px_4px_0px_0px_rgba(16,185,129,0.5)] flex items-center justify-center gap-2 cursor-pointer text-xs uppercase tracking-wider border-2 border-slate-900 active:translate-x-0.5 active:translate-y-0.5 active:shadow-[0px_0px_0px_0px]"
              >
                <span>Build Library</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/login"
                className="w-full sm:w-auto px-6 py-3 border-2 border-slate-900 bg-white hover:bg-slate-50 text-slate-900 font-bold transition-all flex items-center justify-center cursor-pointer text-xs uppercase tracking-wider shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[0px_0px_0px_0px]"
              >
                Log In
              </Link>
            </div>
          </div>

          {/* Right Column: Interactive Keyboard Simulator Widget */}
          <div className="lg:col-span-7 flex justify-center">
            <div className="geek-card p-5 bg-white border-2 border-slate-900 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] w-full max-w-lg space-y-4">
              <div className="flex items-center justify-between border-b border-slate-900 pb-2 mb-1">
                <span className="text-[10px] font-bold text-slate-900 font-pixel">
                  [ SYNTHESIS BOARD LOGGER ]
                </span>

                {/* Switch Sound Profile Selectors */}
                <div className="flex items-center gap-2 text-[9px] font-bold">
                  <button
                    onClick={() => setSoundType('thock')}
                    className={`px-2 py-0.5 border transition-all cursor-pointer ${soundType === 'thock'
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-slate-100 text-slate-700 border-slate-300 hover:border-slate-500'
                      }`}
                  >
                    THOCK
                  </button>
                  <button
                    onClick={() => setSoundType('clack')}
                    className={`px-2 py-0.5 border transition-all cursor-pointer ${soundType === 'clack'
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-slate-100 text-slate-700 border-slate-300 hover:border-slate-500'
                      }`}
                  >
                    CLACK
                  </button>
                </div>
              </div>

              {/* Virtual Keyboard Keycaps Grid */}
              <div className="p-3 border-2 border-slate-900 bg-slate-100 space-y-1.5 shadow-inner">
                {/* Row 1 */}
                <div className="flex justify-between gap-1">
                  {row1.map((k) => (
                    <button
                      key={k}
                      onClick={() => handleKeyPress(k)}
                      className={`flex-1 py-2 text-[9px] font-bold border border-slate-900 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] active:translate-y-[0.5px] active:shadow-none cursor-pointer transition-all ${activeKey === k
                          ? 'bg-emerald-500 text-slate-950 font-black'
                          : k === 'ESC'
                            ? 'bg-orange-400 text-slate-950'
                            : k === 'BS'
                              ? 'bg-slate-300 text-slate-800 flex-[1.5]'
                              : 'bg-white text-slate-900'
                        }`}
                    >
                      {k}
                    </button>
                  ))}
                </div>

                {/* Row 2 */}
                <div className="flex justify-between gap-1">
                  {row2.map((k) => (
                    <button
                      key={k}
                      onClick={() => handleKeyPress(k)}
                      className={`flex-1 py-2 text-[9px] font-bold border border-slate-900 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] active:translate-y-[0.5px] active:shadow-none cursor-pointer transition-all ${activeKey === k
                          ? 'bg-emerald-500 text-slate-950 font-black'
                          : k === 'TAB'
                            ? 'bg-slate-300 text-slate-800 flex-[1.5]'
                            : 'bg-white text-slate-900'
                        }`}
                    >
                      {k}
                    </button>
                  ))}
                </div>

                {/* Row 3 */}
                <div className="flex justify-between gap-1">
                  {row3.map((k) => (
                    <button
                      key={k}
                      onClick={() => handleKeyPress(k)}
                      className={`flex-1 py-2 text-[9px] font-bold border border-slate-900 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] active:translate-y-[0.5px] active:shadow-none cursor-pointer transition-all ${activeKey === k
                          ? 'bg-emerald-500 text-slate-950 font-black'
                          : k === 'CAPS'
                            ? 'bg-slate-300 text-slate-800 flex-[1.8]'
                            : k === 'ENT'
                              ? 'bg-slate-800 text-white flex-[1.8]'
                              : 'bg-white text-slate-900'
                        }`}
                    >
                      {k}
                    </button>
                  ))}
                </div>

                {/* Row 4 */}
                <div className="flex justify-between gap-1">
                  {row4.map((k) => (
                    <button
                      key={k}
                      onClick={() => handleKeyPress(k)}
                      className={`flex-1 py-2 text-[9px] font-bold border border-slate-900 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] active:translate-y-[0.5px] active:shadow-none cursor-pointer transition-all ${activeKey === k
                          ? 'bg-emerald-500 text-slate-950 font-black'
                          : k.includes('SHFT')
                            ? 'bg-slate-300 text-slate-800 flex-[2]'
                            : 'bg-white text-slate-900'
                        }`}
                    >
                      {k}
                    </button>
                  ))}
                </div>

                {/* Spacebar Row */}
                <div className="flex justify-between gap-1">
                  <button
                    onClick={() => handleKeyPress('CTRL')}
                    className="flex-1 py-2 text-[9px] font-bold border border-slate-900 bg-slate-300 text-slate-800 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]"
                  >
                    CTRL
                  </button>
                  <button
                    onClick={() => handleKeyPress('ALT')}
                    className="flex-1 py-2 text-[9px] font-bold border border-slate-900 bg-slate-300 text-slate-800 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]"
                  >
                    ALT
                  </button>
                  <button
                    onClick={() => handleKeyPress('SPACE')}
                    className={`flex-[6] py-2 border border-slate-900 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] active:translate-y-[0.5px] active:shadow-none cursor-pointer transition-all ${activeKey === 'SPACE' ? 'bg-emerald-500' : 'bg-emerald-400'
                      }`}
                  />
                  <button
                    onClick={() => handleKeyPress('ALT')}
                    className="flex-1 py-2 text-[9px] font-bold border border-slate-900 bg-slate-300 text-slate-800 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]"
                  >
                    ALT
                  </button>
                  <button
                    onClick={() => handleKeyPress('CTRL')}
                    className="flex-1 py-2 text-[9px] font-bold border border-slate-900 bg-slate-300 text-slate-800 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]"
                  >
                    CTRL
                  </button>
                </div>
              </div>

              <div className="text-[10px] text-slate-500 uppercase tracking-wider text-center font-bold">
                [ Click keycaps above to trigger synthesizers ]
              </div>
            </div>
          </div>

        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto w-full">
          {[
            {
              title: 'Hardware Inventory',
              desc: 'Store your keyboard frames, brands, layouts, and colors in a visual inventory dashboard.',
              icon: Keyboard,
            },
            {
              title: 'Acoustic Visualizer',
              desc: 'Upload typing recording files and visualize audio frequencies with custom WaveSurfer.js rendering.',
              icon: Music,
            },
            {
              title: 'Side-by-Side Compare',
              desc: 'Select two configuration setups to compare switches, plates, dampeners, and sounds side-by-side.',
              icon: GitCompare,
            },
          ].map((feat, index) => {
            const Icon = feat.icon;
            return (
              <div
                key={index}
                className="geek-card p-6 flex flex-col justify-between gap-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-white"
              >
                <div className="w-9 h-9 bg-slate-100 border-2 border-slate-900 flex items-center justify-center text-slate-900">
                  <Icon className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-950 uppercase tracking-widest block mb-2 font-pixel">
                    {feat.title}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed font-geek">{feat.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* Footer */}
      <footer className="h-16 flex items-center justify-center border-t-2 border-slate-900 text-[10px] font-bold uppercase tracking-widest text-slate-500 z-10 bg-white">
        <span>© {new Date().getFullYear()} KeyTone. [ BUILD: v1.1.0 ]</span>
      </footer>
    </div>
  );
}
