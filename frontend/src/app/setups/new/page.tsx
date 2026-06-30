'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api';
import Navbar from '@/components/Navbar';
import { useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  SlidersHorizontal,
  Loader2,
} from 'lucide-react';

// Wrapper component to provide query parameters safely within Suspense
function NewSetupForm() {
  const { user, logout } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const keyboardId = searchParams.get('keyboard_id') || '';

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 1. General state
  const [setupName, setSetupName] = useState('');
  const [description, setDescription] = useState('');
  const [favourite, setFavourite] = useState(false);
  const [notes, setNotes] = useState('');

  // 2. Switch configuration state
  const [switchBrand, setSwitchBrand] = useState('');
  const [switchModel, setSwitchModel] = useState('');
  const [switchLubed, setSwitchLubed] = useState(false);
  const [switchFilmed, setSwitchFilmed] = useState(false);
  const [switchSpring, setSwitchSpring] = useState('');

  // 3. Keycap configuration state
  const [keycapBrand, setKeycapBrand] = useState('');
  const [keycapProfile, setKeycapProfile] = useState('Cherry');
  const [keycapMaterial, setKeycapMaterial] = useState('PBT');

  // 4. Plate state
  const [plateMaterial, setPlateMaterial] = useState('FR4');

  // 5. Foam list
  const availableFoams = ['Case Foam', 'Plate Foam', 'PE Foam', 'IXPE', 'Cotton', 'Silicone'];
  const [selectedFoams, setSelectedFoams] = useState<string[]>([]);

  // 6. Sound tags
  const soundProfileTags = ['Clacky', 'Thocky', 'Creamy', 'Marble', 'Poppy', 'Muted', 'Deep', 'Loud'];
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // 7. Typing feel slider state
  const [typingFeel, setTypingFeel] = useState(5);

  const handleFoamChange = (foam: string) => {
    setSelectedFoams((prev) =>
      prev.includes(foam) ? prev.filter((item) => item !== foam) : [...prev, foam]
    );
  };

  const handleTagChange = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((item) => item !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyboardId) {
      setError('Keyboard ID is missing from path parameters');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const payload = {
        keyboard_id: keyboardId,
        name: setupName,
        description,
        typing_feel: typingFeel,
        favourite,
        notes,
        switches: switchBrand || switchModel ? {
          brand: switchBrand,
          model: switchModel,
          lubed: switchLubed,
          filmed: switchFilmed,
          spring: switchSpring || undefined,
        } : undefined,
        keycaps: keycapBrand || keycapProfile ? {
          brand: keycapBrand,
          profile: keycapProfile,
          material: keycapMaterial,
        } : undefined,
        plate_material: plateMaterial || undefined,
        foams: selectedFoams,
        sound_tags: selectedTags,
      };

      await api.post('/setups', payload);

      queryClient.invalidateQueries({ queryKey: ['keyboard', keyboardId] });
      queryClient.invalidateQueries({ queryKey: ['metrics'] });

      router.push(`/keyboards/${keyboardId}`);
    } catch (err: any) {
      setError(err.message || 'Failed to create configuration');
    } finally {
      setLoading(false);
    }
  };

  const getTypingFeelLabel = (val: number) => {
    if (val <= 3) return 'Very Soft / Bouncy';
    if (val <= 7) return 'Medium / Balanced';
    return 'Very Firm / Stiff';
  };

  return (
    <div className="min-h-screen bg-[#fafafa] text-[#121212] flex flex-col font-geek">
      <Navbar user={user} onLogout={logout} />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in space-y-6">
        {/* Back Link */}
        <Link
          href={keyboardId ? `/keyboards/${keyboardId}` : '/dashboard'}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 uppercase tracking-wider transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Keyboard Profile</span>
        </Link>

        {/* Header */}
        <div className="border-b-2 border-slate-900 pb-4">
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight font-pixel uppercase flex items-center gap-2">
            <SlidersHorizontal className="w-6 h-6 text-slate-900" />
            <span>Configure Keyboard Setup</span>
          </h1>
          <p className="text-slate-500 mt-1 text-xs uppercase tracking-wider">
            [ BUILD SPEC SHEET: DESIGN ENVIRONMENT ]
          </p>
        </div>

        {error && (
          <div className="p-3 border-2 border-red-500 bg-red-50 text-red-700 text-xs font-bold uppercase tracking-wider">
            {error}
          </div>
        )}

        {/* Config Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Section 1: General Info */}
          <div className="geek-card p-6 bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] space-y-4">
            <h2 className="text-xs font-bold text-slate-950 uppercase font-pixel tracking-widest border-b-2 border-slate-900 pb-2">
              1. General Details
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Setup Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Setup A (Hyacinth switches, PC Plate)"
                  value={setupName}
                  onChange={(e) => setSetupName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border-2 border-slate-900 focus:bg-white focus:ring-1 focus:ring-slate-900 outline-none text-xs text-slate-900 placeholder:text-slate-400 font-geek"
                />
              </div>

              <div>
                <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Short Description
                </label>
                <input
                  type="text"
                  placeholder="e.g. Dreamy clacky workspace build"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border-2 border-slate-900 focus:bg-white focus:ring-1 focus:ring-slate-900 outline-none text-xs text-slate-900 placeholder:text-slate-400 font-geek"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="favourite"
                checked={favourite}
                onChange={(e) => setFavourite(e.target.checked)}
                className="w-4 h-4 border-2 border-slate-900 text-slate-900 focus:ring-slate-900 cursor-pointer"
              />
              <label htmlFor="favourite" className="text-xs font-bold text-slate-800 uppercase tracking-wider cursor-pointer select-none">
                Mark as Favorite configuration
              </label>
            </div>
          </div>

          {/* Section 2: Switch Configuration */}
          <div className="geek-card p-6 bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] space-y-4">
            <h2 className="text-xs font-bold text-slate-950 uppercase font-pixel tracking-widest border-b-2 border-slate-900 pb-2">
              2. Switch Specifications
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Switch Brand
                </label>
                <input
                  type="text"
                  placeholder="e.g. HMX / JWK / Gateron"
                  value={switchBrand}
                  onChange={(e) => setSwitchBrand(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border-2 border-slate-900 focus:bg-white focus:ring-1 focus:ring-slate-900 outline-none text-xs text-slate-900 placeholder:text-slate-400 font-geek"
                />
              </div>

              <div>
                <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Switch Model
                </label>
                <input
                  type="text"
                  placeholder="e.g. Hyacinth V2 / Black Ink"
                  value={switchModel}
                  onChange={(e) => setSwitchModel(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border-2 border-slate-900 focus:bg-white focus:ring-1 focus:ring-slate-900 outline-none text-xs text-slate-900 placeholder:text-slate-400 font-geek"
                />
              </div>

              <div>
                <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Spring Weight / Type
                </label>
                <input
                  type="text"
                  placeholder="e.g. 56g dual stage"
                  value={switchSpring}
                  onChange={(e) => setSwitchSpring(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border-2 border-slate-900 focus:bg-white focus:ring-1 focus:ring-slate-900 outline-none text-xs text-slate-900 placeholder:text-slate-400 font-geek"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-6 pt-2">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="lubed"
                  checked={switchLubed}
                  onChange={(e) => setSwitchLubed(e.target.checked)}
                  className="w-4 h-4 border-2 border-slate-900 text-slate-900 focus:ring-slate-900 cursor-pointer"
                />
                <label htmlFor="lubed" className="text-xs font-bold text-slate-800 uppercase tracking-wider cursor-pointer select-none">
                  Lubricated (Lubed)
                </label>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="filmed"
                  checked={switchFilmed}
                  onChange={(e) => setSwitchFilmed(e.target.checked)}
                  className="w-4 h-4 border-2 border-slate-900 text-slate-900 focus:ring-slate-900 cursor-pointer"
                />
                <label htmlFor="filmed" className="text-xs font-bold text-slate-800 uppercase tracking-wider cursor-pointer select-none">
                  Filmed
                </label>
              </div>
            </div>
          </div>

          {/* Section 3: Keycaps & Plates */}
          <div className="geek-card p-6 bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] gap-6 grid grid-cols-1 md:grid-cols-2">
            
            {/* Keycaps */}
            <div className="space-y-4">
              <h2 className="text-xs font-bold text-slate-950 uppercase font-pixel tracking-widest border-b-2 border-slate-900 pb-2">
                3. Keycaps Specifications
              </h2>

              <div>
                <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Keycap Brand / Designer
                </label>
                <input
                  type="text"
                  placeholder="e.g. GMK / ePBT / Signature Plastics"
                  value={keycapBrand}
                  onChange={(e) => setKeycapBrand(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border-2 border-slate-900 focus:bg-white focus:ring-1 focus:ring-slate-900 outline-none text-xs text-slate-900 placeholder:text-slate-400 font-geek"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Profile
                  </label>
                  <select
                    value={keycapProfile}
                    onChange={(e) => setKeycapProfile(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border-2 border-slate-900 focus:bg-white focus:ring-1 focus:ring-slate-900 outline-none text-xs text-slate-900 cursor-pointer font-geek"
                  >
                    <option value="Cherry">Cherry</option>
                    <option value="OEM">OEM</option>
                    <option value="SA">SA</option>
                    <option value="MT3">MT3</option>
                    <option value="XDA">XDA</option>
                    <option value="KAT">KAT</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Material
                  </label>
                  <select
                    value={keycapMaterial}
                    onChange={(e) => setKeycapMaterial(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border-2 border-slate-900 focus:bg-white focus:ring-1 focus:ring-slate-900 outline-none text-xs text-slate-900 cursor-pointer font-geek"
                  >
                    <option value="PBT">Double-shot PBT</option>
                    <option value="ABS">Double-shot ABS</option>
                    <option value="Dye-sub PBT">Dye-sub PBT</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Plates */}
            <div className="space-y-4">
              <h2 className="text-xs font-bold text-slate-950 uppercase font-pixel tracking-widest border-b-2 border-slate-900 pb-2">
                4. Plate Material
              </h2>

              <div>
                <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Material
                </label>
                <select
                  value={plateMaterial}
                  onChange={(e) => setPlateMaterial(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border-2 border-slate-900 focus:bg-white focus:ring-1 focus:ring-slate-900 outline-none text-xs text-slate-900 cursor-pointer font-geek"
                >
                  <option value="FR4">FR4</option>
                  <option value="PC">Polycarbonate (PC)</option>
                  <option value="POM">POM</option>
                  <option value="Aluminum">Aluminum</option>
                  <option value="Brass">Brass</option>
                  <option value="Carbon Fiber">Carbon Fiber</option>
                  <option value="Plateless">Plateless</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 4: Dampeners / Foams */}
          <div className="geek-card p-6 bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] space-y-4">
            <h2 className="text-xs font-bold text-slate-950 uppercase font-pixel tracking-widest border-b-2 border-slate-900 pb-2">
              5. Dampeners / Acoustic Foams
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {availableFoams.map((foam) => {
                const isSelected = selectedFoams.includes(foam);
                return (
                  <button
                    key={foam}
                    type="button"
                    onClick={() => handleFoamChange(foam)}
                    className={`px-4 py-2.5 border-2 text-xs font-bold tracking-wide transition-all cursor-pointer text-left flex items-center justify-between ${
                      isSelected
                        ? 'bg-slate-900 text-white border-slate-900 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.15)]'
                        : 'bg-white text-slate-800 border-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <span>{foam}</span>
                    {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 5: Sound Profiles & Feedback */}
          <div className="geek-card p-6 bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] gap-6 grid grid-cols-1 md:grid-cols-2">
            
            {/* Sound tags */}
            <div className="space-y-4">
              <h2 className="text-xs font-bold text-slate-950 uppercase font-pixel tracking-widest border-b-2 border-slate-900 pb-2">
                6. Sound Characteristics
              </h2>

              <div className="flex flex-wrap gap-2">
                {soundProfileTags.map((tag) => {
                  const isSelected = selectedTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => handleTagChange(tag)}
                      className={`px-3 py-1.5 border-2 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-emerald-500 text-slate-950 border-slate-900 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.15)] font-black'
                          : 'bg-white text-slate-700 border-slate-900 hover:bg-slate-50'
                      }`}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Slider */}
            <div className="space-y-4">
              <h2 className="text-xs font-bold text-slate-950 uppercase font-pixel tracking-widest border-b-2 border-slate-900 pb-2">
                7. Typing Feedback
              </h2>

              <div>
                <div className="flex justify-between items-center text-[10px] font-bold text-slate-500 mb-2">
                  <span>TYPING FEEL</span>
                  <span className="text-slate-900 uppercase tracking-wider">
                    {getTypingFeelLabel(typingFeel)}
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={typingFeel}
                  onChange={(e) => setTypingFeel(parseInt(e.target.value))}
                  className="w-full h-2 bg-slate-100 border-2 border-slate-900 rounded-none appearance-none cursor-pointer accent-slate-900 outline-none"
                />
                <div className="flex justify-between text-[9px] font-bold text-slate-400 mt-2 uppercase tracking-wide">
                  <span>1 (Softest)</span>
                  <span>5 (Medium)</span>
                  <span>10 (Firmest)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="geek-card p-6 bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] space-y-4">
            <h2 className="text-xs font-bold text-slate-950 uppercase font-pixel tracking-widest border-b-2 border-slate-900 pb-2">
              8. Personal Notes
            </h2>

            <textarea
              rows={4}
              placeholder="e.g. Best workspace configuration, deep profile sounds, extremely enjoyable typing experience during late hours."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border-2 border-slate-900 focus:bg-white focus:ring-1 focus:ring-slate-900 outline-none text-xs text-slate-900 placeholder:text-slate-400 font-geek resize-y"
            />
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-4 pt-4 border-t-2 border-slate-900 border-dashed">
            <Link
              href={`/keyboards/${keyboardId}`}
              className="geek-btn-secondary flex-1 py-3 text-center text-xs uppercase tracking-wider"
            >
              Cancel Setup
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="geek-btn flex-1 py-3 text-xs uppercase tracking-wider flex items-center justify-center gap-1.5"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving Configuration...</span>
                </>
              ) : (
                <span>Save Specification</span>
              )}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}

export default function NewSetupPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#fafafa] flex items-center justify-center flex-col gap-3 font-geek text-[#121212]">
        <Loader2 className="w-8 h-8 text-slate-900 animate-spin" />
        <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">[ Loading config builder... ]</span>
      </div>
    }>
      <NewSetupForm />
    </Suspense>
  );
}
