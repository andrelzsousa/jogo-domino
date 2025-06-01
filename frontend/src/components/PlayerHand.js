import React from "react";
import DominoTile from "./DominoTile";

function PlayerHand({
  hand,
  canPlay,
  onPlayTile,
  onPass,
  board,
  onDragStart,
  onDragEnd,
  dragging,
}) {
  const canPlayTile = (tile) => {
    if (!canPlay || board.length === 0) return canPlay;

    const leftEnd = board[0]?.left;
    const rightEnd = board[board.length - 1]?.right;

    return (
      tile.left === leftEnd ||
      tile.right === leftEnd ||
      tile.left === rightEnd ||
      tile.right === rightEnd
    );
  };

  const handleDoubleClick = (tile) => {
    if (!canPlay || !canPlayTile(tile)) return;

    if (board.length === 0) {
      onPlayTile(tile, "right");
      return;
    }

    const leftEnd = board[0]?.left;
    const rightEnd = board[board.length - 1]?.right;

    const canPlayLeft = tile.left === leftEnd || tile.right === leftEnd;
    const canPlayRight = tile.left === rightEnd || tile.right === rightEnd;

    // Se só pode jogar em um lugar, joga automaticamente
    if (canPlayLeft && !canPlayRight) {
      onPlayTile(tile, "left");
    } else if (canPlayRight && !canPlayLeft) {
      onPlayTile(tile, "right");
    }
    // Se pode jogar nos dois lugares, não faz nada (usuário deve arrastar)
  };

  const handleDragStart = (tile) => {
    if (canPlay && canPlayTile(tile)) {
      onDragStart(tile);
    }
  };

  const canPlayerPlay = () => {
    return hand.some((tile) => canPlayTile(tile));
  };

  return (
    <div className="player-hand">
      <div className="hand-title">
        <h3>Suas pedras ({hand.length})</h3>
        {canPlay && !canPlayerPlay() && (
          <p style={{ color: "#ff6b6b", fontSize: "0.9rem" }}>
            Você não pode jogar nenhuma peça
          </p>
        )}
      </div>

      <div className="hand-tiles">
        {hand.map((tile, index) => (
          <DominoTile
            key={`${tile.id}-${index}`}
            tile={tile}
            isPlayable={canPlay && canPlayTile(tile)}
            onDoubleClick={() => handleDoubleClick(tile)}
            onDragStart={() => handleDragStart(tile)}
            onDragEnd={onDragEnd}
            isDragging={dragging && dragging.id === tile.id}
          />
        ))}
      </div>

      <div className="game-actions">
        {canPlay && !canPlayerPlay() && (
          <button className="pass-button" onClick={onPass}>
            TOCAR (Passar a vez)
          </button>
        )}
      </div>
    </div>
  );
}

export default PlayerHand;
