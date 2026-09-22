import React, { useState, useEffect, useRef } from 'react';
import Slider from './components/Slider';
import Countdown from './components/Countdown';
import ControlPanel from './components/ControlPanel';
import espacioVidainImage from './assets/espacio-vidain.jpeg';

export default function App() {
  const [phase, setPhase] = useState('slider'); // 'slider' | 'countdown'

  // Default values: slider duration 15 minutes, countdown duration 5 minutes
  const [sliderDuration, setSliderDuration] = useState(15 * 60);
  const [countdownDuration, setCountdownDuration] = useState(5 * 60);

  const [sliderTimeLeft, setSliderTimeLeft] = useState(15 * 60);
  const [countdownTimeLeft, setCountdownTimeLeft] = useState(5 * 60);

  const [isPaused, setIsPaused] = useState(false);
  const [mouseMoving, setMouseMoving] = useState(true);

  const mouseTimeoutRef = useRef(null);

  // Sync remaining times if duration parameters are changed from default
  useEffect(() => {
    setSliderTimeLeft(sliderDuration);
  }, [sliderDuration]);

  useEffect(() => {
    setCountdownTimeLeft(countdownDuration);
  }, [countdownDuration]);

  // Main 1-second interval clock loop
  useEffect(() => {
    if (isPaused) return;

    const timer = setInterval(() => {
      if (phase === 'slider') {
        setSliderTimeLeft((prev) => {
          if (prev <= 1) {
            setPhase('countdown');
            return 0;
          }
          return prev - 1;
        });
      } else if (phase === 'countdown') {
        setCountdownTimeLeft((prev) => {
          if (prev <= 1) {
            setPhase('final');
            return 0; // stop at 00:00
          }
          return prev - 1;
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [phase, isPaused]);

  // Reset timers back to initial values
  const resetTimers = () => {
    setSliderTimeLeft(sliderDuration);
    setCountdownTimeLeft(countdownDuration);
    setPhase('slider');
    setIsPaused(false);
  };

  // Mouse idle detection to auto-hide control trigger button
  const handleMouseMove = () => {
    setMouseMoving(true);
    if (mouseTimeoutRef.current) {
      clearTimeout(mouseTimeoutRef.current);
    }
    mouseTimeoutRef.current = setTimeout(() => {
      setMouseMoving(false);
    }, 3000); // Hide after 3 seconds of inactivity
  };

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (mouseTimeoutRef.current) clearTimeout(mouseTimeoutRef.current);
    };
  }, []);

  return (
    <div className={`app-container ${mouseMoving ? 'mouse-moving' : ''}`}>
      {/* Dynamic phase selector */}
      {phase === 'slider' && <Slider isPaused={isPaused} />}
      {phase === 'countdown' && <Countdown timeLeft={countdownTimeLeft} />}
      {phase === 'final' && (
        <div className="final-screen-container">
          <img src={espacioVidainImage} alt="Espacio Vidain" className="final-screen-image" />
        </div>
      )}

      {/* Floating Glassmorphic Settings Drawer */}
      <ControlPanel
        phase={phase}
        setPhase={setPhase}
        isPaused={isPaused}
        setIsPaused={setIsPaused}
        sliderDuration={sliderDuration}
        setSliderDuration={setSliderDuration}
        countdownDuration={countdownDuration}
        setCountdownDuration={setCountdownDuration}
        sliderTimeLeft={sliderTimeLeft}
        setSliderTimeLeft={setSliderTimeLeft}
        countdownTimeLeft={countdownTimeLeft}
        setCountdownTimeLeft={setCountdownTimeLeft}
        resetTimers={resetTimers}
      />
    </div>
  );
}
