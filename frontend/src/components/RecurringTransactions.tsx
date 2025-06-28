import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  Alert,
  Grid,
} from '@mui/material';
import { Add, Edit, Delete, Schedule, Repeat, PlayArrow, Pause } from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { format, addDays, addWeeks, addMonths, addYears } from 'date-fns';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Transaction, CreateTransactionRequest, RecurringTransaction, CreateRecurringTransactionRequest, UpdateRecurringTransactionRequest } from '../types';
import apiService from '../services/api';

interface RecurringTransactionsProps {
  transactions: Transaction[];
  onCreateTransaction: (data: CreateTransactionRequest) => void;
  onUpdateRecurring: (id: string, data: Partial<RecurringTransaction>) => void;
  onDeleteRecurring: (id: string) => void;
  loading?: boolean;
  spaceId?: string;
}

const schema = yup.object({
  name: yup.string().required('Name is required'),
  type: yup.string().oneOf(['income', 'expense']).required('Type is required'),
  amount: yup.string().required('Amount is required').matches(/^\d+(\.\d{1,2})?$/, 'Invalid amount'),
  category: yup.string().required('Category is required'),
  subcategory: yup.string(),
  description: yup.string(),
  frequency: yup.string().oneOf(['weekly', 'monthly', 'yearly']).required('Frequency is required'),
  startDate: yup.string().required('Start date is required'),
}).required();

const RecurringTransactions: React.FC<RecurringTransactionsProps> = ({
  transactions,
  onCreateTransaction,
  onUpdateRecurring,
  onDeleteRecurring,
  loading = false,
  spaceId,
}) => {
  const [showDialog, setShowDialog] = useState(false);
  const [editingRecurring, setEditingRecurring] = useState<RecurringTransaction | null>(null);
  const queryClient = useQueryClient();

  // Fetch recurring transactions using React Query
  const { data: recurringTransactions = [], isLoading: loadingRecurring, refetch: refetchRecurring } = useQuery({
    queryKey: ['recurring-transactions', spaceId],
    queryFn: () => apiService.getRecurringTransactions(spaceId!),
    enabled: !!spaceId,
  });

  // Mutations for recurring transactions
  const updateRecurringMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<RecurringTransaction> }) =>
      apiService.updateRecurringTransaction(spaceId!, id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recurring-transactions', spaceId] });
    },
  });

  const deleteRecurringMutation = useMutation({
    mutationFn: (id: string) => apiService.deleteRecurringTransaction(spaceId!, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recurring-transactions', spaceId] });
    },
  });

  const createRecurringMutation = useMutation({
    mutationFn: (data: CreateRecurringTransactionRequest) =>
      apiService.createRecurringTransaction(spaceId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recurring-transactions', spaceId] });
    },
  });

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      name: '',
      type: 'expense',
      amount: '',
      category: '',
      subcategory: '',
      description: '',
      frequency: 'monthly',
      startDate: new Date().toISOString().split('T')[0],
    },
  });

  const watchType = watch('type');

  // Get recurring transactions from both dedicated table and regular transactions
  const allRecurringTransactions = React.useMemo(() => {
    console.log('[RecurringTransactions] All transactions received:', transactions);
    
    // Get recurring transactions from regular transactions table
    const regularRecurringTransactions = transactions
      .filter(t => t.is_recurring)
      .map(t => ({
        id: `regular-${t.id}`, // Prefix to avoid conflicts
        space_id: t.space_id,
        name: t.description || `${t.type} - ${t.category}`,
        type: t.type,
        amount: t.amount,
        category: t.category,
        subcategory: t.subcategory,
        description: t.description,
        frequency: t.recurrence_frequency || 'monthly',
        start_date: t.date,
        next_due_date: t.date, // This would need to be calculated based on frequency
        is_active: true,
        last_processed: t.date,
        created_at: t.created_at,
        updated_at: t.updated_at,
        source: 'regular_transaction' as const,
      }));

    console.log('[RecurringTransactions] Regular recurring transactions:', regularRecurringTransactions);
    console.log('[RecurringTransactions] Dedicated recurring transactions:', recurringTransactions);

    // Combine both types of recurring transactions
    const combined = [...recurringTransactions, ...regularRecurringTransactions];
    
    // Remove duplicates (if a transaction exists in both tables, prefer the dedicated one)
    const unique = combined.filter((item, index, self) => 
      index === self.findIndex(t => 
        t.source === 'regular_transaction' ? 
          t.id === item.id : 
          t.id === item.id
      )
    );

    console.log('[RecurringTransactions] Combined recurring transactions:', unique);
    return unique;
  }, [transactions, recurringTransactions]);

  const categories = {
    income: ['Salary', 'Freelance', 'Investment', 'Gift', 'Other'],
    expense: ['Food', 'Transportation', 'Housing', 'Entertainment', 'Healthcare', 'Shopping', 'Utilities', 'Other'],
  };

  const calculateNextDueDate = (startDate: string, frequency: string, lastProcessed?: string): string => {
    const baseDate = lastProcessed ? new Date(lastProcessed) : new Date(startDate);
    
    switch (frequency) {
      case 'weekly':
        return format(addWeeks(baseDate, 1), 'yyyy-MM-dd');
      case 'monthly':
        return format(addMonths(baseDate, 1), 'yyyy-MM-dd');
      case 'yearly':
        return format(addYears(baseDate, 1), 'yyyy-MM-dd');
      default:
        return format(addMonths(baseDate, 1), 'yyyy-MM-dd');
    }
  };

  const processRecurringTransactions = async () => {
    if (!spaceId) return;
    
    try {
      const result = await apiService.processRecurringTransactions(spaceId);
      console.log('[RecurringTransactions] Processed recurring transactions:', result);
      
      // Reload recurring transactions to get updated next due dates
      refetchRecurring();
    } catch (error) {
      console.error('[RecurringTransactions] Error processing recurring transactions:', error);
    }
  };

  const handleFormSubmit = async (data: any) => {
    if (!spaceId) return;
    
    console.log('[RecurringTransactions] Form submitted with data:', data);
    
    try {
      const recurringTransactionData: CreateRecurringTransactionRequest = {
        name: data.name,
        type: data.type,
        amount: parseFloat(data.amount),
        category: data.category,
        subcategory: data.subcategory,
        description: data.description,
        frequency: data.frequency,
        start_date: data.startDate,
      };

      if (editingRecurring) {
        // Update existing recurring transaction
        await updateRecurringMutation.mutateAsync({ id: editingRecurring.id, data: recurringTransactionData });
      } else {
        // Create new recurring transaction
        await createRecurringMutation.mutateAsync(recurringTransactionData);
      }

      setShowDialog(false);
      reset();
      setEditingRecurring(null);
    } catch (error) {
      console.error('[RecurringTransactions] Error saving recurring transaction:', error);
    }
  };

  const handleEdit = (recurring: RecurringTransaction) => {
    setEditingRecurring(recurring);
    reset({
      name: recurring.name,
      type: recurring.type,
      amount: recurring.amount.toString(),
      category: recurring.category,
      subcategory: recurring.subcategory || '',
      description: recurring.description || '',
      frequency: recurring.frequency,
      startDate: recurring.start_date,
    });
    setShowDialog(true);
  };

  const handleDelete = async (id: string) => {
    if (!spaceId) return;
    
    if (window.confirm('Are you sure you want to delete this recurring transaction?')) {
      try {
        await deleteRecurringMutation.mutateAsync(id);
      } catch (error) {
        console.error('[RecurringTransactions] Error deleting recurring transaction:', error);
      }
    }
  };

  const handleToggleActive = async (id: string) => {
    if (!spaceId) return;
    
    const recurring = allRecurringTransactions.find(t => t.id === id);
    if (!recurring) return;
    
    try {
      await updateRecurringMutation.mutateAsync({ id, data: { is_active: !recurring.is_active } });
    } catch (error) {
      console.error('[RecurringTransactions] Error toggling active status:', error);
    }
  };

  const handleCloseDialog = () => {
    setShowDialog(false);
    setEditingRecurring(null);
    reset();
  };

  const getFrequencyLabel = (frequency: string) => {
    switch (frequency) {
      case 'weekly': return 'Weekly';
      case 'monthly': return 'Monthly';
      case 'yearly': return 'Yearly';
      default: return frequency;
    }
  };

  const getDaysUntilDue = (nextDueDate: string) => {
    const today = new Date();
    const dueDate = new Date(nextDueDate);
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'Overdue';
    if (diffDays === 0) return 'Due today';
    if (diffDays === 1) return 'Due tomorrow';
    return `Due in ${diffDays} days`;
  };

  return (
    <Box>
      {/* Header with Process Button */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h6">Recurring Transactions</Typography>
        <Box display="flex" gap={1}>
          <Button
            variant="outlined"
            startIcon={<PlayArrow />}
            onClick={processRecurringTransactions}
            disabled={loadingRecurring}
          >
            Process Due
          </Button>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setShowDialog(true)}
            disabled={loadingRecurring}
          >
            Add Recurring
          </Button>
        </Box>
      </Box>

      {/* Recurring Transactions List */}
      {allRecurringTransactions.length === 0 ? (
        <Alert severity="info">
          No recurring transactions set up. Add your first recurring transaction to get started!
        </Alert>
      ) : (
        <List>
          {allRecurringTransactions.map((recurring) => (
            <Card key={recurring.id} sx={{ mb: 2 }}>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                  <Box flex={1}>
                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                      <Typography variant="h6">{recurring.name}</Typography>
                      <Chip
                        label={recurring.type}
                        color={recurring.type === 'income' ? 'success' : 'error'}
                        size="small"
                        variant="outlined"
                      />
                      <Chip
                        label={getFrequencyLabel(recurring.frequency)}
                        size="small"
                        variant="outlined"
                        icon={<Repeat />}
                      />
                      {!recurring.is_active && (
                        <Chip
                          label="Paused"
                          color="warning"
                          size="small"
                          variant="outlined"
                        />
                      )}
                      {recurring.source && (
                        <Chip
                          label={recurring.source === 'dedicated' ? 'Dedicated' : 'From Transaction'}
                          size="small"
                          variant="outlined"
                          color="default"
                        />
                      )}
                    </Box>
                    
                    <Typography variant="body2" color="text.secondary" mb={1}>
                      ${recurring.amount.toFixed(2)} • {recurring.category}
                      {recurring.subcategory && ` • ${recurring.subcategory}`}
                    </Typography>
                    
                    {recurring.description && (
                      <Typography variant="body2" color="text.secondary" mb={1}>
                        {recurring.description}
                      </Typography>
                    )}
                    
                    <Box display="flex" alignItems="center" gap={2}>
                      <Typography variant="body2" color="text.secondary">
                        <Schedule sx={{ fontSize: 16, mr: 0.5 }} />
                        {getDaysUntilDue(recurring.next_due_date)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Next: {format(new Date(recurring.next_due_date), 'MMM dd, yyyy')}
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Box display="flex" flexDirection="column" gap={1}>
                    {recurring.source === 'dedicated' ? (
                      <>
                        <IconButton
                          size="small"
                          onClick={() => handleToggleActive(recurring.id)}
                          color={recurring.is_active ? 'primary' : 'default'}
                        >
                          {recurring.is_active ? <Pause /> : <PlayArrow />}
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleEdit(recurring)}
                          color="primary"
                        >
                          <Edit />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDelete(recurring.id)}
                          color="error"
                        >
                          <Delete />
                        </IconButton>
                      </>
                    ) : (
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                        From Transaction
                      </Typography>
                    )}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          ))}
        </List>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={showDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingRecurring ? 'Edit Recurring Transaction' : 'Add Recurring Transaction'}
        </DialogTitle>
        <form onSubmit={handleSubmit(handleFormSubmit)}>
          <DialogContent>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="name"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Transaction Name"
                      error={!!errors.name}
                      helperText={errors.name?.message}
                    />
                  )}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Controller
                  name="type"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth error={!!errors.type}>
                      <InputLabel>Type</InputLabel>
                      <Select {...field} label="Type">
                        <MenuItem value="income">Income</MenuItem>
                        <MenuItem value="expense">Expense</MenuItem>
                      </Select>
                    </FormControl>
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Controller
                  name="amount"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Amount"
                      type="number"
                      inputProps={{ step: "0.01", min: "0" }}
                      error={!!errors.amount}
                      helperText={errors.amount?.message}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Controller
                  name="category"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth error={!!errors.category}>
                      <InputLabel>Category</InputLabel>
                      <Select {...field} label="Category">
                        {categories[watchType as keyof typeof categories]?.map((category) => (
                          <MenuItem key={category} value={category}>
                            {category}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Controller
                  name="subcategory"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Subcategory (Optional)"
                      error={!!errors.subcategory}
                      helperText={errors.subcategory?.message}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Controller
                  name="frequency"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth error={!!errors.frequency}>
                      <InputLabel>Frequency</InputLabel>
                      <Select {...field} label="Frequency">
                        <MenuItem value="weekly">Weekly</MenuItem>
                        <MenuItem value="monthly">Monthly</MenuItem>
                        <MenuItem value="yearly">Yearly</MenuItem>
                      </Select>
                    </FormControl>
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Controller
                  name="startDate"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Start Date"
                      type="date"
                      InputLabelProps={{ shrink: true }}
                      error={!!errors.startDate}
                      helperText={errors.startDate?.message}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12}>
                <Controller
                  name="description"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Description (Optional)"
                      multiline
                      rows={3}
                      error={!!errors.description}
                      helperText={errors.description?.message}
                    />
                  )}
                />
              </Grid>
            </Grid>
          </DialogContent>
          
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={loadingRecurring}>
              {editingRecurring ? 'Update' : 'Add'} Recurring Transaction
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default RecurringTransactions; 