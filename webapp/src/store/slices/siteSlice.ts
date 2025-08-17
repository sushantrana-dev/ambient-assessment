import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface SiteState {
  selectedSiteId: string | null;
}

const initialState: SiteState = {
  selectedSiteId: null,
};

const siteSlice = createSlice({
  name: 'site',
  initialState,
  reducers: {
    setSelectedSite: (state, action: PayloadAction<string | null>) => {
      state.selectedSiteId = action.payload;
    },
    clearSelectedSite: (state) => {
      state.selectedSiteId = null;
    },
  },
});

export const {
  setSelectedSite,
  clearSelectedSite,
} = siteSlice.actions;

export default siteSlice.reducer; 