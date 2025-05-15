// src/components/TextEditor.tsx
import React from 'react';
import Editor from 'react-simple-code-editor';
import Prism from 'prismjs';
import '../utils/myDsl';                // Custom PrismJS language definition
import 'prismjs/themes/prism-tomorrow.css'; // Base Prism theme
import '../assets/DslStyles.css';       // DSL token color overrides
import { appleGray } from '../theme';    // Theme grayscale colors

interface TextEditorProps {
  value: string;
  onChange: (val: string) => void;
}

const TextEditor: React.FC<TextEditorProps> = ({ value, onChange }) => {
  // Code font settings
  const codeFontFamily = '"SF Mono", "Menlo", "Monaco", "Consolas", "Courier New", monospace';
  const codeFontSize = 14;            // px
  const codeLineHeight = '1.5em';     // matches typical editor line height

  // Split lines for gutter
  const lines = value.split('\n');

  return (
    <div
      style={{
        display: 'flex',
        height: '100%',
        width: '100%',
        overflow: 'auto',      // single scroll container
        fontFamily: codeFontFamily,
        fontSize: codeFontSize,
        lineHeight: codeLineHeight,
      }}
    >
      {/* Line number gutter */}
      <div
        style={{
          padding: '16px 8px',
          textAlign: 'right',
          userSelect: 'none',
          color: appleGray[500],
          flexShrink: 0,
        }}
      >
        {lines.map((_, i) => (
          <div key={i}>{i + 1}</div>
        ))}
      </div>

      {/* Editor area */}
      <div style={{ flexGrow: 1 }}>
        <Editor
          value={value}
          onValueChange={onChange}
          highlight={(code) => {
            if (Prism.languages['my-dsl']) {
              return Prism.highlight(code, Prism.languages['my-dsl'], 'my-dsl');
            }
            return code;
          }}
          padding={16}
          style={{
            fontFamily: codeFontFamily,
            fontSize: codeFontSize,
            lineHeight: codeLineHeight,
            color: appleGray[100],
            background: 'none',    // parent Box provides background
            border: 'none',
            outline: 'none',
            whiteSpace: 'pre',
            minHeight: '100%',
          }}
          textareaClassName="editor-textarea"
          aria-label="DSL Code Editor"
        />
      </div>
    </div>
  );
};

export default TextEditor;
