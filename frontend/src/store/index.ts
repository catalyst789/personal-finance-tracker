import { configureStore } from '@reduxjs/toolkit';
import spacesReducer from './slices/spacesSlice';
import transactionsReducer from './slices/transactionsSlice';
import budgetsReducer from './slices/budgetsSlice';
import uiReducer from './slices/uiSlice';

export const store = configureStore({
  reducer: {
    spaces: spacesReducer,
    transactions: transactionsReducer,
    budgets: budgetsReducer,
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 