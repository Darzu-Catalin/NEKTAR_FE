import React from 'react';
import { Input } from 'antd';

const { TextArea } = Input;

interface TextEditorProps {
  value: string;
  onChange: (val: string) => void;
}

const TextEditor: React.FC<TextEditorProps> = ({ value, onChange }) => {
  return (
    <>
      <div
        style={{
          width: '100%',
          height: '100%',
          padding: 8,
          boxSizing: 'border-box',
          background: '#1e1e1e',
        }}
      >
        <TextArea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="DSL content will appear here..."
          style={{
            width: '100%',
            height: '100%',
            resize: 'none',
            fontFamily: 'Poppins, sans-serif',
            background: '#1e1e1e',
            color: 'white',
            border: '1px solid gray',
            outline: 'none',
          }}
        />
      </div>
      <style>
        {`
          .ant-input::placeholder {
            color: white !important;
            opacity: 1;
            font-family: 'Poppins', sans-serif;
          }
        `}
      </style>
    </>
  );
};

export default TextEditor;