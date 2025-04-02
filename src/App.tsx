// src/App.tsx
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import About from './pages/About';
import BuildYourNetwork from './pages/BuildYourNetwork';
import 'reactflow/dist/style.css';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/build-your-network" element={<BuildYourNetwork />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;