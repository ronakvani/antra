import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Check, 
  Clock, 
  ShieldCheck, 
  Sparkles,
  RefreshCw,
  AlertCircle,
  ExternalLink,
  CheckCircle2
} from 'lucide-react';
import { useEditor } from '../../context/EditorContext';
import { useAuth } from '../../context/AuthContext';
import {
  requestRazorpayQr,
  checkRazorpayPaymentStatus,
  generateQrDataUrl,
  buildStandardUpiString
} from '../../utils/razorpayService';

/**
 * Antra Brand Color Palette (from antra-color-code.png):
 * - Ivory: #F8F4E6
 * - Cherry Blossom: #FEF4F4
 * - Red Plum: #F2A0A1
 * - Deep Crimson: #E95464
 */

export const CHECKOUT_PLAN_DETAILS = {
  pro: {
    id: 'pro',
    name: 'pro',
    displayName: 'antra pro',
    price: 4.50,
    regularPrice: 9.00,
    currencySymbol: '$',
    period: 'monthly',
    billingCycleDays: 30,
    upiAmountInr: 375,
    tagline: '10–15s scrub video · 1 active site · no watermark',
    badge: '15-day launch price (50% off)',
    features: [
      '1 active published website',
      '10–15s video scrub timeline',
      '500mb zero-egress edge storage',
      'clean export without antra watermark'
    ]
  },
  ultra: {
    id: 'ultra',
    name: 'ultra',
    displayName: 'antra ultra',
    price: 19.00,
    regularPrice: 19.00,
    currencySymbol: '$',
    period: 'monthly',
    billingCycleDays: 30,
    upiAmountInr: 1580,
    tagline: 'spatial 3d scene previs · 5 sites · lead-gen forms',
    badge: 'creator & studio tier',
    features: [
      '5 active published websites',
      'up to 30s video scrub timeline',
      '2.5gb edge storage (zero-egress)',
      'spatial 3d scene previs & diffusion'
    ]
  },
  max: {
    id: 'max',
    name: 'max',
    displayName: 'antra max',
    price: 39.00,
    regularPrice: 39.00,
    currencySymbol: '$',
    period: 'monthly',
    billingCycleDays: 30,
    upiAmountInr: 3250,
    tagline: 'multi-scene pipelines · 15 sites · white-label branding',
    badge: 'agency & enterprise tier',
    features: [
      '15 active published websites',
      'up to 60s multi-scene timeline',
      '10gb edge storage (zero-egress)',
      'full white-label branding & webhooks'
    ]
  }
};

export const CheckoutView = () => {
  const { setViewMode, selectedPlan = 'pro' } = useEditor();
  const { user, setUserPlan } = useAuth();

  // Active selected plan (defaults to editor context plan or 'pro')
  const [currentPlanId, setCurrentPlanId] = useState(
    (selectedPlan && CHECKOUT_PLAN_DETAILS[selectedPlan.toLowerCase()]) ? selectedPlan.toLowerCase() : 'pro'
  );

  // Synchronize when editor context selectedPlan changes
  useEffect(() => {
    if (selectedPlan && CHECKOUT_PLAN_DETAILS[selectedPlan.toLowerCase()]) {
      setCurrentPlanId(selectedPlan.toLowerCase());
    }
  }, [selectedPlan]);

  const activePlan = CHECKOUT_PLAN_DETAILS[currentPlanId] || CHECKOUT_PLAN_DETAILS.pro;

  // View Theme Mode: 'studio' (Antra dark with brand colors) or 'figma' (MacBook Pro 14" wireframe light)
  const [themeMode, setThemeMode] = useState('studio');

  // Razorpay payment countdown timer
  const [secondsRemaining, setSecondsRemaining] = useState(899); // 14:59 minutes

  // Razorpay QR & Payment Integration State
  const [qrImageUrl, setQrImageUrl] = useState(null);
  const [qrId, setQrId] = useState(null);
  const [qrLoading, setQrLoading] = useState(false);
  const [qrSource, setQrSource] = useState('svg_fallback'); // 'razorpay_live' | 'upi_generated' | 'svg_fallback'
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [statusNotice, setStatusNotice] = useState('');

  // Countdown timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsRemaining((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch or generate QR code whenever activePlan or user changes
  useEffect(() => {
    let isCancelled = false;

    async function loadQrCode() {
      setQrLoading(true);
      setStatusNotice('initializing razorpay upi qr...');
      setPaymentSuccess(false);

      try {
        // 1. Try calling the backend Razorpay endpoint
        const response = await requestRazorpayQr({
          planId: activePlan.id,
          userEmail: user?.email || 'guest@antra.studio'
        });

        if (isCancelled) return;

        if (response.success && response.qrCode) {
          const rzpQr = response.qrCode;
          setQrId(rzpQr.id);
          setQrSource('razorpay_live');

          // If Razorpay returns a direct hosted image url
          if (rzpQr.image_url) {
            setQrImageUrl(rzpQr.image_url);
          } else {
            // Or generate QR image from the UPI intent string
            const upiString = `upi://pay?pa=razorpay@icici&pn=Antra Studio&am=${activePlan.upiAmountInr}&cu=INR&tn=Antra ${activePlan.name} Plan`;
            const dataUrl = await generateQrDataUrl(upiString);
            if (!isCancelled) setQrImageUrl(dataUrl);
          }
          setStatusNotice('live razorpay qr generated');
        } else {
          // Fallback: Generate real scannable UPI QR with exact plan INR amount
          const upiString = buildStandardUpiString({
            payeeVpa: 'antra@razorpay',
            payeeName: 'Antra Studio',
            amountInr: activePlan.upiAmountInr,
            note: `Antra ${activePlan.name} Plan ($${activePlan.price.toFixed(2)})`
          });
          const dataUrl = await generateQrDataUrl(upiString);
          if (!isCancelled) {
            setQrImageUrl(dataUrl);
            setQrSource('upi_generated');
            setStatusNotice(
              response.requiresKeys 
                ? 'upi qr ready (add razorpay keys for auto-verification)' 
                : 'standard upi qr active'
            );
          }
        }
      } catch (err) {
        console.warn('Backend Razorpay QR request error, falling back to local UPI QR:', err);
        const upiString = buildStandardUpiString({
          amountInr: activePlan.upiAmountInr,
          note: `Antra ${activePlan.name} Plan`
        });
        const dataUrl = await generateQrDataUrl(upiString);
        if (!isCancelled) {
          setQrImageUrl(dataUrl);
          setQrSource('upi_generated');
          setStatusNotice('upi qr ready');
        }
      } finally {
        if (!isCancelled) setQrLoading(false);
      }
    }

    loadQrCode();

    return () => {
      isCancelled = true;
    };
  }, [activePlan.id, activePlan.upiAmountInr, user?.email]);

  // Payment status polling when a real Razorpay qrId is present
  useEffect(() => {
    if (!qrId || paymentSuccess) return;

    const pollInterval = setInterval(async () => {
      try {
        const res = await checkRazorpayPaymentStatus(qrId);
        if (res.success && res.isPaid) {
          setPaymentSuccess(true);
          clearInterval(pollInterval);
          if (setUserPlan) {
            await setUserPlan(activePlan.id);
          }
        }
      } catch (e) {
        // silent polling error
      }
    }, 4000);

    return () => clearInterval(pollInterval);
  }, [qrId, paymentSuccess, activePlan.id, setUserPlan]);


  const handleSimulatePayment = async () => {
    setPaymentSuccess(true);
    if (setUserPlan) {
      await setUserPlan(activePlan.id);
    }
  };

  const formatTimer = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Dynamic Date Calculations (lowercase formatted)
  const today = new Date();
  const formattedStartDate = today.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).toLowerCase();

  const endDate = new Date(today);
  endDate.setDate(today.getDate() + (activePlan.billingCycleDays || 30));
  const formattedEndDate = endDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).toLowerCase();

  return (
    <div 
      className={`min-h-screen w-full font-sans lowercase transition-colors duration-300 selection:bg-[#E95464]/20 selection:text-[#F2A0A1] ${
        themeMode === 'studio' 
          ? 'bg-[#070709] text-zinc-200' 
          : 'bg-[#EBEBEB] text-zinc-900'
      }`}
    >
      {/* Brand Ambient Glows (from antra-color-code.png) */}
      {themeMode === 'studio' && (
        <>
          <div className="fixed top-0 left-1/4 w-[600px] h-[340px] bg-gradient-to-br from-[#E95464]/12 via-[#F2A0A1]/6 to-transparent blur-[140px] pointer-events-none rounded-full" />
          <div className="fixed bottom-10 right-1/4 w-[500px] h-[300px] bg-gradient-to-bl from-[#F2A0A1]/10 via-[#F8F4E6]/5 to-transparent blur-[120px] pointer-events-none rounded-full" />
        </>
      )}

      {/* Top Header Navigation */}
      <header 
        className={`sticky top-0 z-40 w-full backdrop-blur-md border-b transition-colors ${
          themeMode === 'studio' 
            ? 'bg-[#070709]/85 border-white/[0.08]' 
            : 'bg-white/80 border-zinc-300 shadow-sm'
        }`}
      >
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <button
              onClick={() => setViewMode('landing')}
              className={`text-xl font-normal tracking-tight transition cursor-pointer lowercase ${
                themeMode === 'studio' ? 'text-white hover:text-[#F2A0A1]' : 'text-zinc-950 hover:text-[#E95464]'
              }`}
            >
              antra
            </button>
            <div className={`h-3 w-px hidden sm:block ${themeMode === 'studio' ? 'bg-zinc-800' : 'bg-zinc-300'}`} />
            <button
              onClick={() => setViewMode('pricing')}
              className={`hidden sm:flex items-center gap-1.5 text-xs font-normal transition cursor-pointer lowercase ${
                themeMode === 'studio' ? 'text-zinc-400 hover:text-white' : 'text-zinc-600 hover:text-black'
              }`}
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>back to pricing</span>
            </button>
          </div>

          <div className="flex items-center gap-3">

            {/* Theme Toggle Pill: Studio Dark vs Figma Wireframe Light */}
            <div 
              className={`flex items-center p-0.5 rounded-full text-[11px] font-normal border transition ${
                themeMode === 'studio' 
                  ? 'bg-white/[0.05] border-white/10 text-zinc-400' 
                  : 'bg-zinc-200 border-zinc-300 text-zinc-700'
              }`}
            >
              <button
                onClick={() => setThemeMode('studio')}
                className={`px-2.5 py-1 rounded-full transition cursor-pointer lowercase ${
                  themeMode === 'studio' 
                    ? 'bg-[#E95464] text-white shadow-sm font-medium' 
                    : 'text-zinc-600 hover:text-zinc-950 font-normal'
                }`}
              >
                dark
              </button>
              <button
                onClick={() => setThemeMode('figma')}
                className={`px-2.5 py-1 rounded-full transition cursor-pointer lowercase ${
                  themeMode === 'figma' 
                    ? 'bg-white text-zinc-950 shadow-sm font-medium' 
                    : 'text-zinc-400 hover:text-white font-normal'
                }`}
              >
                light
              </button>
            </div>

            {/* User Session Info */}
            {user ? (
              <span className={`text-xs font-normal lowercase hidden md:inline ${
                themeMode === 'studio' ? 'text-zinc-400' : 'text-zinc-600'
              }`}>
                logged in as <strong className={themeMode === 'studio' ? 'text-[#F8F4E6] font-medium' : 'text-zinc-900 font-medium'}>
                  {(user.email || 'user').toLowerCase()}
                </strong>
              </span>
            ) : (
              <span className={`text-xs font-normal lowercase hidden md:inline ${
                themeMode === 'studio' ? 'text-zinc-500' : 'text-zinc-500'
              }`}>
                fast guest checkout
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Main Checkout Viewport Container */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        
        {/* Page Header (No top-right plan switcher pills) */}
        <div className="mb-8">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#E95464] animate-pulse" />
            <span className={`text-xs tracking-wider font-medium lowercase ${
              themeMode === 'studio' ? 'text-[#F2A0A1]' : 'text-[#E95464]'
            }`}>
              checkout & subscription
            </span>
          </div>
          <h1 className={`text-2xl sm:text-3xl font-semibold tracking-tight mt-1 lowercase ${
            themeMode === 'studio' ? 'text-white' : 'text-zinc-950'
          }`}>
            complete your subscription
          </h1>
        </div>

        {/* 2-Column Responsive Layout Matching Figma MacBook Pro 14" - 3 */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* ======================================================== */}
          {/* LEFT COLUMN: Razorpay QR Code + Details + Features       */}
          {/* ======================================================== */}
          <div className="lg:col-span-6 flex flex-col">
            <div 
              className={`rounded-2xl p-6 sm:p-8 transition-all relative overflow-hidden flex flex-col items-center shadow-xl ${
                themeMode === 'studio'
                  ? 'bg-[#111116] border border-white/10 shadow-black/40'
                  : 'bg-white border border-zinc-950 shadow-md'
              }`}
            >
              
              {/* QR Code Viewport (Clean, centered, no clutter) */}
              <div className="flex flex-col items-center justify-center w-full pt-1 pb-4">
                <div className="relative p-5 rounded-2xl bg-white border border-zinc-200 shadow-2xl flex items-center justify-center">
                  
                  {/* Viewfinder Stylized Corner Brackets in Antra Brand Crimson/Plum */}
                  <div className="absolute -top-1 -left-1 w-5 h-5 border-t-2 border-l-2 border-[#E95464] rounded-tl-sm pointer-events-none" />
                  <div className="absolute -top-1 -right-1 w-5 h-5 border-t-2 border-r-2 border-[#E95464] rounded-tr-sm pointer-events-none" />
                  <div className="absolute -bottom-1 -left-1 w-5 h-5 border-b-2 border-l-2 border-[#F2A0A1] rounded-bl-sm pointer-events-none" />
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 border-b-2 border-r-2 border-[#F2A0A1] rounded-br-sm pointer-events-none" />

                  {/* Real Razorpay / UPI Dynamic QR Code Viewport */}
                  <div className="relative w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center bg-white rounded-lg overflow-hidden">
                    {qrLoading ? (
                      <div className="flex flex-col items-center justify-center gap-2 text-zinc-500">
                        <RefreshCw className="w-8 h-8 text-[#E95464] animate-spin" />
                        <span className="text-xs font-mono">generating razorpay qr...</span>
                      </div>
                    ) : qrImageUrl ? (
                      <div className="relative w-full h-full flex items-center justify-center p-2">
                        <img 
                          src={qrImageUrl} 
                          alt={`Razorpay UPI QR for ${activePlan.displayName}`} 
                          className="w-full h-full object-contain"
                        />
                        {/* Center Brand Badge Overlay */}
                        <div className="absolute inset-0 m-auto w-11 h-11 bg-white/95 rounded-xl shadow-md border border-zinc-200 flex flex-col items-center justify-center p-1 pointer-events-none">
                          <span className="text-[10px] font-extrabold text-[#E95464] tracking-tighter lowercase leading-none">
                            antra
                          </span>
                          <span className="text-[8px] font-bold text-zinc-800 leading-none mt-0.5 lowercase">
                            pay
                          </span>
                        </div>
                      </div>
                    ) : (
                      /* Fallback SVG Matrix Graphic */
                      <svg
                        viewBox="0 0 256 256"
                        className="w-full h-full text-zinc-950"
                        fill="currentColor"
                        shapeRendering="crispEdges"
                      >
                        <rect x="16" y="16" width="56" height="56" fill="black" rx="6" />
                        <rect x="24" y="24" width="40" height="40" fill="white" rx="4" />
                        <rect x="32" y="32" width="24" height="24" fill="black" rx="2" />

                        <rect x="184" y="16" width="56" height="56" fill="black" rx="6" />
                        <rect x="192" y="24" width="40" height="40" fill="white" rx="4" />
                        <rect x="200" y="32" width="24" height="24" fill="black" rx="2" />

                        <rect x="16" y="184" width="56" height="56" fill="black" rx="6" />
                        <rect x="24" y="192" width="40" height="40" fill="white" rx="4" />
                        <rect x="32" y="200" width="24" height="24" fill="black" rx="2" />

                        <rect x="80" y="40" width="8" height="8" fill="black" />
                        <rect x="96" y="40" width="8" height="8" fill="black" />
                        <rect x="112" y="40" width="8" height="8" fill="black" />
                        <rect x="128" y="40" width="8" height="8" fill="black" />
                        <rect x="144" y="40" width="8" height="8" fill="black" />
                        <rect x="160" y="40" width="8" height="8" fill="black" />

                        <rect x="40" y="80" width="8" height="8" fill="black" />
                        <rect x="40" y="96" width="8" height="8" fill="black" />
                        <rect x="40" y="112" width="8" height="8" fill="black" />
                        <rect x="40" y="128" width="8" height="8" fill="black" />
                        <rect x="40" y="144" width="8" height="8" fill="black" />
                        <rect x="40" y="160" width="8" height="8" fill="black" />

                        <rect x="88" y="24" width="16" height="8" fill="black" />
                        <rect x="120" y="24" width="16" height="8" fill="black" />
                        <rect x="152" y="24" width="16" height="8" fill="black" />

                        <rect x="88" y="56" width="24" height="8" fill="black" />
                        <rect x="136" y="56" width="16" height="8" fill="black" />

                        <rect x="80" y="80" width="16" height="16" fill="black" />
                        <rect x="112" y="80" width="24" height="8" fill="black" />
                        <rect x="152" y="80" width="16" height="24" fill="black" />
                        <rect x="184" y="80" width="24" height="16" fill="black" />
                        <rect x="224" y="80" width="16" height="16" fill="black" />

                        <rect x="24" y="88" width="16" height="8" fill="black" />
                        <rect x="24" y="120" width="16" height="8" fill="black" />
                        <rect x="24" y="152" width="16" height="8" fill="black" />

                        <rect x="80" y="112" width="24" height="16" fill="black" />
                        <rect x="176" y="112" width="16" height="16" fill="black" />
                        <rect x="208" y="112" width="24" height="8" fill="black" />

                        <rect x="80" y="144" width="16" height="24" fill="black" />
                        <rect x="112" y="144" width="32" height="16" fill="black" />
                        <rect x="160" y="144" width="16" height="8" fill="black" />
                        <rect x="200" y="144" width="24" height="24" fill="black" />

                        <rect x="88" y="184" width="16" height="16" fill="black" />
                        <rect x="120" y="184" width="24" height="8" fill="black" />
                        <rect x="160" y="184" width="16" height="24" fill="black" />
                        <rect x="192" y="184" width="32" height="16" fill="black" />

                        <rect x="88" y="216" width="24" height="16" fill="black" />
                        <rect x="128" y="216" width="16" height="16" fill="black" />
                        <rect x="160" y="224" width="24" height="8" fill="black" />
                        <rect x="208" y="216" width="32" height="16" fill="black" />

                        <rect x="144" y="112" width="16" height="16" fill="black" />
                        <rect x="120" y="96" width="16" height="16" fill="black" />
                      </svg>
                    )}

                    {/* Successful Payment Overlay */}
                    {paymentSuccess && (
                      <div className="absolute inset-0 bg-emerald-950/90 backdrop-blur-sm flex flex-col items-center justify-center p-4 text-center z-10 animate-fade-in">
                        <CheckCircle2 className="w-14 h-14 text-emerald-400 mb-2" />
                        <span className="text-white font-bold text-sm lowercase">payment received!</span>
                        <span className="text-emerald-300 text-xs lowercase mt-0.5">
                          {activePlan.displayName} active on your account
                        </span>
                        <button
                          onClick={() => setViewMode('editor')}
                          className="mt-4 px-4 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs lowercase transition cursor-pointer"
                        >
                          enter studio editor
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* ====================================================== */}
              {/* PLACED BELOW QR CODE (Moved from top red box)          */}
              {/* Razorpay UPI Badge & Countdown Timer                   */}
              {/* ====================================================== */}
              <div className={`w-full flex items-center justify-between py-3 px-4 rounded-xl mt-3 transition-colors ${
                themeMode === 'studio'
                  ? 'bg-white/[0.03] border border-white/[0.06]'
                  : 'bg-zinc-50/90 border border-zinc-200'
              }`}>
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-[#0C2340] text-[#0C83FE] flex items-center justify-center font-bold text-xs shadow-inner shrink-0 lowercase">
                    r
                  </div>
                  <div>
                    <div className={`text-xs font-semibold flex items-center gap-1.5 lowercase ${
                      themeMode === 'studio' ? 'text-white' : 'text-zinc-900'
                    }`}>
                      <span>razorpay upi</span>
                      <span className="px-1.5 py-0.2 bg-emerald-500/15 text-emerald-400 text-[10px] rounded font-small lowercase">
                        verified
                      </span>
                    </div>
                    <div className="text-[11px] text-zinc-500 lowercase">
                      scan with any upi or mobile banking app
                    </div>
                  </div>
                </div>

                {/* Expiry Timer */}
                <div 
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-medium lowercase ${
                    secondsRemaining < 180 
                      ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' 
                      : themeMode === 'studio'
                        ? 'bg-white/[0.06] text-[#F8F4E6] border border-white/10'
                        : 'bg-zinc-100 text-zinc-700 border border-zinc-200'
                  }`}
                  title="qr code expiry countdown"
                >
                  <Clock className="w-3.5 h-3.5 text-[#E95464]" />
                  <span>{formatTimer(secondsRemaining)}</span>
                </div>
              </div>

              {/* ====================================================== */}
              {/* MINI-FEATURE LIST (Moved from right side blue box)     */}
              {/* ====================================================== */}
              <div className={`w-full p-4 rounded-xl mt-3 transition-colors ${
                themeMode === 'studio'
                  ? 'bg-white/[0.03] border border-white/[0.06]'
                  : 'bg-zinc-50/90 border border-zinc-200'
              }`}>
                <div className={`text-[11px] font-semibold mb-2.5 lowercase ${
                  themeMode === 'studio' ? 'text-zinc-400' : 'text-zinc-600'
                }`}>
                  included with {activePlan.name.toLowerCase()}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {(activePlan?.features || []).map((feat, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-[#E95464] shrink-0" />
                      <span className={`text-[11px] lowercase ${
                        themeMode === 'studio' ? 'text-[#F8F4E6]' : 'text-zinc-800 font-medium'
                      }`}>
                        {feat.toLowerCase()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* QR Code Status & Verification Notice */}
              <div className="w-full flex items-center justify-between px-3 py-2 mt-2 rounded-lg bg-black/10 border border-white/5 text-[11px]">
                <div className="flex items-center gap-1.5 text-zinc-400">
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    qrSource === 'razorpay_live' ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                  }`} />
                  <span className="font-mono">{statusNotice}</span>
                </div>
                <div className="flex items-center gap-2">
                  {!paymentSuccess && (
                    <button
                      onClick={handleSimulatePayment}
                      className="text-[10px] text-zinc-400 hover:text-emerald-400 transition cursor-pointer lowercase underline underline-offset-2"
                      title="simulate successful payment test"
                    >
                      simulate pay
                    </button>
                  )}
                </div>
              </div>

            </div>
          </div>

          {/* ======================================================== */}
          {/* RIGHT COLUMN: Order Summary & Invoice Card ONLY          */}
          {/* Matching Figma Wireframe Node #49:5                      */}
          {/* ======================================================== */}
          <div className="lg:col-span-6 flex flex-col">
            <div 
              className={`rounded-2xl p-6 sm:p-8 transition-all min-h-[580px] flex flex-col justify-between shadow-xl ${
                themeMode === 'studio'
                  ? 'bg-[#111116] border border-white/10 shadow-black/40'
                  : 'bg-white border border-zinc-950 shadow-md'
              }`}
            >
              
              {/* Card Header & Dynamic Plan Info */}
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[11px] font-semibold text-zinc-500 block mb-1 lowercase">
                      plan
                    </span>
                    <h2 className={`text-2xl sm:text-3xl font-bold tracking-tight lowercase ${
                      themeMode === 'studio' ? 'text-white' : 'text-zinc-950'
                    }`}>
                      {activePlan.displayName.toLowerCase()}
                    </h2>
                    <p className="text-xs text-zinc-500 mt-1 max-w-sm lowercase">
                      {activePlan.tagline.toLowerCase()}
                    </p>
                  </div>

                  <div className="text-right">
                    <div className={`text-2xl sm:text-3xl font-extrabold lowercase ${
                      themeMode === 'studio' ? 'text-[#F8F4E6]' : 'text-zinc-900'
                    }`}>
                      ${activePlan.price.toFixed(2)}
                      <span className="text-xs font-normal text-zinc-500 ml-1">/mo</span>
                    </div>
                    {activePlan.regularPrice > activePlan.price && (
                      <span className="text-[11px] text-zinc-500 line-through block mt-0.5 lowercase">
                        ${activePlan.regularPrice.toFixed(2)}/mo
                      </span>
                    )}
                  </div>
                </div>

                {/* Launch Promo Badge: Text color is strictly #F8F4E6 in dark mode, brand crimson in light mode */}
                {activePlan.badge && (
                  <div className={`mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium lowercase transition-colors ${
                    themeMode === 'studio'
                      ? 'bg-[#E95464]/15 border border-[#E95464]/30 text-[#F8F4E6]'
                      : 'bg-[#E95464]/10 border border-[#E95464]/30 text-[#B82B3E] font-semibold'
                  }`}>
                    <Sparkles className="w-3 h-3 text-[#E95464]" />
                    <span>{activePlan.badge.toLowerCase()}</span>
                  </div>
                )}

                {/* 3px Horizontal Divider Line (Exact Figma Wireframe Reference #49:11) */}
                <div 
                  className={`h-[3px] my-6 rounded-full ${
                    themeMode === 'studio' 
                      ? 'bg-gradient-to-r from-[#E95464] via-[#F2A0A1]/60 to-white/10' 
                      : 'bg-zinc-950'
                  }`} 
                />

                {/* Key Billing Row 1: Plan Start Date */}
                <div className={`flex items-center justify-between py-3.5 border-b ${
                  themeMode === 'studio' ? 'border-white/[0.04]' : 'border-zinc-200'
                }`}>
                  <span className={`text-sm sm:text-base font-semibold lowercase ${
                    themeMode === 'studio' ? 'text-zinc-200' : 'text-zinc-900'
                  }`}>
                    plan start date:
                  </span>
                  <span className={`text-sm sm:text-base font-medium font-mono tracking-tight lowercase ${
                    themeMode === 'studio' ? 'text-[#F8F4E6]' : 'text-zinc-950'
                  }`}>
                    {formattedStartDate}
                  </span>
                </div>

                {/* Key Billing Row 2: Plan End Date */}
                <div className={`flex items-center justify-between py-3.5 border-b ${
                  themeMode === 'studio' ? 'border-white/[0.04]' : 'border-zinc-200'
                }`}>
                  <span className={`text-sm sm:text-base font-semibold lowercase ${
                    themeMode === 'studio' ? 'text-zinc-200' : 'text-zinc-900'
                  }`}>
                    plan end date:
                  </span>
                  <span className={`text-sm sm:text-base font-medium font-mono tracking-tight lowercase ${
                    themeMode === 'studio' ? 'text-[#F8F4E6]' : 'text-zinc-950'
                  }`}>
                    {formattedEndDate}
                  </span>
                </div>

                {/* Key Billing Row 3: Other Charges */}
                <div className={`flex items-center justify-between py-3.5 border-b ${
                  themeMode === 'studio' ? 'border-white/[0.04]' : 'border-zinc-200'
                }`}>
                  <div>
                    <span className={`text-sm sm:text-base font-semibold lowercase ${
                      themeMode === 'studio' ? 'text-zinc-200' : 'text-zinc-900'
                    }`}>
                      other charges:
                    </span>
                    <span className="text-[11px] text-zinc-500 block lowercase">
                      platform fee, streaming egress & taxes
                    </span>
                  </div>
                  <span className="text-sm sm:text-base font-bold text-emerald-400 lowercase">
                    0*
                  </span>
                </div>
              </div>

              {/* Bottom Section: Total & Guarantee (Invoice Summary ONLY) */}
              <div className="pt-4">
                
                {/* 3px Horizontal Divider Line (Exact Figma Wireframe Reference #52:15) */}
                <div 
                  className={`h-[3px] mb-6 rounded-full ${
                    themeMode === 'studio' 
                      ? 'bg-gradient-to-r from-white/10 via-[#F2A0A1]/60 to-[#E95464]' 
                      : 'bg-zinc-950'
                  }`} 
                />

                {/* Grand Total Row (Figma Wireframe Reference #52:16) */}
                <div className="flex items-baseline justify-between mb-4">
                  <div>
                    <span className={`text-xl sm:text-2xl font-bold tracking-tight lowercase ${
                      themeMode === 'studio' ? 'text-white' : 'text-zinc-950'
                    }`}>
                      total:
                    </span>
                    <div className="text-[11px] text-zinc-500 lowercase">
                      billed monthly · cancel anytime from studio
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-2xl sm:text-3xl font-extrabold text-[#E95464] tracking-tight lowercase">
                      ${activePlan.price.toFixed(2)}
                    </span>
                    <div className={`text-xs font-medium mt-0.5 lowercase ${
                      themeMode === 'studio' ? 'text-zinc-400' : 'text-zinc-600'
                    }`}>
                      ~ ₹{activePlan.upiAmountInr} inr
                    </div>
                  </div>
                </div>

                {/* Trust & Guarantee Footnote */}
                <div className={`pt-3 border-t flex items-center justify-between text-[11px] text-zinc-500 lowercase ${
                  themeMode === 'studio' ? 'border-white/[0.06]' : 'border-zinc-200'
                }`}>
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>256-bit ssl secured razorpay transaction</span>
                  </div>
                  <span>*0 hidden fees</span>
                </div>

              </div>

            </div>
          </div>

        </div>
      </main>

    </div>
  );
};
