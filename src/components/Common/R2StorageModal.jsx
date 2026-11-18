import React, { useState, useEffect } from 'react';
import { Cloud, Database, HardDrive, ShieldCheck, CheckCircle2, AlertCircle, RefreshCw, X, ExternalLink, Film } from 'lucide-react';
import { useEditor } from '../../context/EditorContext';
import { checkR2Status, getR2StorageBreakdown } from '../../utils/r2StorageClient';

export const R2StorageModal = ({ isOpen, onClose }) => {
  const { r2StorageInfo, r2Stats, refreshR2Stats, rawVideoUrl, editedVideoUrl } = useEditor();
  const [loading, setLoading] = useState(false);
  const [statusData, setStatusData] = useState(null);

  const fetchStatus = async () => {
    setLoading(true);
    try {
      const res = await checkR2Status();
      setStatusData(res);
      await refreshR2Stats();
    } catch (e) {
      console.error('Error checking R2 status:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchStatus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const stats = r2Stats || statusData?.stats || {
    isConfigured: statusData?.isConfigured || false,
    bucketName: statusData?.bucketName || 'Not configured',
    totalMb: '0.00',
    totalGb: '0.000',
    freeTierLimitGb: 10,
    percentUsed: '0.00',
    rawVideosCount: 0,
    editedVideosCount: 0,
    totalFiles: 0,
    files: []
  };

  const isConfigured = statusData?.isConfigured ?? stats.isConfigured;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white border border-zinc-200 rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden font-sans">
        
        {/* Header */}
        <div className="p-5 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-orange-50 border border-orange-200/60 flex items-center justify-center text-orange-600 shadow-2xs">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-zinc-900 flex items-center gap-2">
                Cloudflare R2 Storage
                <span className="text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full">
                  10GB Free Tier
                </span>
              </h2>
              <p className="text-xs text-zinc-500">
                Zero-egress object storage with SHA-256 content deduplication
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 rounded-lg transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          
          {/* Connection Status Banner */}
          <div className={`p-3.5 rounded-xl border flex items-center justify-between text-xs ${
            isConfigured 
              ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900' 
              : 'bg-amber-50/80 border-amber-200 text-amber-900'
          }`}>
            <div className="flex items-center gap-2.5">
              {isConfigured ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              )}
              <div>
                <span className="font-semibold">
                  {isConfigured ? 'Connected to Cloudflare R2' : 'R2 Configuration Needed in .env.local'}
                </span>
                <span className="block text-[11px] opacity-80 mt-0.5">
                  {isConfigured 
                    ? `Bucket: ${stats.bucketName || statusData?.bucketName || 'active'}`
                    : 'Add CLOUDFLARE_R2_ACCOUNT_ID and credentials to .env.local to activate remote R2 storage'}
                </span>
              </div>
            </div>

            <button
              onClick={fetchStatus}
              disabled={loading}
              className="p-1.5 hover:bg-white/60 rounded-lg transition text-zinc-600 cursor-pointer"
              title="Refresh status"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {/* 10GB Free Tier Usage Progress */}
          <div className="bg-zinc-50 border border-zinc-200/80 rounded-xl p-4">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="font-semibold text-zinc-700 flex items-center gap-1.5">
                <HardDrive className="w-3.5 h-3.5 text-zinc-500" />
                Storage Quota Usage
              </span>
              <span className="font-mono text-zinc-800 font-medium">
                {stats.totalMb || '0.00'} MB / 10 GB ({stats.percentUsed || '0.00'}%)
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-2.5 bg-zinc-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-orange-500 to-[#E95464] transition-all duration-300 rounded-full"
                style={{ width: `${Math.min(100, Math.max(1, parseFloat(stats.percentUsed || 0)))}%` }}
              />
            </div>

            <div className="mt-2.5 flex items-center justify-between text-[11px] text-zinc-500">
              <span>Remaining free quota: ~{stats.freeTierRemainingMb || '10,240'} MB</span>
              <span>100% Free Tier (0 egress fees)</span>
            </div>
          </div>

          {/* Deduplication Guarantee Card */}
          <div className="bg-indigo-50/60 border border-indigo-100 rounded-xl p-4 flex items-start gap-3">
            <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0 mt-0.5">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div className="text-xs">
              <h4 className="font-semibold text-indigo-950">
                Automatic SHA-256 Content Deduplication Active
              </h4>
              <p className="text-zinc-600 mt-1 leading-relaxed">
                Before uploading any raw or edited video, Antra verifies its cryptographic hash against your R2 bucket. If the video is already stored, Antra instantly reuses the existing URL without storing a duplicate.
              </p>
            </div>
          </div>

          {/* Video Categories Stats Grid */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-3 text-center">
              <span className="text-[11px] text-zinc-500 block">Raw Videos</span>
              <span className="text-lg font-bold text-zinc-900 mt-0.5 block">
                {stats.rawVideosCount || 0}
              </span>
              <span className="text-[10px] text-zinc-400">Source uploads</span>
            </div>

            <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-3 text-center">
              <span className="text-[11px] text-zinc-500 block">Edited / Transcoded</span>
              <span className="text-lg font-bold text-zinc-900 mt-0.5 block">
                {stats.editedVideosCount || 0}
              </span>
              <span className="text-[10px] text-indigo-600 font-medium">All-Intra I-Frames</span>
            </div>

            <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-3 text-center">
              <span className="text-[11px] text-zinc-500 block">Total Objects</span>
              <span className="text-lg font-bold text-zinc-900 mt-0.5 block">
                {stats.totalFiles || 0}
              </span>
              <span className="text-[10px] text-emerald-600 font-medium">Zero duplicates</span>
            </div>
          </div>

          {/* Active Session Video Details */}
          {(rawVideoUrl || editedVideoUrl || r2StorageInfo) && (
            <div className="border border-zinc-200 rounded-xl p-3.5 bg-white space-y-2">
              <span className="text-[11px] font-semibold text-zinc-700 uppercase tracking-wider block">
                Current Session Video Status
              </span>

              {rawVideoUrl && (
                <div className="flex items-center justify-between text-xs py-1 border-b border-zinc-100">
                  <span className="text-zinc-500 flex items-center gap-1.5">
                    <Film className="w-3.5 h-3.5 text-zinc-400" />
                    Raw Video URL:
                  </span>
                  <span className="font-mono text-zinc-800 text-[11px] truncate max-w-[260px]" title={rawVideoUrl}>
                    {rawVideoUrl}
                  </span>
                </div>
              )}

              {editedVideoUrl && (
                <div className="flex items-center justify-between text-xs py-1 border-b border-zinc-100">
                  <span className="text-zinc-500 flex items-center gap-1.5">
                    <Film className="w-3.5 h-3.5 text-indigo-500" />
                    Edited Video URL:
                  </span>
                  <span className="font-mono text-zinc-800 text-[11px] truncate max-w-[260px]" title={editedVideoUrl}>
                    {editedVideoUrl}
                  </span>
                </div>
              )}

              {r2StorageInfo && (
                <div className="pt-1 flex items-center gap-2">
                  <span className="text-[11px] text-zinc-500">Deduplication result:</span>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                    r2StorageInfo.rawDeduplicated || r2StorageInfo.editedDeduplicated
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-zinc-100 text-zinc-700'
                  }`}>
                    {r2StorageInfo.rawDeduplicated || r2StorageInfo.editedDeduplicated
                      ? '✓ Deduplicated (Reused existing R2 copy)'
                      : 'Fresh Upload (Added to R2)'}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Quick Setup Instructions if not configured */}
          {!isConfigured && (
            <div className="p-3.5 bg-zinc-900 text-zinc-200 rounded-xl text-xs space-y-2">
              <span className="font-semibold text-white block">
                How to connect your Cloudflare R2 credentials:
              </span>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                1. Open <code className="text-orange-300">.env.local</code> in the Antra root folder.<br />
                2. Fill in the following 4 values from your Cloudflare Dashboard (R2 → Manage R2 API Tokens):
              </p>
              <pre className="p-2.5 bg-zinc-950 rounded-lg text-[11px] text-zinc-300 font-mono overflow-x-auto">
{`CLOUDFLARE_R2_ACCOUNT_ID=your_account_id
CLOUDFLARE_R2_ACCESS_KEY_ID=your_access_key_id
CLOUDFLARE_R2_SECRET_ACCESS_KEY=your_secret_access_key
CLOUDFLARE_R2_BUCKET_NAME=your_bucket_name`}
              </pre>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 bg-zinc-50 border-t border-zinc-100 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl text-xs font-medium transition cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
