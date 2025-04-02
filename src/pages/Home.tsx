// src/pages/Home.tsx
import React from 'react';
import { Container, Typography } from '@mui/material';

const Home: React.FC = () => {
  return (
    <Container maxWidth="md" sx={{ marginTop: '2rem' }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Home Page
      </Typography>
      <Typography variant="body1">
        Welcome to the home page!
      </Typography>
    </Container>
  );
};

export default Home;
