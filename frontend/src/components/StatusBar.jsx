import React from 'react';

export default function StatusBar({
  playerSymbol,
  aiSymbol,
  playerTurn,
  gameOver,
  playerTimeLeft,
  aiTimeLeft
}) {
  const isPlayerActive = playerTurn && !gameOver;
  const isAIActive = !playerTurn && !gameOver;

  const playerRoleText = gameOver ? "Kết thúc" : (isPlayerActive ? "Đến lượt" : "Chờ...");
  const aiRoleText = gameOver ? "Kết thúc" : (isAIActive ? "Đến lượt" : "Chờ...");

  const getTimerClass = (timeLeft) => {
    if (timeLeft <= 5) return "timer danger";
    if (timeLeft <= 10) return "timer warning";
    return "timer";
  };

  return (
    <div className="status-bar glass-panel">
      {/* Người chơi */}
      <div id="playerCard" className={`player-card ${isPlayerActive ? 'active' : ''}`}>
        <div className="avatar player-avatar">
          <i className="fas fa-user-astronaut"></i>
        </div>
        <div className="player-details">
          <span className="player-label">Người chơi</span>
          <span className="player-role">{playerRoleText}</span>
        </div>
        <div className={`symbol-badge ${playerSymbol}`} id="playerBadge">
          {playerSymbol || 'X'}
        </div>
        <div className={getTimerClass(playerTimeLeft)} id="timerLeft">
          {playerTimeLeft}s
        </div>
      </div>

      {/* Divider VS */}
      <div className="vs-badge">VS</div>

      {/* AI Bot */}
      <div id="aiCard" className={`player-card ${isAIActive ? 'active' : ''}`}>
        <div className={getTimerClass(aiTimeLeft)} id="timerRight">
          {aiTimeLeft}s
        </div>
        <div className={`symbol-badge ${aiSymbol}`} id="aiBadge">
          {aiSymbol || 'O'}
        </div>
        <div className="player-details">
          <span className="player-label">AI Bot</span>
          <span className="player-role">{aiRoleText}</span>
        </div>
        <div className="avatar ai-avatar">
          <i className="fas fa-robot"></i>
        </div>
      </div>
    </div>
  );
}
