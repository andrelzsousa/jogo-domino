import React, { useState, useEffect } from "react";
import io from "socket.io-client";
import GameBoard from "./components/GameBoard";
import PlayerHand from "./components/PlayerHand";
import Scoreboard from "./components/Scoreboard";
import "./App.css";

const socket = io("http://localhost:3001");

function App() {
  const [gameState, setGameState] = useState("welcome"); // welcome, waiting, playing
  const [playerName, setPlayerName] = useState("");
  const [currentPlayerName, setCurrentPlayerName] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [gameData, setGameData] = useState(null);
  const [dragging, setDragging] = useState(null);
  const [gameMessage, setGameMessage] = useState(null);

  useEffect(() => {
    socket.on("joinedGame", ({ playerId, playerName }) => {
      setCurrentPlayerName(playerName);
      setGameState("waiting");
      setErrorMessage("");
    });

    socket.on("roomFull", () => {
      setErrorMessage("Sala cheia! Tente novamente mais tarde.");
    });

    socket.on("nameExists", () => {
      setErrorMessage("Este nome já está sendo usado. Escolha outro nome.");
    });

    socket.on("gameStart", (data) => {
      setGameState("playing");
      showMessage(
        "Jogo iniciado!",
        `Duplas formadas:\nDupla 1: ${data.teams.team1.join(
          " & "
        )}\nDupla 2: ${data.teams.team2.join(" & ")}`
      );
    });

    socket.on("gameState", (data) => {
      setGameData(data);
    });

    socket.on("playerPass", (data) => {
      showMessage(
        "Jogador tocou",
        `${data.playerName} não pode jogar e passou a vez.`
      );
    });

    socket.on("gameEnd", (data) => {
      const winnerTeam = data.winner === 1 ? "Dupla 1" : "Dupla 2";
      showMessage(
        "Fim de jogo!",
        `${winnerTeam} venceu!\nPlacar final: ${data.finalScore.team1} x ${data.finalScore.team2}`
      );
      setTimeout(() => {
        setGameState("welcome");
        setGameData(null);
        setCurrentPlayerName("");
        setPlayerName("");
      }, 5000);
    });

    return () => {
      socket.off("joinedGame");
      socket.off("roomFull");
      socket.off("nameExists");
      socket.off("gameStart");
      socket.off("gameState");
      socket.off("playerPass");
      socket.off("gameEnd");
    };
  }, []);

  const handleJoinGame = () => {
    if (playerName.trim()) {
      socket.emit("joinGame", playerName.trim());
    }
  };

  const handlePlayTile = (tile, position) => {
    socket.emit("playTile", { tile, position });
    setDragging(null);
  };

  const handlePass = () => {
    socket.emit("pass");
  };

  const showMessage = (title, content) => {
    setGameMessage({ title, content });
    setTimeout(() => setGameMessage(null), 3000);
  };

  const handleDragStart = (tile) => {
    setDragging(tile);
  };

  const handleDragEnd = () => {
    setDragging(null);
  };

  if (gameState === "welcome") {
    return (
      <div className="app">
        <div className="welcome-screen">
          <h1>🎲 DOMINÓ ONLINE 🎲</h1>

          <div className="rules-section">
            <h2>📋 Regras do Jogo</h2>
            <ul>
              <li>
                <strong>Formação:</strong> 4 jogadores em 2 duplas (formadas
                aleatoriamente)
              </li>
              <li>
                <strong>Distribuição:</strong> Cada jogador recebe 6 pedras, 4
                ficam dormindo
              </li>
              <li>
                <strong>Início:</strong> Quem tem a maior carroça (peça dupla)
                sai primeiro
              </li>
              <li>
                <strong>Objetivo:</strong> Ser o primeiro a jogar todas as suas
                pedras
              </li>
              <li>
                <strong>Pontuação:</strong> Primeiro time a fazer 6 pontos ganha
              </li>
              <li>
                <strong>Batidas especiais:</strong>
              </li>
              <ul>
                <li>Batida simples: 1 ponto</li>
                <li>Batida de carroça: 2 pontos</li>
                <li>Batida "lá e lô": 3 pontos</li>
                <li>Batida cruzada: 4 pontos</li>
              </ul>
              <li>
                <strong>Tempo limite:</strong> 20 segundos para jogar (senão o
                sistema joga por você)
              </li>
              <li>
                <strong>Duplo clique:</strong> Joga automaticamente se só há uma
                opção
              </li>
              <li>
                <strong>Arrastar:</strong> Arraste a peça para a posição
                desejada no tabuleiro
              </li>
            </ul>
          </div>

          <div className="join-section">
            <h2>🎮 Entrar no Jogo</h2>
            {errorMessage && (
              <div className="error-message">{errorMessage}</div>
            )}
            <div>
              <input
                type="text"
                placeholder="Digite seu nome"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleJoinGame()}
                maxLength={20}
              />
            </div>
            <button onClick={handleJoinGame} disabled={!playerName.trim()}>
              JOGAR
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (gameState === "waiting") {
    return (
      <div className="app">
        <div className="welcome-screen">
          <h1>🎲 DOMINÓ ONLINE 🎲</h1>
          <div className="waiting-message">
            <h2>⏳ Aguardando outros jogadores...</h2>
            <p>
              Você entrou como: <strong>{currentPlayerName}</strong>
            </p>
            <p>Esperando mais jogadores para começar o jogo.</p>
            <p>
              O jogo começará automaticamente quando 4 jogadores estiverem
              conectados.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (gameState === "playing" && gameData) {
    return (
      <div className="app">
        <div className="game-screen">
          <Scoreboard teams={gameData.teams} />

          <GameBoard
            board={gameData.board}
            players={gameData.players}
            currentPlayer={gameData.currentPlayer}
            playerId={gameData.playerId}
            onPlayTile={handlePlayTile}
            dragging={dragging}
            canPlay={gameData.canPlay}
          />

          <PlayerHand
            hand={gameData.hand}
            canPlay={gameData.canPlay}
            onPlayTile={handlePlayTile}
            onPass={handlePass}
            board={gameData.board}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            dragging={dragging}
          />
        </div>

        {gameMessage && (
          <div className="game-message">
            <h2>{gameMessage.title}</h2>
            <p style={{ whiteSpace: "pre-line" }}>{gameMessage.content}</p>
          </div>
        )}
      </div>
    );
  }

  return <div className="app">Carregando...</div>;
}

export default App;
