const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");
const db = require("./database");
const DominoGameLogic = require("./gameLogic");

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

app.use(cors());
app.use(express.json());

const gameLogic = new DominoGameLogic();
let currentGame = null;
let players = [];
let gameState = {
  board: [],
  currentPlayer: 0,
  roundWinner: null,
  doublePoints: 1,
  sleepingTiles: [],
  timeouts: {},
};

// Limpa jogadores desconectados
function cleanupPlayers() {
  players = players.filter((player) => player.connected);
}

// Embaralha array
function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Inicia uma nova rodada
function startNewRound() {
  const distribution = gameLogic.distributeTiles();

  players[0].hand = distribution.player1;
  players[1].hand = distribution.player2;
  players[2].hand = distribution.player3;
  players[3].hand = distribution.player4;
  gameState.sleepingTiles = distribution.sleeping;
  gameState.board = [];

  // Determina quem inicia (maior carroça ou vencedor da rodada anterior)
  if (gameState.roundWinner === null) {
    const hands = players.map((p) => p.hand);
    gameState.currentPlayer = gameLogic.findHighestDouble(hands);
  } else {
    // Um dos jogadores da dupla vencedora
    const winningTeam = Math.floor(gameState.roundWinner / 2);
    gameState.currentPlayer = winningTeam * 2; // Simplificado - poderia ser mais inteligente
  }

  broadcastGameState();
}

// Transmite o estado do jogo para todos os jogadores
function broadcastGameState() {
  players.forEach((player, index) => {
    if (player.socket) {
      const playerView = {
        playerId: index,
        playerName: player.name,
        team: player.team,
        hand: player.hand,
        board: gameState.board,
        currentPlayer: gameState.currentPlayer,
        players: players.map((p, i) => ({
          name: p.name,
          team: p.team,
          handCount: p.hand.length,
          isCurrentPlayer: i === gameState.currentPlayer,
        })),
        teams: {
          team1: {
            names: [players[0]?.name, players[2]?.name],
            score: currentGame?.team1_score || 0,
          },
          team2: {
            names: [players[1]?.name, players[3]?.name],
            score: currentGame?.team2_score || 0,
          },
        },
        canPlay:
          index === gameState.currentPlayer &&
          gameLogic.canPlayerPlay(player.hand, gameState.board),
      };

      player.socket.emit("gameState", playerView);
    }
  });
}

// Próximo jogador
function nextPlayer() {
  do {
    gameState.currentPlayer = (gameState.currentPlayer + 1) % 4;
  } while (
    !gameLogic.canPlayerPlay(
      players[gameState.currentPlayer].hand,
      gameState.board
    )
  );
}

// Verifica fim da rodada
function checkRoundEnd() {
  // Alguém bateu?
  const winner = players.findIndex((player) => player.hand.length === 0);
  if (winner !== -1) {
    endRound(winner, "beat");
    return true;
  }

  // Jogo fechado?
  const hands = players.map((p) => p.hand);
  if (gameLogic.isGameBlocked(hands, gameState.board)) {
    const winnerTeam = gameLogic.determineWinner(hands, [0, 1, 0, 1]);
    if (winnerTeam === 0) {
      // Empate - próxima rodada vale dobrado
      gameState.doublePoints *= 2;
      startNewRound();
    } else {
      endRound(winnerTeam === 1 ? 0 : 1, "blocked");
    }
    return true;
  }

  return false;
}

// Finaliza rodada
function endRound(winner, type) {
  let points = gameState.doublePoints;

  if (type === "beat") {
    const lastTile = gameState.board[gameState.board.length - 1];
    const winType = gameLogic.determineWinType(lastTile, gameState.board);
    points = gameLogic.calculateWinPoints(winType) * gameState.doublePoints;
  }

  const winnerTeam = Math.floor(winner / 2);
  if (winnerTeam === 0) {
    currentGame.team1_score += points;
  } else {
    currentGame.team2_score += points;
  }

  gameState.roundWinner = winner;
  gameState.doublePoints = 1;

  // Verifica fim do jogo
  if (currentGame.team1_score >= 6 || currentGame.team2_score >= 6) {
    const gameWinner = currentGame.team1_score >= 6 ? 1 : 2;
    io.emit("gameEnd", {
      winner: gameWinner,
      finalScore: {
        team1: currentGame.team1_score,
        team2: currentGame.team2_score,
      },
    });
    resetGame();
  } else {
    setTimeout(() => startNewRound(), 3000);
  }

  broadcastGameState();
}

// Reset do jogo
function resetGame() {
  currentGame = null;
  players = [];
  gameState = {
    board: [],
    currentPlayer: 0,
    roundWinner: null,
    doublePoints: 1,
    sleepingTiles: [],
    timeouts: {},
  };
}

// Timeout do jogador
function handlePlayerTimeout(playerId) {
  if (gameState.currentPlayer !== playerId) return;

  const player = players[playerId];
  const autoMove = gameLogic.autoPlay(player.hand, gameState.board);

  if (autoMove) {
    // Joga automaticamente
    playTile(playerId, autoMove.tile, autoMove.position);
  } else {
    // Toca
    io.emit("playerPass", { playerId, playerName: player.name });
    nextPlayer();
    if (!checkRoundEnd()) {
      startPlayerTimeout();
      broadcastGameState();
    }
  }
}

// Inicia timeout do jogador
function startPlayerTimeout() {
  if (gameState.timeouts[gameState.currentPlayer]) {
    clearTimeout(gameState.timeouts[gameState.currentPlayer]);
  }

  gameState.timeouts[gameState.currentPlayer] = setTimeout(() => {
    handlePlayerTimeout(gameState.currentPlayer);
  }, 20000);
}

// Joga uma pedra
function playTile(playerId, tile, position) {
  if (gameState.currentPlayer !== playerId) return false;

  const player = players[playerId];
  const tileIndex = player.hand.findIndex((t) => t.id === tile.id);

  if (tileIndex === -1 || !gameLogic.canPlayTile(tile, gameState.board)) {
    return false;
  }

  // Remove a pedra da mão do jogador
  player.hand.splice(tileIndex, 1);

  // Adiciona ao tabuleiro
  gameState.board = gameLogic.playTile(tile, gameState.board, position);

  // Limpa timeout
  if (gameState.timeouts[playerId]) {
    clearTimeout(gameState.timeouts[playerId]);
    delete gameState.timeouts[playerId];
  }

  // Verifica fim da rodada
  if (!checkRoundEnd()) {
    nextPlayer();
    startPlayerTimeout();
  }

  broadcastGameState();
  return true;
}

io.on("connection", (socket) => {
  console.log("Jogador conectado:", socket.id);

  socket.on("joinGame", (playerName) => {
    // Verifica se a sala está cheia
    if (players.length >= 4) {
      socket.emit("roomFull");
      return;
    }

    // Verifica nome duplicado
    if (players.some((p) => p.name === playerName)) {
      socket.emit("nameExists");
      return;
    }

    // Adiciona jogador
    const playerId = players.length;
    const player = {
      id: playerId,
      name: playerName,
      socket: socket,
      hand: [],
      team: playerId % 2,
      connected: true,
    };

    players.push(player);
    socket.playerId = playerId;

    socket.emit("joinedGame", { playerId, playerName });

    // Se chegou a 4 jogadores, embaralha duplas e inicia o jogo
    if (players.length === 4) {
      // Embaralha posições para formar duplas aleatórias
      const shuffledIndices = shuffleArray([0, 1, 2, 3]);
      const originalPlayers = [...players];

      shuffledIndices.forEach((originalIndex, newIndex) => {
        players[newIndex] = originalPlayers[originalIndex];
        players[newIndex].id = newIndex;
        players[newIndex].team = newIndex % 2;
      });

      currentGame = {
        team1_score: 0,
        team2_score: 0,
      };

      io.emit("gameStart", {
        teams: {
          team1: [players[0].name, players[2].name],
          team2: [players[1].name, players[3].name],
        },
      });

      setTimeout(() => {
        startNewRound();
        startPlayerTimeout();
      }, 2000);
    }
  });

  socket.on("playTile", ({ tile, position }) => {
    if (socket.playerId !== undefined) {
      playTile(socket.playerId, tile, position);
    }
  });

  socket.on("pass", () => {
    if (socket.playerId === gameState.currentPlayer) {
      const player = players[socket.playerId];
      if (!gameLogic.canPlayerPlay(player.hand, gameState.board)) {
        io.emit("playerPass", {
          playerId: socket.playerId,
          playerName: player.name,
        });
        nextPlayer();
        if (!checkRoundEnd()) {
          startPlayerTimeout();
          broadcastGameState();
        }
      }
    }
  });

  socket.on("disconnect", () => {
    console.log("Jogador desconectado:", socket.id);
    if (socket.playerId !== undefined) {
      players[socket.playerId].connected = false;
      // Em um jogo real, você poderia pausar o jogo ou substituir por IA
    }
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
