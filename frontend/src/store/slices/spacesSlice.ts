import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { SpaceState } from '../../types';

const initialState: SpaceState = {
  currentSpaceId: null,
  loading: false,
  error: null,
};

const spacesSlice = createSlice({
  name: 'spaces',
  initialState,
  reducers: {
    setCurrentSpace: (state, action: PayloadAction<string>) => {
      state.currentSpaceId = action.payload;
      state.error = null;
    },
    clearCurrentSpace: (state) => {
      state.currentSpaceId = null;
      state.error = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.loading = false;
    },
  },
});

export const { setCurrentSpace, clearCurrentSpace, setLoading, setError } = spacesSlice.actions;
export default spacesSlice.reducer; 