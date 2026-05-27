import React from 'react';

export default function SetupModal({ isOpen, step, onSelectSide, onSelectTurn, playerSymbol }) {
  if (!isOpen) return null;

  return (
    <div id="setupOverlay" className="modal-overlay">
      {step === 'side' && (
        <div id="sideSelection" className="modal-content glass-panel">
          <h2><i className="fas fa-users-cog"></i> Chọn phe của bạn</h2>
          <p className="modal-subtitle">Hãy chọn màu sắc đại diện cho quân cờ của bạn</p>
          <div className="side-buttons">
            <button id="chooseX" className="select-btn choose-x" onClick={() => onSelectSide('X')}>
              <div className="symbol-circle"><i className="fas fa-xmark"></i></div>
              <div className="select-info">
                <span className="btn-title">Quân X</span>
                <span className="btn-desc">Màu đỏ san hô rực rỡ</span>
              </div>
            </button>
            <button id="chooseO" className="select-btn choose-o" onClick={() => onSelectSide('O')}>
              <div className="symbol-circle"><i className="fas fa-circle-notch"></i></div>
              <div className="select-info">
                <span className="btn-title">Quân O</span>
                <span className="btn-desc">Màu xanh Neon mát lạnh</span>
              </div>
            </button>
          </div>
        </div>
      )}

      {step === 'turn' && (
        <div id="turnSelection" className="modal-content glass-panel">
          <h2><i className="fas fa-hourglass-start"></i> Chọn lượt đi</h2>
          <p className="modal-subtitle">Quyết định ai là người khai cuộc trận đấu</p>
          <div className="turn-buttons">
            <button id="chooseFirst" className="select-btn choose-first" onClick={() => onSelectTurn(playerSymbol)}>
              <div className="symbol-circle"><i className="fas fa-bolt"></i></div>
              <div className="select-info">
                <span className="btn-title">Đi trước</span>
                <span className="btn-desc">Tận dụng lợi thế tấn công</span>
              </div>
            </button>
            <button id="chooseSecond" className="select-btn choose-second" onClick={() => onSelectTurn(playerSymbol === 'X' ? 'O' : 'X')}>
              <div className="symbol-circle"><i className="fas fa-shield-halved"></i></div>
              <div className="select-info">
                <span className="btn-title">Đi sau</span>
                <span className="btn-desc">Phòng ngự phản công sắc bén</span>
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
