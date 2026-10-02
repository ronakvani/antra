import React from 'react';
import { Eye, Layout, UploadCloud, ArrowLeft, LogIn } from 'lucide-react';
import { useEditor } from '../../context/EditorContext';
import { useAuth } from '../../context/AuthContext';

import { compileGrapesPublishPackage } from '../../utils/grapesEngine';
import { generatePenpotCss, generatePenpotSpecJson } from '../../utils/penpotCodeEngine';

export const HeaderToolbar = () => {
  const { setViewMode, manifest } = useEditor();
  const { user, openAuthModal, getDiceBearVoxelBotAvatar } = useAuth();

  const handlePublish = () => {
    const grapesPackage = compileGrapesPublishPackage(manifest);
    const penpotStyles = manifest.components.map((c) => ({
      id: c.id,
      type: c.type,
      penpotCss: generatePenpotCss(c),
      penpotSpec: generatePenpotSpecJson(c)
    }));

    const publishData = {
      ...manifest,
      publishedAt: new Date().toISOString(),
      grapesEnginePackage: grapesPackage,
      penpotEnginePackage: penpotStyles
    };

    const jsonStr = JSON.stringify(publishData, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'content.json';
    a.click();
  };

  return (
    <header className="h-16 bg-white border-b border-zinc-200 px-8 flex items-center justify-between text-zinc-900 select-none shadow-sm">
      {/* Brand & Back */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => setViewMode('landing')}
          className="p-2 hover:bg-zinc-100 rounded-lg transition text-zinc-600 hover:text-zinc-950"
          title="Back to Landing"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <span className="text-3xl font-normal tracking-tight text-zinc-950">
          antra
        </span>
      </div>

      {/* Top Right Actions */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setViewMode('preview')}
          className="p-2.5 hover:bg-zinc-100 text-zinc-700 hover:text-zinc-950 rounded-xl transition flex items-center justify-center border border-zinc-200"
          title="Preview"
        >
          <Eye className="w-5 h-5" />
        </button>

        <button
          className="p-2.5 hover:bg-zinc-100 text-zinc-700 hover:text-zinc-950 rounded-xl transition flex items-center justify-center border border-zinc-200"
          title="Layout Mode"
        >
          <Layout className="w-5 h-5" />
        </button>

        <button
          onClick={handlePublish}
          className="p-2.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl transition flex items-center justify-center shadow-sm"
          title="Publish"
        >
          <UploadCloud className="w-5 h-5" />
        </button>

        <div className="h-6 w-[1px] bg-zinc-200 mx-1" />

        {user ? (
          <div
            className="flex items-center gap-2 pl-1 cursor-pointer"
            onClick={() => openAuthModal('login')}
            title={`Logged in as ${user.username || user.email}`}
          >
            <div className="w-9 h-9 rounded-full bg-zinc-100 border border-zinc-200 p-0.5 overflow-hidden flex items-center justify-center shadow-inner">
              <img
                src={user.avatarUrl || getDiceBearVoxelBotAvatar(user.avatarSeed || user.username || user.email)}
                alt="Builder Avatar"
                className="w-full h-full object-contain rounded-full"
              />
            </div>
          </div>
        ) : (
          <button
            onClick={() => openAuthModal('login')}
            className="p-2 hover:bg-zinc-100 text-zinc-700 hover:text-zinc-950 rounded-xl transition flex items-center gap-1.5 text-xs font-semibold border border-zinc-200"
            title="Builder Sign In"
          >
            <LogIn className="w-4 h-4" />
            <span>Sign In</span>
          </button>
        )}
      </div>
    </header>
  );
};
