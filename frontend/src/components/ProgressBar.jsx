import React from 'react';

export default function ProgressBar({ timeLeft, gameOver }) {
  const percentage = gameOver ? 0 : (timeLeft / 20) * 100;

  const getStyle = () => {
    let background = '#ff4757';
    let boxShadow = '0 0 12px rgba(255, 71, 87, 0.5)';

    if (timeLeft > 10) {
      background = '#2ed573';
      boxShadow = '0 0 10px rgba(46, 213, 115, 0.4)';
    } else if (timeLeft > 5) {
      background = '#ff9f43';
      boxShadow = '0 0 10px rgba(255, 159, 67, 0.4)';
    }

    return {
      width: `${percentage}%`,
      background,
      boxShadow,
      transition: 'width 1s linear, background 0.3s ease, box-shadow 0.3s ease'
    };
  };

  return (
    <div className="progress-bar-container glass-panel">
      <div id="gameProgressBar" className="progress-bar" style={getStyle()}></div>
    </div>
  );
}
