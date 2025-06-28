import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  ComposedChart,
} from 'recharts';
import { Box, Paper, Typography, Grid, Card, CardContent, Chip } from '@mui/material';
import { TrendingUp, TrendingDown, AccountBalance, Warning } from '@mui/icons-material';
import type { ChartProps, SpendingByCategory, TransactionStats, Transaction } from '../types';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FF6B6B', '#4ECDC4'];

export const PieChartComponent: React.FC<ChartProps> = ({ data, title }) => {
  return (
    <Paper elevation={2} sx={{ p: 3, height: 400 }}>
      <Typography variant="h6" gutterBottom align="center">
        {title}
      </Typography>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value: number) => [`$${value.toFixed(2)}`, 'Amount']} />
        </PieChart>
      </ResponsiveContainer>
    </Paper>
  );
};

export const BarChartComponent: React.FC<ChartProps> = ({ data, title }) => {
  return (
    <Paper elevation={2} sx={{ p: 3, height: 400 }}>
      <Typography variant="h6" gutterBottom align="center">
        {title}
      </Typography>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip formatter={(value: number) => [`$${value.toFixed(2)}`, 'Amount']} />
          <Legend />
          <Bar dataKey="value" fill="#8884D8" />
        </BarChart>
      </ResponsiveContainer>
    </Paper>
  );
};

export const LineChartComponent: React.FC<ChartProps> = ({ data, title }) => {
  return (
    <Paper elevation={2} sx={{ p: 3, height: 400 }}>
      <Typography variant="h6" gutterBottom align="center">
        {title}
      </Typography>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip formatter={(value: number) => [`$${value.toFixed(2)}`, 'Amount']} />
          <Legend />
          <Line type="monotone" dataKey="value" stroke="#8884D8" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </Paper>
  );
};

export const AreaChartComponent: React.FC<ChartProps> = ({ data, title }) => {
  return (
    <Paper elevation={2} sx={{ p: 3, height: 400 }}>
      <Typography variant="h6" gutterBottom align="center">
        {title}
      </Typography>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip formatter={(value: number) => [`$${value.toFixed(2)}`, 'Amount']} />
          <Area type="monotone" dataKey="value" stroke="#8884D8" fill="#8884D8" fillOpacity={0.3} />
        </AreaChart>
      </ResponsiveContainer>
    </Paper>
  );
};

export const ComposedChartComponent: React.FC<{ data: any[]; title: string }> = ({ data, title }) => {
  return (
    <Paper elevation={2} sx={{ p: 3, height: 400 }}>
      <Typography variant="h6" gutterBottom align="center">
        {title}
      </Typography>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip formatter={(value: number) => [`$${value.toFixed(2)}`, 'Amount']} />
          <Legend />
          <Bar dataKey="expenses" fill="#FF8042" />
          <Line type="monotone" dataKey="income" stroke="#00C49F" strokeWidth={2} />
        </ComposedChart>
      </ResponsiveContainer>
    </Paper>
  );
};

export const SpendingByCategoryChart: React.FC<{ data: SpendingByCategory[] }> = ({ data }) => {
  const chartData = data.map(item => ({
    name: item.category,
    value: item.total,
    count: item.count,
  }));

  return (
    <PieChartComponent
      data={chartData}
      title="Spending by Category"
      type="pie"
    />
  );
};

export const IncomeVsExpenseChart: React.FC<{ stats: TransactionStats }> = ({ stats }) => {
  const data = [
    { name: 'Income', value: stats.total_income, color: '#00C49F' },
    { name: 'Expenses', value: stats.total_expenses, color: '#FF8042' },
  ];

  return (
    <PieChartComponent
      data={data}
      title="Income vs Expenses"
      type="pie"
    />
  );
};

export const MonthlyTrendChart: React.FC<{ data: Array<{ name: string; value: number }> }> = ({ data }) => {
  return (
    <LineChartComponent
      data={data}
      title="Monthly Spending Trend"
      type="line"
    />
  );
};

export const BudgetTrackingChart: React.FC<{ 
  budget: number; 
  spent: number; 
  category: string;
  transactions: Transaction[];
}> = ({ budget, spent, category, transactions }) => {
  const percentage = (spent / budget) * 100;
  const isOverBudget = percentage > 100;
  
  const monthlyData = transactions
    .filter(t => t.category === category)
    .reduce((acc, t) => {
      const month = new Date(t.date).toLocaleDateString('en-US', { month: 'short' });
      const existing = acc.find(item => item.name === month);
      if (existing) {
        existing.value += t.amount;
      } else {
        acc.push({ name: month, value: t.amount });
      }
      return acc;
    }, [] as Array<{ name: string; value: number }>);

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              {category} Budget
            </Typography>
            <Box display="flex" alignItems="center" gap={2} mb={2}>
              <Typography variant="h4" color={isOverBudget ? 'error.main' : 'success.main'}>
                ${spent.toFixed(2)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                of ${budget.toFixed(2)}
              </Typography>
            </Box>
            <Box display="flex" alignItems="center" gap={1}>
              {isOverBudget ? (
                <Warning color="error" />
              ) : (
                <AccountBalance color="success" />
              )}
              <Chip
                label={`${percentage.toFixed(1)}% used`}
                color={isOverBudget ? 'error' : percentage > 80 ? 'warning' : 'success'}
                variant="outlined"
              />
            </Box>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} md={6}>
        <AreaChartComponent
          data={monthlyData}
          title={`${category} Monthly Trend`}
          type="area"
        />
      </Grid>
    </Grid>
  );
};

export const FinancialHealthIndicator: React.FC<{ stats: TransactionStats }> = ({ stats }) => {
  const savingsRate = stats.total_income > 0 ? ((stats.total_income - stats.total_expenses) / stats.total_income) * 100 : 0;
  
  const getHealthScore = () => {
    if (savingsRate >= 20) return { score: 'Excellent', color: 'success', icon: <TrendingUp /> };
    if (savingsRate >= 10) return { score: 'Good', color: 'success', icon: <TrendingUp /> };
    if (savingsRate >= 0) return { score: 'Fair', color: 'warning', icon: <AccountBalance /> };
    return { score: 'Poor', color: 'error', icon: <TrendingDown /> };
  };

  const health = getHealthScore();

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Financial Health
        </Typography>
        <Box display="flex" alignItems="center" gap={2} mb={2}>
          {health.icon}
          <Typography variant="h4" color={`${health.color}.main`}>
            {health.score}
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary">
          Savings Rate: {savingsRate.toFixed(1)}%
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Net Income: ${stats.net_amount.toFixed(2)}
        </Typography>
      </CardContent>
    </Card>
  );
}; 