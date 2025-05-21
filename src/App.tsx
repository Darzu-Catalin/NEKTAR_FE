// src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, CssBaseline, Box, alpha } from '@mui/material'; // Added Box, alpha
import { ConfigProvider, theme as antdTheme } from 'antd';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import About from './pages/About';
import BuildYourNetwork from './pages/BuildYourNetwork';
// import ParticlesBackground from './components/ParticlesBackground'; // Can be re-enabled if desired
import theme, { appleBlue, appleGray, appleWhite, appleError } from './theme';
import { AuthProvider } from './contexts/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import PrivateRoute from './components/PrivateRoute';
import PersonalCabinet from './pages/PersonalCabinet'; // Import PersonalCabinet

function App() {
  return (
    <ThemeProvider theme={theme}>
      <ConfigProvider
        theme={{
          algorithm: antdTheme.darkAlgorithm,
          token: {
            colorPrimary: appleBlue,
            colorError: appleError,
            colorTextBase: appleWhite,
            colorBgBase: appleGray[800],
            fontFamily: theme.typography.fontFamily,
            borderRadius: theme.shape.borderRadius, // Use MUI theme's border radius
            colorBgElevated: appleGray[700],
            colorBorder: appleGray[600],
            colorBorderSecondary: appleGray[700],
            colorTextDescription: appleGray[400],
          },
          components: {
            Button: {
              borderRadius: 8, // Consistent with MUI
              boxShadow: 'none', primaryShadow: 'none',
              defaultBg: appleGray[600], defaultColor: appleWhite,
              defaultHoverBg: appleGray[500], defaultHoverColor: appleWhite,
              defaultActiveBg: appleGray[400], defaultBorderColor: appleGray[600],
              textHoverBg: alpha(appleBlue, 0.15),
            },
            Modal: { borderRadiusLG: 12, titleFontSize: 17, colorBgElevated: appleGray[700] }, // Consistent with MUI
            Popconfirm: { borderRadiusLG: 10, colorBgElevated: appleGray[700] }, // Consistent with MUI
            Upload: {
                // Style AntD Upload to better match the theme if needed
            },
            Splitter: { // If antd has theme options for Splitter
                // handleBackgroundColor: appleBlue,
                // handleHoverBackgroundColor: theme.palette.primary.light,
            }
          }
        }}
      >
        <CssBaseline /> {/* Applies dark background from MUI theme */}
        <Box // Main application wrapper for background image and overall layout
          sx={{
            position: 'fixed', // Fixed position for the background
            inset: 0, // Equivalent to top:0, right:0, bottom:0, left:0
            backgroundImage: `url('/images/bg2.jpg')`, // Ensure this path is correct in your public folder
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            zIndex: -1, // Push background behind all other content
          }}
        />
        {/* <ParticlesBackground /> */} {/* Optional: if you still want particles */}

        {/* Content Box: Ensures all content is layered above the background and allows scrolling */}
        <Box sx={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <Router>
            <AuthProvider>
              <Navbar /> {/* Navbar should be within AuthProvider if it uses useAuth() */}
              {/* Main content area - takes remaining height and allows its content to scroll */}
              <Box component="main" sx={{ flexGrow: 1, overflowY: 'auto', display:'flex', flexDirection:'column' }}> {/* Ensure main content can scroll */}
                <Routes>
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/" element={
                    <PrivateRoute><Home /></PrivateRoute>
                  } />
                  <Route path="/about" element={
                    <PrivateRoute><About /></PrivateRoute>
                  } />
                  <Route path="/build-your-network" element={
                    <PrivateRoute><BuildYourNetwork /></PrivateRoute>
                  } />
                  <Route path="/cabinet" element={ // New route for Personal Cabinet
                    <PrivateRoute><PersonalCabinet /></PrivateRoute>
                  } />
                </Routes>
              </Box>
            </AuthProvider>
          </Router>
        </Box>
      </ConfigProvider>
    </ThemeProvider>
  );
}

export default App;