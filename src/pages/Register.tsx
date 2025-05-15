import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { TextField, Button, Box, Typography } from '@mui/material';

export default function Register() {
  const { register } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string| null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await register(email, password);
    } catch (e: any) {
      setError(e.response?.data?.msg || 'Register failed');
    }
  };

  return (
    <Box
  maxWidth={400}
  mx="auto"
  mt={8}
  sx={{ 
    borderRadius: '16px',                  
    p: 4,                                  
    backdropFilter: 'blur(10px)',          
    color: '#fff',                         
  }}
>
  <Typography variant="h5" mb={2}>
    Register
  </Typography>

  <form onSubmit={handleSubmit}>
    <TextField
      fullWidth
      label="Email"
      value={email}
      onChange={e => setEmail(e.target.value)}
      margin="normal"
      variant="outlined"
      InputLabelProps={{ style: { color: '#fff' } }}
      InputProps={{ style: { color: '#fff' } }}
      sx={{
        '& .MuiOutlinedInput-root': {
          '& fieldset': { borderColor: '#fff' },
          '&:hover fieldset': { borderColor: '#fff' },
          '&.Mui-focused fieldset': { borderColor: '#fff' },
        },
      }}
    />

    <TextField
      fullWidth
      label="Password"
      type="password"
      value={password}
      onChange={e => setPassword(e.target.value)}
      margin="normal"
      variant="outlined"
      InputLabelProps={{ style: { color: '#fff' } }}
      InputProps={{ style: { color: '#fff' } }}
      sx={{
        '& .MuiOutlinedInput-root': {
          '& fieldset': { borderColor: '#fff' },
          '&:hover fieldset': { borderColor: '#fff' },
          '&.Mui-focused fieldset': { borderColor: '#fff' },
        },
      }}
    />

    {error && (
      <Typography color="error" mt={1}>
        {error}
      </Typography>
    )}

    <Button
      type="submit"
      variant="contained"
      fullWidth
      sx={{
        mt: 2,
        color: '#fff',
        backgroundColor: 'rgba(255,255,255,0.25)',
        '&:hover': { backgroundColor: 'rgba(255,255,255,0.35)' },
      }}
    >
      Sign Up
    </Button>
  </form>
</Box>
  );
}
