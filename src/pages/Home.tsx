// src/pages/Home.tsx

import React, { useEffect, useState } from 'react';
import { Container, Typography, Box, Fade } from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import theme from '../theme';

// 1) Color‑cycle animation (same as before)
const colorCycle = keyframes`
  0%   { color: ${theme.palette.primary.main}; }
  50%  { color: ${theme.palette.success.main}; }
  100% { color: ${theme.palette.primary.main}; }
`;

// 2) Styled Typography locked to exactly theme.typography.h1 size
const AnimatedTitle = styled(Typography)(({ theme }) => ({
  // force h1 sizing:
  fontSize: theme.typography.h1.fontSize,
  lineHeight: theme.typography.h1.lineHeight,
  fontWeight: 'bold',
  animation: `${colorCycle} 3s ease-in-out infinite`,
}));

const Home: React.FC = () => {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    setVisible(true);
  }, []);

  return (
    <Box
      sx={{
        pt: { xs: 6, sm: 8 },
        pb: 4,
        px: 2,
        minHeight: 'calc(100vh - 64px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Container maxWidth="lg" sx={{ textAlign: 'center' }}>
        <Fade in={visible} timeout={1000}>
          {/* component="h1" for semantics; size is forced by styled() */}
          <AnimatedTitle gutterBottom>
            Welcome to NEKTAR
          </AnimatedTitle>
        </Fade>

        <Typography
          variant="h5"
          color="text.secondary"
          sx={{ fontWeight: 400, mt: 2 }}
        >
          Visualize and build your network topologies intuitively.
        </Typography>
      </Container>
    </Box>
  );
};

export default Home;
