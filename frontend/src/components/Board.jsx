import React, { memo } from 'react';

const Board = memo(function Board({ board, onCellClick, playerSymbol, playerTurn, gameOver, lastMove }) {
  const isInteractive = playerTurn && !gameOver;
  const previewClass = isInteractive ? (playerSymbol === "X" ? "preview-mode-x" : "preview-mode-o") : "";

  return (
    <div className="main-layout">
      <div className="board-wrapper">
        <div id="board" className={previewClass}>
          {board.map((row, r) =>
            row.map((cellValue, c) => {
              const isLastMove = lastMove && lastMove.r === r && lastMove.c === c;
              
              let cellClass = "cell";
              if (cellValue) {
                cellClass += ` ${cellValue}`;
              }
              if (isLastMove) {
                cellClass += " last-move";
              }

              return (
                <div
                  key={`${r}-${c}`}
                  id={`cell-${r}-${c}`}
                  className={cellClass}
                  onClick={() => onCellClick(r, c)}
                />
              );
            })
          )}
        </div>
      </div>
    </div>
  );
});

export default Board;
