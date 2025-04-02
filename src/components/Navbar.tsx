import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

const Navbar: React.FC = () => {
  return (
    <AppBar
      position="static"
      color="transparent"
      elevation={0}
      sx={{
        borderBottom: '1px solid #757575', // changed to a gray border
        backgroundColor: '#424242', // changed from black to dark gray
      }}
    >
      <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Typography
          variant="h6"
          component={RouterLink}
          to="/"
          sx={{ textDecoration: 'none', color: '#ccc', fontWeight: 'bold' }} // light gray text
        >
          NEKTAR
        </Typography>
        <Box>
          <Button
            component={RouterLink}
            to="/"
            color="inherit"
            sx={{ textTransform: 'none', fontSize: '1rem', color: '#ccc' }}
          >
            Home
          </Button>
          <Button
            component={RouterLink}
            to="/about"
            color="inherit"
            sx={{ textTransform: 'none', fontSize: '1rem', color: '#ccc' }}
          >
            About
          </Button>
          <Button
            component={RouterLink}
            to="/build-your-network"
            color="inherit"
            sx={{ textTransform: 'none', fontSize: '1rem', color: '#ccc' }}
          >
            Build Your Network
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
