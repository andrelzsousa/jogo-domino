import React from "react";

const Scoreboard = ({ gameState, players }) => {
  const team1 = gameState.teams.team1;
  const team2 = gameState.teams.team2;

  console.log(gameState);

  const formatTeamNames = (team) => {
    if (team.names.length < 2) return "Aguardando jogadores...";
    return `${team.names[0]} & ${team.names[1]}`;
  };

  const getWinningTeam = () => {
    if (team1.score >= 6 && team1.score > team2.score) return 1;
    if (team2.score >= 6 && team2.score > team1.score) return 2;
    return null;
  };

  const winningTeam = getWinningTeam();

  return (
    <div className="scoreboard">
      {/* {currentRoundMultiplier > 1 && (
        <div
          className="error-message"
          style={{
            background: "rgba(255, 215, 0, 0.2)",
            color: "#ffd700",
            border: "1px solid rgba(255, 215, 0, 0.3)",
          }}
        >
          <strong>Próxima rodada vale {currentRoundMultiplier}x pontos!</strong>
        </div>
      )} */}

      <div className="teams-display">
        <div className="team">
          <h3>DUPLA 1</h3>
          <div className="team-players">{formatTeamNames(team1)}</div>

          <div style={{ fontSize: "0.8rem", marginTop: "5px" }}>
            {team1.names.map((player, index) => (
              <div key={index} style={{ marginBottom: "2px" }}>
                <span>{player}: </span>
                <span>
                  {players.find((p) => p.name === player).handCount || 0} pedras
                </span>
              </div>
            ))}
          </div>

          <div
            className="team-score"
            style={{ color: winningTeam === 1 ? "#ffd700" : "#fff" }}
          >
            {team1.score}
          </div>
          <div style={{ fontSize: "0.8rem", marginTop: "5px" }}></div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            fontSize: "1.5rem",
            fontWeight: "bold",
            color: "#ffd700",
          }}
        >
          VS
        </div>

        <div className="team">
          <h3>DUPLA 2</h3>
          <div className="team-players">{formatTeamNames(team2)}</div>

          <div style={{ fontSize: "0.8rem", marginTop: "5px" }}>
            {team2.names.map((player, index) => (
              <div key={index} style={{ marginBottom: "2px" }}>
                <span>{player}: </span>
                <span>
                  {players.find((p) => p.name === player).handCount || 0} pedras
                </span>
              </div>
            ))}
          </div>

          <div
            className="team-score"
            style={{ color: winningTeam === 2 ? "#ffd700" : "#fff" }}
          >
            {team2.score}
          </div>
        </div>
      </div>

      {winningTeam && (
        <div className="game-message">
          <h2>🎉 DUPLA {winningTeam} VENCEU A PARTIDA! 🎉</h2>
          <p>
            Placar final: {team1.score} x {team2.score}
          </p>
        </div>
      )}

      {gameState && (
        <div
          style={{
            textAlign: "center",
            marginTop: "15px",
            fontSize: "0.9rem",
            color: "#ffd700",
          }}
        >
          <div>
            {gameState.currentRound
              ? `Rodada ${gameState.currentRound}`
              : "Aguardando início"}
          </div>
          {gameState.lastRoundResult && (
            <div style={{ marginTop: "5px", fontSize: "0.8rem" }}>
              Última rodada: {gameState.lastRoundResult}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Scoreboard;
