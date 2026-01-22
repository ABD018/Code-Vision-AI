import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function VideoPlayer({ projectName, techStack, description, structure, components }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentChapter, setCurrentChapter] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState('jonas');
  const [showControls, setShowControls] = useState(true);
  
  const speechRef = useRef(null);
  const intervalRef = useRef(null);
  const timeoutRef = useRef(null);

  const avatars = {
    jonas: {
      name: 'Jonas',
      gender: 'male',
      image: 'https://i.pravatar.cc/300?img=12',
      color: '#3b82f6'
    },
    sarah: {
      name: 'Sarah', 
      gender: 'female',
      image: 'https://i.pravatar.cc/300?img=45',
      color: '#ec4899'
    }
  };

  const chapters = [
    { 
      time: 0, 
      duration: 25,
      title: 'Introduction', 
      icon: '👋',
      script: `Hi! I'm ${avatars[selectedAvatar].name}. Let me explain ${projectName} to you. ${description}`
    },
    { 
      time: 25, 
      duration: 35,
      title: 'Tech Stack', 
      icon: '⚡',
      script: techStack?.length > 0 
        ? `This project uses ${techStack.slice(0, 3).join(', ')}. ${getTechExplanation(techStack)}`
        : 'This project uses modern web technologies.'
    },
    { 
      time: 60, 
      duration: 40,
      title: 'Structure', 
      icon: '📁',
      script: `The project has a well-organized structure. ${getStructureDesc(structure)}`
    },
    { 
      time: 100, 
      duration: 35,
      title: 'Components', 
      icon: '🧩',
      script: components?.length > 0
        ? `Key components include ${components.slice(0, 3).map(c => c.name).join(', ')}. Each handles a specific part of the UI.`
        : 'The app is built with modular, reusable components.'
    },
    { 
      time: 135, 
      duration: 25,
      title: 'Setup', 
      icon: '🚀',
      script: 'To run: install dependencies with npm install, then start with npm start. That\'s it!'
    }
  ];

  const totalDuration = chapters.reduce((sum, ch) => sum + ch.duration, 0);

  function getTechExplanation(stack) {
    if (!stack || stack.length === 0) return '';
    const main = stack[0];
    const explanations = {
      'React': 'React provides a component-based architecture for building dynamic UIs',
      'Vue.js': 'Vue offers reactive data binding and a progressive framework',
      'Next.js': 'Next.js adds server-side rendering and routing to React',
      'Express.js': 'Express handles the backend API and server logic'
    };
    return explanations[main] || `${main} powers the core functionality`;
  }

  function getStructureDesc(struct) {
    if (!struct?.children) return 'Files are organized logically';
    const hasSrc = struct.children.some(c => c.name === 'src');
    const hasComponents = struct.children.some(c => 
      c.children?.some(ch => ch.name === 'components')
    );
    let desc = '';
    if (hasSrc) desc += 'Source code lives in the src directory. ';
    if (hasComponents) desc += 'Components are modular and reusable. ';
    return desc || 'Code is well organized';
  }

  const speak = (text) => {
    if ('speechSynthesis' in window && !isMuted) {
      window.speechSynthesis.cancel();
      
      setTimeout(() => {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.95;
        utterance.pitch = selectedAvatar === 'jonas' ? 0.9 : 1.1;
        utterance.volume = volume;
        
        const voices = window.speechSynthesis.getVoices();
        const voice = selectedAvatar === 'jonas'
          ? voices.find(v => v.lang.includes('en-US') && (v.name.includes('Male') || v.name.includes('David')))
          : voices.find(v => v.lang.includes('en-US') && (v.name.includes('Female') || v.name.includes('Samantha')));
        
        if (voice) utterance.voice = voice;
        
        speechRef.current = utterance;
        window.speechSynthesis.speak(utterance);
      }, 100);
    }
  };

  const togglePlay = () => {
    if (isPlaying) {
      setIsPlaying(false);
      window.speechSynthesis.cancel();
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    } else {
      setIsPlaying(true);
      speak(chapters[currentChapter].script);
      
      intervalRef.current = setInterval(() => {
        setCurrentTime(prev => {
          const newTime = prev + 1;
          
          const nextChapter = chapters.findIndex((ch, i) => 
            i > currentChapter && newTime >= ch.time
          );
          
          if (nextChapter !== -1) {
            setCurrentChapter(nextChapter);
            speak(chapters[nextChapter].script);
          }
          
          if (newTime >= totalDuration) {
            setIsPlaying(false);
            window.speechSynthesis.cancel();
            clearInterval(intervalRef.current);
            setCurrentTime(0);
            setCurrentChapter(0);
            return 0;
          }
          
          return newTime;
        });
      }, 1000);
    }
  };

  const seekTo = (time) => {
    setCurrentTime(time);
    const chapterIndex = chapters.findIndex((ch, i) => 
      time >= ch.time && (i === chapters.length - 1 || time < chapters[i + 1].time)
    );
    if (chapterIndex !== -1) {
      setCurrentChapter(chapterIndex);
      if (isPlaying) {
        window.speechSynthesis.cancel();
        speak(chapters[chapterIndex].script);
      }
    }
  };

  const handleProgressClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    seekTo(Math.floor(percentage * totalDuration));
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (!isMuted) {
      window.speechSynthesis.cancel();
    } else if (isPlaying) {
      speak(chapters[currentChapter].script);
    }
  };

  const formatTime = (sec) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <div className="video-section-new">
      <div className="video-header-new">
        <h2>🎬 AI Video Explanation</h2>
        <div className="avatar-selector">
          {Object.entries(avatars).map(([key, avatar]) => (
            <button
              key={key}
              className={`avatar-btn ${selectedAvatar === key ? 'active' : ''}`}
              onClick={() => setSelectedAvatar(key)}
              disabled={isPlaying}
            >
              <img src={avatar.image} alt={avatar.name} />
              <span>{avatar.name}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="video-container-new">
        <div 
          className="video-player-new"
          onMouseEnter={() => setShowControls(true)}
          onMouseLeave={() => isPlaying && setShowControls(false)}
        >
          {/* AI Avatar Video */}
          <div className="avatar-video">
            <div className="avatar-background">
              <div className="gradient-bg"></div>
            </div>
            
            <motion.div 
              className="avatar-frame"
              animate={isPlaying ? {
                scale: [1, 1.02, 1],
              } : {}}
              transition={{
                duration: 2,
                repeat: isPlaying ? Infinity : 0,
                ease: "easeInOut"
              }}
            >
              <img 
                src={avatars[selectedAvatar].image} 
                alt={avatars[selectedAvatar].name}
                className="avatar-image"
              />
              
              {isPlaying && !isMuted && (
                <motion.div 
                  className="speaking-indicator"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 1, 0.5]
                  }}
                  transition={{
                    duration: 1,
                    repeat: Infinity
                  }}
                >
                  <div className="sound-wave">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </motion.div>
              )}
            </motion.div>

            {/* Subtitle/Caption */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentChapter}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="subtitle-box"
              >
                <p>{chapters[currentChapter].script}</p>
              </motion.div>
            </AnimatePresence>

            {/* Chapter Indicator */}
            <div className="chapter-badge">
              <span>{chapters[currentChapter].icon}</span>
              <span>{chapters[currentChapter].title}</span>
            </div>
          </div>

          {/* Video Controls */}
          <AnimatePresence>
            {showControls && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="video-controls-overlay"
              >
                <div className="controls-wrapper">
                  {/* Progress Bar */}
                  <div className="progress-bar-new" onClick={handleProgressClick}>
                    <div 
                      className="progress-filled-new"
                      style={{ width: `${(currentTime / totalDuration) * 100}%` }}
                    />
                    <div 
                      className="progress-handle"
                      style={{ left: `${(currentTime / totalDuration) * 100}%` }}
                    />
                  </div>

                  <div className="controls-bottom">
                    <div className="controls-left">
                      <button className="control-btn-new" onClick={togglePlay}>
                        {isPlaying ? '⏸️' : '▶️'}
                      </button>
                      
                      <button className="control-btn-new" onClick={toggleMute}>
                        {isMuted ? '🔇' : '🔊'}
                      </button>

                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={volume}
                        onChange={(e) => setVolume(parseFloat(e.target.value))}
                        className="volume-slider"
                      />

                      <span className="time-display">
                        {formatTime(currentTime)} / {formatTime(totalDuration)}
                      </span>
                    </div>

                    <div className="controls-right">
                      <button 
                        className="control-btn-new"
                        onClick={() => {
                          setCurrentTime(0);
                          setCurrentChapter(0);
                          setIsPlaying(false);
                          window.speechSynthesis.cancel();
                        }}
                      >
                        ↻
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Chapters List */}
        <div className="chapters-sidebar">
          <h4>📚 Chapters</h4>
          <div className="chapters-list-new">
            {chapters.map((chapter, i) => (
              <motion.button
                key={i}
                whileHover={{ x: 4 }}
                className={`chapter-item-new ${currentChapter === i ? 'active' : ''}`}
                onClick={() => seekTo(chapter.time)}
              >
                <span className="chapter-icon-new">{chapter.icon}</span>
                <div className="chapter-details">
                  <span className="chapter-title-new">{chapter.title}</span>
                  <span className="chapter-time-new">{formatTime(chapter.time)}</span>
                </div>
                {currentChapter === i && isPlaying && (
                  <span className="playing-dot">●</span>
                )}
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      <div className="video-info-bar">
        <span>🎙️ AI Voice Narration</span>
        <span>•</span>
        <span>📺 {totalDuration}s Full Explanation</span>
        <span>•</span>
        <span>👤 {avatars[selectedAvatar].name} Presenting</span>
      </div>
    </div>
  );
}