import React from 'react';
import { motion } from 'framer-motion';

export default function ProjectAnalysis({ progress }) {
  const getStatusMessage = () => {
    if (progress < 20) return 'Extracting files...';
    if (progress < 40) return 'Detecting tech stack...';
    if (progress < 60) return 'Analyzing components...';
    if (progress < 80) return 'Generating explanation...';
    return 'Creating AI video...';
  };

  const getStatusIcon = () => {
    if (progress < 20) return '📦';
    if (progress < 40) return '🔍';
    if (progress < 60) return '🧩';
    if (progress < 80) return '📝';
    return '🎬';
  };

  return (
    <div className="analysis-container">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="analysis-card"
      >
        {/* Spinning AI Icon */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="spinner"
        >
          🤖
        </motion.div>

        <h2>AI is Analyzing Your Project</h2>
        
        {/* Status */}
        <p className="status">
          <span className="status-icon">{getStatusIcon()}</span>
          {getStatusMessage()}
        </p>

        {/* Progress Bar */}
        <div className="progress-wrapper">
          <div className="progress-bar">
            <motion.div
              className="progress-fill"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <span className="progress-text">{progress}%</span>
        </div>

        {/* Steps */}
        <div className="steps">
          <Step number="1" label="Extract Files" active={progress >= 0} completed={progress >= 20} />
          <Step number="2" label="Detect Tech" active={progress >= 20} completed={progress >= 40} />
          <Step number="3" label="Analyze Code" active={progress >= 40} completed={progress >= 60} />
          <Step number="4" label="Generate Script" active={progress >= 60} completed={progress >= 80} />
          <Step number="5" label="Create Video" active={progress >= 80} completed={progress >= 100} />
        </div>

        <p className="info">⏱️ This may take 30-60 seconds</p>
      </motion.div>
    </div>
  );
}

function Step({ number, label, active, completed }) {
  return (
    <div className={`step ${active ? 'active' : ''} ${completed ? 'completed' : ''}`}>
      <span className="step-number">{number}</span>
      <span className="step-label">{label}</span>
      {completed && <span className="check">✓</span>}
    </div>
  );
}