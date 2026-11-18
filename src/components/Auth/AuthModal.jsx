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
  ArrowRight,
  Calendar,
  Tag,
  LogOut,
  ExternalLink,
  Shield,
  Zap,
  Globe
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useEditor } from '../../context/EditorContext';
import { getUserSubscription } from '../../utils/supabaseTracking';

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
    logout,
    user,
    authError,
    setAuthError,
    authSuccess,
    setAuthSuccess,
    getDiceBearVoxelBotAvatar
  } = useAuth();
  const { setViewMode } = useEditor();

  const [userSub, setUserSub] = useState(null);
  const [loadingSub, setLoadingSub] = useState(false);

  useEffect(() => {
    let isMounted = true;
    if (isAuthModalOpen && user) {
      setLoadingSub(true);
      getUserSubscription(user)
        .then((sub) => {
          if (isMounted) setUserSub(sub);
        })
        .finally(() => {
          if (isMounted) setLoadingSub(false);
        });
    }
    return () => {
      isMounted = false;
    };
  }, [isAuthModalOpen, user]);

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
        {user ? (
          <div>
            {/* Logged in User Profile Header */}
            <div className="flex flex-col items-center text-center mb-5">
              <div className="w-20 h-20 rounded-full bg-zinc-100 p-1.5 shadow-md flex items-center justify-center overflow-hidden border-2 border-zinc-900 mb-3">
                <img
                  src={user.avatarUrl || getDiceBearVoxelBotAvatar(user.avatarSeed || user.username || user.email)}
                  alt="User Avatar"
                  className="w-full h-full object-contain rounded-full"
                />
              </div>
              <h2 className="text-xl font-bold text-zinc-950 tracking-tight lowercase">
                {user.username || user.email.split('@')[0]}
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5 font-mono">{user.email}</p>

              <div className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-[#E95464] text-xs font-medium lowercase">
                <span className="w-1.5 h-1.5 rounded-full bg-[#E95464]" />
                <span>active plan: {userSub?.plan_display_name || `antra ${user.plan || 'pro'}`}</span>
              </div>
            </div>

            {/* Subscription Dates & Limits Section */}
            <div className="space-y-3 mb-5">
              {/* Billing Dates & Pricing */}
              <div className="bg-zinc-50 rounded-2xl p-3.5 border border-zinc-100 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-500 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                    <span>billing cycle</span>
                  </span>
                  <span className="font-medium text-zinc-800 lowercase">
                    {userSub?.billing_cycle || 'monthly'} ($
                    {userSub?.price_usd ? Number(userSub.price_usd).toFixed(2) : '4.50'}/mo)
                  </span>
                </div>

                <div className="flex items-center justify-between pt-1.5 border-t border-zinc-200/60">
                  <span className="text-zinc-500">plan start date</span>
                  <span className="font-mono text-[11px] text-zinc-700">
                    {userSub?.plan_start_date ? new Date(userSub.plan_start_date).toLocaleDateString() : new Date().toLocaleDateString()}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-1.5 border-t border-zinc-200/60">
                  <span className="text-zinc-500">plan end date</span>
                  <span className="font-mono text-[11px] text-zinc-900 font-semibold">
                    {userSub?.plan_end_date ? new Date(userSub.plan_end_date).toLocaleDateString() : 'in 30 days'}
                  </span>
                </div>
              </div>

              {/* Published Websites Limit Progress */}
              <div className="bg-zinc-50 rounded-2xl p-3.5 border border-zinc-100 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-600 font-medium flex items-center gap-1.5 lowercase">
                    <Globe className="w-3.5 h-3.5 text-zinc-500" />
                    <span>published websites</span>
                  </span>
                  <span className="font-mono text-xs font-semibold text-zinc-900">
                    {userSub?.sites_created_count ?? 0} / {userSub?.max_sites ?? 1}
                  </span>
                </div>
                <div className="w-full h-2 bg-zinc-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#E95464] transition-all rounded-full"
                    style={{
                      width: `${Math.min(
                        100,
                        Math.max(5, (((userSub?.sites_created_count ?? 0) / (userSub?.max_sites ?? 1)) * 100))
                      )}%`
                    }}
                  />
                </div>
                <p className="text-[11px] text-zinc-400">
                  {(user.plan || 'pro') === 'pro' && 'pro allows 1 site. ultra allows 5. max allows 15.'}
                  {user.plan === 'ultra' && 'ultra allows 5 sites. max allows 15.'}
                  {user.plan === 'max' && 'max tier allows 15 high-performance websites.'}
                </p>
              </div>

              {/* Feature Tags from Supabase */}
              {userSub?.tags && userSub.tags.length > 0 && (
                <div className="bg-zinc-50 rounded-2xl p-3.5 border border-zinc-100">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 mb-2 flex items-center gap-1.5">
                    <Tag className="w-3 h-3 text-zinc-400" />
                    <span>supabase user tags</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {userSub.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-md bg-white border border-zinc-200 text-zinc-600 font-mono text-[10px]"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Actions for Logged in user */}
            <div className="space-y-2 pt-2 border-t border-zinc-100">
              <button
                type="button"
                onClick={() => {
                  closeAuthModal();
                  setViewMode('pricing');
                }}
                className="w-full py-2.5 px-4 bg-zinc-950 hover:bg-zinc-800 text-white rounded-xl text-xs font-medium lowercase transition flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                <span>upgrade / compare plans</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={async () => {
                  await logout();
                  closeAuthModal();
                }}
                className="w-full py-2 px-4 hover:bg-rose-50 text-zinc-500 hover:text-[#E95464] rounded-xl text-xs font-medium lowercase transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>sign out</span>
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Modal Header & Avatar Preview for Guest */}
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
          </>
        )}
      </div>
    </div>
  );
};
