import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { BudgetState, Budget } from '../../types';

const initialState: BudgetState = {
  budget: null,
  loading: false,
  error: null,
};

const budgetsSlice = createSlice({
  name: 'budgets',
  initialState,
  reducers: {
    setBudget: (state, action: PayloadAction<Budget>) => {
      console.log('[BudgetsSlice] setBudget action called with:', action.payload);
      state.budget = action.payload;
      state.error = null;
      console.log('[BudgetsSlice] New state:', state);
    },
    clearBudget: (state) => {
      state.budget = null;
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

export const { setBudget, clearBudget, setLoading, setError } = budgetsSlice.actions;
export default budgetsSlice.reducer; 