import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import UploadZone from './components/UploadZone';
import ProjectAnalysis from './components/ProjectAnalysis';
import VideoPlayer from './components/VideoPlayer';
import FileExplorer from './components/FileExplorer';
import AIChat from './components/AIChat';
import './App.css';

export default function App() {
  const [currentStep, setCurrentStep] = useState('upload');
  const [projectData, setProjectData] = useState(null);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [chatOpen, setChatOpen] = useState(false);

  // Real file analysis function
  const analyzeProject = async (file) => {
    try {
      const JSZip = (await import('jszip')).default;
      const zip = new JSZip();
      const contents = await zip.loadAsync(file);
      
      // Extract file structure
      const structure = buildFileTree(contents.files);
      
      // Detect tech stack from package.json
      let techStack = [];
      let packageJson = null;
      
      const packageFile = contents.files['package.json'] || 
                          Object.keys(contents.files).find(f => f.endsWith('package.json'));
      
      if (packageFile && !contents.files[packageFile].dir) {
        const packageContent = await contents.files[packageFile].async('text');
        packageJson = JSON.parse(packageContent);
        techStack = detectTechStack(packageJson);
      }
      
      // Find important files
      const importantFiles = findImportantFiles(contents.files);
      
      // Analyze components
      const components = await analyzeComponents(contents.files);
      
      return {
        name: file.name.replace('.zip', ''),
        techStack,
        structure,
        description: generateDescription(techStack, components),
        components,
        entryPoint: findEntryPoint(contents.files),
        setupSteps: generateSetupSteps(packageJson),
        packageJson
      };
    } catch (error) {
      console.error('Analysis error:', error);
      return null;
    }
  };

  // Build file tree from ZIP
  const buildFileTree = (files) => {
    const root = { name: 'root', type: 'folder', children: [] };
    const lookup = { '': root };

    Object.keys(files).forEach(path => {
      const parts = path.split('/').filter(p => p);
      let current = '';
      
      parts.forEach((part, i) => {
        const parentPath = current;
        current = current ? `${current}/${part}` : part;
        
        if (!lookup[current]) {
          const isFolder = files[path].dir || i < parts.length - 1;
          const node = {
            name: part,
            type: isFolder ? 'folder' : 'file',
            path: current,
            important: isImportantFile(part),
            children: isFolder ? [] : undefined
          };
          
          lookup[current] = node;
          lookup[parentPath].children.push(node);
        }
      });
    });

    return root;
  };

  // Detect tech stack from package.json
  const detectTechStack = (packageJson) => {
    const stack = new Set();
    const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
    
    if (deps.react) stack.add('React');
    if (deps['react-dom']) stack.add('React DOM');
    if (deps.next) stack.add('Next.js');
    if (deps.vue) stack.add('Vue.js');
    if (deps.angular) stack.add('Angular');
    if (deps.express) stack.add('Express.js');
    if (deps.mongodb || deps.mongoose) stack.add('MongoDB');
    if (deps['framer-motion']) stack.add('Framer Motion');
    if (deps.tailwindcss) stack.add('Tailwind CSS');
    if (deps.typescript) stack.add('TypeScript');
    if (deps.axios) stack.add('Axios');
    if (deps['react-router-dom']) stack.add('React Router');
    
    return Array.from(stack);
  };

  // Check if file is important
  const isImportantFile = (filename) => {
    const important = [
      'package.json', 'README.md', 'index.js', 'index.jsx',
      'App.js', 'App.jsx', 'main.js', 'main.jsx',
      '.env', 'config.js', 'vite.config.js', 'webpack.config.js'
    ];
    return important.includes(filename);
  };

  // Find important files
  const findImportantFiles = (files) => {
    return Object.keys(files).filter(path => {
      const filename = path.split('/').pop();
      return isImportantFile(filename);
    });
  };

  // Analyze components
  const analyzeComponents = async (files) => {
    const components = [];
    const componentPattern = /\.(jsx?|tsx?|vue)$/;
    
    for (const [path, file] of Object.entries(files)) {
      if (!file.dir && componentPattern.test(path) && path.includes('component')) {
        const filename = path.split('/').pop();
        const name = filename.replace(componentPattern, '');
        
        components.push({
          name,
          file: path,
          purpose: `Component: ${name}`
        });
        
        if (components.length >= 5) break; // Limit to 5 components
      }
    }
    
    return components;
  };

  // Find entry point
  const findEntryPoint = (files) => {
    const entryPoints = ['src/index.js', 'src/index.jsx', 'src/main.js', 'index.js'];
    for (const entry of entryPoints) {
      if (files[entry] || files[`./${entry}`]) return entry;
    }
    return 'index.js';
  };

  // Generate description
  const generateDescription = (techStack, components) => {
    const tech = techStack.join(', ');
    return `A modern web application built with ${tech}. Contains ${components.length} key components with modular architecture.`;
  };

  // Generate setup steps
  const generateSetupSteps = (packageJson) => {
    const steps = [];
    
    if (packageJson) {
      steps.push('npm install');
      
      if (packageJson.scripts) {
        if (packageJson.scripts.dev) steps.push('npm run dev');
        else if (packageJson.scripts.start) steps.push('npm start');
        
        const port = packageJson.scripts.dev?.includes('3000') ? '3000' : 
                     packageJson.scripts.start?.includes('3000') ? '3000' : '5173';
        steps.push(`Open http://localhost:${port}`);
      }
    } else {
      steps.push('npm install', 'npm start', 'Open http://localhost:3000');
    }
    
    return steps;
  };

  // Main upload handler
  const handleFileUpload = async (file) => {
    setCurrentStep('analyzing');
    
    const steps = [
      { progress: 20, delay: 800 },
      { progress: 40, delay: 1000 },
      { progress: 60, delay: 1200 },
      { progress: 80, delay: 1000 },
      { progress: 100, delay: 800 }
    ];

    for (const step of steps) {
      await new Promise(resolve => setTimeout(resolve, step.delay));
      setAnalysisProgress(step.progress);
    }

    const data = await analyzeProject(file);
    
    if (data) {
      setProjectData(data);
      setCurrentStep('ready');
    } else {
      alert('Failed to analyze project. Please try again.');
      setCurrentStep('upload');
    }
  };

  return (
    <div className="app">
      <header className="header">
        <div className="header-content">
          <div className="logo">
            <span className="logo-icon">🎬</span>
            <h1>CodeVision AI</h1>
          </div>
          <p className="tagline">Upload any project. AI explains everything.</p>
        </div>
      </header>

      <main className="main">
        <AnimatePresence mode="wait">
          {currentStep === 'upload' && (
            <motion.div
              key="upload"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <UploadZone onUpload={handleFileUpload} />
            </motion.div>
          )}

          {currentStep === 'analyzing' && (
            <motion.div
              key="analyzing"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <ProjectAnalysis progress={analysisProgress} />
            </motion.div>
          )}

          {currentStep === 'ready' && projectData && (
            <motion.div
              key="ready"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="results"
            >
              <div className="results-grid">
                <VideoPlayer 
  projectName={projectData.name}
  techStack={projectData.techStack}
  description={projectData.description}
  structure={projectData.structure}
  components={projectData.components}
/>
                <FileExplorer structure={projectData.structure} />
              </div>

              <div className="project-info">
                <h2>📊 Project Overview</h2>
                
                <div className="info-cards">
                  <div className="info-card">
                    <h3>🎯 What is this project?</h3>
                    <p>{projectData.description}</p>
                  </div>

                  <div className="info-card">
                    <h3>⚡ Tech Stack Used</h3>
                    <div className="tech-stack">
                      {projectData.techStack.length > 0 ? (
                        projectData.techStack.map((tech, i) => (
                          <span key={i} className="tech-badge">{tech}</span>
                        ))
                      ) : (
                        <p>No package.json found</p>
                      )}
                    </div>
                  </div>

                  <div className="info-card">
                    <h3>🚀 How to Run This Project</h3>
                    <ol className="setup-list">
                      {projectData.setupSteps.map((step, i) => (
                        <li key={i}>{step}</li>
                      ))}
                    </ol>
                  </div>

                  {projectData.components.length > 0 && (
                    <div className="info-card">
                      <h3>🧩 Key Components</h3>
                      <div className="components">
                        {projectData.components.map((comp, i) => (
                          <div key={i} className="component-item">
                            <strong>{comp.name}</strong>
                            <p>{comp.purpose}</p>
                            <code>{comp.file}</code>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="reset-btn"
                onClick={() => {
                  setCurrentStep('upload');
                  setProjectData(null);
                  setAnalysisProgress(0);
                  setChatOpen(false);
                }}
              >
                ↻ Analyze Another Project
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {currentStep === 'ready' && (
        <>
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="chat-fab"
            onClick={() => setChatOpen(!chatOpen)}
          >
            {chatOpen ? '✕' : '💬'}
          </motion.button>

          <AnimatePresence>
            {chatOpen && (
              <AIChat 
                projectData={projectData}
                onClose={() => setChatOpen(false)}
              />
            )}
          </AnimatePresence>
        </>
      )}
    </div>
  );
}