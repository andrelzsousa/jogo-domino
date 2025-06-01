const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const dbPath = path.join(__dirname, "domino.db");
const db = new sqlite3.Database(dbPath);

// Inicializa as tabelas
db.serialize(() => {
  // Tabela de jogos
  db.run(`
    CREATE TABLE IF NOT EXISTS games (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      status TEXT DEFAULT 'waiting',
      current_round INTEGER DEFAULT 1,
      team1_score INTEGER DEFAULT 0,
      team2_score INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Tabela de jogadores
  db.run(`
    CREATE TABLE IF NOT EXISTS players (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      game_id INTEGER,
      name TEXT,
      team INTEGER,
      position INTEGER,
      hand TEXT,
      socket_id TEXT,
      FOREIGN KEY (game_id) REFERENCES games (id)
    )
  `);

  // Tabela de estado do jogo
  db.run(`
    CREATE TABLE IF NOT EXISTS game_state (
      game_id INTEGER PRIMARY KEY,
      board TEXT,
      current_player INTEGER,
      round_winner INTEGER,
      double_points INTEGER DEFAULT 1,
      sleeping_tiles TEXT,
      FOREIGN KEY (game_id) REFERENCES games (id)
    )
  `);
});

module.exports = db;
