'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { api, resolveUrl } from '@/lib/api';
import Navbar from '@/components/Navbar';
import { Camera, Save, Lock, Loader2, User as UserIcon } from 'lucide-react';
import type { User } from '@/lib/types';

const PREDEFINED_INTERESTS = [
  'Linear', 'Tactile', 'Clicky', 'Silent', '60%', '65%', '75%', 'TKL', 'Alice', 'Custom Built', 'Vintage'
];

const PREDEFINED_SOUNDS = ['Thocky', 'Clacky', 'Creamy', 'Silent', 'Poppy'];

export default function ProfilePage() {
  const { user, loading: authLoading, logout, setUser } = useAuth();
  const router = useRouter();

  // Avatar state
  const [avatarLoading, setAvatarLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Profile Form state
  const [fullName, setFullName] = useState('');
  const [bio, setBio] = useState('');
  const [interests, setInterests] = useState<string[]>([]);
  const [preferredSound, setPreferredSound] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileMsg, setProfileMsg] = useState({ type: '', text: '' });

  // Password Form state
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState({ type: '', text: '' });

  useEffect(() => {
    if (user) {
      setFullName(user.full_name || '');
      setBio(user.bio || '');
      setInterests(user.interests || []);
      setPreferredSound(user.preferred_sound || '');
    }
  }, [user]);

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex items-center justify-center flex-col gap-3 font-geek text-[#121212]">
        <Loader2 className="w-8 h-8 text-slate-900 animate-spin" />
        <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">[ Loading Profile... ]</span>
      </div>
    );
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAvatarLoading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await api.post('/users/avatar', formData);
      const updatedUser = { ...user, avatar_url: res.avatar_url };
      setUser(updatedUser);
      sessionStorage.setItem('keytone_user', JSON.stringify(updatedUser));
    } catch (err: any) {
      alert(err.message || 'Failed to upload avatar');
    } finally {
      setAvatarLoading(false);
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileMsg({ type: '', text: '' });

    try {
      const updatedUser = await api.patch('/users/profile', {
        full_name: fullName,
        bio,
        interests,
        preferred_sound: preferredSound
      });
      setUser(updatedUser);
      sessionStorage.setItem('keytone_user', JSON.stringify(updatedUser));
      setProfileMsg({ type: 'success', text: 'Profile updated successfully!' });
    } catch (err: any) {
      setProfileMsg({ type: 'error', text: err.message || 'Failed to update profile' });
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMsg({ type: '', text: '' });

    if (newPassword !== confirmPassword) {
      setPasswordMsg({ type: 'error', text: 'New passwords do not match' });
      return;
    }

    setPasswordLoading(true);
    try {
      await api.patch('/users/password', {
        old_password: oldPassword,
        new_password: newPassword
      });
      setPasswordMsg({ type: 'success', text: 'Password changed successfully!' });
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setPasswordMsg({ type: 'error', text: err.message || 'Failed to change password' });
    } finally {
      setPasswordLoading(false);
    }
  };

  const toggleInterest = (interest: string) => {
    setInterests(prev => 
      prev.includes(interest) 
        ? prev.filter(i => i !== interest)
        : [...prev, interest]
    );
  };

  return (
    <div className="min-h-screen bg-[#fafafa] text-[#121212] flex flex-col font-geek">
      <Navbar user={user} onLogout={logout} />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in space-y-6">
        
        {/* User ID Badge (Hero) */}
        <div className="geek-card bg-slate-900 text-white p-6 sm:p-8 flex flex-col sm:flex-row items-center sm:items-stretch gap-6 shadow-[8px_8px_0px_0px_rgba(16,185,129,1)] relative overflow-hidden">
          {/* Techy background pattern */}
          <div className="absolute top-0 right-0 w-64 h-full opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '16px 16px' }}></div>
          
          <div className="relative group cursor-pointer shrink-0 z-10" onClick={() => fileInputRef.current?.click()}>
            <div className="w-32 h-32 sm:w-40 sm:h-40 border-4 border-emerald-500 bg-slate-800 flex items-center justify-center relative overflow-hidden">
              {user.avatar_url ? (
                <img src={resolveUrl(user.avatar_url)} alt="Avatar" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-300" />
              ) : (
                <UserIcon className="w-16 h-16 text-slate-500" />
              )}
              <div className="absolute inset-0 bg-emerald-500/80 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="w-8 h-8 text-slate-900 mb-1" />
                <span className="text-xs text-slate-900 font-bold uppercase tracking-widest font-pixel">Update</span>
              </div>
              {avatarLoading && (
                <div className="absolute inset-0 bg-slate-900/80 flex flex-col items-center justify-center z-20">
                    <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
                </div>
              )}
            </div>
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleAvatarUpload} />
          </div>

          <div className="flex-1 flex flex-col justify-center z-10 text-center sm:text-left">
            <div className="inline-block bg-emerald-500 text-slate-900 text-[10px] font-bold uppercase tracking-widest px-2 py-1 mb-3 self-center sm:self-start">
              Verified Agent
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-wide font-pixel uppercase text-white mb-1">
              {user.full_name || user.username}
            </h1>
            <p className="text-emerald-400 text-xs font-bold uppercase tracking-widest font-geek mb-4">
              {user.email} • ID: {user.id.split('-')[0]}
            </p>
            {user.bio ? (
              <p className="text-slate-300 text-sm font-geek border-l-2 border-emerald-500 pl-3 italic max-w-xl">
                "{user.bio}"
              </p>
            ) : (
              <p className="text-slate-500 text-sm font-geek border-l-2 border-slate-700 pl-3 italic">
                No biography recorded in databanks.
              </p>
            )}
          </div>
        </div>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Settings Column (2/3 width) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Personalization Form */}
            <form onSubmit={handleProfileSubmit} className="geek-card p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-white relative">
              <div className="absolute top-0 right-0 w-8 h-8 border-b-2 border-l-2 border-slate-900 bg-emerald-400 flex items-center justify-center">
                <UserIcon className="w-4 h-4 text-slate-900" />
              </div>
              <div className="border-b-2 border-slate-900 pb-3 mb-6 pr-8">
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-widest font-pixel flex items-center gap-2">
                  <span className="w-2 h-2 bg-emerald-500 inline-block animate-pulse"></span>
                  Identity Config
                </h2>
              </div>
              
              {profileMsg.text && (
                <div className={`p-3 mb-6 border-2 text-xs font-bold uppercase tracking-wider ${profileMsg.type === 'error' ? 'border-red-500 bg-red-50 text-red-700' : 'border-emerald-500 bg-emerald-50 text-emerald-700'}`}>
                  {profileMsg.text}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Display Name</label>
                  <input
                    type="text"
                    placeholder="Your Name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border-2 border-slate-900 focus:bg-emerald-50 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none text-xs text-slate-900 transition-all font-geek shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Acoustic Preference</label>
                  <select
                    value={preferredSound}
                    onChange={(e) => setPreferredSound(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border-2 border-slate-900 focus:bg-emerald-50 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none text-xs text-slate-900 cursor-pointer font-geek shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                  >
                    <option value="">Select a sound signature...</option>
                    {PREDEFINED_SOUNDS.map(sound => (
                      <option key={sound} value={sound}>{sound}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">System Bio</label>
                <textarea
                  rows={3}
                  placeholder="Tell us about your keyboard journey..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border-2 border-slate-900 focus:bg-emerald-50 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none text-xs text-slate-900 transition-all resize-none font-geek shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                />
              </div>

              <div className="mb-8">
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Hardware Interests</label>
                <div className="flex flex-wrap gap-2 p-3 bg-slate-50 border-2 border-slate-900 border-dashed">
                  {PREDEFINED_INTERESTS.map(interest => {
                    const isSelected = interests.includes(interest);
                    return (
                      <button
                        key={interest}
                        type="button"
                        onClick={() => toggleInterest(interest)}
                        className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider border-2 transition-all cursor-pointer font-geek ${
                          isSelected 
                            ? 'bg-slate-900 text-emerald-400 border-slate-900 shadow-[2px_2px_0px_0px_rgba(16,185,129,1)] scale-[1.02]' 
                            : 'bg-white text-slate-600 border-slate-300 hover:border-slate-900 hover:text-slate-900 hover:-translate-y-0.5'
                        }`}
                      >
                        {interest}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t-2 border-slate-900 border-dashed">
                <button type="submit" disabled={profileLoading} className="geek-btn px-8 py-3 text-xs uppercase tracking-widest flex items-center gap-2">
                  {profileLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  <span>Save Config</span>
                </button>
              </div>
            </form>
          </div>

          {/* Sidebar Column (1/3 width) */}
          <div className="space-y-6">
            
            {/* Security Form */}
            <form onSubmit={handlePasswordSubmit} className="geek-card p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-slate-900 text-white relative">
              <div className="absolute top-0 right-0 w-8 h-8 border-b-2 border-l-2 border-emerald-500 bg-slate-800 flex items-center justify-center">
                <Lock className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="border-b-2 border-slate-700 pb-3 mb-6 pr-8">
                <h2 className="text-sm font-bold text-white uppercase tracking-widest font-pixel">Security</h2>
              </div>

              {passwordMsg.text && (
                <div className={`p-3 mb-6 border-2 text-[10px] font-bold uppercase tracking-wider ${passwordMsg.type === 'error' ? 'border-red-500 bg-red-950 text-red-400' : 'border-emerald-500 bg-emerald-950 text-emerald-400'}`}>
                  {passwordMsg.text}
                </div>
              )}

              <div className="space-y-4 mb-8">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Current Auth Key</label>
                  <input
                    type="password"
                    required
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border-2 border-slate-700 focus:bg-slate-900 focus:border-emerald-500 outline-none text-xs text-white transition-all font-geek"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-emerald-500 uppercase tracking-wider mb-2">New Auth Key</label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border-2 border-emerald-900 focus:bg-slate-900 focus:border-emerald-500 outline-none text-xs text-white transition-all font-geek shadow-[2px_2px_0px_0px_rgba(16,185,129,0.2)]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-emerald-500 uppercase tracking-wider mb-2">Confirm Auth Key</label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border-2 border-emerald-900 focus:bg-slate-900 focus:border-emerald-500 outline-none text-xs text-white transition-all font-geek shadow-[2px_2px_0px_0px_rgba(16,185,129,0.2)]"
                  />
                </div>
              </div>

              <div className="pt-4 border-t-2 border-slate-700 border-dashed">
                <button type="submit" disabled={passwordLoading} className="w-full geek-btn-secondary py-3 text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 !border-slate-700 !text-slate-300 hover:!bg-slate-800 hover:!border-emerald-500 hover:!text-emerald-400 transition-all">
                  {passwordLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                  <span>Update Password</span>
                </button>
              </div>
            </form>

            {/* Quick Stats or Filler Card */}
            <div className="geek-card p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-emerald-50 border-emerald-200 text-center">
              <h3 className="text-xs font-bold text-slate-900 uppercase font-pixel tracking-wider mb-2">Telemetry Active</h3>
              <p className="text-[10px] text-slate-600 font-geek uppercase leading-relaxed">
                Your profile configuration dictates how your setups and sound profiles are analyzed in the global matrix. Keep your preferences updated.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
