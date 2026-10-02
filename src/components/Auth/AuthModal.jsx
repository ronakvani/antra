import React, { useState, useEffect } from 'react';
import {
  X,
  LogIn,
  UserPlus,
  Mail,
  Lock,
  User,
  Sparkles,
  Shuffle,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const RANDOM_SEEDS = [
  'cyber-builder',
  'voxel-master',
  'pixel-pilot',
  'quantum-bot',
  'neon-matrix',
  'antra-craft',
  'sol-droid',
  'vortex-cube',
  'glitch-tech',
  'alpha-bot',
  'cyber-samurai',
  'pixel-knight',
  'hyper-droid'
];

export const AuthModal = () => {
  const {
    isAuthModalOpen,
    authModalMode,
    setAuthModalMode,
    closeAuthModal,
    login,
    signup,
    authError,
    setAuthError,
    authSuccess,
    setAuthSuccess,
    getDiceBearVoxelBotAvatar
  } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [avatarSeed, setAvatarSeed] = useState('antra-builder');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Sync avatar seed when username or email changes during signup
  useEffect(() => {
    if (authModalMode === 'signup') {
      const activeSeed = username.trim() || email.split('@')[0] || 'antra-builder';
      setAvatarSeed(activeSeed);
    }
  }, [username, email, authModalMode]);

  if (!isAuthModalOpen) return null;

  const handleShuffleAvatar = () => {
    const randomPick = RANDOM_SEEDS[Math.floor(Math.random() * RANDOM_SEEDS.length)];
    const seedWithNum = `${randomPick}-${Math.floor(Math.random() * 900 + 100)}`;
    setAvatarSeed(seedWithNum);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccess('');

    if (!email.trim() || !password) {
      setAuthError('Please fill in all required fields.');
      return;
    }

    setSubmitting(true);
    try {
      if (authModalMode === 'login') {
        await login(email, password);
      } else {
        await signup(email, password, username, avatarSeed);
      }
    } catch (err) {
      // Error handled in context
    } finally {
      setSubmitting(false);
    }
  };

  const currentAvatarUrl = getDiceBearVoxelBotAvatar(
    authModalMode === 'signup'
      ? (avatarSeed || username || email.split('@')[0] || 'antra-builder')
      : (email.split('@')[0] || 'antra-builder')
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-[420px] bg-white border border-zinc-200 rounded-[28px] shadow-2xl p-6 sm:p-8 overflow-hidden text-zinc-900 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={closeAuthModal}
          className="absolute top-5 right-5 p-2 rounded-full text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 transition"
          title="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header & Avatar Preview */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="relative mb-3 group">
            <div className="w-20 h-20 rounded-full bg-zinc-100 p-1.5 shadow-md flex items-center justify-center overflow-hidden border-2 border-zinc-900">
              <img
                src={currentAvatarUrl}
                alt="User Avatar"
                className="w-full h-full object-contain rounded-full"
              />
            </div>
            {authModalMode === 'signup' && (
              <button
                type="button"
                onClick={handleShuffleAvatar}
                title="Shuffle avatar style"
                className="absolute -bottom-1 -right-1 p-1.5 bg-zinc-950 text-white rounded-full shadow-md hover:bg-zinc-800 transition hover:scale-105 flex items-center justify-center border border-white/20 cursor-pointer"
              >
                <Shuffle className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <h2 className="text-2xl font-bold text-zinc-950 tracking-tight">
            {authModalMode === 'login' ? 'Welcome back' : 'Create your account'}
          </h2>
          <p className="text-xs text-zinc-500 mt-1">
            {authModalMode === 'login'
              ? 'Sign in to manage and edit your interactive websites'
              : 'Sign up to start creating and publishing interactive video websites'}
          </p>
        </div>

        {/* Mode Switch Tabs */}
        <div className="grid grid-cols-2 bg-zinc-100 p-1 rounded-2xl mb-5">
          <button
            type="button"
            onClick={() => {
              setAuthModalMode('login');
              setAuthError('');
              setAuthSuccess('');
            }}
            className={`py-2 text-sm font-semibold rounded-xl transition flex items-center justify-center gap-2 ${
              authModalMode === 'login'
                ? 'bg-white text-zinc-950 shadow-sm'
                : 'text-zinc-500 hover:text-zinc-900'
            }`}
          >
            <LogIn className="w-4 h-4" />
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setAuthModalMode('signup');
              setAuthError('');
              setAuthSuccess('');
            }}
            className={`py-2 text-sm font-semibold rounded-xl transition flex items-center justify-center gap-2 ${
              authModalMode === 'signup'
                ? 'bg-white text-zinc-950 shadow-sm'
                : 'text-zinc-500 hover:text-zinc-900'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            Sign Up
          </button>
        </div>

        {/* Error Alert */}
        {authError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-start gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{authError}</span>
          </div>
        )}

        {/* Success Alert */}
        {authSuccess && (
          <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-start gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
            <span>{authSuccess}</span>
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {authModalMode === 'signup' && (
            <div>
              <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1">
                Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ronak Vani"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm text-zinc-950 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:bg-white transition"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm text-zinc-950 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:bg-white transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm text-zinc-950 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:bg-white transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-zinc-400 hover:text-zinc-700 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full mt-3 py-3 px-4 bg-zinc-950 hover:bg-zinc-800 text-white font-semibold rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75"
          >
            {submitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : authModalMode === 'login' ? (
              <>
                <LogIn className="w-4 h-4" />
                Sign In
              </>
            ) : (
              <>
                <span>Create Account</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Consumer Clean Footer */}
        <div className="mt-5 text-center text-[11px] text-zinc-400 pt-3 border-t border-zinc-100">
          By continuing, you agree to Antra's Terms of Service and Privacy Policy.
        </div>
      </div>
    </div>
  );
};
