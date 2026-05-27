import React, { useState, useEffect, useRef, useCallback } from 'react';
import SetupModal from './components/SetupModal';
import StatusBar from './components/StatusBar';
import ProgressBar from './components/ProgressBar';
import Board from './components/Board';
import Controls from './components/Controls';
import Toast from './components/Toast';

export default function App() {
  const [board, setBoard] = useState(() => 
    Array(30).fill(null).map(() => Array(30).fill(''))
  );
  const [playerSymbol, setPlayerSymbol] = useState('');
  const [aiSymbol, setAiSymbol] = useState('');
  const [playerTurn, setPlayerTurn] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [undoUsed, setUndoUsed] = useState(false);
  const [history, setHistory] = useState([]);
  const [playerTimeLeft, setPlayerTimeLeft] = useState(20);
  const [aiTimeLeft, setAiTimeLeft] = useState(20);
  const [setupStep, setSetupStep] = useState('side'); // 'side' -> 'turn' -> null (game started)
  const [toast, setToast] = useState({ text: '', type: '', show: false });

  const toastTimeoutRef = useRef(null);

  // Show message function
  const showMessage = (text, type) => {
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }

    setToast({ text, type, show: true });

    if (type !== 'win' && type !== 'lose') {
      toastTimeoutRef.current = setTimeout(() => {
        setToast((prev) => ({ ...prev, show: false }));
      }, 2500);
    }
  };

  // Timers Effect
  useEffect(() => {
    if (setupStep !== null || gameOver) return;

    let interval = null;

    if (playerTurn) {
      setPlayerTimeLeft(20);
      interval = setInterval(() => {
        setPlayerTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            setGameOver(true);
            showMessage('Bạn thua vì hết giờ!', 'lose');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      setAiTimeLeft(20);
      interval = setInterval(() => {
        setAiTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            setGameOver(true);
            showMessage('Bot hết giờ! Bạn thắng cuộc.', 'win');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [playerTurn, gameOver, setupStep]);

  // Handle Side Selection
  const handleSelectSide = (side) => {
    setPlayerSymbol(side);
    setAiSymbol(side === 'X' ? 'O' : 'X');
    setSetupStep('turn');
  };

  // Handle Turn Selection & Start Game
  const handleSelectTurn = (firstPlayerSymbol) => {
    setSetupStep(null);

    if (firstPlayerSymbol === playerSymbol) {
      setPlayerTurn(true);
      setPlayerTimeLeft(20);
    } else {
      setPlayerTurn(false);
      setAiTimeLeft(20);

      // AI goes first: call /move with row=-1, col=-1 on empty board
      const emptyBoard = Array(30).fill(null).map(() => Array(30).fill(''));
      fetch('/move', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          player: playerSymbol,
          board: emptyBoard,
          row: -1,
          col: -1,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.ai_move) {
            const [ar, ac] = data.ai_move;
            const updatedBoard = emptyBoard.map((row) => [...row]);
            updatedBoard[ar][ac] = aiSymbol;
            setBoard(updatedBoard);
            setHistory([{ r: ar, c: ac }]);
          }
          setPlayerTurn(true);
          setPlayerTimeLeft(20);
        })
        .catch((err) => {
          console.error(err);
          showMessage('Không thể kết nối tới server!', 'lose');
        });
    }
  };

  // Handle cell click (Player move)
  const handleCellClick = useCallback((r, c) => {
    if (!playerTurn || gameOver || board[r][c] !== '') return;

    // Place Player piece
    const updatedBoard = board.map((row) => [...row]);
    updatedBoard[r][c] = playerSymbol;
    setBoard(updatedBoard);

    const newHistory = [...history, { r, c }];
    setHistory(newHistory);
    setPlayerTurn(false);

    // Call API /move
    fetch('/move', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        player: playerSymbol,
        board: updatedBoard,
        row: r,
        col: c,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.player_win) {
          setGameOver(true);
          showMessage('Chúc mừng! Bạn đã chiến thắng.', 'win');
          return;
        }

        const nextBoard = updatedBoard.map((row) => [...row]);
        let finalHistory = newHistory;

        if (data.ai_move) {
          const [ar, ac] = data.ai_move;
          nextBoard[ar][ac] = aiSymbol;
          setBoard(nextBoard);
          finalHistory = [...newHistory, { r: ar, c: ac }];
          setHistory(finalHistory);
        }

        if (data.ai_win) {
          setGameOver(true);
          showMessage('Rất tiếc! AI Bot đã thắng.', 'lose');
          return;
        }

        if (data.player_about_to_lose) {
          showMessage('Nguy hiểm! AI sắp giành chiến thắng.', 'warning');
        } else if (data.player_about_to_win) {
          showMessage('Cơ hội! Bạn đang tiến gần chiến thắng.', 'warning');
        }

        setPlayerTurn(true);
        setPlayerTimeLeft(20);
      })
      .catch((err) => {
        console.error(err);
        showMessage('Có lỗi kết nối tới server!', 'lose');
        setPlayerTurn(true);
      });
  }, [playerTurn, gameOver, board, playerSymbol, history, aiSymbol]);

  // Undo last 2 moves (AI & Player)
  const handleUndo = () => {
    if (undoUsed || gameOver || history.length === 0) return;

    const newHistory = [...history];
    const updatedBoard = board.map((row) => [...row]);

    // 1. Pop AI's move
    if (newHistory.length > 0) {
      const lastAI = newHistory.pop();
      updatedBoard[lastAI.r][lastAI.c] = '';
    }

    // 2. Pop Player's move
    if (newHistory.length > 0) {
      const lastPlayer = newHistory.pop();
      updatedBoard[lastPlayer.r][lastPlayer.c] = '';
    }

    setBoard(updatedBoard);
    setHistory(newHistory);
    setUndoUsed(true);
    setPlayerTurn(true);
    setPlayerTimeLeft(20);
  };

  // Play Again (Reset Game State)
  const handlePlayAgain = () => {
    // Reload state
    setBoard(Array(30).fill(null).map(() => Array(30).fill('')));
    setPlayerSymbol('');
    setAiSymbol('');
    setPlayerTurn(false);
    setGameOver(false);
    setUndoUsed(false);
    setHistory([]);
    setPlayerTimeLeft(20);
    setAiTimeLeft(20);
    setSetupStep('side');
    setToast({ text: '', type: '', show: false });
  };

  // Determine last move to highlight
  const lastMove = history.length > 0 ? history[history.length - 1] : null;

  return (
    <>
      {/* Background glow elements */}
      <div className="bg-glow bg-glow-1"></div>
      <div className="bg-glow bg-glow-2"></div>

      <div id="app">
        {/* Header */}
        <header className="game-header">
          <h1 className="game-title">
            <i className="fas fa-gamepad icon-game"></i> CARO <span className="neon-text">AI</span>
          </h1>
        </header>

        {/* Game Container */}
        <div className="game-container">
          <StatusBar
            playerSymbol={playerSymbol}
            aiSymbol={aiSymbol}
            playerTurn={playerTurn}
            gameOver={gameOver}
            playerTimeLeft={playerTimeLeft}
            aiTimeLeft={aiTimeLeft}
          />

          <ProgressBar
            timeLeft={playerTurn ? playerTimeLeft : aiTimeLeft}
            gameOver={gameOver}
          />

          <Board
            board={board}
            onCellClick={handleCellClick}
            playerSymbol={playerSymbol}
            playerTurn={playerTurn}
            gameOver={gameOver}
            lastMove={lastMove}
          />

          <Controls
            onUndo={handleUndo}
            onPlayAgain={handlePlayAgain}
            undoDisabled={undoUsed || gameOver || history.length === 0}
            showPlayAgain={gameOver}
          />
        </div>
      </div>

      <SetupModal
        isOpen={setupStep !== null}
        step={setupStep}
        onSelectSide={handleSelectSide}
        onSelectTurn={handleSelectTurn}
        playerSymbol={playerSymbol}
      />

      <Toast
        text={toast.text}
        type={toast.type}
        show={toast.show}
      />
    </>
  );
}
