import React, { useState, useRef, useEffect } from 'react';
import {
  LogIn,
  UserPlus,
  LogOut,
  ChevronDown,
  LayoutDashboard,
  Sparkles,
  Tag,
  User
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useEditor } from '../../context/EditorContext';

export const BuilderAuthHeader = () => {
  const { user, openAuthModal, logout, getDiceBearVoxelBotAvatar } = useAuth();
  const { setViewMode } = useEditor();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const defaultAvatar = getDiceBearVoxelBotAvatar('antra-guest');

  return (
    <div className="absolute top-6 right-8 z-30 flex items-center gap-2.5 select-none font-normal">
      {user ? (
        /* Logged-In State with Unique Avatar & Profile Dropdown */
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setViewMode('pricing')}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-white/90 hover:bg-white backdrop-blur-md border border-zinc-200/80 hover:border-zinc-300 text-zinc-800 hover:text-zinc-950 text-xs font-normal rounded-2xl shadow-sm transition cursor-pointer lowercase"
            title="view pricing"
          >
            <Tag className="w-3.5 h-3.5 text-zinc-600" />
            <span>pricing</span>
          </button>

          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2.5 px-3 py-1.5 bg-white/90 hover:bg-white backdrop-blur-md border border-zinc-200/80 hover:border-zinc-300 rounded-2xl shadow-sm hover:shadow-md transition group cursor-pointer"
            >
              {/* Avatar */}
              <div className="relative w-8 h-8 rounded-full bg-zinc-100 border border-zinc-200 p-0.5 overflow-hidden flex items-center justify-center shrink-0 shadow-inner">
                <img
                  src={user.avatarUrl || getDiceBearVoxelBotAvatar(user.avatarSeed || user.username || user.email)}
                  alt="avatar"
                  className="w-full h-full object-contain rounded-full"
                />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full" />
              </div>

              <div className="flex flex-col text-left">
                <span className="text-xs font-normal text-zinc-950 tracking-tight leading-tight lowercase">
                  {user.username || user.email.split('@')[0]}
                </span>
                <span className="text-[10px] font-normal text-zinc-400 lowercase leading-none">
                  creator
                </span>
              </div>

              <ChevronDown className={`w-3.5 h-3.5 text-zinc-400 group-hover:text-zinc-700 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* User Profile Dropdown Menu */}
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white border border-zinc-200 rounded-[22px] shadow-2xl p-4 text-left z-40 animate-in fade-in slide-in-from-top-2 duration-150">
                
                {/* Profile Card Header */}
                <div className="flex items-center gap-3 pb-3 border-b border-zinc-100">
                  <div className="w-12 h-12 rounded-full bg-zinc-100 border border-zinc-200 p-1 flex items-center justify-center overflow-hidden shadow-sm shrink-0">
                    <img
                      src={user.avatarUrl || getDiceBearVoxelBotAvatar(user.avatarSeed || user.username || user.email)}
                      alt="avatar"
                      className="w-full h-full object-contain rounded-full"
                    />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-normal text-zinc-950 truncate lowercase">
                      {user.username || user.email.split('@')[0]}
                    </span>
                    <span className="text-xs text-zinc-400 truncate" title={user.email}>
                      {user.email}
                    </span>
                  </div>
                </div>

                {/* Menu Options */}
                <div className="py-2 space-y-1">
                  <button
                    type="button"
                    onClick={() => {
                      setDropdownOpen(false);
                      setViewMode('editor');
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-sm font-normal text-zinc-700 hover:text-zinc-950 hover:bg-zinc-100 rounded-xl transition cursor-pointer lowercase"
                  >
                    <LayoutDashboard className="w-4 h-4 text-zinc-400" />
                    <span>open studio</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setDropdownOpen(false);
                      setViewMode('pricing');
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-sm font-normal text-zinc-700 hover:text-zinc-950 hover:bg-zinc-100 rounded-xl transition cursor-pointer lowercase"
                  >
                    <Tag className="w-4 h-4 text-zinc-500" />
                    <span>view pricing</span>
                  </button>

                  <div className="my-1 border-t border-zinc-100" />

                  <button
                    type="button"
                    onClick={() => {
                      setDropdownOpen(false);
                      logout();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-sm font-normal text-red-600 hover:bg-red-50 rounded-xl transition cursor-pointer lowercase"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>sign out</span>
                  </button>
                </div>

                {/* Brand Footer */}
                <div className="pt-2 border-t border-zinc-100 flex items-center justify-between text-[11px] text-zinc-400 lowercase">
                  <span>antra</span>
                  <span>v1.0</span>
                </div>

              </div>
            )}
          </div>
        </div>
      ) : (
        /* Logged-Out State: Pricing, Login, and Sign Up Buttons */
        <div className="flex items-center gap-1.5 bg-white/80 hover:bg-white/95 backdrop-blur-md border border-zinc-200/80 p-1.5 rounded-2xl shadow-sm transition font-normal">
          {/* Guest Avatar Preview Icon */}
          <div
            className="w-8 h-8 rounded-full bg-zinc-100 border border-zinc-200 p-0.5 flex items-center justify-center cursor-pointer hover:scale-105 transition shadow-inner overflow-hidden"
            onClick={() => openAuthModal('signup')}
            title="create account"
          >
            <img
              src={defaultAvatar}
              alt="avatar"
              className="w-full h-full object-contain rounded-full"
            />
          </div>

          {/* Pricing Button */}
          <button
            type="button"
            onClick={() => setViewMode('pricing')}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-normal text-zinc-700 hover:text-zinc-950 hover:bg-zinc-100 rounded-xl transition cursor-pointer lowercase"
            title="view pricing"
          >
            <Tag className="w-3.5 h-3.5 text-zinc-500" />
            <span>pricing</span>
          </button>

          <div className="h-3 w-px bg-zinc-200" />

          {/* Sign In Button */}
          <button
            type="button"
            onClick={() => openAuthModal('login')}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-normal text-zinc-700 hover:text-zinc-950 hover:bg-zinc-100 rounded-xl transition cursor-pointer lowercase"
            title="sign in"
          >
            <LogIn className="w-3.5 h-3.5 text-zinc-500" />
            <span>sign in</span>
          </button>

          {/* Sign Up Button */}
          <button
            type="button"
            onClick={() => openAuthModal('signup')}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-normal bg-zinc-950 hover:bg-zinc-800 text-white rounded-xl shadow-sm transition cursor-pointer lowercase"
            title="sign up"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>sign up</span>
          </button>
        </div>
      )}
    </div>
  );
};
