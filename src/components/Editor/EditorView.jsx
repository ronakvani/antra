import React from 'react';
import { HeaderToolbar } from './HeaderToolbar';
import { ComponentLibrary } from './ComponentLibrary';
import { VideoCanvas } from './VideoCanvas';
import { TimelineBar } from './TimelineBar';
import { PropertiesPanel } from './PropertiesPanel';

export const EditorView = () => {
  return (
    <div className="h-screen w-screen flex flex-col bg-zinc-100 overflow-hidden font-sans text-zinc-900">
      {/* Top Header Navigation */}
      <HeaderToolbar />

      {/* Main 3-Column Workspace (Matching MacBook Pro 14" - 2 in Figma) */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel: Website Component Palette (Rectangle 2 - 300px) */}
        <ComponentLibrary />

        {/* Center Viewport: Video Media Layer + Canvas Overlay (Rectangle 4 - 824px) */}
        <VideoCanvas />

        {/* Right Panel: Properties Panel (Rectangle 3 - 300px) */}
        <PropertiesPanel />
      </div>

      {/* Bottom Panel: Timeline Bar & Playhead Scrubbing (Timeline Bar - 849px) */}
      <TimelineBar />
    </div>
  );
};
