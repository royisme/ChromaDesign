import React, { useState } from 'react';
import { LandingPage } from './components/LandingPage';
import { GeneratorApp } from './components/GeneratorApp';

type View = 'landing' | 'app';

export default function App() {
  const [view, setView] = useState<View>('landing');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleStart = () => {
    setView('app');
  };

  const handleBackToHome = () => {
    setView('landing');
    setSelectedFile(null);
  };

  const handleGallerySelectFromLanding = (file: File) => {
    setSelectedFile(file);
    // Don't generate here, pass the file to GeneratorApp which will handle generation on mount
    setView('app');
  };

  return (
    <>
      {view === 'landing' ? (
        <LandingPage 
          onStart={handleStart} 
          onGallerySelect={handleGallerySelectFromLanding}
          isProcessing={false} // Landing page doesn't show processing state
        />
      ) : (
        <GeneratorApp 
          initialFile={selectedFile} 
          onBack={handleBackToHome}
        />
      )}
    </>
  );
}