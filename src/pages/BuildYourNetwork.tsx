// src/pages/BuildYourNetwork.tsx
import React, { useState, useCallback } from 'react';
// Added alpha for glassmorphism effect
import { Container, Typography, Button, CircularProgress, Box, Alert, alpha } from '@mui/material';
import { Splitter, Upload } from 'antd';
import type { UploadChangeParam } from 'antd/es/upload';
import { UploadOutlined } from '@ant-design/icons';
import TextEditor from '../components/TextEditor';
import Visualization from '../components/Visualization';
import pako from 'pako';
import { DraggableImage, Link } from '../types';
import theme, { appleGray } from '../theme'; // Keep theme import

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

  // AntD Upload onChange handler
  const handleFileChange = (info: UploadChangeParam) => {
      // Reset error on new file selection
      setError('');
      if (info.fileList.length > 0) {
         // Get the most recent file object
         const currentFile = info.fileList[info.fileList.length - 1].originFileObj as File;
         if (currentFile) {
            setFile(currentFile);
            setFileName(currentFile.name);
         } else {
             // Handle case where originFileObj might be undefined (e.g., upload error)
             setFile(null);
             setFileName('');
             setError('Could not read the selected file.');
         }
      } else {
         // File removed
         setFile(null);
         setFileName('');
      }
  };

    // Decode & convert a PK* file
    const handleDecodeAndConvert = useCallback(async () => {
        if (!file) return;
        setLoading(true);
        setError('');
        setParsedDevices([]); // Clear previous visualization
        setParsedLinks([]);
        setDslContent(''); // Clear previous DSL

        try {
            // 1) Convert file -> base64
            const base64File = await toBase64(file);

            // 2) Decode route (AWS Lambda)
            const decodeResponse = await fetch(
                'https://1nlsyfjbcb.execute-api.eu-south-1.amazonaws.com/default/pka2xml',
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ file: base64File.split(',')[1], action: 'decode' }), // Send only base64 part
                }
            );

            if (!decodeResponse.ok) {
                 const errorText = await decodeResponse.text();
                 throw new Error(`Decode failed: ${decodeResponse.status} ${errorText || decodeResponse.statusText}`);
            }

            const responseText = await decodeResponse.text();

             // Check if response text is valid base64 before proceeding
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

            // 3) Convert route (Local Flask Backend)
            const formData = new FormData();
            formData.append('file', xmlBlob, 'input.xml');

            const token = localStorage.getItem("token");

            const convertResponse = await fetch('http://127.0.0.1:5000/api/convert', {
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

            // 4) Use the result JSON
            const resultJson = await convertResponse.json();

            if (!resultJson || !resultJson.dsl || !resultJson.react_flow) {
                throw new Error("Conversion result is missing expected data (dsl or react_flow).");
            }

            setDslContent(resultJson.dsl || ''); // Ensure dslContent is always a string

            // Safely map nodes and edges
            const nodes = resultJson.react_flow.nodes || [];
            const edges = resultJson.react_flow.edges || [];

            setParsedDevices(
                nodes.map((node: any) => ({
                    id: parseInt(node?.id ?? '0', 10),
                    name: node?.data?.label ?? 'Unknown',
                    src: node?.data?.src ?? '', // Provide default image path if needed
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
            // Clear results on error
            setParsedDevices([]);
            setParsedLinks([]);
            setDslContent('');
        } finally {
            setLoading(false);
        }
    }, [file]); // Dependency: file state

    // Compile DSL -> Ask BE for JSON
    const handleCompileDsl = useCallback(async () => {
        if (!dslContent.trim()) return;
        setLoading(true);
        setError('');
        try {
            const token = localStorage.getItem("token");
            const response = await fetch('http://127.0.0.1:5000/reactflow', {
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

            // Safely map nodes and edges
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
             // Optionally clear visualization on compile error
             // setParsedDevices([]);
             // setParsedLinks([]);
        } finally {
            setLoading(false);
        }
    }, [dslContent]); // Dependency: dslContent state


  return (
    <Container
      maxWidth={false}
      disableGutters
      sx={{
        height: '80vh', // Adjust based on actual AppBar height (e.g., 64px)
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
          accept=".pkt" // Specify accepted file types
          beforeUpload={() => false} // Prevent auto-upload, handle in onChange
          onChange={handleFileChange}
          showUploadList={false}
          maxCount={1}
        >
          {/* Use MUI Button as the trigger */}
          <Button
              variant="outlined" // Use outlined for this action
              startIcon={<UploadOutlined />}
              size="small"
              disabled={loading} // Disable while loading
           >
             Select PKT File
          </Button>
        </Upload>

        {fileName && !loading && (
            <Typography variant="body2" sx={{ color: 'text.secondary', mr: 'auto' /* Push following elements right */ }}>
                {fileName}
            </Typography>
        )}
         {/* Spacer to push actions to the right if no filename */}
         {!fileName && !loading && <Box sx={{ flexGrow: 1 }}/>}

        <Button
          variant="contained"
          color="primary"
          onClick={handleDecodeAndConvert}
          disabled={!file || loading}
          size="small"
          sx={{ ml: 1 }} // Add margin if needed
        >
          Decode & Convert
        </Button>

        {/* Show compile button only if there's DSL content */}
        {dslContent.trim().length > 0 && (
          <Button
            variant="contained" // Keep as primary action? Or outlined?
            color="primary"
            onClick={handleCompileDsl}
            disabled={loading || !dslContent.trim()}
            size="small"
            sx={{ ml: 1 }}
          >
            Compile DSL
          </Button>
        )}

        {loading && <CircularProgress size={20} sx={{ ml: 2 }} />}
      </Box>

       {/* Error Alert Area */}
       {error && (
         <Box sx={{ px: 2, pt: 1, flexShrink: 0 }}> {/* Confine Alert */}
            <Alert severity="error" onClose={() => setError('')}>
            {error}
            </Alert>
         </Box>
       )}

      {/* Splitter takes remaining space */}
      <Box sx={{ flexGrow: 1, overflow: 'hidden', borderTop: `1px solid ${theme.palette.divider}`, position: 'relative' /* Needed for Splitter positioning */ }}>
          {/* Check AntD Splitter documentation for best styling practices */}
          {/* You might need CSS overrides for `.ant-splitter-handle` */}
          <Splitter
             style={{
                 height: '100%',
                 width: '100%',
                 position: 'absolute', // Fill parent Box
                 // Example handle style (use CSS for better control)
                 // '--ant-splitter-handle-bg': appleGray[200]
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
    </Container>
  );
};

export default BuildYourNetwork;