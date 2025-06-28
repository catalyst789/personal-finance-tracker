import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { TransactionState, Transaction, TransactionFilters, PaginatedResponse } from '../../types';

const initialState: TransactionState = {
  transactions: [],
  pagination: null,
  filters: {
    page: 1,
    limit: 10,
  },
  loading: false,
  error: null,
  selectedTransaction: null,
};

const transactionsSlice = createSlice({
  name: 'transactions',
  initialState,
  reducers: {
    setTransactions: (state, action: PayloadAction<PaginatedResponse<Transaction>>) => {
      console.log('[Redux] setTransactions called with:', action.payload);
      state.transactions = action.payload.data;
      state.pagination = action.payload.pagination;
      state.error = null;
      console.log('[Redux] Updated state transactions:', state.transactions);
    },
    addTransaction: (state, action: PayloadAction<Transaction>) => {
      state.transactions.unshift(action.payload);
      if (state.pagination) {
        state.pagination.total += 1;
      }
    },
    updateTransaction: (state, action: PayloadAction<Transaction>) => {
      const index = state.transactions.findIndex(t => t.id === action.payload.id);
      if (index !== -1) {
        state.transactions[index] = action.payload;
      }
    },
    removeTransaction: (state, action: PayloadAction<string>) => {
      state.transactions = state.transactions.filter(t => t.id !== action.payload);
      if (state.pagination) {
        state.pagination.total = Math.max(0, state.pagination.total - 1);
      }
    },
    setFilters: (state, action: PayloadAction<Partial<TransactionFilters>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = { page: 1, limit: 10 };
    },
    setSelectedTransaction: (state, action: PayloadAction<Transaction | null>) => {
      state.selectedTransaction = action.payload;
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

export const {
  setTransactions,
  addTransaction,
  updateTransaction,
  removeTransaction,
  setFilters,
  clearFilters,
  setSelectedTransaction,
  setLoading,
  setError,
} = transactionsSlice.actions;

export default transactionsSlice.reducer; 