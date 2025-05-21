// src/pages/BuildYourNetwork.tsx
import React, { useState, useCallback, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
// Added alpha for glassmorphism effect
import {
  Container,
  Typography,
  Button,
  CircularProgress,
  Box,
  Alert,
  alpha,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
} from '@mui/material';
import { Splitter, Upload } from 'antd';
import type { UploadChangeParam } from 'antd/es/upload';
import { UploadOutlined } from '@ant-design/icons';
import TextEditor from '../components/TextEditor';
import Visualization from '../components/Visualization';
import pako from 'pako';
import { DraggableImage, Link } from '../types';
import theme, { appleGray, appleWhite } from '../theme'; // Ensure appleWhite is exported or use a direct value
import api from '../api'; // Ensure your api instance is imported

// Helper: file -> Base64
const toBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (err) => reject(err);
  });

// Helper: base64 -> Blob
const b64toBlob = (base64: string, type = 'application/octet-stream'): Promise<Blob> => {
  return fetch(`data:${type};base64,${base64}`).then((res) => res.blob());
};

// Add this interface
interface TopologyLocationState {
  loadedDsl?: string;
  loadedReactFlow?: any;
  loadedTitle?: string;
}
const BuildYourNetwork: React.FC = () => {
  const [dslContent, setDslContent] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string>('');

  const [parsedDevices, setParsedDevices] = useState<DraggableImage[]>([]);
  const [parsedLinks, setParsedLinks] = useState<Link[]>([]);

  // Removed: currentReactFlowJson state is no longer needed for saving

  const [openSaveDialog, setOpenSaveDialog] = useState(false);
  const [saveTitle, setSaveTitle] = useState('');

  // Add these hooks
  const location = useLocation();
  const navigate = useNavigate();

  // Add this useEffect
  useEffect(() => {
    const state = location.state as TopologyLocationState | null;
    if (state?.loadedDsl !== undefined && state?.loadedReactFlow) {
      setDslContent(state.loadedDsl);
      setSaveTitle(state.loadedTitle || file?.name || 'Loaded Topology'); // Pre-fill save title

      const nodes = state.loadedReactFlow.nodes || [];
      const edges = state.loadedReactFlow.edges || [];

      setParsedDevices(
        nodes.map((node: any) => ({
          id: parseInt(node?.id ?? '0', 10),
          name: node?.data?.label ?? 'Unknown',
          src: node?.data?.src ?? '',
          x: node?.position?.x ?? 0,
          y: node?.position?.y ?? 0,
          type: node?.data?.type ?? 'unknown',
          coordinates: node?.data?.coordinates ?? `${node?.position?.x ?? 0} ${node?.position?.y ?? 0}`,
          power_on: node?.data?.power_on ?? false,
          interface: node?.data?.interface ?? { name: 'N/A', ip: 'N/A', bandwidth: 0 },
        }))
      );
      setParsedLinks(edges.map((edge: any) => ({ from: parseInt(edge?.source ?? '0', 10), to: parseInt(edge?.target ?? '0', 10) })));
      navigate(location.pathname, { replace: true, state: null }); // Clear state after loading
    }
  }, [location, navigate, file?.name]); // Added file?.name to dependencies for saveTitle


  const handleFileChange = (info: UploadChangeParam) => {
      setError('');
      if (info.fileList.length > 0) {
         const currentFile = info.fileList[info.fileList.length - 1].originFileObj as File;
         if (currentFile) {
            setFile(currentFile);
            setFileName(currentFile.name);
         } else {
             setFile(null);
             setFileName('');
             setError('Could not read the selected file.');
         }
      } else {
         setFile(null);
         setFileName('');
      }
  };

    const handleDecodeAndConvert = useCallback(async () => {
        if (!file) return;
        setLoading(true);
        setError('');
        setParsedDevices([]);
        setParsedLinks([]);
        setDslContent('');

        try {
            const base64File = await toBase64(file); // This remains a local helper
            const decodeLambdaResponse = await fetch( // This is the external lambda call
                'https://1nlsyfjbcb.execute-api.eu-south-1.amazonaws.com/default/pka2xml',
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ file: base64File.split(',')[1], action: 'decode' }),
                }
            );

            if (!decodeLambdaResponse.ok) {
                 const errorText = await decodeLambdaResponse.text();
                 throw new Error(`Lambda decode failed: ${decodeLambdaResponse.status} ${errorText || decodeLambdaResponse.statusText}`);
            }

            const responseText = await decodeLambdaResponse.text();

            let blob: Blob;
            try {
                 blob = await b64toBlob(responseText);
            } catch (e) {
                console.error("Failed to create blob from base64 response:", responseText);
                throw new Error("Decode service returned invalid data.");
            }

            const arrayBuffer = await blob.arrayBuffer();
            const data = pako.inflate(new Uint8Array(arrayBuffer));
            const xmlStr = new TextDecoder('utf-8').decode(data);
            const xmlBlob = new Blob([xmlStr], { type: 'application/xml' });

            const formData = new FormData();
            formData.append('file', xmlBlob, 'input.xml');

            // Use your api instance for calls to your backend
            const convertResponse = await api.post('/decode', formData, {
                headers: {
                    // 'Content-Type': 'multipart/form-data' // Axios handles this for FormData
                },
            });
            const resultJson = convertResponse.data; // Axios wraps response in .data

            if (!resultJson || !resultJson.dsl || !resultJson.react_flow) {
                throw new Error("Conversion result is missing expected data (dsl or react_flow).");
            }

            setDslContent(resultJson.dsl || '');

            const nodes = resultJson.react_flow.nodes || [];
            const edges = resultJson.react_flow.edges || [];

            setParsedDevices(
                nodes.map((node: any) => ({
                    id: parseInt(node?.id ?? '0', 10),
                    name: node?.data?.label ?? 'Unknown',
                    src: node?.data?.src ?? '',
                    x: node?.position?.x ?? 0,
                    y: node?.position?.y ?? 0,
                    type: node?.data?.type ?? 'unknown',
                    coordinates: node?.data?.coordinates ?? `${node?.position?.x ?? 0} ${node?.position?.y ?? 0}`,
                    power_on: node?.data?.power_on ?? false,
                    interface: node?.data?.interface ?? { name: 'N/A', ip: 'N/A', bandwidth: 0 },
                }))
            );

            setParsedLinks(
                edges.map((edge: any) => ({
                    from: parseInt(edge?.source ?? '0', 10),
                    to: parseInt(edge?.target ?? '0', 10),
                }))
            );

        } catch (err: any) {
            console.error('Error during decode/convert:', err.response?.data || err.message || err);
            setError(`Error: ${err.response?.data?.error || err.message || String(err)}`);
            setParsedDevices([]);
            setParsedLinks([]);
            setDslContent('');
        } finally {
            setLoading(false);
        }
    }, [file]); 

    const handleCompileDsl = useCallback(async () => {
        if (!dslContent.trim()) return;
        setLoading(true);
        setError('');
        try {
            // Use your api instance
            const response = await api.post('/compile', { dsl: dslContent });
            const resultJson = response.data; // Axios wraps response in .data

             if (!resultJson || !resultJson.react_flow) {
                throw new Error("Compile result is missing expected data (react_flow).");
             }

            const nodes = resultJson.react_flow.nodes || [];
            const edges = resultJson.react_flow.edges || [];

            setParsedDevices(
                nodes.map((node: any) => ({
                    id: parseInt(node?.id ?? '0', 10),
                    name: node?.data?.label ?? 'Unknown',
                    src: node?.data?.src ?? '',
                    x: node?.position?.x ?? 0,
                    y: node?.position?.y ?? 0,
                    type: node?.data?.type ?? 'unknown',
                    coordinates: node?.data?.coordinates ?? `${node?.position?.x ?? 0} ${node?.position?.y ?? 0}`,
                    power_on: node?.data?.power_on ?? false,
                    interface: node?.data?.interface ?? { name: 'N/A', ip: 'N/A', bandwidth: 0 },
                }))
            );

            setParsedLinks(
                edges.map((edge: any) => ({
                    from: parseInt(edge?.source ?? '0', 10),
                    to: parseInt(edge?.target ?? '0', 10),
                }))
            );

        } catch (err: any) {
            console.error('Error compiling DSL:', err.response?.data || err.message || err);
            setError(`Error: ${err.response?.data?.error || err.message || String(err)}`);
        } finally {
            setLoading(false);
        }
    }, [dslContent]); 

    const handleOpenSaveDialog = () => {
      setOpenSaveDialog(true);
      // Do not clear saveTitle here if it might be pre-filled from a loaded topology
    };

    const handleCloseSaveDialog = () => {
      setOpenSaveDialog(false);
    };

    // MODIFIED: Function to save the current topology (DSL + React Flow) to the backend
    const handleSaveTopology = useCallback(async () => {
      if (!saveTitle.trim()) {
        setError('A title is required to save the topology.');
        return;
      }
      if (!dslContent.trim()) { // Check if there's DSL to compile and save
        setError('No DSL content to save. Please write some DSL or decode/load a file first.');
        return;
      }

      setLoading(true);
      setError('');

      try {
        const token = localStorage.getItem("token"); // Good to check if user is logged in client-side too
        if (!token) {
          throw new Error("Authentication token not found. Please log in.");
        }

        // 1. Compile the current DSL content to get the latest React Flow JSON
        // Use your api instance
        const compileResponse = await api.post('/compile', { dsl: dslContent });
        const compileResultJson = compileResponse.data; // Axios wraps response in .data

        if (!compileResultJson || !compileResultJson.react_flow) {
            throw new Error("Compilation result is missing expected data (react_flow).");
        }

        const reactFlowTopologyToSave = compileResultJson.react_flow;
        
        // MODIFICATION: Prepare content to save both DSL and React Flow
        const topologyDataToSave = {
            dsl: dslContent,
            reactFlow: reactFlowTopologyToSave,
        };

        // 2. Save the structured content to the snippets
        // Use your api instance
        const saveResponse = await api.post('/snippets', {
            title: saveTitle,
            content: JSON.stringify(topologyDataToSave), // Save the combined object as a string
        });

        // Backend returns 201 on successful snippet creation. Axios .data will have the response.
        if (saveResponse.status !== 201) { // Check for explicit 201
          const errorData = saveResponse.data;
          throw new Error(errorData.msg || `Failed to save topology: ${saveResponse.status} - ${JSON.stringify(errorData)}`);
        }

        alert('Topology saved successfully!');
        handleCloseSaveDialog();
      } catch (err: any) {
        console.error('Error saving topology:', err);
        setError(`Error saving topology: ${err.message || String(err)}`);
      } finally {
        setLoading(false);
      }
    }, [saveTitle, dslContent]); 

  return (
    <Container
      maxWidth={false}
      disableGutters
      sx={{
        height: 'calc(100vh - 64px - 40px)', // Adjust height considering Navbar and potential margins
        width: '95vw', // Match Navbar width for consistency
        margin: '20px auto', // Center it like Navbar
        display: 'flex',
        flexDirection: 'column',
        bgcolor: alpha(appleGray[800], 0.8), // Slightly transparent to see page background
        backdropFilter: 'blur(10px)',
        border: `1px solid ${alpha(appleGray[600], 0.5)}`,
        overflow: 'hidden', // Prevent content from spilling during resize
        color: appleWhite, // Ensure text inside is generally white
      }}
    >
      {/* Header Toolbar Area */}
      <Box
        sx={{
          padding: '12px 16px',
          bgcolor: alpha(appleGray[900], 0.7), // Darker, slightly transparent toolbar
          borderBottom: `1px solid ${alpha(appleGray[600], 0.5)}`,
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          flexShrink: 0,
        }}
      >
        <Upload
          accept=".pkt, .pka" // Allow .pka as well
          beforeUpload={() => false}
          onChange={handleFileChange}
          showUploadList={false}
          maxCount={1}
        >
          <Button
              variant="outlined"
              startIcon={<UploadOutlined />}
              size="small"
              disabled={loading}
              sx={{ color: appleWhite, borderColor: appleGray[500], '&:hover': { borderColor: theme.palette.primary.main } }}
           >
             Select PKT/PKA File
          </Button>
        </Upload>

        {fileName && !loading && (
            <Typography variant="body2" sx={{ color: appleGray[300], mr: 'auto' }}>
                {fileName}
            </Typography>
        )}
         {!fileName && !loading && <Box sx={{ flexGrow: 1 }}/>}

        <Button
          variant="contained"
          color="primary"
          onClick={handleDecodeAndConvert}
          disabled={!file || loading}
          size="small"
        >
          Decode & Convert
        </Button>

        {dslContent.trim().length > 0 && (
          <Button
            variant="contained"
            color="primary"
            onClick={handleCompileDsl}
            disabled={loading || !dslContent.trim()}
            size="small"
          >
            Compile DSL
          </Button>
        )}

        {/* REVISED: Save Topology Button disabled condition */}
        <Button
          variant="contained"
          onClick={handleOpenSaveDialog} // Removed color="secondary" to let theme primary apply or explicit sx
          disabled={loading || !dslContent.trim()} // Disabled if no DSL content
          size="small"
          sx={{ 
            ml: 1, 
            backgroundColor: theme.palette.primary.main, // Explicitly use primary color
            '&:hover': { backgroundColor: theme.palette.primary.dark } 
          }}
        >
          Save Topology
        </Button>


        {loading && <CircularProgress size={20} sx={{ ml: 2, color: theme.palette.primary.main }} />}
      </Box>

       {/* Error Alert Area */}
       {error && (
         <Box sx={{ px: 2, py:1, flexShrink: 0 }}> {/* Adjusted padding */}
            <Alert 
                severity="error" 
                onClose={() => setError('')}
                sx={{
                    bgcolor: alpha(theme.palette.error.dark, 0.9), // Use theme error color
                    color: appleWhite, // Keep text white for contrast
                    '.MuiAlert-icon': { color: appleWhite },
                    '.MuiAlert-action button': { color: appleWhite } // For close button if shown
                }}
            >
            {error}
            </Alert>
         </Box>
       )}

      {/* Splitter takes remaining space */}
      <Box sx={{ flexGrow: 1, overflow: 'hidden', borderTop: `1px solid ${alpha(appleGray[600],0.3)}`, position: 'relative' }}>
          <Splitter
             style={{
                 height: '100%',
                 width: '100%',
                 position: 'absolute', // Ensure Splitter fills the Box
             }}
          >
             <Splitter.Panel // Antd specific component for splitter
                // defaultSize="40%" // Removed as it can cause issues with dynamic content
             >
                <Box sx={{ height: '100%', width: '100%', bgcolor: appleGray[800], overflow: 'hidden', borderRadius: '0 0 0 8px' }}>
                    <TextEditor value={dslContent} onChange={setDslContent} />
                </Box>
             </Splitter.Panel>
             <Splitter.Panel // Antd specific component for splitter
             >
                <Box sx={{ height: '100%', width: '100%', bgcolor: appleGray[900], overflow: 'hidden', borderRadius: '0 0 8px 0' }}> {/* Darker for visualization */}
                     <Visualization devices={parsedDevices} links={parsedLinks} />
                </Box>
             </Splitter.Panel>
          </Splitter>
       </Box>

        {/* Material-UI Dialog for Save Topology */}
        <Dialog 
            open={openSaveDialog} 
            onClose={handleCloseSaveDialog}
            PaperProps={{
                style: {
                    backgroundColor: appleGray[700], // Dark dialog background
                    color: appleWhite, // White text in dialog
                    borderRadius: theme.shape.borderRadius // Consistent rounding
                }
            }}
        >
          <DialogTitle sx={{color: appleWhite}}>Save Current Topology</DialogTitle>
          <DialogContent>
            <DialogContentText sx={{color: appleGray[300]}}>
              Please enter a title for your topology. This will help you identify it later in your cabinet.
            </DialogContentText>
            <TextField
              autoFocus
              margin="dense"
              id="title"
              label="Topology Title"
              type="text"
              fullWidth
              variant="standard"
              value={saveTitle}
              onChange={(e) => setSaveTitle(e.target.value)}
              error={!!error && error.includes('title is required')} 
              helperText={error.includes('title is required') ? 'Title is required.' : ''}
              InputLabelProps={{ style: { color: appleGray[200] } }}
              InputProps={{ style: { color: appleWhite } }}
              sx={{
                '& .MuiInput-underline:before': { borderBottomColor: appleGray[500] },
                '& .MuiInput-underline:hover:not(.Mui-disabled):before': { borderBottomColor: theme.palette.primary.main },
                '& .MuiInput-underline.Mui-error:after': { borderBottomColor: theme.palette.error.main },
             }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseSaveDialog} sx={{ color: appleGray[200] }}>Cancel</Button>
            <Button onClick={handleSaveTopology} disabled={loading || !saveTitle.trim()} sx={{ color: theme.palette.primary.main }}>Save</Button>
          </DialogActions>
        </Dialog>
    </Container>
  );
};

export default BuildYourNetwork;