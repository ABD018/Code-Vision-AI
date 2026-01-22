import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function FileExplorer({ structure }) {
  return (
    <div className="explorer-section">
      <h2>🗂️ Project Structure</h2>
      <div className="file-tree">
        <FileNode node={structure} level={0} />
      </div>
    </div>
  );
}

function FileNode({ node, level }) {
  const [isOpen, setIsOpen] = useState(level < 2); // Auto-expand first 2 levels

  const isFolder = node.type === 'folder';
  const hasChildren = node.children && node.children.length > 0;

  return (
    <div className="file-node">
      <motion.div
        whileHover={{ x: 4, backgroundColor: 'rgba(59, 130, 246, 0.1)' }}
        className={`node-header ${node.important ? 'important' : ''}`}
        style={{ paddingLeft: `${level * 20}px` }}
        onClick={() => isFolder && setIsOpen(!isOpen)}
      >
        {isFolder && (
          <motion.span
            animate={{ rotate: isOpen ? 90 : 0 }}
            transition={{ duration: 0.2 }}
            className="expand-icon"
          >
            ▶
          </motion.span>
        )}
        
        <span className="node-icon">
          {isFolder ? (isOpen ? '📂' : '📁') : getFileIcon(node.name)}
        </span>
        
        <span className="node-name">{node.name}</span>
        
        {node.important && (
          <span className="important-badge">⭐</span>
        )}
      </motion.div>

      <AnimatePresence>
        {isFolder && isOpen && hasChildren && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {node.children.map((child, i) => (
              <FileNode key={i} node={child} level={level + 1} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function getFileIcon(filename) {
  if (filename.endsWith('.jsx') || filename.endsWith('.js')) return '📄';
  if (filename.endsWith('.css') || filename.endsWith('.scss')) return '🎨';
  if (filename.endsWith('.json')) return '⚙️';
  if (filename.endsWith('.html')) return '🌐';
  if (filename.endsWith('.md')) return '📝';
  return '📄';
}