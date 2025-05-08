import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { styled } from '@mui/material/styles';

// Styled AppBar component to achieve the glassmorphism effect
const GlassAppBar = styled(AppBar)(({ theme }) => ({
  backgroundColor: 'transparent', // Make background transparent
  backdropFilter: 'blur(30px)', // Apply blur to the background
  borderRadius: '50px', // Rounded corners
  position: 'sticky', // Make it sticky
  top: 10, // Stick it to the top
  zIndex: 1000, // Ensure it's above other elements
  color: 'inherit', // Inherit text color
  width: '95%', // Use a percentage width
  display: 'flex',
  justifyContent: 'center', // Center content horizontally
  margin: '20px auto',     // Add vertical margin and auto horizontal margin
  boxShadow: 'none', // Remove the shadow
  border: 'none',       // Remove all borders
  '& .MuiToolbar-root': { // Target the Toolbar component
    border: 'none',         // Ensure Toolbar has no borders either
    backgroundColor: 'transparent', // Make the toolbar transparent
    minHeight: 'auto', // Add this line
  },
  // Add these lines to remove any potential background color or borders
  '&:before, &:after': {
    content: 'none',
    display: 'none',
  },
  p: 10,
}));

const Navbar: React.FC = () => {
  return (
    <GlassAppBar>
      <Toolbar sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
        <Box
          component={RouterLink}
          to="/"
          sx={{
            display: 'flex',
            alignItems: 'center',
            height: '100%',
            textDecoration: 'none',
          }}
        >
          <img
            src="images/logo/logo.png" // Replace with the actual path to your logo
            alt="NEKTAR Logo"
            style={{
              height: '60px', // Adjust the height as needed
              marginRight: '0px', // Adjust spacing if needed
            }}
          />
        </Box>
        <Box>
          <Button
            component={RouterLink}
            to="/"
            color="inherit"
            sx={{ fontSize: '20px', fontWeight: 600, marginRight: 1, color: '#fff' }}
          >
            Home
          </Button>
          <Button
            component={RouterLink}
            to="/about"
            color="inherit"
            sx={{ fontSize: '20px', fontWeight: 600, marginRight: 1, color: '#fff' }}
          >
            About
          </Button>
          <Button
            component={RouterLink}
            to="/build-your-network"
            color="inherit"
            sx={{ fontSize: '20px', fontWeight: 600, color: '#fff' }}
          >
            Build Your Network
          </Button>
          <Button
            component={RouterLink}
            to="/login"
            color="inherit"
            sx={{ fontSize: '20px', fontWeight: 600, color: '#fff' }}
          >
            Login
          </Button>
          <Button
            component={RouterLink}
            to="/register"
            color="inherit"
            sx={{ fontSize: '20px', fontWeight: 600, color: '#fff' }}
          >
            Register
          </Button>
        </Box>
      </Toolbar>
    </GlassAppBar>
  );
};

export default Navbar;
