import React, { useState } from 'react';
import { motion } from 'framer-motion';

export default function UploadZone({ onUpload }) {
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file) => {
    if (file.name.endsWith('.zip')) {
      onUpload(file);
    } else {
      alert('Please upload a ZIP file only!');
    }
  };

  return (
    <div className="upload-container">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="hero"
      >
        <h1>🚀 Understand Any Codebase in Minutes</h1>
        <p>Upload your project ZIP and let AI create a complete explanation video</p>
      </motion.div>

      {/* Upload Area */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className={`upload-zone ${dragActive ? 'drag-active' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          id="file-upload"
          accept=".zip"
          onChange={handleChange}
          style={{ display: 'none' }}
        />

        <motion.div
          animate={{ scale: dragActive ? 1.05 : 1 }}
          className="upload-content"
        >
          {/* Animated Icon */}
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="upload-icon"
          >
            📦
          </motion.div>

          <h2>Drop your project ZIP here</h2>
          <p>or click the button below</p>

          <label htmlFor="file-upload" className="upload-btn">
            📂 Choose File
          </label>

          <div className="upload-hints">
            <span>✓ React, Vue, Angular, Node.js</span>
            <span>✓ Max size: 100MB</span>
            <span>✓ Instant AI analysis</span>
          </div>
        </motion.div>
      </motion.div>

      {/* Features */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="features"
      >
        <div className="feature">
          <span className="feature-icon">🎥</span>
          <h3>AI Video Explanation</h3>
          <p>Complete walkthrough generated automatically</p>
        </div>

        <div className="feature">
          <span className="feature-icon">🗂️</span>
          <h3>Visual File Tree</h3>
          <p>Interactive folder structure visualization</p>
        </div>

        <div className="feature">
          <span className="feature-icon">💬</span>
          <h3>AI Chat Assistant</h3>
          <p>Ask anything about the codebase</p>
        </div>

        <div className="feature">
          <span className="feature-icon">⚡</span>
          <h3>Tech Stack Detection</h3>
          <p>Auto-identifies all technologies</p>
        </div>
      </motion.div>
    </div>
  );
}