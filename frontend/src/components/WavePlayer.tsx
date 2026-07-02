'use client';

import React, { useRef, useEffect, useState } from 'react';
import WaveSurfer from 'wavesurfer.js';
import { Play, Pause, Download, Trash2, Volume2, VolumeX, Loader2 } from 'lucide-react';
import { resolveUrl } from '@/lib/api';

interface WavePlayerProps {
  url: string;
  filename: string;
  duration?: number;
  format?: string;
  size?: number;
  acousticProfile?: string;
  dominantFreq?: number;
  onDelete?: () => void;
}

export default function WavePlayer({ url, filename, duration, format, size, acousticProfile, dominantFreq, onDelete }: WavePlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const wavesurferRef = useRef<WaveSurfer | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [currentTime, setCurrentTime] = useState('0:00');
  const [totalTime, setTotalTime] = useState('0:00');
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;

    const ws = WaveSurfer.create({
      container: containerRef.current,
      waveColor: 'rgba(18, 18, 18, 0.15)',
      progressColor: '#10b981',
      cursorColor: '#121212',
      barWidth: 2,
      barRadius: 0,
      height: 60,
      url: resolveUrl(url),
    });

    wavesurferRef.current = ws;

    ws.on('ready', () => {
      setIsReady(true);
      const totalSec = Math.round(ws.getDuration());
      const min = Math.floor(totalSec / 60);
      const sec = totalSec % 60;
      setTotalTime(`${min}:${sec < 10 ? '0' : ''}${sec}`);
    });

    ws.on('play', () => setIsPlaying(true));
    ws.on('pause', () => setIsPlaying(false));
    ws.on('audioprocess', () => {
      const currentSec = Math.round(ws.getCurrentTime());
      const min = Math.floor(currentSec / 60);
      const sec = currentSec % 60;
      setCurrentTime(`${min}:${sec < 10 ? '0' : ''}${sec}`);
    });

    return () => {
      ws.destroy();
    };
  }, [url]);

  const handlePlayPause = () => {
    if (wavesurferRef.current) {
      wavesurferRef.current.playPause();
    }
  };

  const handleMute = () => {
    if (wavesurferRef.current) {
      wavesurferRef.current.setMuted(!isMuted);
      setIsMuted(!isMuted);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div className="geek-card p-4 flex flex-col md:flex-row items-center gap-4 relative overflow-hidden shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] bg-white hover:border-emerald-500 transition-all font-geek">
      {/* Controls */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={handlePlayPause}
          disabled={!isReady}
          className="w-10 h-10 border-2 border-slate-900 bg-slate-900 hover:bg-slate-800 text-white flex items-center justify-center transition-all cursor-pointer disabled:opacity-50 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.15)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[0px_0px_0px_0px]"
        >
          {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 pl-0.5" />}
        </button>
        <button
          onClick={handleMute}
          disabled={!isReady}
          className="w-9 h-9 border-2 border-slate-900 bg-white hover:bg-slate-50 text-slate-800 flex items-center justify-center transition-all cursor-pointer shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[0px_0px_0px_0px]"
        >
          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>
      </div>

      {/* Waveform Visualization */}
      <div className="flex-1 w-full flex flex-col justify-center min-w-0">
        <div className="relative">
          {!isReady && (
            <div className="absolute inset-0 flex items-center gap-2 text-slate-500 text-xs font-semibold">
              <Loader2 className="w-4 h-4 animate-spin text-slate-900" />
              <span>Loading waveforms...</span>
            </div>
          )}
          <div ref={containerRef} className={!isReady ? 'opacity-0' : 'opacity-100'} />
        </div>

        {/* Timers & Info */}
        <div className="flex flex-col gap-2 mt-2">
          <div className="flex items-center justify-between text-[10px] text-gray-500 font-bold tracking-wider uppercase">
            <div className="flex items-center gap-2">
              <span>{currentTime}</span>
              <span>/</span>
              <span>{totalTime}</span>
            </div>
            <div className="flex items-center gap-2">
              {acousticProfile && (
                <span className={`px-1.5 py-0.5 text-[8px] font-bold text-white uppercase tracking-widest ${
                  acousticProfile === 'THOCKY' ? 'bg-slate-800' : 
                  acousticProfile === 'CLACKY' ? 'bg-amber-600' : 'bg-emerald-600'
                }`}>
                  {acousticProfile}
                </span>
              )}
              {dominantFreq && (
                <span className="text-[9px] text-slate-500 font-bold uppercase">
                  {dominantFreq}Hz
                </span>
              )}
              {acousticProfile && <span>•</span>}
              <span>{format || 'AUDIO'}</span>
              <span>•</span>
              <span>{size ? formatSize(size) : 'Unknown Size'}</span>
            </div>
          </div>

          {/* Acoustic Analysis Bar */}
          {dominantFreq && (
            <div className="hidden sm:flex flex-col gap-1 mt-1">
              <div className="flex justify-between text-[8px] font-bold text-slate-400 uppercase tracking-widest">
                <span>Thocky</span>
                <span>Creamy</span>
                <span>Clacky</span>
              </div>
              <div className="h-1.5 w-full bg-slate-100 border border-slate-900 relative">
                {/* Gradient background */}
                <div className="absolute inset-0 bg-gradient-to-r from-slate-600 via-emerald-400 to-amber-500 opacity-20" />
                {/* Marker */}
                <div 
                  className="absolute top-0 bottom-0 bg-slate-900 shadow-[1px_0px_0px_0px_rgba(0,0,0,0.5)]"
                  style={{ 
                    // Map 50Hz - 1000Hz to 0 - 100%
                    left: `${Math.min(100, Math.max(0, ((dominantFreq - 50) / 950) * 100))}%`,
                    width: '3px',
                    marginLeft: '-1.5px'
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 shrink-0">
        <a
          href={resolveUrl(url)}
          download
          target="_blank"
          rel="noreferrer"
          className="p-2 border-2 border-slate-900 bg-white hover:bg-slate-50 text-slate-700 transition-colors flex items-center justify-center cursor-pointer shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[0px_0px_0px_0px]"
          title="Download File"
        >
          <Download className="w-4.5 h-4.5" />
        </a>
        {onDelete && (
          <button
            onClick={onDelete}
            className="p-2 border-2 border-red-700 bg-white hover:bg-red-50 text-red-700 transition-colors flex items-center justify-center cursor-pointer shadow-[1.5px_1.5px_0px_0px_rgba(185,28,28,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[0px_0px_0px_0px]"
            title="Delete Recording"
          >
            <Trash2 className="w-4.5 h-4.5" />
          </button>
        )}
      </div>
    </div>
  );
}
