document.addEventListener("DOMContentLoaded", function () {
  // Ngăn việc bôi đen văn bản trên toàn bộ trang game
  document.addEventListener("selectstart", function (e) {
    e.preventDefault();
  });

  // Tham chiếu các phần tử DOM
  const boardDiv = document.getElementById("board");
  const chooseXBtn = document.getElementById("chooseX");
  const chooseOBtn = document.getElementById("chooseO");
  const sideSelection = document.getElementById("sideSelection");
  const turnSelection = document.getElementById("turnSelection");
  const setupOverlay = document.getElementById("setupOverlay");
  const chooseFirstBtn = document.getElementById("chooseFirst");
  const chooseSecondBtn = document.getElementById("chooseSecond");
  const undoBtn = document.getElementById("undo");
  const messageDiv = document.getElementById("message");
  const playAgainBtn = document.getElementById("playAgain");
  
  const playerCard = document.getElementById("playerCard");
  const aiCard = document.getElementById("aiCard");
  const turnStatusLeft = document.getElementById("turnStatusLeft");
  const turnStatusRight = document.getElementById("turnStatusRight");
  const timerLeft = document.getElementById("timerLeft");
  const timerRight = document.getElementById("timerRight");
  const playerBadge = document.getElementById("playerBadge");
  const aiBadge = document.getElementById("aiBadge");
  const gameProgressBar = document.getElementById("gameProgressBar");

  // Các biến quản lý trạng thái trò chơi
  let playerSymbol = "";
  let aiSymbol = "";
  let playerTurn = false;
  let gameOver = false;
  let undoUsed = false;
  let board = Array(30)
    .fill()
    .map(() => Array(30).fill(""));
  let history = [];
  let selectedCell = null;
  let playerTimerInterval = null;
  let aiTimerInterval = null;
  let playerTimeLeft = 20;
  let aiTimeLeft = 20;

  // Xây dựng bàn cờ 30x30
  for (let r = 0; r < 30; r++) {
    for (let c = 0; c < 30; c++) {
      const cell = document.createElement("div");
      cell.id = `cell-${r}-${c}`;
      cell.classList.add("cell");
      
      // Xử lý sự kiện click ô cờ
      cell.addEventListener("click", () => cellClick(r, c));
      
      // Xử lý hiệu ứng hover xem trước nước đi (Preview)
      cell.addEventListener("mouseenter", () => {
        if (!playerTurn || gameOver || board[r][c] !== "") return;
        cell.classList.add(playerSymbol === "X" ? "preview-X" : "preview-O");
      });
      
      cell.addEventListener("mouseleave", () => {
        cell.classList.remove("preview-X", "preview-O");
      });

      boardDiv.appendChild(cell);
    }
  }

  // Cập nhật trạng thái hiển thị lượt đi
  function updateTurnStatus() {
    if (playerTurn && !gameOver) {
      turnStatusLeft.textContent = "Đến lượt";
      turnStatusRight.textContent = "Chờ...";
      playerCard.classList.add("active");
      aiCard.classList.remove("active");
    } else if (!playerTurn && !gameOver) {
      turnStatusLeft.textContent = "Chờ...";
      turnStatusRight.textContent = "Đến lượt";
      playerCard.classList.remove("active");
      aiCard.classList.add("active");
    } else {
      turnStatusLeft.textContent = "Kết thúc";
      turnStatusRight.textContent = "Kết thúc";
      playerCard.classList.remove("active");
      aiCard.classList.remove("active");
      gameProgressBar.style.width = "0%";
    }
    updateUndoButton();
  }

  // Cập nhật thanh tiến trình đếm ngược dựa trên thời gian còn lại
  function updateProgressBar(timeLeft) {
    const percentage = (timeLeft / 20) * 100;
    gameProgressBar.style.width = percentage + "%";
    
    // Thay đổi màu thanh chạy theo mức độ khẩn cấp
    if (timeLeft > 10) {
      gameProgressBar.style.background = "#2ed573";
      gameProgressBar.style.boxShadow = "0 0 10px rgba(46, 213, 115, 0.4)";
    } else if (timeLeft > 5) {
      gameProgressBar.style.background = "#ff9f43";
      gameProgressBar.style.boxShadow = "0 0 10px rgba(255, 159, 67, 0.4)";
    } else {
      gameProgressBar.style.background = "#ff4757";
      gameProgressBar.style.boxShadow = "0 0 12px rgba(255, 71, 87, 0.5)";
    }
  }

  // Quản lý lớp CSS cảnh báo nguy hiểm trên bộ đếm thời gian
  function updateTimerUrgency(timeLeft, timerElement) {
    if (timeLeft <= 5) {
      timerElement.className = "timer danger";
    } else if (timeLeft <= 10) {
      timerElement.className = "timer warning";
    } else {
      timerElement.className = "timer";
    }
  }

  // Bắt đầu đếm ngược thời gian cho người chơi
  function startPlayerTimer() {
    clearInterval(playerTimerInterval);
    playerTimeLeft = 20;
    timerLeft.textContent = playerTimeLeft + "s";
    timerLeft.className = "timer";
    updateProgressBar(playerTimeLeft);

    playerTimerInterval = setInterval(() => {
      playerTimeLeft--;
      timerLeft.textContent = playerTimeLeft + "s";
      updateProgressBar(playerTimeLeft);
      updateTimerUrgency(playerTimeLeft, timerLeft);

      if (playerTimeLeft <= 0) {
        clearInterval(playerTimerInterval);
        timerLeft.textContent = "Hết giờ";
        playerTurn = false;
        gameOver = true;
        showMessage("Bạn thua vì hết giờ!", "lose");
        endGame();
      }
    }, 1000);
  }

  // Bắt đầu đếm ngược thời gian cho AI Bot
  function startAITimer() {
    clearInterval(aiTimerInterval);
    aiTimeLeft = 20;
    timerRight.textContent = aiTimeLeft + "s";
    timerRight.className = "timer";
    updateProgressBar(aiTimeLeft);

    aiTimerInterval = setInterval(() => {
      aiTimeLeft--;
      timerRight.textContent = aiTimeLeft + "s";
      updateProgressBar(aiTimeLeft);
      updateTimerUrgency(aiTimeLeft, timerRight);

      if (aiTimeLeft <= 0) {
        clearInterval(aiTimerInterval);
        timerRight.textContent = "Hết giờ";
        playerTurn = true;
        gameOver = true;
        showMessage("Bot hết giờ! Bạn thắng cuộc.", "win");
        endGame();
      }
    }, 1000);
  }

  function stopPlayerTimer() {
    clearInterval(playerTimerInterval);
    timerLeft.className = "timer";
  }

  function stopAITimer() {
    clearInterval(aiTimerInterval);
    timerRight.className = "timer";
  }

  // Trạng thái nút Hoàn tác (Undo)
  function updateUndoButton() {
    if (undoUsed || gameOver || history.length === 0) {
      undoBtn.disabled = true;
    } else {
      undoBtn.disabled = false;
    }
  }

  // Tiến vào bước chọn lượt đi sau khi chọn xong phe cờ
  function startGame() {
    sideSelection.classList.add("hidden");
    turnSelection.classList.remove("hidden");
  }

  // Bắt đầu ván chơi sau khi chọn lượt đi
  function startGameWithTurn(firstPlayer) {
    turnSelection.classList.add("hidden");
    setupOverlay.classList.add("hidden"); // Ẩn hoàn toàn overlay thiết lập
    updateTurnStatus();
    
    if (firstPlayer === playerSymbol) {
      playerTurn = true;
      updateTurnStatus();
      startPlayerTimer();
    } else {
      playerTurn = false;
      updateTurnStatus();
      startAITimer();
      
      // AI đi trước
      fetch("/move", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          player: playerSymbol,
          board: board,
          row: -1,
          col: -1,
        }),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.ai_move) {
            const [ar, ac] = data.ai_move;
            placePiece(ar, ac, aiSymbol);
            history.push({ r: ar, c: ac });
          }
          playerTurn = true;
          updateTurnStatus();
          stopAITimer();
          startPlayerTimer();
        });
    }
  }

  // Xử lý khi bấm vào ô cờ
  function cellClick(r, c) {
    if (!playerTurn || gameOver) return;
    if (board[r][c] !== "") return;

    const cell = document.getElementById(`cell-${r}-${c}`);
    cell.classList.remove("preview-X", "preview-O");

    // Đặt quân cờ của người chơi ngay lập tức
    placePiece(r, c, playerSymbol);
    history.push({ r: r, c: c });
    
    playerTurn = false;
    updateTurnStatus();
    stopPlayerTimer();
    startAITimer();

    // Gửi nước đi của người chơi tới Flask Server
    fetch("/move", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        player: playerSymbol,
        board: board,
        row: r,
        col: c,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        // Người chơi thắng
        if (data.player_win) {
          stopAITimer();
          showMessage("Chúc mừng! Bạn đã chiến thắng.", "win");
          endGame();
          return;
        }
        
        // Thực hiện nước đi của Bot AI
        if (data.ai_move) {
          const [ar, ac] = data.ai_move;
          placePiece(ar, ac, aiSymbol);
          history.push({ r: ar, c: ac });
        }
        
        // AI thắng
        if (data.ai_win) {
          stopAITimer();
          showMessage("Rất tiếc! AI Bot đã thắng.", "lose");
          endGame();
          return;
        }

        // Cảnh báo nếu sắp thắng/thua (đọc dữ liệu từ backend trả về)
        if (data.player_about_to_lose) {
          showMessage("Nguy hiểm! AI sắp giành chiến thắng.", "warning");
        } else if (data.player_about_to_win) {
          showMessage("Cơ hội! Bạn đang tiến gần chiến thắng.", "warning");
        }

        playerTurn = true;
        updateTurnStatus();
        stopAITimer();
        startPlayerTimer();
      });
  }

  // Đặt quân cờ và đồng bộ giao diện
  function placePiece(r, c, symbol) {
    board[r][c] = symbol;
    
    // Gỡ bỏ dấu hiệu nước đi cuối cùng của các ô cũ
    document
      .querySelectorAll(".last-move")
      .forEach((cell) => cell.classList.remove("last-move"));
      
    const cell = document.getElementById(`cell-${r}-${c}`);
    cell.textContent = ""; 
    cell.classList.remove("selected", "selected-X", "selected-O", "preview-X", "preview-O");
    cell.classList.add(symbol, "last-move");
  }

  // Hiển thị hộp thông báo/cảnh báo nổi (Toast Message)
  function showMessage(text, type) {
    messageDiv.textContent = text;
    messageDiv.className = "";
    messageDiv.classList.add(type, "show");
    
    // Nếu là thông báo thường hoặc cảnh báo, tự động ẩn sau 2.5s
    if (type !== "win" && type !== "lose") {
      setTimeout(() => {
        messageDiv.classList.remove("show");
      }, 2500);
    }
  }

  // Kết thúc trận đấu
  function endGame() {
    gameOver = true;
    undoBtn.disabled = true;
    playAgainBtn.classList.remove("hidden");
    stopPlayerTimer();
    stopAITimer();
    updateTurnStatus();
  }

  // Nút chơi lại: tải lại trang
  playAgainBtn.addEventListener("click", () => {
    messageDiv.classList.remove("show");
    location.reload();
  });

  // Xử lý chức năng Hoàn tác (Undo) - quay lại 1 cặp nước đi
  undoBtn.addEventListener("click", () => {
    if (undoUsed || gameOver || history.length === 0) return;

    // 1. Thu hồi nước đi cuối của AI Bot
    if (history.length > 0) {
      const last = history.pop();
      board[last.r][last.c] = "";
      const cell = document.getElementById(`cell-${last.r}-${last.c}`);
      cell.className = "cell";
    }
    
    // 2. Thu hồi nước đi cuối của Người chơi
    if (history.length > 0) {
      const last = history.pop();
      board[last.r][last.c] = "";
      const cell = document.getElementById(`cell-${last.r}-${last.c}`);
      cell.className = "cell";
    }

    // Thiết lập lại ô đi cuối cùng (nếu còn)
    document.querySelectorAll(".last-move").forEach(cell => cell.classList.remove("last-move"));
    if (history.length > 0) {
      const last = history[history.length - 1];
      const cell = document.getElementById(`cell-${last.r}-${last.c}`);
      if (cell) {
        cell.classList.add("last-move");
      }
    }

    undoUsed = true;
    updateTurnStatus();
    
    if (playerTurn && !gameOver) {
      startPlayerTimer();
    }
  });

  // Chọn quân X
  chooseXBtn.addEventListener("click", () => {
    playerSymbol = "X";
    aiSymbol = "O";
    playerBadge.textContent = "X";
    playerBadge.className = "symbol-badge X";
    aiBadge.textContent = "O";
    aiBadge.className = "symbol-badge O";
    startGame();
  });

  // Chọn quân O
  chooseOBtn.addEventListener("click", () => {
    playerSymbol = "O";
    aiSymbol = "X";
    playerBadge.textContent = "O";
    playerBadge.className = "symbol-badge O";
    aiBadge.textContent = "X";
    aiBadge.className = "symbol-badge X";
    startGame();
  });

  // Chọn đi trước
  chooseFirstBtn.addEventListener("click", () => {
    startGameWithTurn(playerSymbol);
  });

  // Chọn đi sau
  chooseSecondBtn.addEventListener("click", () => {
    startGameWithTurn(aiSymbol);
  });
});
