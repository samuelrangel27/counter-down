import React, { useState, useEffect } from 'react';
import { Settings, Play, Pause, RotateCcw, SkipForward, X } from 'lucide-react';

export default function ControlPanel({
  phase,
  setPhase,
  isPaused,
  setIsPaused,
  sliderDuration,
  setSliderDuration,
  countdownDuration,
  setCountdownDuration,
  sliderTimeLeft,
  setSliderTimeLeft,
  countdownTimeLeft,
  setCountdownTimeLeft,
  resetTimers
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [sliderInput, setSliderInput] = useState(Math.round(sliderDuration / 60));
  const [countdownInput, setCountdownInput] = useState(Math.round(countdownDuration / 60));

  // Sync input fields when default values change
  useEffect(() => {
    setSliderInput(Math.round(sliderDuration / 60));
  }, [sliderDuration]);

  useEffect(() => {
    setCountdownInput(Math.round(countdownDuration / 60));
  }, [countdownDuration]);

  // Handle global keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      const targetTag = e.target.tagName.toLowerCase();
      // Ignore if user is typing in an input
      if (targetTag === 'input' || targetTag === 'textarea') return;

      switch (e.key.toLowerCase()) {
        case 'h':
          e.preventDefault();
          setIsOpen((prev) => !prev);
          break;
        case ' ':
          e.preventDefault();
          setIsPaused((prev) => !prev);
          break;
        case 's':
          e.preventDefault();
          handleSkip();
          break;
        case 'r':
          e.preventDefault();
          resetTimers();
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [phase, sliderDuration, countdownDuration]);

  const handleSkip = () => {
    if (phase === 'slider') {
      setPhase('countdown');
    } else if (phase === 'countdown') {
      setPhase('final');
    } else {
      setPhase('slider');
    }
  };

  const handleApplySettings = (e) => {
    e.preventDefault();
    const newSliderDur = Math.max(1, parseInt(sliderInput) || 15) * 60;
    const newCountdownDur = Math.max(1, parseInt(countdownInput) || 10) * 60;

    setSliderDuration(newSliderDur);
    setCountdownDuration(newCountdownDur);
    
    // Instantly apply and reset timer values
    setSliderTimeLeft(newSliderDur);
    setCountdownTimeLeft(newCountdownDur);
  };

  const formatSeconds = (totalSecs) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <>
      {/* Floating Gear Button */}
      <button 
        className="control-trigger-btn" 
        onClick={() => setIsOpen(!isOpen)}
        title="Configuración (H)"
      >
        <Settings size={20} />
      </button>

      {/* Control Panel Drawer */}
      {isOpen && (
        <div className="control-panel">
          <div className="panel-header">
            <h3>Consola de Control</h3>
            <button className="panel-close-btn" onClick={() => setIsOpen(false)}>
              <X size={18} />
            </button>
          </div>

          {/* Current State Info */}
          <div className="panel-section">
            <div className="panel-section-title">Estado Actual</div>
            <div style={{ display: 'flex', alignItems: 'center', margin: '0.4rem 0' }}>
              <span className={`status-badge active-phase`}>
                Fase: {phase === 'slider' ? 'SLIDESHOW' : phase === 'countdown' ? 'CONTEO' : 'FINAL'}
              </span>
              <span className={`status-badge`}>
                {isPaused ? 'PAUSADO' : 'ACTIVO'}
              </span>
            </div>
            <div style={{ fontSize: '0.9rem', opacity: 0.8, marginTop: '0.5rem' }}>
              Tiempo restante (Slides): {formatSeconds(sliderTimeLeft)} <br />
              Tiempo restante (Conteo): {formatSeconds(countdownTimeLeft)}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="panel-section">
            <div className="panel-section-title">Acciones Rápidas</div>
            <div className="btn-row">
              <button 
                className={`btn btn-primary`} 
                onClick={() => setIsPaused(!isPaused)}
                style={{ flex: 1 }}
              >
                {isPaused ? <Play size={14} /> : <Pause size={14} />}
                {isPaused ? 'Reanudar' : 'Pausar'}
              </button>
              <button 
                className="btn" 
                onClick={handleSkip}
                style={{ flex: 1 }}
                title="Cambiar de fase"
              >
                <SkipForward size={14} />
                Saltar Fase
              </button>
            </div>
            <button 
              className="btn btn-danger btn-full" 
              onClick={resetTimers}
              style={{ marginTop: '0.5rem' }}
            >
              <RotateCcw size={14} />
              Reiniciar Todo
            </button>
          </div>

          {/* Settings Form */}
          <div className="panel-section">
            <div className="panel-section-title">Ajustes de Duración</div>
            <form onSubmit={handleApplySettings}>
              <div className="control-group">
                <label className="control-label">Duración Slider (min)</label>
                <input 
                  type="number" 
                  min="1" 
                  max="180"
                  className="control-input"
                  value={sliderInput}
                  onChange={(e) => setSliderInput(e.target.value)}
                />
              </div>
              <div className="control-group">
                <label className="control-label">Duración Conteo (min)</label>
                <input 
                  type="number" 
                  min="1" 
                  max="180"
                  className="control-input"
                  value={countdownInput}
                  onChange={(e) => setCountdownInput(e.target.value)}
                />
              </div>
              <button type="submit" className="btn btn-primary btn-full" style={{ marginTop: '0.4rem' }}>
                Aplicar y Reiniciar
              </button>
            </form>
          </div>

          {/* Keyboard Shortcuts Info */}
          <div className="keyboard-shortcut-info">
            Atajos: <span className="keyboard-key">H</span> panel |{' '}
            <span className="keyboard-key">Space</span> pausa |{' '}
            <span className="keyboard-key">S</span> saltar |{' '}
            <span className="keyboard-key">R</span> reiniciar
          </div>
        </div>
      )}
    </>
  );
}
