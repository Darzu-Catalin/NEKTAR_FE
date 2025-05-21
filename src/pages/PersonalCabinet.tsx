// src/pages/PersonalCabinet.tsx
import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  CircularProgress,
  Alert,
  Button,
  Paper
} from '@mui/material';
import { DeleteOutline as DeleteIcon, Launch as LaunchIcon } from '@mui/icons-material';
import api from '../api'; // Your global axios instance
import { useAuth } from '../contexts/AuthContext'; // To ensure user is available

interface Snippet {
  id: number;
  title: string;
  content: string; // JSON string: { dsl: string, reactFlow: any }
  created_at: string;
}

const PersonalCabinet: React.FC = () => {
  const [snippets, setSnippets] = useState<Snippet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { user } = useAuth(); // Get user to ensure operations are for logged-in user

  const fetchSnippets = useCallback(async () => {
    if (!user) {
        setError("User not authenticated.");
        setLoading(false);
        return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/snippets');
      setSnippets(response.data.sort((a: Snippet, b: Snippet) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
    } catch (err: any) {
      console.error("Error fetching snippets:", err);
      setError(err.response?.data?.msg || err.message || 'Could not load your saved topologies.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchSnippets();
  }, [fetchSnippets]);

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this topology?')) {
      return;
    }
    setLoading(true);
    try {
      await api.delete(`/snippets/${id}`);
      setSnippets((prevSnippets) => prevSnippets.filter((s) => s.id !== id));
      // alert('Topology deleted successfully.'); // Optional: or rely on UI update
    } catch (err: any) {
      console.error("Error deleting snippet:", err);
      setError(err.response?.data?.msg || err.message || 'Could not delete the topology.');
      // alert(`Error: ${err.response?.data?.msg || err.message || 'Could not delete the topology.'}`);
    } finally {
      // Refetch or just update UI locally. For now, local update is fine.
      // await fetchSnippets(); // To ensure list is fresh from server after delete
      setLoading(false);
    }
  };

  const handleLoad = (snippet: Snippet) => {
    try {
      const parsedContent = JSON.parse(snippet.content);
      if (parsedContent.dsl !== undefined && parsedContent.reactFlow) { // Check dsl can be empty string
        navigate('/build-your-network', {
          state: {
            loadedDsl: parsedContent.dsl,
            loadedReactFlow: parsedContent.reactFlow,
            loadedTitle: snippet.title,
          },
        });
      } else {
        const errorMessage = 'Selected topology data is corrupted or in an incompatible format.';
        setError(errorMessage);
        alert(`Error: ${errorMessage} Cannot load.`);
      }
    } catch (e) {
      console.error('Error parsing snippet content:', e);
      const errorMessage = 'Failed to parse topology data.';
      setError(errorMessage);
      alert(`Error: ${errorMessage} Cannot load.`);
    }
  };

  if (loading && snippets.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 128px)', color: '#fff' }}>
        <CircularProgress sx={{color: '#007AFF'}} />
      </Box>
    );
  }

  return (
    <Container maxWidth="md" sx={{ pt: {xs: 6, sm: 8}, pb: 4, px:2, minHeight: 'calc(100vh - 64px)'}}>
        <Paper sx={{ p: 3, backgroundColor: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(10px)', borderRadius: '16px', color: '#fff' }}>
            <Typography variant="h4" component="h1" gutterBottom sx={{ textAlign: 'center', mb: 3, color: '#fff' }}>
                My Saved Topologies
            </Typography>

            {error && (
                <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2, backgroundColor: 'rgba(255,59,48,0.7)', color: '#fff' }}>
                    {error}
                </Alert>
            )}

            {loading && snippets.length > 0 && <CircularProgress size={24} sx={{ display: 'block', margin: '0 auto 16px auto', color: '#007AFF'}}/>}

            {!loading && snippets.length === 0 && (
                <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.7)', textAlign: 'center', mt: 3, mb: 3 }}>
                    You haven't saved any topologies yet.
                </Typography>
            )}

            {snippets.length > 0 && (
                <List>
                    {snippets.map((snippet) => (
                        <ListItem
                            key={snippet.id}
                            sx={{
                                backgroundColor: 'rgba(255,255,255,0.05)',
                                backdropFilter: 'blur(5px)',
                                borderRadius: 2,
                                mb: 1.5,
                                '&:hover': {
                                    backgroundColor: 'rgba(255,255,255,0.1)',
                                },
                                transition: 'background-color 0.2s ease-in-out',
                                p: 2,
                            }}
                        >
                            <ListItemText
                                primary={<Typography variant="h6" sx={{color: '#fff'}}>{snippet.title}</Typography>}
                                secondary={`Saved: ${new Date(snippet.created_at).toLocaleDateString()} ${new Date(snippet.created_at).toLocaleTimeString()}`}
                                secondaryTypographyProps={{color: 'rgba(255,255,255,0.5)'}}
                            />
                            <ListItemSecondaryAction>
                                <IconButton
                                    edge="end"
                                    aria-label="load"
                                    onClick={() => handleLoad(snippet)}
                                    sx={{ color: '#007AFF', '&:hover': { color: '#58aeff' } }}
                                    title="Load Topology"
                                >
                                    <LaunchIcon />
                                </IconButton>
                                <IconButton
                                    edge="end"
                                    aria-label="delete"
                                    onClick={() => handleDelete(snippet.id)}
                                    sx={{ color: '#FF3B30', '&:hover': { color: '#ff6c64' }, ml:1 }}
                                    title="Delete Topology"
                                    disabled={loading && snippets.length > 0} // Disable delete while another operation might be in progress
                                >
                                    <DeleteIcon />
                                </IconButton>
                            </ListItemSecondaryAction>
                        </ListItem>
                    ))}
                </List>
            )}
             <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
                <Button
                    variant="contained"
                    onClick={() => navigate('/build-your-network')}
                    sx={{
                        color: '#fff',
                        backgroundColor: 'rgba(0,122,255,0.7)', // appleBlue with transparency
                        '&:hover': { backgroundColor: 'rgba(0,122,255,0.9)' },
                        p: '10px 20px',
                        fontSize: '1rem'
                    }}
                >
                    Create New Network
                </Button>
            </Box>
        </Paper>
    </Container>
  );
};

export default PersonalCabinet;