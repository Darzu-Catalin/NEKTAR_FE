// src/pages/BuildYourNetwork.tsx
import React, { useState, useCallback } from 'react';
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
import theme, { appleGray } from '../theme';

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
            const base64File = await toBase64(file);
            const decodeResponse = await fetch(
                'https://1nlsyfjbcb.execute-api.eu-south-1.amazonaws.com/default/pka2xml',
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ file: base64File.split(',')[1], action: 'decode' }),
                }
            );

            if (!decodeResponse.ok) {
                 const errorText = await decodeResponse.text();
                 throw new Error(`Decode failed: ${decodeResponse.status} ${errorText || decodeResponse.statusText}`);
            }

            const responseText = await decodeResponse.text();

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

            const token = localStorage.getItem("token");

            const convertResponse = await fetch('http://127.0.0.1:5000/api/decode', {
                method: 'POST',
                body: formData,
                headers: {
                  Authorization: `Bearer ${token}`,
                }
            });

            if (!convertResponse.ok) {
                let errData;
                try {
                    errData = await convertResponse.json();
                } catch (e) {
                     errData = { error: await convertResponse.text() || 'Conversion failed without specific error.' };
                }
                throw new Error(errData.error || `Conversion failed: ${convertResponse.status}`);
            }

            const resultJson = await convertResponse.json();

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
            console.error('Error during decode/convert:', err);
            setError(`Error: ${err.message || String(err)}`);
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
            const token = localStorage.getItem("token");
            const response = await fetch('http://127.0.0.1:5000/api/compile', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json',
                  Authorization: `Bearer ${token}`,
                 },
                body: JSON.stringify({ dsl: dslContent }),
            });

            if (!response.ok) {
                const errorMsg = await response.text();
                throw new Error(errorMsg || `Compile failed: ${response.status}`);
            }
            const resultJson = await response.json();

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
            console.error('Error compiling DSL:', err);
            setError(`Error: ${err.message || String(err)}`);
        } finally {
            setLoading(false);
        }
    }, [dslContent]);

    const handleOpenSaveDialog = () => {
      setOpenSaveDialog(true);
      setSaveTitle('');
    };

    const handleCloseSaveDialog = () => {
      setOpenSaveDialog(false);
    };

    // REVISED: Function to save the current React Flow topology to the backend
    const handleSaveTopology = useCallback(async () => {
      if (!saveTitle.trim()) {
        setError('A title is required to save the topology.');
        return;
      }
      if (!dslContent.trim()) { // Check if there's DSL to compile and save
        setError('No DSL content to save. Please write some DSL or decode a file first.');
        return;
      }

      setLoading(true);
      setError('');

      try {
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("Authentication token not found. Please log in.");
        }

        // 1. Compile the current DSL content to get the latest React Flow JSON
        const compileResponse = await fetch('http://127.0.0.1:5000/api/compile', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ dsl: dslContent }),
        });

        if (!compileResponse.ok) {
            const errorData = await compileResponse.json();
            throw new Error(errorData.error || `Failed to compile DSL for saving: ${compileResponse.status}`);
        }

        const compileResultJson = await compileResponse.json();

        if (!compileResultJson || !compileResultJson.react_flow) {
            throw new Error("Compilation result is missing expected data (react_flow).");
        }

        const reactFlowTopologyToSave = compileResultJson.react_flow;

        // 2. Save the compiled React Flow JSON to the snippets
        const saveResponse = await fetch('http://127.0.0.1:5000/api/snippets', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            title: saveTitle,
            content: JSON.stringify(reactFlowTopologyToSave),
          }),
        });

        if (!saveResponse.ok) {
          const errorData = await saveResponse.json();
          throw new Error(errorData.msg || `Failed to save topology: ${saveResponse.status}`);
        }

        alert('Topology saved successfully!');
        handleCloseSaveDialog();
      } catch (err: any) {
        console.error('Error saving topology:', err);
        setError(`Error saving topology: ${err.message || String(err)}`);
      } finally {
        setLoading(false);
      }
    }, [saveTitle, dslContent]); // Dependency now includes dslContent

  return (
    <Container
      maxWidth={false}
      disableGutters
      sx={{
        height: '80vh',
        width: '90vw',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'black',
        borderRadius: 1,
      }}
    >
      {/* Header Toolbar Area */}
      <Box
        sx={{
          padding: '12px 16px',
          bgcolor: 'black',
          borderBottom: `1px solid ${theme.palette.divider}`,
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          flexShrink: 0,
        }}
      >
        <Upload
          accept=".pkt"
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
           >
             Select PKT File
          </Button>
        </Upload>

        {fileName && !loading && (
            <Typography variant="body2" sx={{ color: 'text.secondary', mr: 'auto' }}>
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
          sx={{ ml: 1 }}
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
            sx={{ ml: 1 }}
          >
            Compile DSL
          </Button>
        )}

        {/* REVISED: Save Topology Button disabled condition */}
        <Button
          variant="contained"
          color="secondary"
          onClick={handleOpenSaveDialog}
          disabled={loading || !dslContent.trim()} // Disabled if no DSL content
          size="small"
          sx={{ ml: 1 }}
        >
          Save Topology
        </Button>


        {loading && <CircularProgress size={20} sx={{ ml: 2 }} />}
      </Box>

       {/* Error Alert Area */}
       {error && (
         <Box sx={{ px: 2, pt: 1, flexShrink: 0 }}>
            <Alert severity="error" onClose={() => setError('')}>
            {error}
            </Alert>
         </Box>
       )}

      {/* Splitter takes remaining space */}
      <Box sx={{ flexGrow: 1, overflow: 'hidden', borderTop: `1px solid ${theme.palette.divider}`, position: 'relative' }}>
          <Splitter
             style={{
                 height: '100%',
                 width: '100%',
                 position: 'absolute',
             }}
          >
             <Splitter.Panel defaultSize="40%" min="20%" max="60%">
                <Box sx={{ height: '100%', width: '100%', bgcolor: appleGray[800], overflow: 'hidden', borderRadius: 1 }}>
                    <TextEditor value={dslContent} onChange={setDslContent} />
                </Box>
             </Splitter.Panel>
             <Splitter.Panel>
                <Box sx={{ height: '100%', width: '100%', bgcolor: appleGray[100], overflow: 'hidden' }}>
                     <Visualization devices={parsedDevices} links={parsedLinks} />
                </Box>
             </Splitter.Panel>
          </Splitter>
       </Box>

        {/* Material-UI Dialog for Save Topology */}
        <Dialog open={openSaveDialog} onClose={handleCloseSaveDialog}>
          <DialogTitle>Save Current Topology</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Please enter a title for your React Flow topology. This will help you identify it later in your cabinet.
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
              helperText={error.includes('title is required') ? error : ''}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseSaveDialog}>Cancel</Button>
            <Button onClick={handleSaveTopology} disabled={loading || !saveTitle.trim()}>Save</Button>
          </DialogActions>
        </Dialog>
    </Container>
  );
};

export default BuildYourNetwork;