import { Box, Button, Container, Typography, Paper, CircularProgress } from '@mui/material';
import { AccountBalance, TrendingUp, Security } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../hooks';
import { setLoading, setError } from '../store/slices/spacesSlice';
import apiService from '../services/api';
import type { RootState } from '../store';

const LandingPage = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { loading } = useAppSelector((state: RootState) => state.spaces);

  const handleStart = async () => {
    try {
      dispatch(setLoading(true));
      const result = await apiService.createSpace();
      navigate(`/space/${result.space_id}`);
    } catch (error) {
      dispatch(setError(error instanceof Error ? error.message : 'Failed to create space'));
    } finally {
      dispatch(setLoading(false));
    }
  };

  const features = [
    {
      icon: <AccountBalance sx={{ fontSize: 40 }} />,
      title: 'Track Everything',
      description: 'Monitor income, expenses, and savings in one place'
    },
    {
      icon: <TrendingUp sx={{ fontSize: 40 }} />,
      title: 'Visual Insights',
      description: 'Beautiful charts and analytics to understand your spending'
    },
    {
      icon: <Security sx={{ fontSize: 40 }} />,
      title: 'Secure & Private',
      description: 'Your data stays private with session-based spaces'
    }
  ];

  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100vw',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        py: 4,
        overflowX: 'hidden',
      }}
    >
      <Container maxWidth={false} disableGutters sx={{ width: '100%', maxWidth: '100vw', px: { xs: 2, md: 4 } }}>
        <Box sx={{ textAlign: 'center', color: 'white', mb: 8 }}>
          <Typography 
            variant="h2" 
            component="h1" 
            gutterBottom
            sx={{ 
              fontWeight: 700,
              textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
              mb: 2
            }}
          >
            Personal Finance Tracker
          </Typography>
          <Typography 
            variant="h5" 
            sx={{ 
              mb: 4,
              opacity: 0.9,
              maxWidth: 600,
              mx: 'auto'
            }}
          >
            Take control of your finances with our easy-to-use tracking tool. 
            No registration required - just start tracking instantly.
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={handleStart}
            disabled={loading}
            sx={{ 
              px: 6, 
              py: 2, 
              fontSize: '1.2rem',
              fontWeight: 600,
              borderRadius: 3,
              boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 12px 40px rgba(0,0,0,0.4)',
              },
              transition: 'all 0.3s ease'
            }}
          >
            {loading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              'Start Tracking Now'
            )}
          </Button>
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 4 }}>
          {features.map((feature, index) => (
            <Paper
              key={index}
              elevation={8}
              sx={{
                p: 4,
                textAlign: 'center',
                borderRadius: 3,
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)',
                transition: 'all 0.3s ease',
                maxWidth: '100%',
                overflow: 'hidden',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
                }
              }}
            >
              <Box sx={{ color: 'primary.main', mb: 2 }}>
                {feature.icon}
              </Box>
              <Typography variant="h6" component="h3" gutterBottom sx={{ fontWeight: 600 }}>
                {feature.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {feature.description}
              </Typography>
            </Paper>
          ))}
        </Box>
      </Container>
    </Box>
  );
};

export default LandingPage; 