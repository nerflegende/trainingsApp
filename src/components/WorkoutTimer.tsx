import { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Timer, Clock } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { Modal } from './Modal';

export function WorkoutTimer() {
  const { darkMode } = useTheme();
  const [showStopwatch, setShowStopwatch] = useState(true);
  const [showTimerSettings, setShowTimerSettings] = useState(false);

  // Stopwatch state
  const [stopwatchTime, setStopwatchTime] = useState(0);
  const [stopwatchRunning, setStopwatchRunning] = useState(false);
  const stopwatchInterval = useRef<number | null>(null);

  // Pause timer state
  const [pauseTime, setPauseTime] = useState(90); // Default 90 seconds
  const [pauseRemaining, setPauseRemaining] = useState(90);
  const [pauseRunning, setPauseRunning] = useState(false);
  const pauseInterval = useRef<number | null>(null);

  // Stopwatch effect
  useEffect(() => {
    if (stopwatchRunning) {
      stopwatchInterval.current = window.setInterval(() => {
        setStopwatchTime(prev => prev + 1);
      }, 1000);
    } else if (stopwatchInterval.current) {
      clearInterval(stopwatchInterval.current);
    }
    return () => {
      if (stopwatchInterval.current) clearInterval(stopwatchInterval.current);
    };
  }, [stopwatchRunning]);

  // Pause timer effect
  useEffect(() => {
    if (pauseRunning && pauseRemaining > 0) {
      pauseInterval.current = window.setInterval(() => {
        setPauseRemaining(prev => {
          if (prev <= 1) {
            setPauseRunning(false);
            // Play sound or vibrate
            if ('vibrate' in navigator) {
              navigator.vibrate([200, 100, 200]);
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (pauseInterval.current) {
      clearInterval(pauseInterval.current);
    }
    return () => {
      if (pauseInterval.current) clearInterval(pauseInterval.current);
    };
  }, [pauseRunning, pauseRemaining]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const resetStopwatch = () => {
    setStopwatchRunning(false);
    setStopwatchTime(0);
  };

  const resetPauseTimer = () => {
    setPauseRunning(false);
    setPauseRemaining(pauseTime);
  };

  const setPauseTimeValue = (seconds: number) => {
    setPauseTime(seconds);
    setPauseRemaining(seconds);
    setShowTimerSettings(false);
  };

  const pauseOptions = [30, 60, 90, 120, 180, 300];

  return (
    <div className={`flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
      {/* Stopwatch */}
      <div 
        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg cursor-pointer ${
          darkMode ? 'bg-dark-border hover:bg-gray-700' : 'bg-gray-200 hover:bg-gray-300'
        }`}
        onClick={() => setShowStopwatch(!showStopwatch)}
      >
        <Clock size={16} className="text-primary" />
        <span className="font-mono text-sm">{formatTime(stopwatchTime)}</span>
      </div>

      {showStopwatch && (
        <div className="flex items-center gap-1">
          <button
            onClick={() => setStopwatchRunning(!stopwatchRunning)}
            className={`p-1.5 rounded-full ${
              darkMode ? 'hover:bg-dark-border' : 'hover:bg-gray-200'
            }`}
          >
            {stopwatchRunning ? <Pause size={14} /> : <Play size={14} />}
          </button>
          <button
            onClick={resetStopwatch}
            className={`p-1.5 rounded-full ${
              darkMode ? 'hover:bg-dark-border' : 'hover:bg-gray-200'
            }`}
          >
            <RotateCcw size={14} />
          </button>
        </div>
      )}

      {/* Pause Timer */}
      <div 
        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg cursor-pointer ${
          pauseRemaining === 0 && !pauseRunning ? 'bg-primary animate-pulse' : 
          darkMode ? 'bg-dark-border hover:bg-gray-700' : 'bg-gray-200 hover:bg-gray-300'
        }`}
        onClick={() => setShowTimerSettings(true)}
      >
        <Timer size={16} className={pauseRemaining === 0 ? 'text-white' : 'text-primary'} />
        <span className={`font-mono text-sm ${pauseRemaining === 0 ? 'text-white' : ''}`}>
          {formatTime(pauseRemaining)}
        </span>
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={() => {
            if (pauseRemaining === 0) {
              setPauseRemaining(pauseTime);
            }
            setPauseRunning(!pauseRunning);
          }}
          className={`p-1.5 rounded-full ${
            darkMode ? 'hover:bg-dark-border' : 'hover:bg-gray-200'
          }`}
        >
          {pauseRunning ? <Pause size={14} /> : <Play size={14} />}
        </button>
        <button
          onClick={resetPauseTimer}
          className={`p-1.5 rounded-full ${
            darkMode ? 'hover:bg-dark-border' : 'hover:bg-gray-200'
          }`}
        >
          <RotateCcw size={14} />
        </button>
      </div>

      <Modal
        isOpen={showTimerSettings}
        onClose={() => setShowTimerSettings(false)}
        title="Pausenzeit einstellen"
      >
        <div className="grid grid-cols-2 gap-3">
          {pauseOptions.map(seconds => (
            <button
              key={seconds}
              onClick={() => setPauseTimeValue(seconds)}
              className={`p-4 rounded-lg font-semibold transition-colors ${
                pauseTime === seconds
                  ? 'bg-primary text-white'
                  : darkMode
                  ? 'bg-dark-border hover:bg-gray-700 text-white'
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
              }`}
            >
              {formatTime(seconds)}
            </button>
          ))}
        </div>
      </Modal>
    </div>
  );
}
