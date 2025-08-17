import { useState, useEffect } from 'react';
import { Site, FlattenedSpacesData } from '../types/api.types';

const API_BASE_URL = 'http://localhost:8000';

interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export const useApi = <T>(url: string, enabled: boolean = true) => {
  const [state, setState] = useState<ApiState<T>>({
    data: null,
    loading: false,
    error: null
  });

  useEffect(() => {
    if (!enabled) return;

    const fetchData = async () => {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      try {
        const response = await fetch(`${API_BASE_URL}${url}`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        setState({ data, loading: false, error: null });
      } catch (error) {
        setState({
          data: null,
          loading: false,
          error: error instanceof Error ? error.message : 'An error occurred'
        });
      }
    };

    fetchData();
  }, [url, enabled]);

  return state;
};

export const useSites = () => {
  return useApi<{ sites: Site[] }>('/sites/');
};

export const useSpaces = (siteId: string | null) => {
  return useApi<FlattenedSpacesData>(`/spaces/?siteId=${siteId}`, !!siteId);
};

// API functions for optimistic updates
export const addStreamToSpace = async (spaceId: number, streamName: string) => {
  const response = await fetch(`${API_BASE_URL}/spaces/${spaceId}/streams`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name: streamName }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const errorMessage = errorData.detail || `HTTP error! status: ${response.status}`;
    throw new Error(errorMessage);
  }

  return response.json();
};

export const deleteStream = async (streamId: number) => {
  const response = await fetch(`${API_BASE_URL}/streams/${streamId}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const errorMessage = errorData.detail || `HTTP error! status: ${response.status}`;
    throw new Error(errorMessage);
  }

  return response.json();
}; 