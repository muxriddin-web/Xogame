let board = Array(9).fill(null);
let currentPlayer = "X";
let gameActive = false;
let playWithBot = false;

let scoreX = 0;
let scoreO = 0;
let drawScore = 0;

const menu = document.getElementById("menu");
const gameBoard = document.getElementById("gameBoard");
const scoreBoard = document.getElementById("scoreBoard");
const gameButtons = document.getElementById("gameButtons");
const status = document.getElementById("status");

const scoreXEl = document.getElementById("scoreX");
const scoreOEl = document.getElementById("scoreO");
const scoreDrawEl = document.getElementById("scoreDraw");

const statsBox = document.getElementById("statsBox");
const statsX = document.getElementById("statsX");
const statsO = document.getElementById("statsO");
const statsDraw = document.getElementById("statsDraw");
const winSound = new Audio("./music/gamewin.mp3");
const loseSound = new Audio("./music/gamenowin.mp3");
const drawSound = new Audio("./music/gamenext.mp3");
drawSound.volume = 0.7;
winSound.volume = 0.7;
loseSound.volume = 0.7;

const winPatterns = [
  [0,1,2],[3,4,5],[6,7,8],
  [0,3,6],[1,4,7],[2,5,8],
  [0,4,8],[2,4,6]
];
function stopAllSounds() {
  [winSound, loseSound, drawSound].forEach(sound => {
    sound.pause();
    sound.currentTime = 0;
  });
}
function createBoard() {
  gameBoard.innerHTML = "";

  board.forEach((_, i) => {
    const cell = document.createElement("div");
    cell.classList.add("cell");
    cell.dataset.index = i;
    cell.addEventListener("click", handleClick);
    gameBoard.appendChild(cell);
  });
}

function startGame(withBot) {
  playWithBot = withBot;
  board = Array(9).fill(null);
  currentPlayer = "X";
  gameActive = true;

  menu.classList.add("hidden");
  statsBox.classList.add("hidden");

  gameBoard.classList.remove("hidden");
  scoreBoard.classList.remove("hidden");
  gameButtons.classList.remove("hidden");
  status.classList.remove("hidden");

  status.textContent = `${currentPlayer} navbatda`;

  createBoard();
}

function handleClick(e) {
  const index = e.target.dataset.index;

  if (board[index] || !gameActive) return;

  makeMove(index, currentPlayer);

  if (checkEnd()) return;

  currentPlayer = currentPlayer === "X" ? "O" : "X";
  status.textContent = `${currentPlayer} navbatda`;

  if (playWithBot && currentPlayer === "O") {
    setTimeout(botMove, 300);
  }
}

function makeMove(index, player) {
  board[index] = player;
  const cell = document.querySelector(`[data-index='${index}']`);
  cell.textContent = player;
}

function botMove() {
  if (!gameActive) return;

  const bestMove = minimax(board, "O").index;
  makeMove(bestMove, "O");

  if (checkEnd()) return;

  currentPlayer = "X";
  status.textContent = `${currentPlayer} navbatda`;
}

function checkWinner(tempBoard, player) {
  for (let pattern of winPatterns) {
    if (pattern.every(i => tempBoard[i] === player)) {
      return pattern;
    }
  }
  return null;
}
function checkEnd() {
  const winner = checkWinner(board, currentPlayer);

  if (winner) {
    winner.forEach(i => {
      const cell = document.querySelector(`[data-index='${i}']`);

      if (currentPlayer === "X") {
        cell.classList.add("win-x");
      } else {
        if (playWithBot) {
          cell.classList.add("win-o");
        } else {
          cell.classList.add("win-x");
        }
      }
    });

    gameBoard.classList.add("board-win");

    setTimeout(() => {
      gameBoard.classList.remove("board-win");
    }, 1800);

    gameActive = false;

    if (currentPlayer === "X") {
      scoreX++;
      statsX.textContent = scoreX;
      updateScore("X");

      winSound.currentTime = 0;
      winSound.play();
    } else {
      scoreO++;
      statsO.textContent = scoreO;
      updateScore("O");

      if (playWithBot) {
        loseSound.currentTime = 0;
        loseSound.play();
      } else {
        winSound.currentTime = 0;
        winSound.play();
      }
    }

    status.textContent = `${currentPlayer} yutdi!`;
    return true;
  }

  if (board.every(cell => cell)) {
    drawScore++;

    document.querySelectorAll(".cell").forEach(cell => {
      cell.classList.add("draw-cell");
    });

    statsDraw.textContent = drawScore;
    updateScore("draw");

    drawSound.currentTime = 0;
    drawSound.play();

    status.textContent = "Durang!";
    gameActive = false;
    return true;
  }

  return false;
}

function updateScore(winner = null) {
  scoreXEl.textContent = scoreX;
  scoreOEl.textContent = scoreO;
  scoreDrawEl.textContent = drawScore;

  scoreXEl.classList.remove("score-pop");
  scoreOEl.classList.remove("score-pop");
  scoreDrawEl.classList.remove("score-pop");

  void scoreXEl.offsetWidth;

  if (winner === "X") {
    scoreXEl.classList.add("score-pop");
  } else if (winner === "O") {
    scoreOEl.classList.add("score-pop");
  } else if (winner === "draw") {
    scoreDrawEl.classList.add("score-pop");
  }
}
function restartGame() {
  stopAllSounds();

  board = Array(9).fill(null);
  currentPlayer = "X";
  gameActive = true;
  status.textContent = `${currentPlayer} navbatda`;
  document.querySelectorAll(".cell").forEach(cell => {
  cell.classList.remove("win-x", "win-o", "draw-cell");
  });
  createBoard();
}

function backMenu() {
  stopAllSounds();

  gameBoard.classList.add("hidden");
  scoreBoard.classList.add("hidden");
  gameButtons.classList.add("hidden");
  status.classList.add("hidden");

  menu.classList.remove("hidden");
}

function showStats() {
  statsBox.classList.remove("hidden");
}

function minimax(newBoard, player) {
  const empty = newBoard
    .map((v, i) => v === null ? i : null)
    .filter(v => v !== null);

  if (checkWinner(newBoard, "X")) return { score: -10 };
  if (checkWinner(newBoard, "O")) return { score: 10 };
  if (empty.length === 0) return { score: 0 };

  const moves = [];

  for (let i of empty) {
    const move = {};
    move.index = i;
    newBoard[i] = player;

    if (player === "O") {
      move.score = minimax(newBoard, "X").score;
    } else {
      move.score = minimax(newBoard, "O").score;
    }

    newBoard[i] = null;
    moves.push(move);
  }

  let bestMove;

  if (player === "O") {
    let bestScore = -Infinity;
    for (let i = 0; i < moves.length; i++) {
      if (moves[i].score > bestScore) {
        bestScore = moves[i].score;
        bestMove = i;
      }
    }
  } else {
    let bestScore = Infinity;
    for (let i = 0; i < moves.length; i++) {
      if (moves[i].score < bestScore) {
        bestScore = moves[i].score;
        bestMove = i;
      }
    }
  }

  return moves[bestMove];
}

document.getElementById("play-bot").addEventListener("click", () => startGame(true));
document.getElementById("play-friend").addEventListener("click", () => startGame(false));
document.getElementById("show-stats").addEventListener("click", showStats);
document.getElementById("closeStats").addEventListener("click", () => statsBox.classList.add("hidden"));
document.getElementById("restart").addEventListener("click", restartGame);
document.getElementById("backMenu").addEventListener("click", backMenu);