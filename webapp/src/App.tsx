import React, { useEffect, useRef } from "react";
import { SiteSelector } from "./components/SiteSelector";
import { SpaceTree } from "./components/SpaceTree";
import { SelectedCamerasList } from "./components/SelectedCameras/SelectedCamerasList";
import { ThemeToggle } from "./components/ThemeToggle";
import { ThemeProvider } from "./contexts/ThemeContext";
import { ReduxProvider } from "./store/Provider";
import { useAppDispatch, useAppSelector } from "./store/hooks";
import { fetchSpaces, clearSpaces } from "./store/slices/spacesSlice";
import { clearSelection } from "./store/slices/selectionSlice";
import ToastContainer from "./components/ToastContainer";
import "./App.css";

function AppContent() {
  const dispatch = useAppDispatch();
  const previousSiteIdRef = useRef<string | null>(null);

  // Redux state selectors
  const selectedSiteId = useAppSelector((state) => state.site.selectedSiteId);

  // Fetch spaces when site changes and clear selections
  useEffect(() => {
    // Clear selections when site changes (including switching between sites)
    if (previousSiteIdRef.current !== selectedSiteId) {
      dispatch(clearSelection());
      previousSiteIdRef.current = selectedSiteId;
    }

    if (selectedSiteId) {
      dispatch(fetchSpaces(selectedSiteId));
    } else {
      dispatch(clearSpaces());
    }
  }, [selectedSiteId, dispatch]);

  return (
    <div className="app">
      <header className="app__header">
        <h1 className="app__title">
          Space Navigator
          <span className="app__title-brand">AMBIENT</span>
        </h1>
        <div className="app__header-controls">
          <SiteSelector />
          <ThemeToggle />
        </div>
      </header>

      <main className="app__main">
        <div className="app__spaces-section app__sidebar">
          <SpaceTree />
        </div>

        <div className="app__content">
          <SelectedCamerasList />
        </div>
      </main>

      <ToastContainer />
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
