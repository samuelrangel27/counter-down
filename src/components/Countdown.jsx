import logoImage from '../assets/logo-yellow-espacio-vidain-gdl.png';

export default function Countdown({ timeLeft }) {
  // Format total seconds into mm:ss
  const formatTime = (totalSeconds) => {
    if (totalSeconds < 0) totalSeconds = 0;
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    const displayMins = minutes.toString().padStart(2, '0');
    const displaySecs = seconds.toString().padStart(2, '0');

    return `${displayMins}:${displaySecs}`;
  };

  const isCritical = timeLeft <= 10;

  return (
    <div className={`countdown-container ${isCritical ? 'critical-mode' : ''}`}>
      {/* Logo in top-left corner */}
      <div className="logo-container">
        <img src={logoImage} alt="espacios vidain Guadalajara" className="logo-image" />
      </div>

      {/* Centered Counter */}
      <div className="counter-display">
        {isCritical ? (
          <div key={timeLeft} className="critical-seconds-digit">
            {timeLeft}
          </div>
        ) : (
          <div className="counter-digits">{formatTime(timeLeft)}</div>
        )}
      </div>

      {/* Decorative Athelas Italic O Arc in bottom-right */}
      <div className="corner-arc">O</div>
    </div>
  );
}
