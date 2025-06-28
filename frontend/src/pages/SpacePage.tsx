import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Paper,
  Card,
  CardContent,
  Fab,
  Dialog,
  Alert,
  Snackbar,
  CircularProgress,
  Tabs,
  Tab,
  AppBar,
  Toolbar,
} from '@mui/material';
import { Add, TrendingUp, TrendingDown, AccountBalance, Settings, Refresh } from '@mui/icons-material';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAppDispatch, useAppSelector } from '../hooks';
import { setCurrentSpace } from '../store/slices/spacesSlice';
import { setTransactions, setFilters, setLoading, setError } from '../store/slices/transactionsSlice';
import { setBudget } from '../store/slices/budgetsSlice';
import { addNotification } from '../store/slices/uiSlice';
import { useSessionPersistence } from '../hooks/useLocalStorage';
import apiService from '../services/api';
import TransactionList from '../components/TransactionList';
import TransactionForm from '../components/TransactionForm';
import BudgetManager from '../components/BudgetManager';
import RecurringTransactions from '../components/RecurringTransactions';
import { 
  PieChartComponent, 
  SpendingByCategoryChart, 
  IncomeVsExpenseChart,
  FinancialHealthIndicator,
  BudgetTrackingChart,
  ComposedChartComponent,
  AreaChartComponent,
} from '../components/Charts';
import type { Transaction, CreateTransactionRequest, UpdateTransactionRequest } from '../types';
import type { RootState } from '../store';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const SpacePage: React.FC = () => {
  const { spaceId } = useParams<{ spaceId: string }>();
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();
  
  const { transactions, pagination, filters, loading } = useAppSelector((state: RootState) => state.transactions);
  const { budget } = useAppSelector((state: RootState) => state.budgets);
  
  // Session persistence
  const { setCurrentSpaceId, clearAllSessionData } = useSessionPersistence();
  
  const [showForm, setShowForm] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');
  const [activeTab, setActiveTab] = useState(0);

  console.log('[SpacePage] Budget from Redux:', budget);

  // Set current space in Redux and session
  useEffect(() => {
    if (spaceId) {
      dispatch(setCurrentSpace(spaceId));
      setCurrentSpaceId(spaceId);
    }
  }, [spaceId, dispatch, setCurrentSpaceId]);

  // Fetch transactions
  const { data: transactionsData, isLoading: transactionsLoading, refetch: refetchTransactions } = useQuery({
    queryKey: ['transactions', spaceId, filters],
    queryFn: () => apiService.getTransactions(spaceId!, filters),
    enabled: !!spaceId,
  });

  // Fetch budget
  const { data: budgetData, refetch: refetchBudget } = useQuery({
    queryKey: ['budget', spaceId],
    queryFn: () => {
      console.log('[SpacePage] Budget query function called for spaceId:', spaceId);
      return apiService.getBudget(spaceId!);
    },
    enabled: !!spaceId,
  });

  console.log('[SpacePage] Budget data from query:', budgetData);

  // Update Redux state when data changes
  useEffect(() => {
    if (transactionsData) {
      console.log('[SpacePage] Dispatching transactions to Redux:', transactionsData);
      dispatch(setTransactions(transactionsData));
    }
  }, [transactionsData, dispatch]);

  useEffect(() => {
    if (budgetData) {
      console.log('[SpacePage] Dispatching budget to Redux:', budgetData);
      dispatch(setBudget(budgetData));
    }
  }, [budgetData, dispatch]);

  // Mutations
  const createTransactionMutation = useMutation({
    mutationFn: (data: CreateTransactionRequest) => 
      apiService.createTransaction(spaceId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions', spaceId] });
      queryClient.invalidateQueries({ queryKey: ['recurring-transactions', spaceId] });
      setShowForm(false);
      showNotification('Transaction added successfully!', 'success');
    },
    onError: (error) => {
      showNotification(error instanceof Error ? error.message : 'Failed to add transaction', 'error');
    },
  });

  const updateTransactionMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTransactionRequest }) =>
      apiService.updateTransaction(spaceId!, id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions', spaceId] });
      queryClient.invalidateQueries({ queryKey: ['recurring-transactions', spaceId] });
      setShowForm(false);
      setEditingTransaction(null);
      showNotification('Transaction updated successfully!', 'success');
    },
    onError: (error) => {
      showNotification(error instanceof Error ? error.message : 'Failed to update transaction', 'error');
    },
  });

  const deleteTransactionMutation = useMutation({
    mutationFn: (id: string) => apiService.deleteTransaction(spaceId!, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions', spaceId] });
      queryClient.invalidateQueries({ queryKey: ['recurring-transactions', spaceId] });
      showNotification('Transaction deleted successfully!', 'success');
    },
    onError: (error) => {
      showNotification(error instanceof Error ? error.message : 'Failed to delete transaction', 'error');
    },
  });

  const updateBudgetMutation = useMutation({
    mutationFn: (amount: number) => {
      console.log('[SpacePage] updateBudgetMutation called with amount:', amount);
      console.log('[SpacePage] spaceId:', spaceId);
      const result = apiService.updateBudget(spaceId!, { monthly_budget: amount });
      console.log('[SpacePage] updateBudgetMutation returning promise:', result);
      return result;
    },
    onSuccess: (data) => {
      console.log('[SpacePage] updateBudgetMutation success:', data);
      console.log('[SpacePage] Invalidating budget query for spaceId:', spaceId);
      queryClient.invalidateQueries({ queryKey: ['budget', spaceId] });
      showNotification('Budget updated successfully!', 'success');
    },
    onError: (error) => {
      console.error('[SpacePage] updateBudgetMutation error:', error);
      showNotification(error instanceof Error ? error.message : 'Failed to update budget', 'error');
    },
  });

  const handleAddTransaction = (data: CreateTransactionRequest) => {
    createTransactionMutation.mutate(data);
  };

  const handleUpdateTransaction = (data: CreateTransactionRequest) => {
    if (editingTransaction) {
      updateTransactionMutation.mutate({ id: editingTransaction.id, data });
    }
  };

  const handleEditTransaction = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setShowForm(true);
  };

  const handleDeleteTransaction = (transactionId: string) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      deleteTransactionMutation.mutate(transactionId);
    }
  };

  const handleUpdateBudget = (amount: number) => {
    console.log('[SpacePage] handleUpdateBudget called with amount:', amount);
    updateBudgetMutation.mutate(amount);
  };

  const handleSetCategoryBudget = (category: string, amount: number) => {
    // TODO: Implement category budget storage
    showNotification(`Category budget for ${category} set to $${amount}`, 'success');
  };

  const handlePageChange = (page: number) => {
    dispatch(setFilters({ page }));
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingTransaction(null);
  };

  const handleRefresh = () => {
    refetchTransactions();
    refetchBudget();
    showNotification('Data refreshed successfully!', 'success');
  };

  const handleClearSession = () => {
    if (window.confirm('Are you sure you want to clear all session data? This will log you out.')) {
      clearAllSessionData();
      window.location.href = '/';
    }
  };

  const showNotification = (message: string, severity: 'success' | 'error') => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setShowSnackbar(true);
  };

  // Calculate stats
  const transactionsArray = transactions || [];
  const stats = transactionsData?.stats || {
    total_income: 0,
    total_expenses: 0,
    net_amount: 0,
    transaction_count: 0,
  };

  // Use backend-provided stats for charts
  const spendingByCategory = transactionsData?.categoryStats || [];
  type MonthlyStat = { month: string; year: number; income: number; expenses: number };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const monthlyData = (transactionsData?.monthlyStats || []).map(function(item: MonthlyStat) {
    return {
      name: `${item.month} ${item.year}`,
      income: item.income,
      expenses: item.expenses
    };
  });

  if (!spaceId) {
    return (
      <Container>
        <Alert severity="error">Invalid space ID</Alert>
      </Container>
    );
  }

  // Show loading state while data is being fetched
  if (transactionsLoading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h4" component="h1">
            Finance Dashboard
          </Typography>
          <Box display="flex" gap={1}>
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={handleRefresh}
              disabled={transactionsLoading}
            >
              Refresh
            </Button>
            <Button
              variant="outlined"
              startIcon={<Settings />}
              onClick={handleClearSession}
            >
              Clear Session
            </Button>
          </Box>
        </Box>
        <Typography variant="body1" color="text.secondary">
          Space ID: {spaceId}
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1}>
                <TrendingUp color="success" />
                <Typography variant="h6" color="success.main">
                  ${stats.total_income.toFixed(2)}
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Total Income
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1}>
                <TrendingDown color="error" />
                <Typography variant="h6" color="error.main">
                  ${stats.total_expenses.toFixed(2)}
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Total Expenses
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1}>
                <AccountBalance color={stats.net_amount >= 0 ? 'success' : 'error'} />
                <Typography 
                  variant="h6" 
                  color={stats.net_amount >= 0 ? 'success.main' : 'error.main'}
                >
                  ${stats.net_amount.toFixed(2)}
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Net Amount
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <FinancialHealthIndicator stats={stats} />
        </Grid>
      </Grid>

      {/* Tabs */}
      <Box sx={{ width: '100%' }}>
        <AppBar position="static" color="default" elevation={1}>
          <Toolbar>
            <Tabs
              value={activeTab}
              onChange={(_, newValue) => setActiveTab(newValue)}
              indicatorColor="primary"
              textColor="primary"
            >
              <Tab label="Overview" />
              <Tab label="Transactions" />
              <Tab label="Budget" />
              <Tab label="Recurring" />
              <Tab label="Analytics" />
            </Tabs>
          </Toolbar>
        </AppBar>

        {/* Overview Tab */}
        <TabPanel value={activeTab} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <IncomeVsExpenseChart stats={stats} />
            </Grid>
            <Grid item xs={12} md={6}>
              <SpendingByCategoryChart data={spendingByCategory} />
            </Grid>
            <Grid item xs={12}>
              <ComposedChartComponent
                data={monthlyData}
                title="Monthly Income vs Expenses"
              />
            </Grid>
          </Grid>
        </TabPanel>

        {/* Transactions Tab */}
        <TabPanel value={activeTab} index={1}>
          <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
            <Typography variant="h5">Transactions</Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setShowForm(true)}
            >
              Add Transaction
            </Button>
          </Box>
          
          <TransactionList
            transactions={transactionsArray}
            loading={transactionsLoading}
            onEdit={handleEditTransaction}
            onDelete={handleDeleteTransaction}
            pagination={pagination}
            onPageChange={handlePageChange}
          />
        </TabPanel>

        {/* Budget Tab */}
        <TabPanel value={activeTab} index={2}>
          <BudgetManager
            budget={budget}
            transactions={transactionsArray}
            onUpdateBudget={handleUpdateBudget}
            onSetCategoryBudget={handleSetCategoryBudget}
            loading={updateBudgetMutation.isPending}
          />
        </TabPanel>

        {/* Recurring Tab */}
        <TabPanel value={activeTab} index={3}>
          <RecurringTransactions
            transactions={transactionsArray}
            onCreateTransaction={handleAddTransaction}
            onUpdateRecurring={() => {}}
            onDeleteRecurring={() => {}}
            loading={createTransactionMutation.isPending}
            spaceId={spaceId}
          />
        </TabPanel>

        {/* Analytics Tab */}
        <TabPanel value={activeTab} index={4}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <AreaChartComponent
                data={monthlyData.map(item => ({ name: item.name, value: item.expenses }))}
                title="Monthly Expenses Trend"
                type="area"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <AreaChartComponent
                data={monthlyData.map(item => ({ name: item.name, value: item.income }))}
                title="Monthly Income Trend"
                type="area"
              />
            </Grid>
            {budget && (
              <Grid item xs={12}>
                <BudgetTrackingChart
                  budget={budget.monthly_budget}
                  spent={stats.total_expenses}
                  category="Overall"
                  transactions={transactionsArray}
                />
              </Grid>
            )}
          </Grid>
        </TabPanel>
      </Box>

      {/* Transaction Form Dialog */}
      {showForm && (
        <TransactionForm
          transaction={editingTransaction || undefined}
          onSubmit={editingTransaction ? handleUpdateTransaction : handleAddTransaction}
          onCancel={handleFormClose}
          loading={createTransactionMutation.isPending || updateTransactionMutation.isPending}
        />
      )}

      {/* Snackbar */}
      <Snackbar
        open={showSnackbar}
        autoHideDuration={6000}
        onClose={() => setShowSnackbar(false)}
      >
        <Alert 
          onClose={() => setShowSnackbar(false)} 
          severity={snackbarSeverity}
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default SpacePage; 