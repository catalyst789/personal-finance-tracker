import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { vi } from 'vitest';
import theme from '../../theme';
import TransactionList from '../TransactionList';
import type { Transaction } from '../../types';

// Mock store
const createMockStore = () => configureStore({
  reducer: {
    spaces: (state = { currentSpaceId: null, loading: false, error: null }) => state,
    transactions: (state = { transactions: [], pagination: null, filters: {}, loading: false, error: null }) => state,
    budgets: (state = { budget: null, loading: false, error: null }) => state,
    ui: (state = { sidebarOpen: false, theme: 'light', notifications: [] }) => state,
  },
});

const mockTransactions: Transaction[] = [
  {
    id: '1',
    space_id: 'space1',
    type: 'income',
    amount: 1000,
    category: 'Salary',
    description: 'Monthly salary',
    date: '2024-01-15',
    is_recurring: false,
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z',
  },
  {
    id: '2',
    space_id: 'space1',
    type: 'expense',
    amount: 50,
    category: 'Food',
    description: 'Grocery shopping',
    date: '2024-01-16',
    is_recurring: false,
    created_at: '2024-01-16T10:00:00Z',
    updated_at: '2024-01-16T10:00:00Z',
  },
];

const mockPagination = {
  page: 1,
  limit: 10,
  total: 2,
  total_pages: 1,
  has_next: false,
  has_prev: false,
};

const renderWithProviders = (component: React.ReactElement) => {
  const store = createMockStore();
  return render(
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        {component}
      </ThemeProvider>
    </Provider>
  );
};

describe('TransactionList', () => {
  const mockOnEdit = vi.fn();
  const mockOnDelete = vi.fn();
  const mockOnPageChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state correctly', () => {
    renderWithProviders(
      <TransactionList
        transactions={[]}
        loading={true}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        pagination={null}
        onPageChange={mockOnPageChange}
      />
    );

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('renders empty state correctly', () => {
    renderWithProviders(
      <TransactionList
        transactions={[]}
        loading={false}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        pagination={null}
        onPageChange={mockOnPageChange}
      />
    );

    expect(screen.getByText('No transactions found. Add your first transaction to get started!')).toBeInTheDocument();
  });

  it('renders transactions correctly', () => {
    renderWithProviders(
      <TransactionList
        transactions={mockTransactions}
        loading={false}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        pagination={mockPagination}
        onPageChange={mockOnPageChange}
      />
    );

    expect(screen.getByText('Salary')).toBeInTheDocument();
    expect(screen.getByText('Food')).toBeInTheDocument();
    expect(screen.getByText('$1000.00')).toBeInTheDocument();
    expect(screen.getByText('$50.00')).toBeInTheDocument();
    expect(screen.getByText('income')).toBeInTheDocument();
    expect(screen.getByText('expense')).toBeInTheDocument();
  });

  it('calls onEdit when edit button is clicked', () => {
    renderWithProviders(
      <TransactionList
        transactions={mockTransactions}
        loading={false}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        pagination={mockPagination}
        onPageChange={mockOnPageChange}
      />
    );

    const editButtons = screen.getAllByTestId('EditIcon');
    fireEvent.click(editButtons[0]);

    expect(mockOnEdit).toHaveBeenCalledWith(mockTransactions[0]);
  });

  it('calls onDelete when delete button is clicked', () => {
    renderWithProviders(
      <TransactionList
        transactions={mockTransactions}
        loading={false}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        pagination={mockPagination}
        onPageChange={mockOnPageChange}
      />
    );

    const deleteButtons = screen.getAllByTestId('DeleteIcon');
    fireEvent.click(deleteButtons[0]);

    expect(mockOnDelete).toHaveBeenCalledWith(mockTransactions[0].id);
  });

  it('displays recurring transaction information correctly', () => {
    const recurringTransaction: Transaction = {
      ...mockTransactions[0],
      is_recurring: true,
      recurrence_frequency: 'monthly',
    };

    renderWithProviders(
      <TransactionList
        transactions={[recurringTransaction]}
        loading={false}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        pagination={mockPagination}
        onPageChange={mockOnPageChange}
      />
    );

    expect(screen.getByText('monthly')).toBeInTheDocument();
  });

  it('renders pagination when provided', () => {
    renderWithProviders(
      <TransactionList
        transactions={mockTransactions}
        loading={false}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        pagination={mockPagination}
        onPageChange={mockOnPageChange}
      />
    );

    expect(screen.getByText('1–2 of 2')).toBeInTheDocument();
  });

  it('displays transaction dates correctly', () => {
    renderWithProviders(
      <TransactionList
        transactions={mockTransactions}
        loading={false}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        pagination={mockPagination}
        onPageChange={mockOnPageChange}
      />
    );

    expect(screen.getByText('Jan 15, 2024')).toBeInTheDocument();
    expect(screen.getByText('Jan 16, 2024')).toBeInTheDocument();
  });

  it('displays subcategory when available', () => {
    const transactionWithSubcategory: Transaction = {
      ...mockTransactions[0],
      subcategory: 'Bonus',
    };

    renderWithProviders(
      <TransactionList
        transactions={[transactionWithSubcategory]}
        loading={false}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        pagination={mockPagination}
        onPageChange={mockOnPageChange}
      />
    );

    expect(screen.getByText('Bonus')).toBeInTheDocument();
  });
}); 