import { useState } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T) {
  // Get from local storage then parse stored json or return initialValue
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Return a wrapped version of useState's setter function that persists the new value to localStorage
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      // Allow value to be a function so we have the same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue] as const;
}

// Specialized hooks for session persistence
export function useSessionSpace() {
  const [currentSpaceId, setCurrentSpaceId] = useLocalStorage<string | null>('currentSpaceId', null);
  
  const clearSession = () => {
    setCurrentSpaceId(null);
    // Clear other session data
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem('transactions');
      window.localStorage.removeItem('budget');
    }
  };

  return { currentSpaceId, setCurrentSpaceId, clearSession };
}

export function useSessionTransactions() {
  const [transactions, setTransactions] = useLocalStorage<any[]>('transactions', []);
  
  const addTransaction = (transaction: any) => {
    setTransactions(prev => [transaction, ...prev]);
  };

  const updateTransaction = (id: string, updatedTransaction: any) => {
    setTransactions(prev => 
      prev.map(t => t.id === id ? updatedTransaction : t)
    );
  };

  const deleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  const clearTransactions = () => {
    setTransactions([]);
  };

  return {
    transactions,
    setTransactions,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    clearTransactions,
  };
}

export function useSessionBudget() {
  const [budget, setBudget] = useLocalStorage<any | null>('budget', null);
  
  const clearBudget = () => {
    setBudget(null);
  };

  return { budget, setBudget, clearBudget };
}

export function useSessionPersistence() {
  const { currentSpaceId, setCurrentSpaceId, clearSession } = useSessionSpace();
  const { transactions, setTransactions, addTransaction, updateTransaction, deleteTransaction, clearTransactions } = useSessionTransactions();
  const { budget, setBudget, clearBudget } = useSessionBudget();

  const clearAllSessionData = () => {
    clearSession();
    clearTransactions();
    clearBudget();
  };

  return {
    currentSpaceId,
    setCurrentSpaceId,
    transactions,
    setTransactions,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    budget,
    setBudget,
    clearAllSessionData,
  };
} 