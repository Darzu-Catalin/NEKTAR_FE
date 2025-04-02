// src/index.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import reportWebVitals from './reportWebVitals';
import 'reactflow/dist/style.css';

// Debounce ResizeObserver
const debounce = (fn: (...args: any[]) => void, ms: number) => {
  let timeout: NodeJS.Timeout;
  return (...args: any[]) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), ms);
  };
};

const OriginalResizeObserver = window.ResizeObserver;
window.ResizeObserver = class DebouncedResizeObserver extends OriginalResizeObserver {
  constructor(callback: ResizeObserverCallback) {
    super(debounce(callback, 100)); // Debounce by 100ms
  }
};

const container = document.getElementById('root');
if (!container) {
  throw new Error("Root container with id 'root' not found.");
}

const root = ReactDOM.createRoot(container);
root.render(

    <App />

);

reportWebVitals();