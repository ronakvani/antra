import React from 'react';
import { AuthProvider } from './context/AuthContext';
import { EditorProvider, useEditor } from './context/EditorContext';
import { LandingView } from './components/Landing/LandingView';
import { EditorView } from './components/Editor/EditorView';
import { ScrollViewer } from './components/Viewer/ScrollViewer';
import { PricingView } from './components/Pricing/PricingView';
import { AuthModal } from './components/Auth/AuthModal';

const MainContainer = () => {
  const { viewMode } = useEditor();

  return (
    <>
      {viewMode === 'landing' && <LandingView />}
      {viewMode === 'preview' && <ScrollViewer />}
      {viewMode === 'editor' && <EditorView />}
      {viewMode === 'pricing' && <PricingView />}
      <AuthModal />
    </>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <EditorProvider>
        <MainContainer />
      </EditorProvider>
    </AuthProvider>
  );
}

