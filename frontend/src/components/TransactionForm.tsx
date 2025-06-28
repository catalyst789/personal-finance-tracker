import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Box,
  Grid,
  CircularProgress,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import type { TransactionFormProps, Transaction } from '../types';

const schema = yup.object({
  type: yup.string().oneOf(['income', 'expense']).required('Type is required'),
  amount: yup.string().required('Amount is required').matches(/^\d+(\.\d{1,2})?$/, 'Invalid amount'),
  category: yup.string().required('Category is required'),
  subcategory: yup.string(),
  description: yup.string(),
  date: yup.string().required('Date is required'),
  is_recurring: yup.boolean(),
  recurrence_frequency: yup.string().when('is_recurring', {
    is: true,
    then: (schema) => schema.oneOf(['weekly', 'monthly', 'yearly']).required('Frequency is required'),
    otherwise: (schema) => schema.optional(),
  }),
}).required();

const categories = {
  income: ['Salary', 'Freelance', 'Investment', 'Gift', 'Other'],
  expense: ['Food', 'Transportation', 'Housing', 'Entertainment', 'Healthcare', 'Shopping', 'Utilities', 'Other'],
};

const TransactionForm: React.FC<TransactionFormProps> = ({
  transaction,
  onSubmit,
  onCancel,
  loading,
}) => {
  const {
    control,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      type: transaction?.type || 'expense',
      amount: transaction?.amount?.toString() || '',
      category: transaction?.category || '',
      subcategory: transaction?.subcategory || '',
      description: transaction?.description || '',
      date: transaction?.date || new Date().toISOString().split('T')[0],
      is_recurring: transaction?.is_recurring || false,
      recurrence_frequency: transaction?.recurrence_frequency || '',
    },
  });

  const watchType = watch('type');
  const watchIsRecurring = watch('is_recurring');

  const handleFormSubmit = (data: any) => {
    onSubmit({
      ...data,
      amount: parseFloat(data.amount),
      is_recurring: data.is_recurring || false,
      recurrence_frequency: data.is_recurring ? data.recurrence_frequency : undefined,
    });
  };

  const handleClose = () => {
    reset();
    onCancel();
  };

  return (
    <Dialog open={true} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {transaction ? 'Edit Transaction' : 'Add New Transaction'}
      </DialogTitle>
      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <DialogContent>
          <Grid container spacing={3}>
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

            <Grid item xs={12} sm={6}>
              <Controller
                name="date"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Date"
                    type="date"
                    InputLabelProps={{ shrink: true }}
                    error={!!errors.date}
                    helperText={errors.date?.message}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name="is_recurring"
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={
                      <Switch
                        checked={field.value}
                        onChange={field.onChange}
                      />
                    }
                    label="Recurring Transaction"
                  />
                )}
              />
            </Grid>

            {watchIsRecurring && (
              <Grid item xs={12} sm={6}>
                <Controller
                  name="recurrence_frequency"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth error={!!errors.recurrence_frequency}>
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
            )}
          </Grid>
        </DialogContent>
        
        <DialogActions>
          <Button onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            {transaction ? 'Update' : 'Add'} Transaction
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default TransactionForm; 