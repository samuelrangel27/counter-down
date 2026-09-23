import { useState, useEffect, useRef, useCallback } from 'react';
import Slider from './components/Slider';
import Countdown from './components/Countdown';
import ControlPanel from './components/ControlPanel';
import espacioVidainImage from './assets/espacio-vidain.jpeg';
import {
  calculateSecondsUntilTarget,
  getStoredValue,
  setStoredValue,
} from './utils/timeUtils';

export default function App() {
  const [phase, setPhase] = useState('slider'); // 'slider' | 'countdown' | 'final'
  const [isPaused, setIsPaused] = useState(false);
  const [mouseMoving, setMouseMoving] = useState(true);

  // Configuration: stop mode ('targetTime' | 'duration')
  // Default: targetTime stopping at 19:00 (7:00 PM)
  const [sliderStopMode, setSliderStopMode] = useState(() =>
    getStoredValue('sliderStopMode', 'targetTime')
  );
  const [sliderTargetTime, setSliderTargetTime] = useState(() =>
    getStoredValue('sliderTargetTime', '19:00')
  );
  const [targetDay, setTargetDay] = useState(() =>
    getStoredValue('targetDay', 'auto')
  );

  const [sliderDuration, setSliderDuration] = useState(() =>
    Number(getStoredValue('sliderDuration', 15 * 60))
  );
  const [countdownDuration, setCountdownDuration] = useState(() =>
    Number(getStoredValue('countdownDuration', 5 * 60))
  );

  // Remaining time states
  const [sliderTimeLeft, setSliderTimeLeft] = useState(() => {
    const savedMode = getStoredValue('sliderStopMode', 'targetTime');
    if (savedMode === 'targetTime') {
      const savedTarget = getStoredValue('sliderTargetTime', '19:00');
      const savedDay = getStoredValue('targetDay', 'auto');
      return calculateSecondsUntilTarget(savedTarget, savedDay);
    }
    return Number(getStoredValue('sliderDuration', 15 * 60));
  });

  const [countdownTimeLeft, setCountdownTimeLeft] = useState(() =>
    Number(getStoredValue('countdownDuration', 5 * 60))
  );

  const mouseTimeoutRef = useRef(null);

  // Main 1-second interval loop
  useEffect(() => {
    if (isPaused) return;

    const timer = setInterval(() => {
      if (phase === 'slider') {
        if (sliderStopMode === 'targetTime') {
          const remaining = calculateSecondsUntilTarget(sliderTargetTime, targetDay);
          setSliderTimeLeft(remaining);

          // When target time (e.g. 7:00 PM) arrives, stop slider and start countdown
          if (remaining <= 0) {
            setPhase('countdown');
            setCountdownTimeLeft(countdownDuration);
          }
        } else {
          setSliderTimeLeft((prev) => {
            if (prev <= 1) {
              setPhase('countdown');
              setCountdownTimeLeft(countdownDuration);
              return 0;
            }
            return prev - 1;
          });
        }
      } else if (phase === 'countdown') {
        setCountdownTimeLeft((prev) => {
          if (prev <= 1) {
            setPhase('final');
            return 0;
          }
          return prev - 1;
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [
    phase,
    isPaused,
    sliderStopMode,
    sliderTargetTime,
    targetDay,
    countdownDuration,
  ]);

  // Reset timers back to initial values
  const resetTimers = useCallback(() => {
    if (sliderStopMode === 'targetTime') {
      const remaining = calculateSecondsUntilTarget(sliderTargetTime, targetDay);
      setSliderTimeLeft(remaining);
    } else {
      setSliderTimeLeft(sliderDuration);
    }
    setCountdownTimeLeft(countdownDuration);
    setPhase('slider');
    setIsPaused(false);
  }, [sliderStopMode, sliderTargetTime, targetDay, sliderDuration, countdownDuration]);

  // Skip to next phase
  const handleSkip = useCallback(() => {
    if (phase === 'slider') {
      setPhase('countdown');
      setCountdownTimeLeft(countdownDuration);
    } else if (phase === 'countdown') {
      setPhase('final');
    } else {
      setPhase('slider');
      if (sliderStopMode === 'targetTime') {
        setSliderTimeLeft(calculateSecondsUntilTarget(sliderTargetTime, targetDay));
      } else {
        setSliderTimeLeft(sliderDuration);
      }
    }
  }, [phase, countdownDuration, sliderStopMode, sliderTargetTime, targetDay, sliderDuration]);

  // Apply new settings from ControlPanel
  const handleApplySettings = useCallback(
    ({
      mode,
      targetTime,
      day,
      sliderDur,
      countdownDur,
    }) => {
      if (mode !== undefined) {
        setSliderStopMode(mode);
        setStoredValue('sliderStopMode', mode);
      }
      if (targetTime !== undefined) {
        setSliderTargetTime(targetTime);
        setStoredValue('sliderTargetTime', targetTime);
      }
      if (day !== undefined) {
        setTargetDay(day);
        setStoredValue('targetDay', day);
      }
      if (sliderDur !== undefined) {
        setSliderDuration(sliderDur);
        setStoredValue('sliderDuration', sliderDur);
      }
      if (countdownDur !== undefined) {
        setCountdownDuration(countdownDur);
        setStoredValue('countdownDuration', countdownDur);
      }

      // Immediately refresh remaining time
      const activeMode = mode !== undefined ? mode : sliderStopMode;
      const activeTarget = targetTime !== undefined ? targetTime : sliderTargetTime;
      const activeDay = day !== undefined ? day : targetDay;
      const activeSliderDur = sliderDur !== undefined ? sliderDur : sliderDuration;
      const activeCountdownDur = countdownDur !== undefined ? countdownDur : countdownDuration;

      if (phase === 'slider') {
        if (activeMode === 'targetTime') {
          const remaining = calculateSecondsUntilTarget(activeTarget, activeDay);
          setSliderTimeLeft(remaining);
        } else {
          setSliderTimeLeft(activeSliderDur);
        }
      } else if (phase === 'countdown') {
        setCountdownTimeLeft(activeCountdownDur);
      }
    },
    [sliderStopMode, sliderTargetTime, targetDay, sliderDuration, countdownDuration, phase]
  );

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
        sliderStopMode={sliderStopMode}
        sliderTargetTime={sliderTargetTime}
        targetDay={targetDay}
        sliderDuration={sliderDuration}
        countdownDuration={countdownDuration}
        sliderTimeLeft={sliderTimeLeft}
        countdownTimeLeft={countdownTimeLeft}
        resetTimers={resetTimers}
        handleSkip={handleSkip}
        onApplySettings={handleApplySettings}
      />
    </div>
  );
}
