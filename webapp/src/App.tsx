import React, { useEffect, useMemo } from 'react';
import { SiteSelector } from './components/SiteSelector';
import { SpaceTree } from './components/SpaceTree';
import { SelectedCamerasList } from './components/SelectedCameras/SelectedCamerasList';
import { ThemeToggle } from './components/ThemeToggle';
import { ThemeProvider } from './contexts/ThemeContext';
import { ReduxProvider } from './store/Provider';
import { useAppDispatch, useAppSelector } from './store/hooks';
import { fetchSpaces, clearSpaces } from './store/slices/spacesSlice';
import { clearSelection } from './store/slices/selectionSlice';
import { getSelectedStreamsInTree } from './utils/treeUtils';
import ToastContainer from './components/ToastContainer';
import './App.css';

function AppContent() {
  const dispatch = useAppDispatch();
  
  // Redux state selectors
  const selectedSiteId = useAppSelector(state => state.site.selectedSiteId);
  const spaces = useAppSelector(state => state.spaces.optimisticSpaces);
  const selectedStreamIds = useAppSelector(state => state.selection.selectedStreamIds);
  const loading = useAppSelector(state => state.spaces.loading);
  const error = useAppSelector(state => state.spaces.error);
  const toasts = useAppSelector(state => state.toast.toasts);
  
  // Static virtualization configuration - memoized
  const virtualizationConfig = useMemo(() => ({
    enabled: true,
    maxHeight: 400,
    itemHeight: 48,
    threshold: 7 // Enable virtualization when there are 7+ items for optimal performance
  }), []);

  // Fetch spaces when site changes
  useEffect(() => {
    if (selectedSiteId) {
      dispatch(fetchSpaces(selectedSiteId));
    } else {
      dispatch(clearSpaces());
      dispatch(clearSelection());
    }
  }, [selectedSiteId, dispatch]);

  // Calculate selected streams
  const selectedStreams = useMemo(() => 
    getSelectedStreamsInTree(spaces, selectedStreamIds),
    [spaces, selectedStreamIds]
  );

  return (
    <div className="app">
      <header className="app__header">
        <h1 className="app__title">
          Space Navigator
          <span className="app__title-brand">AMBIENT</span>
        </h1>
        <div className="app__header-controls">
          <SiteSelector
            selectedSiteId={selectedSiteId}
          />
          <ThemeToggle />
        </div>
      </header>
      
      <main className="app__main">
        <div className="app__sidebar">
          {selectedSiteId && (
            <div className="app__spaces-section">
              {error && (
                <div className="error">Error loading spaces: {error}</div>
              )}
              
              <SpaceTree
                isLoading={loading}
                enableVirtualization={virtualizationConfig.enabled}
                virtualizationConfig={{
                  maxHeight: virtualizationConfig.maxHeight,
                  itemHeight: virtualizationConfig.itemHeight,
                  threshold: virtualizationConfig.threshold
                }}
              />
            </div>
          )}
        </div>
        
        <div className="app__content">
          <SelectedCamerasList
            selectedStreams={selectedStreams}
          />
        </div>
      </main>
      
      <ToastContainer toasts={toasts} />
    </div>
  );
}

function App() {
  return (
    <ReduxProvider>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </ReduxProvider>
  );
}

export default App;