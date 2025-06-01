import React from "react";

const Scoreboard = ({ gameState, players }) => {
  const { score = { team1: 0, team2: 0 }, currentRoundMultiplier = 1 } =
    gameState || {};

  // Organiza os jogadores em duplas
  const getTeams = () => {
    if (!players || players.length < 4) return { team1: [], team2: [] };

    const team1 = players.filter((p) => p.team === 1);
    const team2 = players.filter((p) => p.team === 2);

    return { team1, team2 };
  };

  const { team1, team2 } = getTeams();

  const formatTeamNames = (team) => {
    if (team.length < 2) return "Aguardando jogadores...";
    return `${team[0].name} / ${team[1].name}`;
  };

  const getWinningTeam = () => {
    if (score.team1 >= 6 && score.team1 > score.team2) return 1;
    if (score.team2 >= 6 && score.team2 > score.team1) return 2;
    return null;
  };

  const winningTeam = getWinningTeam();

  return (
    <div className="scoreboard">
      {currentRoundMultiplier > 1 && (
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
      )}

      <div className="teams-display">
        <div className="team">
          <h3>DUPLA 1</h3>
          <div className="team-players">{formatTeamNames(team1)}</div>
          <div
            className="team-score"
            style={{ color: winningTeam === 1 ? "#ffd700" : "#fff" }}
          >
            {score.team1}
          </div>
          <div style={{ fontSize: "0.8rem", marginTop: "5px" }}>
            {team1.map((player) => (
              <div key={player.id} style={{ marginBottom: "2px" }}>
                <span>{player.name.substring(0, 10)}: </span>
                <span>{player.stonesCount || 0} pedras</span>
              </div>
            ))}
          </div>
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
          <div
            className="team-score"
            style={{ color: winningTeam === 2 ? "#ffd700" : "#fff" }}
          >
            {score.team2}
          </div>
          <div style={{ fontSize: "0.8rem", marginTop: "5px" }}>
            {team2.map((player) => (
              <div key={player.id} style={{ marginBottom: "2px" }}>
                <span>{player.name.substring(0, 10)}: </span>
                <span>{player.stonesCount || 0} pedras</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {winningTeam && (
        <div className="game-message">
          <h2>🎉 DUPLA {winningTeam} VENCEU A PARTIDA! 🎉</h2>
          <p>
            Placar final: {score.team1} x {score.team2}
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
