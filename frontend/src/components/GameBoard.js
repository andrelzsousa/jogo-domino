import React, { useState } from "react";
import DominoTile from "./DominoTile";

function GameBoard({
  board,
  players,
  currentPlayer,
  playerId,
  onPlayTile,
  dragging,
  canPlay,
}) {
  const [dragOver, setDragOver] = useState(null);

  const handleDragOver = (e, position) => {
    e.preventDefault();
    if (dragging && canPlay) {
      setDragOver(position);
    }
  };

  const handleDragLeave = () => {
    setDragOver(null);
  };

  const handleDrop = (e, position) => {
    e.preventDefault();
    if (dragging && canPlay) {
      onPlayTile(dragging, position);
      setDragOver(null);
    }
  };

  const canPlayTileAt = (tile, position) => {
    if (!tile || board.length === 0) return true;

    const leftEnd = board[0]?.left;
    const rightEnd = board[board.length - 1]?.right;

    if (position === "left") {
      return tile.left === leftEnd || tile.right === leftEnd;
    } else {
      return tile.left === rightEnd || tile.right === rightEnd;
    }
  };

  const getPlayableSides = (tile, index) => {
    if (board.length === 0) return { left: true, right: true };
    if (index === 0) return { left: true, right: false };
    if (index === board.length - 1) return { left: false, right: true };
    return { left: false, right: false };
  };

  const renderOpponentHand = (player, position, index) => {
    const isCurrentPlayer = index === currentPlayer;

    return (
      <div key={index} className={`opponent-hand ${position}`}>
        {Array.from({ length: player.handCount }).map((_, tileIndex) => (
          <div key={tileIndex} className="opponent-tile">
            ?
          </div>
        ))}
        {isCurrentPlayer && (
          <div className={`current-player-indicator ${position}`}>
            {player.name}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="game-table">
      <div className="opponent-hands">
        {players.map((player, index) => {
          if (index === playerId) return null;

          let position;
          const relativeIndex = (index - playerId + 4) % 4;

          switch (relativeIndex) {
            case 1:
              position = "right";
              break;
            case 2:
              position = "top";
              break;
            case 3:
              position = "left";
              break;
            default:
              position = "bottom";
          }

          return renderOpponentHand(player, position, index);
        })}

        {playerId === currentPlayer && (
          <div className="current-player-indicator bottom">Sua vez!</div>
        )}
      </div>

      <div className="board">
        {/* Drop zone esquerda */}
        {board.length > 0 &&
          canPlay &&
          dragging &&
          canPlayTileAt(dragging, "left") && (
            <div
              className={`drop-zone left ${
                dragOver === "left" ? "active" : ""
              }`}
              onDragOver={(e) => handleDragOver(e, "left")}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, "left")}
            >
              JOGAR AQUI
            </div>
          )}

        {/* Tabuleiro com as peças jogadas */}
        {board.map((tile, index) => {
          const playableSides = getPlayableSides(tile, index);
          return (
            <DominoTile
              key={`${tile.id}-${index}`}
              tile={tile}
              isOnBoard={true}
              small={true}
              playableLeft={playableSides.left}
              playableRight={playableSides.right}
            />
          );
        })}

        {/* Drop zone direita */}
        {board.length > 0 &&
          canPlay &&
          dragging &&
          canPlayTileAt(dragging, "right") && (
            <div
              className={`drop-zone right ${
                dragOver === "right" ? "active" : ""
              }`}
              onDragOver={(e) => handleDragOver(e, "right")}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, "right")}
            >
              JOGAR AQUI
            </div>
          )}

        {/* Drop zone central para primeira jogada */}
        {board.length === 0 && canPlay && dragging && (
          <div
            className="drop-zone active"
            style={{ position: "relative" }}
            onDragOver={(e) => handleDragOver(e, "right")}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, "right")}
          >
            PRIMEIRA JOGADA
          </div>
        )}
      </div>
    </div>
  );
}

export default GameBoard;
