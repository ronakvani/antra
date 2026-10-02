import React, { createContext, useContext, useState, useEffect } from 'react';

const EditorContext = createContext(null);

const getInitialViewMode = () => {
  const path = window.location.pathname;
  if (path === '/editor') return 'editor';
  if (path === '/preview') return 'preview';
  return 'landing';
};

export const EditorProvider = ({ children }) => {
  // Navigation View: 'landing' | 'editor' | 'preview'
  const [viewMode, setViewModeState] = useState(getInitialViewMode);
  
  const setViewMode = (mode) => {
    setViewModeState(mode);
    const targetPath = mode === 'editor' ? '/editor' : mode === 'preview' ? '/preview' : '/';
    if (window.location.pathname !== targetPath) {
      window.history.pushState({ mode }, '', targetPath);
    }
  };

  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      if (path === '/editor') setViewModeState('editor');
      else if (path === '/preview') setViewModeState('preview');
      else setViewModeState('landing');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Video Source (default to antra-gradient.mp4 if present or null)
  const [videoSrc, setVideoSrc] = useState('/antra-gradient.mp4');
  const [videoDuration, setVideoDuration] = useState(20.0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  // Reference Images & Prompt state for video generation
  const [referenceImages, setReferenceImages] = useState([]);
  const [promptText, setPromptText] = useState('');

  // Interactive Overlay Manifest (content.json structure)
  const [manifest, setManifest] = useState({
    title: 'Antra Interactive Site',
    duration: 20.0,
    components: []
  });

  const [selectedComponentId, setSelectedComponentId] = useState(null);

  const addComponent = (newComp) => {
    const id = `comp_${Date.now()}`;
    setManifest((prev) => ({
      ...prev,
      components: [...prev.components, { ...newComp, id, locked: false, hidden: false }]
    }));
    setSelectedComponentId(id);
    return id;
  };

  const updateComponent = (id, updatedFields) => {
    setManifest((prev) => ({
      ...prev,
      components: prev.components.map((c) => (c.id === id ? { ...c, ...updatedFields } : c))
    }));
  };

  const removeComponent = (id) => {
    setManifest((prev) => ({
      ...prev,
      components: prev.components.filter((c) => c.id !== id)
    }));
    if (selectedComponentId === id) setSelectedComponentId(null);
  };

  const duplicateComponent = (id) => {
    const target = manifest.components.find((c) => c.id === id);
    if (!target) return;
    const newLeft = (parseFloat(target.style?.left) || 30) + 3;
    const newTop = (parseFloat(target.style?.top) || 30) + 3;
    const isPctLeft = (target.style?.left || '').includes('%');
    const isPctTop = (target.style?.top || '').includes('%');

    const newComp = {
      ...target,
      id: `comp_${Date.now()}`,
      content: target.content ? `${target.content} (Copy)` : target.content,
      style: {
        ...target.style,
        left: isPctLeft ? `${Math.min(90, newLeft)}%` : `${newLeft}px`,
        top: isPctTop ? `${Math.min(90, newTop)}%` : `${newTop}px`
      }
    };
    setManifest((prev) => ({
      ...prev,
      components: [...prev.components, newComp]
    }));
    setSelectedComponentId(newComp.id);
  };

  const toggleLockComponent = (id) => {
    setManifest((prev) => ({
      ...prev,
      components: prev.components.map((c) => (c.id === id ? { ...c, locked: !c.locked } : c))
    }));
  };

  const toggleHideComponent = (id) => {
    setManifest((prev) => ({
      ...prev,
      components: prev.components.map((c) => (c.id === id ? { ...c, hidden: !c.hidden } : c))
    }));
  };

  const moveComponentOrder = (id, direction) => {
    setManifest((prev) => {
      const idx = prev.components.findIndex((c) => c.id === id);
      if (idx === -1) return prev;
      const comps = [...prev.components];
      if (direction === 'up' && idx < comps.length - 1) {
        // Move towards front (higher in stack)
        const item = comps.splice(idx, 1)[0];
        comps.splice(idx + 1, 0, item);
      } else if (direction === 'down' && idx > 0) {
        // Move towards back (lower in stack)
        const item = comps.splice(idx, 1)[0];
        comps.splice(idx - 1, 0, item);
      } else if (direction === 'front') {
        const item = comps.splice(idx, 1)[0];
        comps.push(item);
      } else if (direction === 'back') {
        const item = comps.splice(idx, 1)[0];
        comps.unshift(item);
      }
      return { ...prev, components: comps };
    });
  };

  return (
    <EditorContext.Provider
      value={{
        viewMode,
        setViewMode,
        videoSrc,
        setVideoSrc,
        videoDuration,
        setVideoDuration,
        currentTime,
        setCurrentTime,
        isPlaying,
        setIsPlaying,
        referenceImages,
        setReferenceImages,
        promptText,
        setPromptText,
        manifest,
        setManifest,
        selectedComponentId,
        setSelectedComponentId,
        addComponent,
        updateComponent,
        removeComponent,
        duplicateComponent,
        toggleLockComponent,
        toggleHideComponent,
        moveComponentOrder
      }}
    >
      {children}
    </EditorContext.Provider>
  );
};

export const useEditor = () => {
  const context = useContext(EditorContext);
  if (!context) {
    throw new Error('useEditor must be used within an EditorProvider');
  }
  return context;
};
