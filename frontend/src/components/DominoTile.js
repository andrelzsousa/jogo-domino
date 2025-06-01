import React from "react";

function DominoTile({
  tile,
  isPlayable = false,
  isOnBoard = false,
  small = false,
  onDoubleClick,
  onDragStart,
  onDragEnd,
  isDragging = false,
}) {
  const renderDots = (number) => {
    const dots = [];
    const positions = [
      [1, 1],
      [0, 0],
      [2, 2],
      [0, 2],
      [2, 0],
      [1, 0],
      [1, 2],
    ];

    for (let i = 0; i < number; i++) {
      const [row, col] = positions[i];
      dots.push(
        <div
          key={i}
          className="dot"
          style={{
            gridRow: row + 1,
            gridColumn: col + 1,
          }}
        />
      );
    }

    return dots;
  };

  const handleDragStart = (e) => {
    if (!isPlayable || !onDragStart) return;

    e.dataTransfer.effectAllowed = "move";

    e.dataTransfer.setData("text/plain", JSON.stringify(tile));

    onDragStart(tile);
  };

  const handleDragEnd = (e) => {
    if (onDragEnd) {
      onDragEnd();
    }
  };

  const tileClass = `
    ${isOnBoard ? "board-tile" : "domino-tile"}
    ${isPlayable ? "playable" : ""}
    ${isDragging ? "dragging" : ""}
  `.trim();

  return (
    <div
      className={tileClass}
      onDoubleClick={onDoubleClick}
      draggable={isPlayable}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      title={
        isPlayable
          ? "Duplo clique para jogar automaticamente ou arraste para escolher posição"
          : ""
      }
    >
      <div className="tile-half top">
        <div className="dots">{renderDots(tile.left)}</div>
      </div>

      <div className="tile-half bottom">
        <div className="dots">{renderDots(tile.right)}</div>
      </div>
    </div>
  );
}

export default DominoTile;
