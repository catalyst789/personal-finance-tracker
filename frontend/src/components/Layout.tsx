import { Box } from '@mui/material';
import type { LayoutProps } from '../types';

const Layout = ({ children }: LayoutProps) => {
  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default' }}>
      {children}
    </Box>
  );
};

export default Layout; 