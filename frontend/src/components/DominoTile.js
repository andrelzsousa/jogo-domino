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
  playableLeft = false,
  playableRight = false,
}) {
  const dotPositions = {
    0: [],
    1: [[1, 1]],
    2: [
      [0, 0],
      [2, 2],
    ],
    3: [
      [0, 0],
      [1, 1],
      [2, 2],
    ],
    4: [
      [0, 0],
      [0, 2],
      [2, 0],
      [2, 2],
    ],
    5: [
      [0, 0],
      [0, 2],
      [1, 1],
      [2, 0],
      [2, 2],
    ],
    6: [
      [0, 0],
      [0, 2],
      [1, 0],
      [1, 2],
      [2, 0],
      [2, 2],
    ],
  };

  const renderDots = (number) => {
    const dots = [];
    const positions = dotPositions[number] || [];
    for (let i = 0; i < positions.length; i++) {
      const [row, col] = positions[i];
      dots.push(
        <div
          key={i}
          className="dot"
          style={
            isOnBoard
              ? {
                  gridRow: row + 1,
                  gridColumn: col + 1,
                  width: "5px",
                  height: "5px",
                  backgroundColor: "#000",
                  borderRadius: "50%",
                  margin: "auto",
                }
              : {
                  gridRow: row + 1,
                  gridColumn: col + 1,
                  width: "8px",
                  height: "8px",
                  backgroundColor: "#000",
                  borderRadius: "50%",
                  margin: "auto",
                }
          }
        />
      );
    }
    return (
      <div
        style={
          isOnBoard
            ? {
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gridTemplateRows: "repeat(3, 1fr)",
                gap: "4px",
                width: "20px",
                height: "20px",
                padding: "0",
                margin: "auto",
              }
            : {
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gridTemplateRows: "repeat(3, 1fr)",
                gap: "4px",
                width: "32px",
                height: "32px",
                padding: "0",
                margin: "auto",
              }
        }
      >
        {dots}
      </div>
    );
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
      <div className={`tile-half top ${playableLeft ? "playable-side" : ""}`}>
        <div>{renderDots(tile.left)}</div>
      </div>

      <div
        className={`tile-half bottom ${playableRight ? "playable-side" : ""}`}
      >
        <div>{renderDots(tile.right)}</div>
      </div>
    </div>
  );
}

export default DominoTile;
