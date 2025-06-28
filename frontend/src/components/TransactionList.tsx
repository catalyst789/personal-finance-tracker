import React from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Typography,
  TablePagination,
  CircularProgress,
  Alert,
} from '@mui/material';
import { Edit, Delete, TrendingUp, TrendingDown } from '@mui/icons-material';
import { format } from 'date-fns';
import type { TransactionListProps } from '../types';

const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  loading,
  onEdit,
  onDelete,
  pagination,
  onPageChange,
}) => {
  const handlePageChange = (_: unknown, newPage: number) => {
    onPageChange(newPage + 1); // API uses 1-based pagination
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (transactions.length === 0) {
    return (
      <Alert severity="info" sx={{ mt: 2 }}>
        No transactions found. Add your first transaction to get started!
      </Alert>
    );
  }

  return (
    <Paper elevation={2}>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Type</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Recurring</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {transactions.map((transaction) => (
              <TableRow key={transaction.id} hover>
                <TableCell>
                  <Box display="flex" alignItems="center" gap={1}>
                    {transaction.type === 'income' ? (
                      <TrendingUp color="success" />
                    ) : (
                      <TrendingDown color="error" />
                    )}
                    <Chip
                      label={transaction.type}
                      color={transaction.type === 'income' ? 'success' : 'error'}
                      size="small"
                      variant="outlined"
                    />
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography
                    variant="body2"
                    color={transaction.type === 'income' ? 'success.main' : 'error.main'}
                    fontWeight="bold"
                  >
                    ${transaction.amount.toFixed(2)}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Box>
                    <Typography variant="body2" fontWeight="medium">
                      {transaction.category}
                    </Typography>
                    {transaction.subcategory && (
                      <Typography variant="caption" color="text.secondary">
                        {transaction.subcategory}
                      </Typography>
                    )}
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" noWrap maxWidth={200}>
                    {transaction.description || '-'}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {format(new Date(transaction.date), 'MMM dd, yyyy')}
                  </Typography>
                </TableCell>
                <TableCell>
                  {transaction.is_recurring ? (
                    <Chip
                      label={transaction.recurrence_frequency}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      -
                    </Typography>
                  )}
                </TableCell>
                <TableCell align="center">
                  <IconButton
                    size="small"
                    onClick={() => onEdit(transaction)}
                    color="primary"
                  >
                    <Edit />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => onDelete(transaction.id)}
                    color="error"
                  >
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      
      {pagination && (
        <TablePagination
          component="div"
          count={pagination.total}
          page={pagination.page - 1} // MUI uses 0-based pagination
          rowsPerPage={pagination.limit}
          rowsPerPageOptions={[10, 25, 50]}
          onPageChange={handlePageChange}
          onRowsPerPageChange={() => {}} // TODO: Implement
        />
      )}
    </Paper>
  );
};

export default TransactionList; 