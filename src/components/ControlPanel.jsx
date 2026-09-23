import { useState, useEffect } from 'react';
import { Settings, Play, Pause, RotateCcw, SkipForward, X, Clock, Check } from 'lucide-react';
import {
  format12Hour,
  formatSeconds,
  formatCurrentClock,
  getTargetInfo,
  getTimeFromNow,
} from '../utils/timeUtils';

export default function ControlPanel({
  phase,
  isPaused,
  setIsPaused,
  sliderStopMode,
  sliderTargetTime,
  targetDay,
  sliderDuration,
  countdownDuration,
  sliderTimeLeft,
  countdownTimeLeft,
  resetTimers,
  handleSkip,
  onApplySettings,
}) {
  const [isOpen, setIsOpen] = useState(false);

  // Form local state
  const [modeInput, setModeInput] = useState(sliderStopMode);
  const [targetTimeInput, setTargetTimeInput] = useState(sliderTargetTime);
  const [targetDayInput, setTargetDayInput] = useState(targetDay);
  const [sliderMinInput, setSliderMinInput] = useState(Math.round(sliderDuration / 60));
  const [countdownMinInput, setCountdownMinInput] = useState(Math.round(countdownDuration / 60));

  // Current real-world clock live display
  const [currentClock, setCurrentClock] = useState(() => formatCurrentClock());
  const [appliedFeedback, setAppliedFeedback] = useState(false);

  // Update live clock every second
  useEffect(() => {
    const clockTimer = setInterval(() => {
      setCurrentClock(formatCurrentClock());
    }, 1000);
    return () => clearInterval(clockTimer);
  }, []);

  // Handle global keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      const targetTag = e.target.tagName.toLowerCase();
      // Ignore if user is typing in an input
      if (targetTag === 'input' || targetTag === 'textarea' || targetTag === 'select') return;

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
  }, [handleSkip, resetTimers, setIsPaused]);

  const handleApply = (e) => {
    if (e) e.preventDefault();
    const newSliderDur = Math.max(1, parseInt(sliderMinInput, 10) || 15) * 60;
    const newCountdownDur = Math.max(1, parseInt(countdownMinInput, 10) || 5) * 60;

    onApplySettings({
      mode: modeInput,
      targetTime: targetTimeInput || '19:00',
      day: targetDayInput,
      sliderDur: newSliderDur,
      countdownDur: newCountdownDur,
    });

    setAppliedFeedback(true);
    setTimeout(() => setAppliedFeedback(false), 2000);
  };

  const handlePresetSelect = (timeStr) => {
    setTargetTimeInput(timeStr);
    setModeInput('targetTime');
  };

  const handleRelativePreset = (minutes) => {
    const nextTime = getTimeFromNow(minutes);
    setTargetTimeInput(nextTime);
    setTargetDayInput('today');
    setModeInput('targetTime');
  };

  const targetInfo = getTargetInfo(sliderTargetTime, targetDay);

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
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Clock size={18} color="var(--ctrl-accent)" />
              <h3>Consola de Control</h3>
            </div>
            <button
              className="panel-close-btn"
              onClick={() => setIsOpen(false)}
              title="Cerrar (H)"
            >
              <X size={18} />
            </button>
          </div>

          {/* Current State Info */}
          <div className="panel-section">
            <div className="panel-section-title">Estado Actual</div>
            <div style={{ display: 'flex', alignItems: 'center', margin: '0.4rem 0', flexWrap: 'wrap', gap: '0.3rem' }}>
              <span className="status-badge active-phase">
                Fase: {phase === 'slider' ? 'SLIDESHOW' : phase === 'countdown' ? 'CONTEO' : 'FINAL'}
              </span>
              <span className="status-badge">
                {isPaused ? 'PAUSADO' : 'ACTIVO'}
              </span>
              <span className="status-badge live-clock-badge">
                {currentClock}
              </span>
            </div>

            <div style={{ fontSize: '0.85rem', opacity: 0.85, marginTop: '0.6rem', lineHeight: '1.45' }}>
              {phase === 'slider' && (
                <>
                  {sliderStopMode === 'targetTime' ? (
                    <>
                      <div>
                        Parada de slider: <strong>{format12Hour(sliderTargetTime)}</strong>{' '}
                        <span style={{ opacity: 0.7 }}>({targetInfo.isTomorrow ? 'Mañana' : 'Hoy'})</span>
                      </div>
                      <div>
                        Tiempo restante para el conteo: <strong>{formatSeconds(sliderTimeLeft)}</strong>
                      </div>
                    </>
                  ) : (
                    <div>
                      Tiempo restante de slider: <strong>{formatSeconds(sliderTimeLeft)}</strong>
                    </div>
                  )}
                  <div style={{ opacity: 0.65, fontSize: '0.8rem', marginTop: '0.2rem' }}>
                    Duración del conteo posterior: {Math.round(countdownDuration / 60)} min
                  </div>
                </>
              )}

              {phase === 'countdown' && (
                <>
                  <div>
                    Tiempo restante (Conteo): <strong>{formatSeconds(countdownTimeLeft)}</strong>
                  </div>
                  <div style={{ opacity: 0.65, fontSize: '0.8rem', marginTop: '0.2rem' }}>
                    Al finalizar el conteo se mostrará la pantalla de bienvenida.
                  </div>
                </>
              )}

              {phase === 'final' && (
                <div>
                  Pantalla final de bienvenida activa.
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="panel-section">
            <div className="panel-section-title">Acciones Rápidas</div>
            <div className="btn-row">
              <button
                className="btn btn-primary"
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
                title="Avanzar de fase manualmente"
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
            <div className="panel-section-title">Programación de Parada</div>

            {/* Mode Selector */}
            <div className="mode-toggle">
              <button
                type="button"
                className={`mode-toggle-btn ${modeInput === 'targetTime' ? 'active' : ''}`}
                onClick={() => setModeInput('targetTime')}
              >
                Hora programada (ej. 7:00 PM)
              </button>
              <button
                type="button"
                className={`mode-toggle-btn ${modeInput === 'duration' ? 'active' : ''}`}
                onClick={() => setModeInput('duration')}
              >
                Duración fija (min)
              </button>
            </div>

            <form onSubmit={handleApply}>
              {modeInput === 'targetTime' ? (
                <>
                  <div className="control-group" style={{ marginBottom: '0.4rem' }}>
                    <label className="control-label">
                      Hora de parada e inicio del conteo:
                    </label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <input
                        type="time"
                        step="60"
                        className="control-input control-input-time"
                        value={targetTimeInput}
                        onChange={(e) => setTargetTimeInput(e.target.value)}
                        required
                      />
                      <span className="time-badge">
                        {format12Hour(targetTimeInput)}
                      </span>
                    </div>
                  </div>

                  {/* Day selection */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.75rem', opacity: 0.7 }}>Día objetivo:</span>
                    <div className="day-selector-row">
                      <button
                        type="button"
                        className={`day-btn ${targetDayInput === 'auto' ? 'active' : ''}`}
                        onClick={() => setTargetDayInput('auto')}
                        title="Detecta automáticamente hoy o mañana según la hora actual"
                      >
                        Auto
                      </button>
                      <button
                        type="button"
                        className={`day-btn ${targetDayInput === 'today' ? 'active' : ''}`}
                        onClick={() => setTargetDayInput('today')}
                      >
                        Hoy
                      </button>
                      <button
                        type="button"
                        className={`day-btn ${targetDayInput === 'tomorrow' ? 'active' : ''}`}
                        onClick={() => setTargetDayInput('tomorrow')}
                      >
                        Mañana
                      </button>
                    </div>
                  </div>

                  {/* Quick Preset Buttons */}
                  <div style={{ margin: '0.5rem 0 0.8rem 0' }}>
                    <div style={{ fontSize: '0.72rem', opacity: 0.6, marginBottom: '0.3rem' }}>
                      Atajos rápidos:
                    </div>
                    <div className="presets-row">
                      <button
                        type="button"
                        className="preset-btn"
                        onClick={() => handlePresetSelect('18:00')}
                      >
                        18:00 (6:00 PM)
                      </button>
                      <button
                        type="button"
                        className="preset-btn"
                        onClick={() => handlePresetSelect('19:00')}
                      >
                        19:00 (7:00 PM)
                      </button>
                      <button
                        type="button"
                        className="preset-btn"
                        onClick={() => handlePresetSelect('19:30')}
                      >
                        19:30 (7:30 PM)
                      </button>
                      <button
                        type="button"
                        className="preset-btn"
                        onClick={() => handlePresetSelect('20:00')}
                      >
                        20:00 (8:00 PM)
                      </button>
                      <button
                        type="button"
                        className="preset-btn"
                        onClick={() => handleRelativePreset(5)}
                      >
                        +5 min
                      </button>
                      <button
                        type="button"
                        className="preset-btn"
                        onClick={() => handleRelativePreset(10)}
                      >
                        +10 min
                      </button>
                      <button
                        type="button"
                        className="preset-btn"
                        onClick={() => handleRelativePreset(15)}
                      >
                        +15 min
                      </button>
                    </div>
                  </div>

                  <p className="panel-helper-text">
                    El slider se detendrá automáticamente a las{' '}
                    <strong>{format12Hour(targetTimeInput)}</strong> y el conteo regresivo
                    comenzará de inmediato.
                  </p>
                </>
              ) : (
                <div className="control-group">
                  <label className="control-label">Duración Slider (min)</label>
                  <input
                    type="number"
                    min="1"
                    max="180"
                    className="control-input"
                    value={sliderMinInput}
                    onChange={(e) => setSliderMinInput(e.target.value)}
                  />
                </div>
              )}

              {/* Countdown duration setting */}
              <div className="control-group" style={{ marginTop: '0.8rem' }}>
                <label className="control-label">
                  Duración del Conteo posterior (min)
                </label>
                <input
                  type="number"
                  min="1"
                  max="180"
                  className="control-input"
                  value={countdownMinInput}
                  onChange={(e) => setCountdownMinInput(e.target.value)}
                />
              </div>
              <p className="panel-helper-text" style={{ marginBottom: '0.8rem' }}>
                Tiempo que durará la cuenta regresiva antes de mostrar la pantalla final.
              </p>

              <button
                type="submit"
                className="btn btn-primary btn-full"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}
              >
                {appliedFeedback ? <Check size={16} /> : null}
                {appliedFeedback ? '¡Ajustes Aplicados!' : 'Guardar y Aplicar'}
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
