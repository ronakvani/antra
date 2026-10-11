import React from 'react';
import { X, Sparkles, ArrowRight, Lock } from 'lucide-react';
import { useEditor } from '../../context/EditorContext';
import { FEATURE_REQUIREMENTS, ANTRA_PLANS } from '../../utils/planFeatures';

export const PlanUpgradeModal = ({ isOpen, onClose, featureKey, customMessage }) => {
  const { setViewMode } = useEditor();

  if (!isOpen) return null;

  const featureInfo = FEATURE_REQUIREMENTS[featureKey] || {
    requiredPlan: 'ultra',
    label: featureKey || 'advanced feature'
  };

  const planInfo = ANTRA_PLANS[featureInfo.requiredPlan] || ANTRA_PLANS.ultra;

  const handleNavigatePricing = () => {
    onClose();
    setViewMode('pricing');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-[420px] bg-[#0d0e12] border border-white/10 rounded-[28px] shadow-2xl p-6 sm:p-7 overflow-hidden text-zinc-300 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Subtle Brand Glow */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-[#E95464]/10 blur-3xl pointer-events-none rounded-full" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#F2A0A1]/10 blur-3xl pointer-events-none rounded-full" />

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-zinc-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
          title="close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header Icon */}
        <div className="w-12 h-12 rounded-2xl bg-white/[0.06] border border-white/10 flex items-center justify-center text-[#E95464] mb-4 shadow-inner">
          <Lock className="w-5 h-5 stroke-[1.5]" />
        </div>

        {/* Title */}
        <h3 className="text-xl font-normal text-white tracking-tight lowercase">
          {featureInfo.label}
        </h3>

        {/* Description */}
        <p className="text-xs font-normal text-zinc-400 mt-2 leading-relaxed lowercase">
          {customMessage || (
            <>
              this feature requires the <span className="text-white font-normal">{planInfo.displayName.toLowerCase()}</span> tier ({planInfo.price}). {planInfo.status === 'upcoming' ? 'this is an upcoming tier scheduled for launch.' : ''}
            </>
          )}
        </p>

        {/* Feature Highlights Pill */}
        <div className="mt-4 p-3 rounded-2xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-between text-xs lowercase">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#E95464]" />
            <span className="text-zinc-300 font-normal">plan tier</span>
          </div>
          <span className="text-white font-normal px-2.5 py-0.5 rounded-full bg-white/10 border border-white/10 text-[11px]">
            {planInfo.displayName.toLowerCase()} {planInfo.status === 'upcoming' ? '(upcoming)' : ''}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex items-center gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 px-3 bg-white/[0.06] hover:bg-white/[0.1] text-zinc-300 text-xs font-normal rounded-xl transition cursor-pointer lowercase"
          >
            keep editing
          </button>
          <button
            type="button"
            onClick={handleNavigatePricing}
            className="flex-1 py-2.5 px-3 bg-white hover:bg-[#FEF4F4] text-zinc-950 text-xs font-normal rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer lowercase shadow-md"
          >
            <span>view pricing</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
