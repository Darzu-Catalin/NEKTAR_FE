// src/components/Navbar.tsx
import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box, ButtonProps } from '@mui/material';
import { Link as RouterLink, LinkProps as RouterDomLinkProps } from 'react-router-dom'; // Import LinkProps
import { styled, alpha } from '@mui/material/styles';
import { useAuth } from '../contexts/AuthContext';
import theme, { appleGray, appleWhite } from '../theme'; // Assuming appleWhite is exported

// Styled AppBar component (same as before)
const GlassAppBar = styled(AppBar)(({ theme }) => ({
  backgroundColor: alpha(appleGray[800], 0.5),
  backdropFilter: 'blur(20px)',
  borderRadius: '12px',
  position: 'sticky',
  top: 16,
  zIndex: 1100,
  color: appleWhite,
  width: 'calc(100% - 32px)',
  maxWidth: '1200px',
  margin: '16px auto',
  boxShadow: `0 4px 12px ${alpha(theme.palette.common.black, 0.1)}`,
  border: `1px solid ${alpha(appleGray[600], 0.3)}`,
  padding: '0 8px',
  '& .MuiToolbar-root': {
    minHeight: '56px',
    paddingLeft: '16px',
    paddingRight: '16px',
  },
}));

// Define custom props for NavButton to include LinkProps when component is RouterLink
interface NavButtonCustomProps {
  component?: typeof RouterLink | React.ElementType;
  to?: RouterDomLinkProps['to']; // Explicitly include 'to' from LinkProps
  // You could add other LinkProps here if needed, e.g., 'replace', 'state'
}

// Combine ButtonProps with our custom props.
// This ensures NavButton accepts standard Button props and also 'to' when used as a Link.
type CombinedNavButtonProps = Omit<ButtonProps, 'component' | 'to'> & NavButtonCustomProps;


const NavButton = styled(Button)<CombinedNavButtonProps>(({ theme }) => ({
    fontSize: '1rem',
    fontWeight: 500,
    marginRight: theme.spacing(1.5),
    color: appleGray[200],
    textTransform: 'none',
    padding: '6px 12px',
    borderRadius: '8px',
    '&:hover': {
      backgroundColor: alpha(appleWhite, 0.1),
      color: appleWhite,
    },
    '&.active': {
      color: appleWhite,
      fontWeight: 600,
    }
}));


const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  return (
    <GlassAppBar>
      <Toolbar sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
        <Box
          component={RouterLink}
          to="/"
          sx={{
            display: 'flex',
            alignItems: 'center',
            textDecoration: 'none',
          }}
        >
          <img
            src="/images/logo/logo.png"
            alt="NEKTAR Logo"
            style={{
              height: '40px',
              marginRight: '8px',
            }}
          />
        </Box>
        <Box>
          {/* When using NavButton with component={RouterLink}, 'to' prop is now correctly typed */}
          <NavButton component={RouterLink} to="/">
            Home
          </NavButton>
          <NavButton component={RouterLink} to="/about">
            About
          </NavButton>
          {user ? (
            <>
              <NavButton component={RouterLink} to="/build-your-network">
                Build Network
              </NavButton>
              <NavButton component={RouterLink} to="/cabinet">
                My Cabinet
              </NavButton>
              <NavButton onClick={logout}>
                Logout
              </NavButton>
            </>
          ) : (
            <>
              <NavButton component={RouterLink} to="/login">
                Login
              </NavButton>
              <NavButton component={RouterLink} to="/register">
                Register
              </NavButton>
            </>
          )}
        </Box>
      </Toolbar>
    </GlassAppBar>
  );
};

export default Navbar;