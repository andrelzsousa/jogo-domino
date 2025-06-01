class DominoGameLogic {
  constructor() {
    this.tiles = this.generateTiles();
  }

  // Gera todas as pedras do dominó (0-0 até 6-6)
  generateTiles() {
    const tiles = [];
    for (let i = 0; i <= 6; i++) {
      for (let j = i; j <= 6; j++) {
        tiles.push({ left: i, right: j, id: `${i}-${j}` });
      }
    }
    return tiles;
  }

  // Embaralha e distribui as pedras
  distributeTiles() {
    const shuffled = [...this.tiles].sort(() => Math.random() - 0.5);

    return {
      player1: shuffled.slice(0, 6),
      player2: shuffled.slice(6, 12),
      player3: shuffled.slice(12, 18),
      player4: shuffled.slice(18, 24),
      sleeping: shuffled.slice(24, 28),
    };
  }

  // Encontra a maior carroça
  findHighestDouble(hands) {
    let highestDouble = -1;
    let playerWithHighest = -1;

    hands.forEach((hand, playerIndex) => {
      hand.forEach((tile) => {
        if (tile.left === tile.right && tile.left > highestDouble) {
          highestDouble = tile.left;
          playerWithHighest = playerIndex;
        }
      });
    });

    return playerWithHighest;
  }

  // Verifica se uma pedra pode ser jogada
  canPlayTile(tile, board) {
    if (board.length === 0) return true;

    const leftEnd = board[0].left;
    const rightEnd = board[board.length - 1].right;

    return (
      tile.left === leftEnd ||
      tile.right === leftEnd ||
      tile.left === rightEnd ||
      tile.right === rightEnd
    );
  }

  // Joga uma pedra no tabuleiro
  playTile(tile, board, position) {
    if (board.length === 0) {
      return [tile];
    }

    const newBoard = [...board];

    if (position === "left") {
      const leftEnd = board[0].left;
      if (tile.right === leftEnd) {
        newBoard.unshift(tile);
      } else if (tile.left === leftEnd) {
        newBoard.unshift({ left: tile.right, right: tile.left, id: tile.id });
      }
    } else if (position === "right") {
      const rightEnd = board[board.length - 1].right;
      if (tile.left === rightEnd) {
        newBoard.push(tile);
      } else if (tile.right === rightEnd) {
        newBoard.push({ left: tile.right, right: tile.left, id: tile.id });
      }
    }

    return newBoard;
  }

  // Verifica se o jogo está fechado
  isGameBlocked(hands, board) {
    return hands.every(
      (hand) => !hand.some((tile) => this.canPlayTile(tile, board))
    );
  }

  // Calcula pontos na mão
  calculateHandPoints(hand) {
    return hand.reduce((sum, tile) => sum + tile.left + tile.right, 0);
  }

  // Determina o vencedor quando o jogo fecha
  determineWinner(hands, teams) {
    const team1Points =
      this.calculateHandPoints(hands[0]) + this.calculateHandPoints(hands[2]);
    const team2Points =
      this.calculateHandPoints(hands[1]) + this.calculateHandPoints(hands[3]);

    if (team1Points < team2Points) return 1;
    if (team2Points < team1Points) return 2;
    return 0; // Empate
  }

  // Calcula pontos da batida
  calculateWinPoints(winType, board) {
    switch (winType) {
      case "simple":
        return 1;
      case "double":
        return 2;
      case "lalo":
        return 3;
      case "cross":
        return 4;
      default:
        return 1;
    }
  }

  // Determina o tipo de batida
  determineWinType(lastTile, board) {
    if (board.length <= 1) return "simple";

    const leftEnd = board[0].left;
    const rightEnd = board[board.length - 1].right;

    // Batida cruzada (carroça em duas cabeças iguais)
    if (
      lastTile.left === lastTile.right &&
      leftEnd === rightEnd &&
      lastTile.left === leftEnd
    ) {
      return "cross";
    }

    // Batida lá e lô (peça diferente em duas cabeças diferentes)
    if (
      lastTile.left !== lastTile.right &&
      leftEnd !== rightEnd &&
      ((lastTile.left === leftEnd && lastTile.right === rightEnd) ||
        (lastTile.right === leftEnd && lastTile.left === rightEnd))
    ) {
      return "lalo";
    }

    // Batida de carroça (carroça em uma cabeça)
    if (lastTile.left === lastTile.right) {
      return "double";
    }

    return "simple";
  }

  // Verifica se um jogador pode jogar
  canPlayerPlay(hand, board) {
    return hand.some((tile) => this.canPlayTile(tile, board));
  }

  // Joga automaticamente (timeout ou IA simples)
  autoPlay(hand, board) {
    const playableTiles = hand.filter((tile) => this.canPlayTile(tile, board));
    if (playableTiles.length === 0) return null;

    // Escolhe aleatoriamente entre as opções válidas
    const randomTile =
      playableTiles[Math.floor(Math.random() * playableTiles.length)];

    // Determina a posição
    const leftEnd = board.length > 0 ? board[0].left : null;
    const rightEnd = board.length > 0 ? board[board.length - 1].right : null;

    let position = "right";
    if (board.length === 0) {
      position = "right";
    } else if (randomTile.left === leftEnd || randomTile.right === leftEnd) {
      if (randomTile.left === rightEnd || randomTile.right === rightEnd) {
        position = Math.random() < 0.5 ? "left" : "right";
      } else {
        position = "left";
      }
    }

    return { tile: randomTile, position };
  }
}

module.exports = DominoGameLogic;
