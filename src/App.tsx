// src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, CssBaseline, Box } from '@mui/material'; // Added Box
import { ConfigProvider, theme as antdTheme } from 'antd';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import About from './pages/About';
import BuildYourNetwork from './pages/BuildYourNetwork';
import ParticlesBackground from './components/ParticlesBackground'; // Import the background
import theme, { appleBlue, appleGray, appleWhite, appleError } from './theme';
import { AuthProvider } from './contexts/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import PrivateRoute from './components/PrivateRoute'; // Import the PrivateRoute component

function App() {
  return (
    <ThemeProvider theme={theme}>
      <ConfigProvider
        theme={{
          algorithm: antdTheme.darkAlgorithm,
          token: { /* ... dark theme tokens ... */
            colorPrimary: appleBlue,
            colorError: appleError,
            colorTextBase: appleWhite,
            colorBgBase: appleGray[800],
            fontFamily: theme.typography.fontFamily,
            borderRadius: theme.shape.borderRadius,
            colorBgElevated: appleGray[700],
            colorBorder: appleGray[600],
            colorBorderSecondary: appleGray[700],
            colorTextDescription: appleGray[400],
           },
           components: { /* ... dark theme component overrides ... */
                Button: {
                   borderRadius: 8, boxShadow: 'none', primaryShadow: 'none',
                   defaultBg: appleGray[600], defaultColor: appleWhite,
                   defaultHoverBg: appleGray[500], defaultHoverColor: appleWhite,
                   defaultActiveBg: appleGray[400], defaultBorderColor: appleGray[600],
                   textHoverBg: 'rgba(10, 132, 255, 0.15)', // alpha(appleBlue, 0.15) doesn't work directly here
                },
                Modal: { borderRadiusLG: 12, titleFontSize: 17, colorBgElevated: appleGray[700] },
                Popconfirm: { borderRadiusLG: 10, colorBgElevated: appleGray[700] },
           }
        }}
      >
        <CssBaseline /> {/* Applies dark background */}
        <Box
          sx={{
            position: 'fixed',
            inset: 0,                              // top:0; right:0; bottom:0; left:0
            backgroundImage: `url('/images/bg2.jpg')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            zIndex: -1,                            // push behind everything
          }}
        />
        {/* Use a Box to ensure content is layered above the background */}
        <Box sx={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Router>
              <AuthProvider>
              <Navbar /> {/* Navbar should likely be above the main scrollable content */}
              {/* Main content area */}
              <Box component="main" sx={{ flexGrow: 1 }}>
                  <Routes>
                  <Route path="/login"    element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/" element={
                    <PrivateRoute><Home/></PrivateRoute>
                  }/>
                  <Route path="/about" element={
                    <PrivateRoute><About /></PrivateRoute>
                  }/>
                  <Route path="/build-your-network" element={
                    <PrivateRoute><BuildYourNetwork /></PrivateRoute>
                  }/>
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