// src/pages/About.tsx
import React from 'react';
import { Container, Typography } from '@mui/material';

const About: React.FC = () => {
  return (
    <Container maxWidth="md" sx={{ marginTop: '2rem' }}>
      <Typography variant="h4" component="h1" gutterBottom>
        About Us
      </Typography>
      <Typography variant="body1">
        This is the about page.
      </Typography>
    </Container>
  );
};

export default About;
