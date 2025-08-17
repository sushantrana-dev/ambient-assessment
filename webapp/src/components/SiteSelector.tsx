import React, { useCallback, useMemo } from 'react';
import { useSites } from '../hooks/useApi';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { setSelectedSite } from '../store/slices/siteSlice';

export const SiteSelector: React.FC = () => {
  const selectedSiteId = useAppSelector(state => state.site.selectedSiteId);
  const dispatch = useAppDispatch();
  const { data: sitesData, loading, error } = useSites();

  // Memoize the sites array to prevent unnecessary re-renders
  const sites = useMemo(() => {
    if (!sitesData?.sites) return [];
    return sitesData.sites;
  }, [sitesData]);

  // Memoize the change handler
  const handleSiteChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const siteId = e.target.value;
    if (siteId) {
      dispatch(setSelectedSite(siteId));
    } else {
      dispatch(setSelectedSite(null));
    }
  }, [dispatch]);

  if (loading) {
    return (
      <div className="site-selector">
        <div className="loading">Loading sites...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="site-selector">
        <div className="error">Error loading sites: {error}</div>
      </div>
    );
  }

  return (
    <div className="site-selector">
      <label htmlFor="site-select" className="site-selector__label">
        Select Site:
      </label>
      <select
        id="site-select"
        value={selectedSiteId || ''}
        onChange={handleSiteChange}
        className="site-selector__select"
        aria-label="Select a site"
      >
        <option value="">Choose a site...</option>
        {sites?.map((site) => (
          <option key={site.id} value={site.id}>
            {site.name}
          </option>
        ))}
      </select>
    </div>
  );
}; 