import React, { useState } from 'react';
import { Container, Typography, Button, CircularProgress, Box } from '@mui/material';
import { Splitter } from 'antd';
import TextEditor from '../components/TextEditor';
import Visualization from '../components/Visualization';
import pako from 'pako';

// Helper function to convert a file to Base64
const toBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (err) => reject(err);
  });

// Helper function to convert a base64 string to a Blob
const b64toBlob = (base64: string, type = 'application/octet-stream'): Promise<Blob> => {
  return fetch(`data:${type};base64,${base64}`).then((res) => res.blob());
};

// Define interfaces for devices and links
export interface DraggableImage {
  id: number;
  name: string;
  src: string;
  x: number;
  y: number;
}

export interface Link {
  from: number;
  to: number;
}

const BuildYourNetwork: React.FC = () => {
  const [dslContent, setDslContent] = useState<string>(''); // DSL text for TextEditor
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [parsedDevices, setParsedDevices] = useState<DraggableImage[]>([]); // For Visualization
  const [parsedLinks, setParsedLinks] = useState<Link[]>([]); // For Visualization

  // File input change handler
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  // Decode and convert file
  const handleDecodeAndConvert = async () => {
    if (!file) return;
    setLoading(true);
    setError('');
    try {
      const base64File = await toBase64(file);
      const decodeResponse = await fetch(
        'https://1nlsyfjbcb.execute-api.eu-south-1.amazonaws.com/default/pka2xml',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ file: base64File, action: 'decode' }),
        }
      );
      const responseText = await decodeResponse.text();
      const blob = await b64toBlob(responseText);
      const arrayBuffer = await blob.arrayBuffer();
      const data = pako.inflate(new Uint8Array(arrayBuffer));
      const xmlStr = new TextDecoder('utf-8').decode(data);
      const xmlBlob = new Blob([xmlStr], { type: 'application/xml' });
      const formData = new FormData();
      formData.append('file', xmlBlob, 'input.xml');

      const convertResponse = await fetch('http://127.0.0.1:5000/convert', {
        method: 'POST',
        body: formData,
      });
      if (!convertResponse.ok) {
        const errData = await convertResponse.json();
        throw new Error(errData.error || 'Conversion failed');
      }
      const resultJson = await convertResponse.json();

      // Set DSL text for TextEditor
      setDslContent(resultJson.dsl);

      // Set devices and links for Visualization from React Flow JSON
      setParsedDevices(
        resultJson.react_flow.nodes.map((node: any) => ({
          id: parseInt(node.id),
          name: node.data.label,
          src: node.data.src,
          x: node.position.x,
          y: node.position.y,
        }))
      );
      setParsedLinks(
        resultJson.react_flow.edges.map((edge: any) => ({
          from: parseInt(edge.source),
          to: parseInt(edge.target),
        }))
      );
    } catch (err: any) {
      console.error('Error during decode/convert:', err);
      setError(`Error: ${err.message || err}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container
      maxWidth={false}
      disableGutters
      sx={{
        backgroundColor: '#424242', // changed from black to dark gray
        padding: '8px',
        boxSizing: 'border-box',
        maxHeight: '100vh',
        overflow: 'hidden',
      }}
    >
      {/* Header with file input and button */}
      <Box sx={{ padding: '8px', height: '64px', backgroundColor: '#616161' }}>
        <input type="file" onChange={handleFileChange} />
        <Button
          variant="contained"
          onClick={handleDecodeAndConvert}
          disabled={!file || loading}
          sx={{ marginLeft: '1rem' }}
        >
          Decode and Convert File
        </Button>
        {loading && <CircularProgress size={24} sx={{ marginLeft: '1rem' }} />}
        {error && (
          <Typography color="error" sx={{ marginTop: '0.5rem' }}>
            {error}
          </Typography>
        )}
      </Box>
      {/* Splitter takes the remaining height */}
      <Splitter
        style={{
          height: 'calc(100vh - 128px - 50px)', // subtract header height + padding
          width: '100%',
          backgroundColor: '#616161', // changed from black to dark gray
        }}
      >
        <Splitter.Panel defaultSize="40%" min="20%" max="50%">
          <TextEditor value={dslContent} onChange={setDslContent} />
        </Splitter.Panel>
        <Splitter.Panel>
          <Visualization devices={parsedDevices} links={parsedLinks} />
        </Splitter.Panel>
      </Splitter>
    </Container>
  );
};

export default BuildYourNetwork;
