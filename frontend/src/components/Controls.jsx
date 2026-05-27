import React from 'react';

export default function Controls({ onUndo, onPlayAgain, undoDisabled, showPlayAgain }) {
  return (
    <div className="controls glass-panel">
      <button
        id="undo"
        className="control-btn"
        onClick={onUndo}
        disabled={undoDisabled}
      >
        <i className="fas fa-undo"></i>
        <span>Lùi một bước</span>
      </button>

      {showPlayAgain && (
        <button
          id="playAgain"
          className="control-btn"
          onClick={onPlayAgain}
        >
          <i className="fas fa-redo"></i>
          <span>Chơi lại</span>
        </button>
      )}
    </div>
  );
}
