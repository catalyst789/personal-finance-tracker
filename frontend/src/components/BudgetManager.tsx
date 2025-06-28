import React, { useState } from 'react';
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
  Grid,
  Chip,
  LinearProgress,
  Alert,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
} from '@mui/material';
import { Add, Edit, Delete, Warning, TrendingUp, TrendingDown } from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import type { Budget, Transaction } from '../types';

interface CategoryBudget {
  id: string;
  category: string;
  amount: number;
  spent: number;
  remaining: number;
  percentage: number;
}

interface BudgetManagerProps {
  budget: Budget | null;
  transactions: Transaction[];
  onUpdateBudget: (amount: number) => void;
  onSetCategoryBudget: (category: string, amount: number) => void;
  loading?: boolean;
}

const budgetSchema = yup.object({
  monthly_budget: yup.string().required('Monthly budget is required').matches(/^\d+(\.\d{1,2})?$/, 'Invalid amount'),
}).required();

const categorySchema = yup.object({
  category: yup.string().required('Category is required'),
  amount: yup.string().required('Amount is required').matches(/^\d+(\.\d{1,2})?$/, 'Invalid amount'),
}).required();

const BudgetManager: React.FC<BudgetManagerProps> = ({
  budget,
  transactions,
  onUpdateBudget,
  onSetCategoryBudget,
  loading = false,
}) => {
  const [showBudgetDialog, setShowBudgetDialog] = useState(false);
  const [showCategoryDialog, setShowCategoryDialog] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryBudget | null>(null);

  const {
    control: budgetControl,
    handleSubmit: handleBudgetSubmit,
    reset: resetBudgetForm,
    formState: { errors: budgetErrors },
  } = useForm({
    resolver: yupResolver(budgetSchema),
    defaultValues: {
      monthly_budget: budget?.monthly_budget?.toString() || '',
    },
  });

  const {
    control: categoryControl,
    handleSubmit: handleCategorySubmit,
    reset: resetCategoryForm,
    watch,
    formState: { errors: categoryErrors },
  } = useForm({
    resolver: yupResolver(categorySchema),
    defaultValues: {
      category: '',
      amount: '',
    },
  });

  const watchCategory = watch('category');

  // Calculate category budgets
  const categoryBudgets: CategoryBudget[] = React.useMemo(() => {
    const categories = ['Food', 'Transportation', 'Housing', 'Entertainment', 'Healthcare', 'Shopping', 'Utilities'];
    const spentByCategory = transactions
      .filter(t => t.type === 'expense')
      .reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount;
        return acc;
      }, {} as Record<string, number>);

    return categories.map(category => {
      const spent = spentByCategory[category] || 0;
      const amount = 0; // TODO: Get from category budget storage
      const remaining = amount - spent;
      const percentage = amount > 0 ? (spent / amount) * 100 : 0;

      return {
        id: category,
        category,
        amount,
        spent,
        remaining,
        percentage,
      };
    });
  }, [transactions]);

  const totalSpent = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalBudget = budget?.monthly_budget || 0;
  const totalRemaining = totalBudget - totalSpent;
  const totalPercentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

  const handleBudgetFormSubmit = (data: any) => {
    console.log('[BudgetManager] handleBudgetFormSubmit called with data:', data);
    console.log('[BudgetManager] Calling onUpdateBudget with amount:', parseFloat(data.monthly_budget));
    onUpdateBudget(parseFloat(data.monthly_budget));
    setShowBudgetDialog(false);
    resetBudgetForm();
  };

  const handleCategoryFormSubmit = (data: any) => {
    onSetCategoryBudget(data.category, parseFloat(data.amount));
    setShowCategoryDialog(false);
    resetCategoryForm();
  };

  const handleEditCategory = (categoryBudget: CategoryBudget) => {
    setEditingCategory(categoryBudget);
    resetCategoryForm({
      category: categoryBudget.category,
      amount: categoryBudget.amount.toString(),
    });
    setShowCategoryDialog(true);
  };

  const handleCloseDialogs = () => {
    setShowBudgetDialog(false);
    setShowCategoryDialog(false);
    setEditingCategory(null);
    resetBudgetForm();
    resetCategoryForm();
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 100) return 'error';
    if (percentage >= 80) return 'warning';
    return 'success';
  };

  return (
    <Box>
      {/* Overall Budget Card */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6">Monthly Budget</Typography>
            <Button
              variant="outlined"
              size="small"
              startIcon={<Edit />}
              onClick={() => setShowBudgetDialog(true)}
            >
              Edit Budget
            </Button>
          </Box>
          
          <Box display="flex" alignItems="center" gap={2} mb={2}>
            <Typography variant="h4" color={totalRemaining >= 0 ? 'success.main' : 'error.main'}>
              ${totalSpent.toFixed(2)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              of ${totalBudget.toFixed(2)}
            </Typography>
          </Box>

          <Box mb={2}>
            <Box display="flex" justifyContent="space-between" mb={1}>
              <Typography variant="body2" color="text.secondary">
                Progress
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {totalPercentage.toFixed(1)}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={Math.min(totalPercentage, 100)}
              color={getProgressColor(totalPercentage)}
              sx={{ height: 8, borderRadius: 4 }}
            />
          </Box>

          <Box display="flex" alignItems="center" gap={1}>
            {totalRemaining >= 0 ? (
              <TrendingUp color="success" />
            ) : (
              <Warning color="error" />
            )}
            <Typography variant="body2" color={totalRemaining >= 0 ? 'success.main' : 'error.main'}>
              {totalRemaining >= 0 ? `$${totalRemaining.toFixed(2)} remaining` : `$${Math.abs(totalRemaining).toFixed(2)} over budget`}
            </Typography>
          </Box>
        </CardContent>
      </Card>

      {/* Category Budgets */}
      <Card>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6">Category Budgets</Typography>
            <Button
              variant="contained"
              size="small"
              startIcon={<Add />}
              onClick={() => setShowCategoryDialog(true)}
            >
              Add Category Budget
            </Button>
          </Box>

          <List>
            {categoryBudgets.map((categoryBudget) => (
              <ListItem key={categoryBudget.id} divider>
                <ListItemText
                  primary={
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Box component="span" sx={{ fontWeight: 'medium' }}>
                        {categoryBudget.category}
                      </Box>
                      <Chip
                        label={`${categoryBudget.percentage.toFixed(1)}%`}
                        color={getProgressColor(categoryBudget.percentage)}
                        size="small"
                        variant="outlined"
                      />
                    </Box>
                  }
                  secondary={
                    <Box>
                      <Box display="flex" justifyContent="space-between" mb={1}>
                        <Box component="span" sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>
                          ${categoryBudget.spent.toFixed(2)} of ${categoryBudget.amount.toFixed(2)}
                        </Box>
                        <Box component="span" sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>
                          ${categoryBudget.remaining.toFixed(2)} remaining
                        </Box>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={Math.min(categoryBudget.percentage, 100)}
                        color={getProgressColor(categoryBudget.percentage)}
                        sx={{ height: 4, borderRadius: 2 }}
                      />
                    </Box>
                  }
                />
                <ListItemSecondaryAction>
                  <IconButton
                    edge="end"
                    size="small"
                    onClick={() => handleEditCategory(categoryBudget)}
                  >
                    <Edit />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        </CardContent>
      </Card>

      {/* Budget Dialog */}
      <Dialog open={showBudgetDialog} onClose={handleCloseDialogs} maxWidth="sm" fullWidth>
        <DialogTitle>Update Monthly Budget</DialogTitle>
        <form onSubmit={handleBudgetSubmit((data) => {
          console.log('[BudgetManager] Form submitted with data:', data);
          handleBudgetFormSubmit(data);
        })}>
          <DialogContent>
            <Controller
              name="monthly_budget"
              control={budgetControl}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Monthly Budget"
                  type="number"
                  inputProps={{ step: "0.01", min: "0" }}
                  error={!!budgetErrors.monthly_budget}
                  helperText={budgetErrors.monthly_budget?.message}
                  sx={{ mt: 1 }}
                />
              )}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialogs}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={loading}>
              Update Budget
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Category Budget Dialog */}
      <Dialog open={showCategoryDialog} onClose={handleCloseDialogs} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingCategory ? 'Edit Category Budget' : 'Add Category Budget'}
        </DialogTitle>
        <form onSubmit={handleCategorySubmit(handleCategoryFormSubmit)}>
          <DialogContent>
            <Controller
              name="category"
              control={categoryControl}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Category"
                  select
                  error={!!categoryErrors.category}
                  helperText={categoryErrors.category?.message}
                  sx={{ mb: 2 }}
                >
                  {['Food', 'Transportation', 'Housing', 'Entertainment', 'Healthcare', 'Shopping', 'Utilities'].map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </TextField>
              )}
            />
            <Controller
              name="amount"
              control={categoryControl}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Budget Amount"
                  type="number"
                  inputProps={{ step: "0.01", min: "0" }}
                  error={!!categoryErrors.amount}
                  helperText={categoryErrors.amount?.message}
                />
              )}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialogs}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={loading}>
              {editingCategory ? 'Update' : 'Add'} Budget
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default BudgetManager; 