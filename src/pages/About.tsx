// src/pages/About.tsx
import React from 'react';
import { Container, Typography, Box } from '@mui/material';

const About: React.FC = () => {
  return (
    // Use Box for padding respecting AppBar height (adjust pt if needed)
    <Box sx={{ pt: 4, pb: 4, px: 2, minHeight: 'calc(100vh - 64px)' }}> {/* Ensure background and height */}
      <Container maxWidth="md"> {/* Keep content constrained */}
        <Typography variant="h4" component="h1" gutterBottom color="text.primary">
          About Us
        </Typography>
        <Typography variant="body1" color="text.secondary">
          This application, NEKTAR, allows you to visualize and interact with network topologies defined by a custom DSL or decoded from PKA files.
        </Typography>
        {/* Add more content about the project here */}
      </Container>
    </Box>
  );
};

export default About;