import React from 'react';
import { Site } from '../types/api.types';
import { useSites } from '../hooks/useApi';

interface SiteSelectorProps {
  selectedSiteId: string | null;
  onSiteChange: (siteId: string) => void;
}

export const SiteSelector: React.FC<SiteSelectorProps> = ({
  selectedSiteId,
  onSiteChange
}) => {
  const { data: sitesData, loading, error } = useSites();

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

  const sites = sitesData?.sites || [];

  return (
    <div className="site-selector">
      <label htmlFor="site-select" className="site-selector__label">
        Select Site:
      </label>
      <select
        id="site-select"
        value={selectedSiteId || ''}
        onChange={(e) => onSiteChange(e.target.value)}
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