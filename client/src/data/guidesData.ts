export interface GuideArticle {
  slug: string;
  title: string;
  subtitle: string;
  category: 'Chess' | 'Ludo' | 'Arcade' | 'Strategy';
  readTime: string;
  gameId?: string; // Links to playable game on Friends Arcade if available
  publishedDate: string;
  summary: string;
  sections: {
    heading: string;
    content: string[];
    tips?: string[];
  }[];
}

export const GUIDES: GuideArticle[] = [
  {
    slug: 'chess-rules-and-pieces',
    title: "How to Play Chess: Rules, Board Setup & Piece Movements for Beginners",
    subtitle: "A comprehensive, step-by-step masterclass covering board orientation, the special powers of each piece, and checkmate fundamentals.",
    category: 'Chess',
    readTime: '6 min read',
    publishedDate: 'October 2026',
    summary: "Master the fundamental rules of Chess, from the golden rule of board orientation ('white on right') to pawns, knights, rooks, bishops, queens, kings, and special moves like castling and en passant.",
    sections: [
      {
        heading: '1. The Chessboard Layout & Orientation',
        content: [
          "Chess is played on an 8x8 grid composed of 64 alternating light and dark squares. Before any pieces are placed, ensure the board is oriented properly: each player must have a light-colored square on their bottom-right corner ('white on right').",
          "Rows are called ranks (numbered 1 through 8 from White's side to Black's side), and vertical columns are called files (lettered 'a' through 'h' from left to right).",
          "White always moves first, after which players alternate single turns until the match concludes in checkmate, resignation, or a draw."
        ],
        tips: [
          "Golden Board Rule: 'White on right' — the bottom right corner (h1 for White, a8 for Black) must always be a light square.",
          "Queen Color Rule: 'Queen on her own color' — White Queen begins on d1 (white square); Black Queen begins on d8 (black square)."
        ]
      },
      {
        heading: '2. Understanding Every Chess Piece and How It Moves',
        content: [
          "The Pawn (1 point): Pawns move forward one square at a time, but on their initial move from their home rank, they may advance two squares. Pawns capture diagonally forward one square.",
          "The Knight (3 points): Knights move in an unique 'L-shape' (two squares in one cardinal direction, then one square perpendicular). Knights are the only pieces capable of jumping over other pieces.",
          "The Bishop (3 points): Bishops move diagonally across any number of unoccupied squares. Because they travel strictly along diagonals, a bishop remains on squares of its starting color for the entire match.",
          "The Rook (5 points): Rooks move in straight horizontal ranks and vertical files across any number of unoccupied squares. They are formidable major pieces.",
          "The Queen (9 points): The most powerful attacking piece on the board. The Queen combines the movement abilities of the Rook and Bishop, moving horizontally, vertically, or diagonally.",
          "The King (Priceless): The King moves one square in any direction. The objective of Chess is to trap the enemy King so it cannot escape attack (Checkmate)."
        ]
      },
      {
        heading: '3. Special Chess Moves Every Player Must Know',
        content: [
          "Castling: A dual defensive move involving the King and a Rook. If neither piece has moved yet and the squares between them are clear (and none are under enemy attack), the King moves two squares toward the Rook, and the Rook hops over to the adjacent square.",
          "En Passant: A unique pawn capture rule. When an opponent advances a pawn two squares past your adjacent pawn on the 5th rank, you may capture it diagonally as if it had only moved one square forward.",
          "Pawn Promotion: If a pawn reaches the 8th rank (the furthest rank from its origin), it is instantly promoted into a Queen, Rook, Bishop, or Knight of your choice."
        ]
      },
      {
        heading: '4. Check, Checkmate, and Stalemate',
        content: [
          "Check occurs when a player's King is under direct attack. The defending player must immediately eliminate the check by moving the King, capturing the attacking piece, or blocking the attack with another piece.",
          "Checkmate occurs when the King is in check and there are no legal moves to escape. The game ends immediately, and the checking player wins.",
          "Stalemate occurs when the player whose turn it is has no legal moves available, but their King is NOT in check. Stalemate results in an immediate draw."
        ]
      }
    ]
  },
  {
    slug: 'chess-strategies-for-beginners',
    title: 'Essential Chess Strategies: Openings, Center Control & Tactics',
    subtitle: 'Proven principles to help novice players win more games, protect their pieces, and build lethal mating attacks.',
    category: 'Chess',
    readTime: '7 min read',
    publishedDate: 'October 2026',
    summary: 'Discover the three phases of chess, why controlling the four central squares (d4, d5, e4, e5) determines the match tempo, and how to avoid the most common beginner traps.',
    sections: [
      {
        heading: '1. The Golden Opening Principles',
        content: [
          "Every beginner must follow three ironclad rules during the opening phase (moves 1–10):",
          "1. Control the Center: The squares e4, d4, e5, and d5 are the battlefield high-ground. Occupying the center with pawns allows your pieces maximum mobility.",
          "2. Develop Knights before Bishops: Knights need fewer moves to reach active outpost squares (e.g. Nf3, Nc3). Develop them early to influence center squares.",
          "3. Castle Early: Leaving your King in the center of the board is an invitation for disaster. Castle within the first 6–8 moves to shelter your King and activate your Rook."
        ],
        tips: [
          "Don't move the same piece multiple times in the opening unless it is under direct threat.",
          "Avoid bringing your Queen out too early; opponents will attack your Queen with minor pieces while developing their army for free."
        ]
      },
      {
        heading: '2. Elementary Tactics: Forks, Pins, and Skewers',
        content: [
          "Tactics are short-term sequence calculations that win material or force checkmate:",
          "The Fork: A single piece attacks two or more enemy pieces simultaneously. Knights and Pawns are the most notorious forking weapons.",
          "The Pin: A piece attacks an enemy piece that cannot move without exposing a more valuable piece behind it (Absolute pin against the King; Relative pin against the Queen).",
          "The Skewer: An attack on a high-value piece (like the King or Queen) that forces it to move, exposing a lesser-value piece behind it to capture."
        ]
      },
      {
        heading: '3. Common Beginner Blunders to Avoid',
        content: [
          "Hanging Pieces: Constantly scan the board before executing your move. Ask yourself: 'Is the square I am moving to protected? What did my opponent's last move threaten?'",
          "Ignoring the Back Rank: Failing to create an escape square ('luft') for your castled King often leads to sudden back-rank checkmates with enemy rooks.",
          "Trading Without Purpose: Don't exchange pieces automatically. Only trade when it damages your opponent's pawn structure, relieves defensive pressure, or converts a material advantage."
        ]
      }
    ]
  },
  {
    slug: 'how-to-play-ludo',
    title: 'How to Play Multiplayer Ludo: Rules, Dice Mechanics & Token Navigation',
    subtitle: 'Everything you need to know about navigating the cross-shaped board, rolling sixes, capturing opponents, and reaching home safely.',
    category: 'Ludo',
    readTime: '5 min read',
    publishedDate: 'October 2026',
    summary: 'A definitive guide to the rules of Ludo, token spawning requirements, safe squares (stars), capture dynamics, and how to navigate online multiplayer rooms with friends.',
    sections: [
      {
        heading: '1. The Board and Setup',
        content: [
          "Ludo is a strategy board game for 2 to 4 players derived from the ancient Indian game Pachisi. The board is divided into four colored quadrants (Red, Green, Yellow, Blue), with a cross-shaped track containing three columns of squares per arm.",
          "Each player selects a color and places their 4 colored tokens into their corresponding home yard. The center of the board is the Home Triangle."
        ]
      },
      {
        heading: '2. Starting the Game & The Magic Six',
        content: [
          "Players take turns rolling a standard 6-sided die in a clockwise rotation.",
          "To move a token out of your starting yard onto the active track (the starting square), you must roll a 6. Rolling any other number when all tokens are in the yard passes the turn to the next player.",
          "Whenever you roll a 6, you receive a bonus roll! However, rolling three consecutive sixes is typically ruled a foul, voiding the turn."
        ],
        tips: [
          "Always prioritize releasing your tokens when rolling a 6 if your active tokens are on safe squares.",
          "Having multiple tokens active on the track gives you flexible move choices when specific numbers are rolled."
        ]
      },
      {
        heading: '3. Captures and Safe Squares',
        content: [
          "Capturing an Opponent: If your token lands on an exact square occupied by an opponent's token, the opponent's token is captured ('cut') and sent back to its starting yard! The capturing player also earns a bonus die roll.",
          "Safe Squares (Globes/Stars): Certain marked squares along the track are safe zones. Tokens resting on safe squares cannot be captured by opposing players.",
          "Blockades: When two tokens of the same color land on the same square, in many rule sets they form a blockade that opponents cannot pass or land on."
        ]
      },
      {
        heading: '4. Reaching the Home Triangle & Victory',
        content: [
          "Tokens must complete a full circuit around the board track and enter their colored home column.",
          "To enter the center Home Triangle, a player must roll the exact number required. The first player to safely navigate all four of their tokens into the Home Triangle is declared the winner!"
        ]
      }
    ]
  },
  {
    slug: 'ludo-winning-strategies',
    title: 'Ludo Winning Strategies: Token Rotation, Defense & Safe Zones',
    subtitle: 'Strategic masterclass for dominating multiplayer Ludo matches against friends through probability, pacing, and ruthless defense.',
    category: 'Ludo',
    readTime: '6 min read',
    publishedDate: 'October 2026',
    summary: 'Learn when to chase, when to retreat, how to stagger token distances, and how to use safe squares to maximize your winning probability.',
    sections: [
      {
        heading: '1. The Four-Token Stagger Technique',
        content: [
          "A classic beginner mistake is sprinting a single token all the way home while leaving the remaining three trapped in the yard.",
          "By staggering your tokens across the board, you ensure you always have a legal, advantageous move regardless of what number the die displays. If a token is in danger, move it; if an opponent is within range, advance the hunter token!"
        ]
      },
      {
        heading: '2. Controlling the Safe Squares (Stars)',
        content: [
          "Safe squares are the strategic outposts of Ludo. Resting on a star just behind an opponent's token puts them under constant psychological pressure.",
          "Never vacate a safe square if an enemy token is positioned within 1 to 6 squares behind you, as their probability of rolling that number is substantial."
        ],
        tips: [
          "Dice Probability: Rolling a specific number on a single 6-sided die is 1 in 6 (16.67%). If an opponent has 2 tokens positioned within 6 squares of yours, their probability of capturing you increases dramatically."
        ]
      },
      {
        heading: '3. Risk vs. Reward in Enemy Territory',
        content: [
          "When approaching the home straight, the final quadrant is the most dangerous. Tokens captured here lose nearly 50 squares of progress!",
          "If you must choose between advancing a token that is 5 squares from entering your home column versus moving a fresh token out of your base, almost always prioritize securing the high-value token into the protected colored column."
        ]
      }
    ]
  },
  {
    slug: 'connect-four-tactics',
    title: 'Connect Four Strategy: Controlling the Center & Double-Threat Traps',
    subtitle: 'Mathematically proven tactics to dominate the 7x6 gravity grid and force unstoppable winning combinations.',
    category: 'Arcade',
    readTime: '5 min read',
    gameId: 'connect-four',
    publishedDate: 'October 2026',
    summary: 'Master column 4 dominance, odd-versus-even row parity, diagonal blind spots, and how to set up 7-move double threats in Connect Four.',
    sections: [
      {
        heading: '1. Why Column 4 (The Center) Decides the Game',
        content: [
          "In a standard 7-column, 6-row Connect Four grid, the center column (Column 4) is involved in mathematically more winning combinations than all other columns combined (up to 16 distinct four-in-a-row paths).",
          "The first player should virtually always drop their opening chip in Column 4. Ceding control of the center column to your rival hands them a severe offensive initiative."
        ]
      },
      {
        heading: "2. The 7-Move Double Threat (The '7' Trap)",
        content: [
          "A double threat occurs when you build an alignment that creates two separate winning squares simultaneously. Because your opponent can only block one square on their turn, you will claim victory on the next.",
          "The classic '7' trap aligns chips in a horizontal and diagonal fork. When setting up a trap, look for diagonal connections that your opponent might overlook."
        ]
      },
      {
        heading: '3. Avoiding the Blunder of Helping Your Opponent',
        content: [
          "In Connect Four, gravity is an active participant. Dropping a chip directly underneath a square that would give your opponent an immediate win is a catastrophic blunder.",
          "Always scan the row immediately above your planned drop. If dropping your chip allows your opponent to drop their chip on top of yours to complete a four-in-a-row, find a different move!"
        ]
      }
    ]
  },
  {
    slug: 'tic-tac-toe-theory',
    title: 'The Mathematical Secrets of Tic-Tac-Toe: How to Never Lose a Duel',
    subtitle: 'The game-theory blueprint for Tic-Tac-Toe. Learn corner openings, center responses, and forced win trees.',
    category: 'Arcade',
    readTime: '4 min read',
    gameId: 'tic-tac-toe',
    publishedDate: 'October 2026',
    summary: 'Tic-Tac-Toe is a mathematically solved zero-sum game with 255,168 possible games. Discover the step-by-step decision tree that guarantees you will never lose a match.',
    sections: [
      {
        heading: '1. Playing as First Player (X): The Corner Dominance',
        content: [
          "When playing first, the statistically strongest opening move is a corner square (e.g. top-left).",
          "If your opponent does not respond by taking the center square, you have a guaranteed forced win! You can claim an adjacent corner on move 2, setting up an unblockable fork."
        ]
      },
      {
        heading: '2. Playing as Second Player (O): The Center Survival Rule',
        content: [
          "If Player X opens in a corner, Player O MUST play in the center square (index 4). Playing an edge or opposing corner immediately allows X to force a win.",
          "If Player X opens in the center, Player O should respond in a corner square. Following these two simple rules guarantees at minimum a draw in every single match."
        ]
      }
    ]
  },
  {
    slug: 'reaction-challenge-guide',
    title: 'Reaction Time Mastery: Split-Second Visual Reflexes & False Starts',
    subtitle: 'Understand visual latency, nervous system reaction speeds, and how to consistently achieve sub-200ms scores.',
    category: 'Strategy',
    readTime: '4 min read',
    gameId: 'reaction-challenge',
    publishedDate: 'October 2026',
    summary: 'Explore human reaction time benchmarks, how input device latency affects split-second challenges, and the psychological discipline needed to avoid false starts.',
    sections: [
      {
        heading: '1. Human Visual Reaction Benchmarks',
        content: [
          "The average human visual reaction time is approximately 250 milliseconds (ms). Highly trained gamers and sprinters can reach between 170ms and 200ms.",
          "In Friends Arcade's Reaction Challenge, a randomized countdown turns from red to yellow to green. Reacting the exact millisecond the signal turns green gives you a competitive podium edge."
        ]
      },
      {
        heading: '2. The Mathematics of False Starts',
        content: [
          "A common mistake is trying to anticipate the timer rhythmically. In our engine, the green signal delay is determined by cryptographically randomized server intervals.",
          "Clicking even 1 millisecond before the signal turns green registers a False Start penalty, resetting your round score to zero. Patience is faster than guessing!"
        ]
      }
    ]
  },
  {
    slug: 'trivia-quiz-speed-tactics',
    title: 'How to Win Online Trivia & Quick Quiz: Speed Scoring & Deduction Tips',
    subtitle: 'Strategic trivia secrets: speed multiplier bonuses, process of elimination, and pattern recognition.',
    category: 'Strategy',
    readTime: '5 min read',
    gameId: 'quick-quiz',
    publishedDate: 'October 2026',
    summary: 'Learn how to maximize your score in multiplayer trivia games by understanding timer decay curves, rapid question reading, and educated guessing.',
    sections: [
      {
        heading: '1. How Speed Multipliers Work',
        content: [
          "In Quick Quiz on Friends Arcade, answering correctly is only half the equation. The countdown timer awards up to 100 base points plus bonus points scaled to how many seconds remain on the clock.",
          "Answering correctly within the first 3 seconds yields almost double the points of answering in the final seconds. Quick decision-making creates insurmountable leads."
        ]
      },
      {
        heading: '2. The Power of Immediate Elimination',
        content: [
          "When four multiple-choice options appear, immediately identify the two absurd or incorrect options. Reducing your choice to a 50/50 coin flip in under 1 second dramatically improves your speed and accuracy.",
          "Trust your first instinct: cognitive research shows your initial intuition in trivia is correct over 70% of the time."
        ]
      }
    ]
  }
];
