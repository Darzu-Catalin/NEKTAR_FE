// src/components/Navbar.tsx
import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

const Navbar: React.FC = () => {
  return (
    <AppBar position="static" color="transparent" elevation={0} sx={{ borderBottom: '1px solid #e0e0e0', backgroundColor: 'black' }}>
      <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Typography
          variant="h6"
          component={RouterLink}
          to="/"
          sx={{ textDecoration: 'none', color: 'white', fontWeight: 'bold' }}
        >
          NEKTAR
        </Typography>
        <Box>
          <Button component={RouterLink} to="/" color="inherit" sx={{ textTransform: 'none', fontSize: '1rem' }}>
            Home
          </Button>
          <Button component={RouterLink} to="/about" color="inherit" sx={{ textTransform: 'none', fontSize: '1rem' }}>
            About
          </Button>
          <Button component={RouterLink} to="/build-your-network" color="inherit" sx={{ textTransform: 'none', fontSize: '1rem' }}>
            Build Your Network
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;